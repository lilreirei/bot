if (parseFloat(process.versions.node) < 6)
    throw new Error('Incompatible node version. Install Node 6 or higher.');

var reload = require('require-reload')(require),
    fs = require('fs'),
    Eris = require('eris'),
    config = reload('./config.json'),
    formatSeconds = require("./utils/utils.js").formatSeconds,
    version = reload('./package.json').version,
    Nf = new Intl.NumberFormat('en-US'),
    round = require('./utils/utils.js').round,
    validateConfig = reload('./utils/validateConfig.js'),
    CommandManager = reload('./utils/CommandManager.js'),
    utils = reload('./utils/utils.js'),
    settingsManager = reload('./utils/settingsManager.js'),
    logger,
    games = reload('./special/games.json'),
    CommandManagers = [],
    events = {},
    bannedUsers = reload('./banned_users.json');

commandsProcessed = 0;
cleverbotTimesUsed = 0;

validateConfig(config).catch(() => process.exit(0));
logger = new(reload('./utils/Logger.js'))(config.logTimestamp);

var bot = new Eris(config.token, {
    autoReconnect: true,
    disableEveryone: true,
    getAllUsers: true,
    messageLimit: 10,
    sequencerWait: 100,
    moreMentions: true,
    disableEvents: config.disableEvents,
    maxShards: config.shardCount,
    gatewayVersion: 6,
    cleanContent: true
});

function loadCommandSets() {
    return new Promise(resolve => {
        CommandManagers = [];
        for (let prefix in config.commandSets) { //Add command sets
            let color = config.commandSets[prefix].color;
            if (color && !logger.isValidColor(color)) {
                logger.warn(`Log color for ${prefix} invalid`);
                color = undefined;
            }
            CommandManagers.push(new CommandManager(config, prefix, config.commandSets[prefix].dir, color));
        }
        resolve();
    });
}

function initCommandManagers(index = 0) {
    return new Promise((resolve, reject) => {
        CommandManagers[index].initialize(bot, config, settingsManager) //Load CommandManager at {index}
            .then(() => {
                logger.debug(`Loaded CommandManager ${index}`, 'INIT');
                index++;
                if (CommandManagers.length > index) { //If there are more to load
                    initCommandManagers(index) //Loop through again
                        .then(resolve)
                        .catch(reject);
                } else //If that was the last one resolve
                    resolve();
            }).catch(reject);
    });
}

function loadEvents() { // Load all events in events/
    return new Promise((resolve, reject) => {
        fs.readdir(__dirname + '/events/', (err, files) => {
            if (err) reject(`Error reading events directory: ${err}`);
            else if (!files) reject('No files in directory events/');
            else {
                for (let name of files) {
                    if (name.endsWith('.js')) {
                        name = name.replace(/\.js$/, '');
                        try {
                            events[name] = reload(`./events/${name}.js`);
                            initEvent(name);
                        } catch (e) {
                            logger.error(`${e}\n${e.stack}`, 'Error loading ' + name.replace(/\.js$/, ''));
                        }
                    }
                }
                resolve();
            }
        });
    });
}

function initEvent(name) { // Setup the event listener for each loaded event.
    if (name === 'messageCreate') {
        bot.on('messageCreate', msg => {
            if (msg.content.startsWith(config.reloadCommand) && config.adminIds.includes(msg.author.id)) //check for reload or eval command
                reloadModule(msg);
            else if (msg.content.startsWith(config.evalCommand) && config.adminIds.includes(msg.author.id))
                evaluate(msg);
            else
                events.messageCreate.handler(bot, msg, CommandManagers, config, settingsManager);
        });
    }
    else if (name === 'channelDelete') {
        bot.on('channelDelete', channel => {
            settingsManager.handleDeletedChannel(channel);
        });
    } else if (name === 'ready') {
        bot.on('ready', () => {
            events.ready(bot, config, games, utils);
        });
    } else {
        bot.on(name, function() { // MUST NOT BE ANNON/ARROW FUNCTION
            events[name](bot, settingsManager, config, ...arguments);
        });
    }
}

function miscEvents() {
    return new Promise(resolve => {
        if (bot.listeners('error').length === 0) {
            bot.on('error', (e, id) => {
                logger.error(`${e}\n${e.stack}`, `SHARD ${id} ERROR`);
            });
        }
        if (bot.listeners('shardReady').length === 0) {
            bot.on('shardReady', id => {
                logger.logBold(` SHARD ${id} CONNECTED`, 'green');
            });
        }
        if (bot.listeners('disconnected').length === 0) {
            bot.on('disconnected', () => {
                logger.logBold(' DISCONNECTED FROM DISCORD', 'red');
            });
        }
        if (bot.listeners('shardDisconnect').length === 0) {
            bot.on('shardDisconnect', (e, id) => {
                logger.error(e, `SHARD ${id} DISCONNECT`);
            });
        }
        if (bot.listeners('shardResume').length === 0) {
            bot.on('shardResume', id => {
                logger.logBold(` SHARD ${id} RESUMED`, 'green');
            });
        }
        if (bot.listeners('guildCreate').length === 0) {
            bot.on('guildCreate', guild => {
                logger.debug(guild.name, 'GUILD CREATE');
            });
        }
        if (bot.listeners('guildDelete').length === 0) {
            bot.on('guildDelete', (guild, unavailable) => {
                if (unavailable === false)
                    logger.debug(guild.name, 'GUILD REMOVE');
            });
        }
        return resolve();
    });
}

