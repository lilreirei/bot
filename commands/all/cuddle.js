const axios = require('axios'),
    findMember = require('../../utils/utils.js').findMember;
var reload = require('require-reload')(require),
    config = reload('../../config.json'),
    error,
    logger,
    logger = new(reload('../../utils/Logger.js'))(config.logTimestamp);

module.exports = {
    desc: "Cuddle with someone.",
    usage: "<username/id/@mention>",
    cooldown: 5,
    guildOnly: true,
    task(bot, msg, args) {
        /**
         * perm checks
         * @param {boolean} embedLinks - Checks if the bots permissions has embedLinks
         * @param {boolean} sendMessages - Checks if the bots permissions has sendMessages
         */
        const embedLinks = msg.channel.permissionsOf(bot.user.id).has('embedLinks');
        const sendMessages = msg.channel.permissionsOf(bot.user.id).has('sendMessages');
        if (embedLinks === false) return bot.createMessage(msg.channel.id, `\\❌ I'm missing the \`embedLinks\` permission, which is required for this command to work.`)
            .catch(err => {
                if (!err.response) return logger.error(err, 'ERROR');
                error = JSON.parse(err.response);
                if ((!error.code) && (!error.message)) return logger.error(err, 'ERROR');
                logger.error(error.code + '\n' + error.message, 'ERROR');
            });
        if (sendMessages === false) return;
        const user = findMember(msg, args);
        if (!args) return 'wrong usage';
        if (!user) return bot.createMessage(msg.channel.id, {
            content: ``,
            embed: {
                color: 0xff0000,
                author: {
                    name: ``,
                    url: ``,
                    icon_url: ``
                },
                description: `That is not a valid guild member. Need to specify a name, ID or mention the user.`
            }
        }).catch(err => {
            logger.error(err, 'ERROR')
        });
        const base_url = "https://rra.ram.moe",
            type = "cuddle",
            path = "/i/r?type=" + type;
        axios.get(base_url + path)
            .then(res => {
                if (res.data.error) return msg.channel.createMessage({
                        content: ``,
                        embed: {
                            color: 0xff0000,
                            author: {
                                name: `ERROR: ${res.data.error}`,
                                url: ``,
                                icon_url: ``
                            },
                            description: res.data.message,
                        }
                    })
                    .catch(err => {
                        if (!err.response) return logger.error(err, 'ERROR');
                        error = JSON.parse(err.response);
                        if ((!error.code) && (!error.message)) return logger.error(err, 'ERROR');
                        logger.error(error.code + '\n' + error.message, 'ERROR');
                    });
                bot.createMessage(msg.channel.id, {
                    content: ``,
                    embed: {
                        color: 0xf4ce11,
                        author: {
                            name: ``,
                            url: ``,
                            icon_url: ``
                        },
                        description: `${msg.author.username} cuddles with ${user.username}`,
                        image: {
                            url: base_url + res.data.path
                        },
                        footer: {
                            text: `using the ram.moe API`,
                            icon_url: ``
                        }
                    }
                }).catch(err => {
                    if (!err.response) return logger.error(err, 'ERROR');
                    error = JSON.parse(err.response);
                    if ((!error.code) && (!error.message)) return logger.error(err, 'ERROR');
                    logger.error(error.code + '\n' + error.message, 'ERROR');
                });
            })
            .catch(err => {
                logger.error(err, 'ERROR');
            });
    }
};