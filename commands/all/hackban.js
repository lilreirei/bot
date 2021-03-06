var reload = require('require-reload')(require),
    config = reload('../../config.json'),
    error,
    logger,
    logger = new(reload('../../utils/Logger.js'))(config.logTimestamp);

module.exports = {
    desc: "Ban a user that is not in the guild.",
    usage: "<user_id> | <reason>",
    guildOnly: true,
    requiredPermission: 'banMembers',
    task(bot, msg, args) {
        /**
         * perm checks
         * @param {boolean} embedLinks - Checks if the bots permissions has embedLinks
         * @param {boolean} sendMessages - Checks if the bots permissions has sendMessages
         */
        const embedLinks = msg.channel.permissionsOf(bot.user.id).has('embedLinks');
        const sendMessages = msg.channel.permissionsOf(bot.user.id).has('sendMessages');
        const banMembers = msg.channel.permissionsOf(bot.user.id).has('banMembers');
        if (embedLinks === false) return bot.createMessage(msg.channel.id, `❌ I'm missing the \`embedLinks\` permission, which is required for this command to work.`)
            .catch(err => {
                error = JSON.parse(err.response);
                if ((!error.code) && (!error.message)) return logger.error('\n' + err, 'ERROR')
                logger.error(error.code + '\n' + error.message, 'ERROR');
            });
        if (sendMessages === false) return;
        if (banMembers === false) return bot.createMessage(msg.channel.id, `❌ I'm missing the \`banMembers\` permission, which is required for this command to work.`)
            .catch(err => {
                error = JSON.parse(err.response);
                if ((!error.code) && (!error.message)) return logger.error('\n' + err, 'ERROR')
                logger.error(error.code + '\n' + error.message, 'ERROR');
            });
        if (!args) return 'wrong usage';
        const str = args + "";
        const array = str.split(/ ?\| ?/),
            userToBan = array[0],
            reason = array[1];
        const deletedays = 7;
        const idRegex = /^\d{17,18}$/.test(userToBan);
        if (idRegex === true) {
            bot.banGuildMember(msg.channel.guild.id, userToBan, deletedays, reason)
                .catch(err => {
                    error = JSON.parse(err.response);
                    if ((!error.code) && (!error.message)) return logger.error('\n' + err, 'ERROR')
                    bot.createMessage(msg.channel.id, {
                        content: ``,
                        embed: {
                            color: 0xff0000,
                            author: {
                                name: `ERROR`,
                                url: ``,
                                icon_url: ``
                            },
                            description: `Code: ${error.code}\nMessage: ${error.message}`
                        }
                    }).catch(err => {
                        error = JSON.parse(err.response);
                        if ((!error.code) && (!error.message)) return logger.error('\n' + err, 'ERROR')
                        logger.error(error.code + '\n' + error.message, 'ERROR');
                    });
                });
        } else {
            bot.createMessage(msg.channel.id, {
                content: ``,
                embed: {
                    color: 0xff0000,
                    author: {
                        name: ``,
                        url: ``,
                        icon_url: ``
                    },
                    description: `The given ID is invalid, make sure you used a correct userID.`,
                    fields: [{
                        name: `For support join:`,
                        value: `https://discord.gg/Vf4ne5b`,
                        inline: true
                    }]
                }
            }).catch(err => {
                logger.error('\n' + err, 'ERROR')
            });
        }
    }
};