function login() {
    logger.logBold(`Logging in...`, 'green');
    bot.connect().catch(error => {
        logger.error(error, 'LOGIN ERROR');
    });
}

//Load commands and log in
loadCommandSets()
    .then(initCommandManagers)
    .then(loadEvents)
    .then(miscEvents)
    .then(login)
    .catch(error => {
        logger.error(error, 'ERROR IN INIT');
    });

function reloadModule(msg) {
    logger.debug(`${msg.author.username}: ${msg.content}`, 'RELOAD MODULE');
    let arg = msg.content.substr(config.reloadCommand.length).trim();

    for (let i = 0; i < CommandManagers.length; i++) { //If arg starts with a prefix for a CommandManager reload/load the file.
        if (arg.startsWith(CommandManagers[i].prefix))
            return CommandManagers[i].reload(bot, msg.channel.id, arg.substr(CommandManagers[i].prefix.length), config, settingsManager);
    }

    if (arg === 'CommandManagers') {

        loadCommandSets()
            .then(initCommandManagers)
            .then(() => {
                msg.channel.createMessage('Reloaded CommandManagers');
            }).catch(error => {
                logger.error(error, 'ERROR IN INIT');
            });

    } else if (arg.startsWith('utils/')) {

        fs.access(`${__dirname}/${arg}.js`, fs.R_OK | fs.F_OK, err => {
            if (err)
                msg.channel.createMessage('That file does not exist!');
            else {
                switch (arg.replace(/(utils\/|\.js)/g, '')) {
                    case 'CommandManager':
                        CommandManager = reload('./utils/CommandManager.js');
                        msg.channel.createMessage('Reloaded utils/CommandManager.js');
                        break;
                    case 'settingsManager':
                        {
                            let tempCommandList = settingsManager.commandList;
                            settingsManager.destroy();
                            settingsManager = reload('./utils/settingsManager.js');
                            settingsManager.commandList = tempCommandList;
                            msg.channel.createMessage('Reloaded utils/settingsManager.js');
                            break;
                        }
                    case 'utils':
                        utils = reload('./utils/utils.js');
                        msg.channel.createMessage('Reloaded utils/utils.js');
                        break;
                    case 'validateConfig':
                        validateConfig = reload('./utils/validateConfig.js');
                        msg.channel.createMessage('Reloaded utils/validateConfig.js');
                        break;
                    case 'Logger':
                        logger = new(reload('./utils/Logger.js'))(config.logTimestamp);
                        msg.channel.createMessage('Reloaded utils/Logger.js');
                        break;
                    default:
                        msg.channel.createMessage("Can't reload that because it isn't already loaded");
                        break;
                }
            }
        });

    } else if (arg.startsWith('events/')) {

        arg = arg.substr(7);
        if (events.hasOwnProperty(arg)) {
            events[arg] = reload(`./events/${arg}.js`);
            msg.channel.createMessage(`Reloaded events/${arg}.js`);
        } else
            msg.channel.createMessage("That event isn't loaded");

    } else if (arg.startsWith('special/')) {

        switch (arg.substr(8)) {
            case 'cleverbot':
                events.messageCreate.reloadCleverbot(bot, msg.channel.id);
                break;
            case 'games':
                games = reload('./special/games.json');
                msg.channel.createMessage('Reloaded special/games.json');
                break;
            default:
                msg.channel.createMessage("Not found");
                break;
        }

    } else if (arg === 'config') {

        validateConfig = reload('./utils/validateConfig.js');
        config = reload('./config.json');
        validateConfig(config).catch(() => process.exit(0));
        msg.channel.createMessage("Reloaded config");
    }
}

function evaluate(msg) {
    logger.debug(`${msg.author.username}: ${msg.content}`, 'EVAL');
    let toEval = msg.content.substr(config.evalCommand.length).trim();
    let result = '~eval failed~';
    let lower = toEval.toLowerCase();
    if (lower.includes('bot.token')) return bot.createMessage(msg.channel.id, 'owo nothing to be found here.');
    try {
        result = eval(toEval);
    } catch (error) {
        logger.debug(error.message, 'EVAL FAILED');
        msg.channel.createMessage(`\`\`\`diff\n- ${error}\`\`\``); //Send error to chat also.
    }

    if (result !== '~eval failed~') {
        logger.debug(result, 'EVAL RESULT');
        msg.channel.createMessage(`__**Result:**__ \n${result}`);
    }
}

if (config.carbonKey) { //Send servercount to Carbon bot list
    setInterval(() => {
        if (bot.uptime !== 0)
            utils.updateCarbon(config.carbonKey, bot.guilds.size);
    }, 1800000);
}

if (config.discordlistToken) { //Send servercount to discordlist bot list
    setInterval(() => {
        if (bot.uptime !== 0)
            utils.updateDiscordlist(config.discordlistToken, bot.guilds.size);
    }, 1800000);
}

if (config.abalBotsKey) { //Send servercount to Abal's bot list
    setInterval(() => {
        if (bot.uptime !== 0)
            utils.updateAbalBots(bot.user.id, config.abalBotsKey, bot.guilds.size);

        var data = {}
        data.table = []
        var obj = {
            serverCount: bot.guilds.size,
            userCount: bot.users.size
        }
        data.table.push(obj)
    }, 1800000);
}

if (config.discordbotsorg) { //Send servercount to discordbotsorg
    setInterval(() => {
        if (bot.uptime !== 0)
            utils.updateDiscordBots(bot.user.id, config.discordbotsorg, bot.guilds.size);

        var data = {}
        data.table = []
        var obj = {
            server_count: bot.guilds.size,
            shard_id: bot.shards.map(s => s.id),
            shard_count: bot.shards.size
        }
        data.table.push(obj)
    }, 1800000);
}

setInterval(() => { // Update the bot's status for each shard every 10 minutes
    if (games.length !== 0 && bot.uptime !== 0 && config.cycleGames === true) {
        bot.shards.forEach(shard => {
            let name = games[~~(Math.random() * games.length)];
            name = name.replace(/\$\{GUILDSIZE\}/gi, bot.guilds.size);
            name = name.replace(/\$\{USERSIZE\}/gi, bot.users.size);
            shard.editStatus(null, { name });
        });
    }
}, 600000);

/** Only meant for the public version */
setInterval(() => {
    let totalCommandUsage = commandsProcessed + cleverbotTimesUsed;
    let c = bot.getChannel('240154456577015808');
    let messageID = '326381968763650059';
    c.editMessage(messageID, {
            content: ``,
            embed: {
                color: 0xf4ce11,
                type: 'rich',
                author: {
                    name: `Shinobu Statistics:`,
                    url: `https://shinobubot.xyz`,
                    icon_url: `${bot.user.avatarURL}`
                },
                thumbnail: {
                    url: `${bot.user.avatarURL}`
                },
                fields: [{
                        name: `Memory Usage:`,
                        value: `${Math.round(process.memoryUsage().rss / 1024 / 1000)}MB`,
                        inline: true
                    },
                    {
                        name: `Shards:`,
                        value: `Current: ${c.guild.shard.id}\nTotal: ${bot.shards.size}`,
                        inline: true
                    },
                    {
                        name: `Version:`,
                        value: `Shinobu v${version}`,
                        inline: true
                    },
                    {
                        name: `Node Version:`,
                        value: `${process.version}`,
                        inline: true
                    },
                    {
                        name: `Uptime:`,
                        value: `${formatSeconds(process.uptime())}`,
                        inline: false
                    },
                    {
                        name: `Guilds:`,
                        value: `${Nf.format(bot.guilds.size)}`,
                        inline: true
                    },
                    {
                        name: `Channels:`,
                        value: `${Nf.format(Object.keys(bot.channelGuildMap).length)}`,
                        inline: true
                    },
                    {
                        name: `Private Channels:`,
                        value: `${Nf.format(bot.privateChannels.size)}`,
                        inline: true
                    },
                    {
                        name: `Users:`,
                        value: `${Nf.format(bot.users.size)}`,
                        inline: true
                    },
                    {
                        name: `Average Users/Guild:`,
                        value: `${Nf.format((bot.users.size / bot.guilds.size).toFixed(2))}`,
                        inline: true
                    },
                    {
                        name: `Total | Commands | Cleverbot:`,
                        value: `${Nf.format(totalCommandUsage)} | ${Nf.format(commandsProcessed)} | ${Nf.format(cleverbotTimesUsed)}`,
                        inline: true
                    },
                    {
                        name: `Average:`,
                        value: `${(totalCommandUsage / (bot.uptime / (1000 * 60))).toFixed(2)}/min`,
                        inline: true
                    }
                ]
            }
        })
        .catch(err => {
            if (!err.response) return logger.error('\n' + err, 'ERROR');
            let error = JSON.parse(err.response);
            if ((!error.code) && (!error.message)) return logger.error('\n' + err, 'ERROR');
            logger.error('An unhandledRejection occurred\n' + 'Code: ' + error.code + '\n' + 'Message: ' + error.message, 'ERROR');
        });
}, 20000);
/**/

process.on('SIGINT', () => {
    bot.disconnect({ reconnect: false });
    settingsManager.handleShutdown().then(() => process.exit(0));
    setTimeout(() => {
        process.exit(0);
    }, 5000);
});

process.on("uncaughtException", err => {
    logger.error('An uncaughtException occurred\n' + err.message, 'ERROR')
});

process.on("unhandledRejection", err => {
    let error = JSON.parse(err.response);
    if (error.code !== undefined && error.message !== undefined) return logger.error('An unhandledRejection occurred\n' + 'Code: ' + error.code + '\n' + 'Message: ' + error.message, 'ERROR');
    logger.error('\n' + err, 'ERROR');
});