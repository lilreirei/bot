var reload = require('require-reload'),
    banned = reload('../../banned_search_terms.json');
const booru = require('booru')

module.exports = {
    desc: "Send possibly nsfw image with the given tag(s) (Max 2 tags, seperate tags by space!\n(Use either s=safe, q=questionable or e=explicit for a tag to choose what you want) [nsfw]",
    usage: "<site> [<tag1> <tag2>] (Max 2 tags, tags must be seperated by space!).\nType: \"s.booru list\" for a list of sites the bot can get a picture from.",
    aliases: ['hentai'],
    cooldown: 5,
    guildOnly: true,
    task(bot, msg, args, config, settingsManager) {
        var nsfw = settingsManager.getNSFW(msg.channel.guild.id, msg.channel.id);
        if (!nsfw) {
            bot.createMessage(msg.channel.id, 'You can only use this command in an **nsfw** channels, use \`s.settings nsfw <allow/deny>\`.').catch(err => {
                return;
            });
        } else if (!args) {
            return 'wrong usage'
        } else {
            var str = args + "";
            var array = str.split(' '),
                a = array[0],
                b = array[1],
                c = array[2];
            if (c !== undefined)
                var lower2 = c.toLowerCase();
            if (b !== undefined)
                var lower = b.toLowerCase();
            var bannedWord1 = banned.bannedWords[0];
            var bannedWord2 = banned.bannedWords[1];
            var bannedWord3 = banned.bannedWords[2];
            var bannedWord4 = banned.bannedWords[3];
            if (a === 'list') {
                bot.createMessage(msg.channel.id, {
                    content: ``,
                    embed: {
                        color: 0xf4ce11,
                        author: {
                            name: `${msg.author.username}`,
                            icon_url: `${msg.author.avatarURL}`
                        },
                        description: `e621.net, aliases: ["e6","e621"]
e926.net, aliases: ["e9","e926"]
hypnohub.net, aliases: ["hh","hypo","hypohub"]
danbooru.donmai.us, aliases: ["db","dan","danbooru"]
konachan.com, aliases: ["kc","konac","kcom"]
konachan.net, aliases: ["kn","konan","knet"]
yande.re, aliases: ["yd","yand","yandere"]
gelbooru.com, aliases: ["gb","gel","gelbooru"]
rule34.xxx, aliases: ["r34","rule34"]
safebooru.org, aliases: ["sb","safe","safebooru"]
tbib.org, aliases: ["tb", "tbib","big"]
xbooru.com, aliases: ["xb","xbooru"]
youhate.us, aliases: ["yh","you","youhate"]
dollbooru.org, aliases: ["do","doll","dollbooru"]
rule34.paheal.net, aliases: ["pa","paheal"]`
                    }
                }).catch(err => {
                    const error = JSON.parse(err.response);
                    if (error.code === 50013) {
                        bot.createMessage(msg.channel.id, `❌ I do not have the required permissions for this command to function normally.`).catch(err => {
                            bot.getDMChannel(msg.author.id).then(dmchannel => {
                                dmchannel.createMessage(`I tried to respond to a command you used in **${msg.channel.guild.name}**, channel: ${msg.channel.mention}.\nUnfortunately I do not have the required permissions. Please speak to the guild owner.`).catch(err => {
                                    return;
                                });
                            }).catch(err => {
                                return;
                            });
                        });
                    } else {
                        bot.createMessage(msg.channel.id, `
\`\`\`
ERROR
Code: ${error.code}
Message: ${error.message}

For more help join the support server.
Get the invite link by doing s.support
\`\`\`
`).catch(err => {
                            return;
                        });
                    }
                });
            } else {
                if (!c) {
                    if (lower.includes(bannedWord1) || lower.includes(bannedWord2) || lower.includes(bannedWord3) || lower.includes(bannedWord4)) return bot.createMessage(msg.channel.id, {
                        content: ``,
                        embed: {
                            color: 0xf4ce11,
                            author: {
                                name: ``,
                                url: ``,
                                icon_url: ``
                            },
                            description: `Sorry it's against Discord's ToS to search for these tags.`
                        }
                    }).catch(err => {
                        return;
                    });
                    booru.search(`${a}`, [`${b}`], {
                            limit: 1,
                            random: true
                        })
                        .then(booru.commonfy)
                        .then(images => {
                            for (let image of images) {
                                var tag = image.common.tags + "";
                                if (tag.includes(banned.bannedWords[0]) || tag.includes(banned.bannedWords[1]) || tag.includes(banned.bannedWords[2]) || tag.includes(banned.bannedWords[3]) || tag.includes(banned.bannedWords[4]) || tag.includes(banned.bannedWords[5])) return bot.createMessage(msg.channel.id, {
                                    content: ``,
                                    embed: {
                                        color: 0xf4ce11,
                                        author: {
                                            name: ``,
                                            url: ``,
                                            icon_url: ``
                                        },
                                        description: `Sorry, it's against Discord's ToS to show you this images.`
                                    }
                                }).catch(err => {
                                    return;
                                });
                                var tags = tag.split(',').join(', ');
                                var img = image.common.file_url.toString(" ");
                                var imguri = img.replace(/ /g, "%20");
                                bot.createMessage(msg.channel.id, {
                                    content: ``,
                                    embed: {
                                        color: 0xf4ce11,
                                        author: {
                                            name: `Click here for the direct image url`,
                                            url: `${imguri}`,
                                            icon_url: `${msg.author.avatarURL}`
                                        },
                                        description: `Searched tags: ${b}
Tags: ${tags}
Score: ${image.common.score}
Rating: ${image.common.rating}`,
                                        image: {
                                            url: `${imguri}`
                                        }
                                    }
                                }).catch(err => {
                                    const error = JSON.parse(err.response);
                                    if (error.code === 50013) {
                                        bot.createMessage(msg.channel.id, `❌ I do not have the required permissions for this command to function normally.`).catch(err => {
                                            bot.getDMChannel(msg.author.id).then(dmchannel => {
                                                dmchannel.createMessage(`I tried to respond to a command you used in **${msg.channel.guild.name}**, channel: ${msg.channel.mention}.\nUnfortunately I do not have the required permissions. Please speak to the guild owner.`).catch(err => {
                                                    return;
                                                });
                                            }).catch(err => {
                                                return;
                                            });
                                        });
                                    } else {
                                        bot.createMessage(msg.channel.id, `
\`\`\`
ERROR
Code: ${error.code}
Message: ${error.message}

For more help join the support server.
Get the invite link by doing s.support
\`\`\`
`).catch(err => {
                                            return;
                                        });
                                    }
                                });
                            }
                        })
                        .catch(err => {
                            if (err.name === 'booruError') {
                                bot.createMessage(msg.channel.id, {
                                    content: ``,
                                    embed: {
                                        color: 0xff0000,
                                        author: {
                                            name: ``,
                                            url: ``,
                                            icon_url: ``
                                        },
                                        description: `${err.message}`,
                                        fields: [{
                                            name: `For support join:`,
                                            value: `https://discord.gg/Vf4ne5b`,
                                            inline: true
                                        }]
                                    }
                                }).catch(err => {
                                    return;
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
                                        description: `${err}`,
                                        fields: [{
                                            name: `For support join:`,
                                            value: `https://discord.gg/Vf4ne5b`,
                                            inline: true
                                        }]
                                    }
                                }).catch(err => {
                                    return;
                                });
                            }
                        })
                } else {
                    if (lower2.includes(bannedWord1) || lower2.includes(bannedWord2) || lower2.includes(bannedWord3) || lower2.includes(bannedWord4)) return bot.createMessage(msg.channel.id, {
                        content: ``,
                        embed: {
                            color: 0xf4ce11,
                            author: {
                                name: ``,
                                url: ``,
                                icon_url: ``
                            },
                            description: `Sorry it's against Discord's ToS to search for these tags.`
                        }
                    }).catch(err => {
                        return;
                    });
                    booru.search(`${a}`, [`${b}`, `${c}`], {
                            limit: 1,
                            random: true
                        })
                        .then(booru.commonfy)
                        .then(images => {
                            for (let image of images) {
                                var tag = image.common.tags + "";
                                if (tag.includes(banned.bannedWords[0]) || tag.includes(banned.bannedWords[1]) || tag.includes(banned.bannedWords[2]) || tag.includes(banned.bannedWords[3]) || tag.includes(banned.bannedWords[4]) || tag.includes(banned.bannedWords[5])) return bot.createMessage(msg.channel.id, {
                                    content: ``,
                                    embed: {
                                        color: 0xf4ce11,
                                        author: {
                                            name: ``,
                                            url: ``,
                                            icon_url: ``
                                        },
                                        description: `Sorry, it's against Discord's ToS to show you this image.`
                                    }
                                }).catch(err => {
                                    return;
                                });
                                var tags = tag.split(',').join(', ');
                                var img = image.common.file_url.toString(" ");
                                var imguri = img.replace(/ /g, "%20");
                                bot.createMessage(msg.channel.id, {
                                    content: ``,
                                    embed: {
                                        color: 0xf4ce11,
                                        author: {
                                            name: `Click here for the direct image url`,
                                            url: `${imguri}`,
                                            icon_url: `${msg.author.avatarURL}`
                                        },
                                        description: `Searched tags: ${b}, ${c}
Tags: ${tags}
Score: ${image.common.score}
Rating: ${image.common.rating}`,
                                        image: {
                                            url: `${imguri}`
                                        }
                                    }
                                }).catch(err => {
                                    const error = JSON.parse(err.response);
                                    if (error.code === 50013) {
                                        bot.createMessage(msg.channel.id, `❌ I do not have the required permissions for this command to function normally.`).catch(err => {
                                            bot.getDMChannel(msg.author.id).then(dmchannel => {
                                                dmchannel.createMessage(`I tried to respond to a command you used in **${msg.channel.guild.name}**, channel: ${msg.channel.mention}.\nUnfortunately I do not have the required permissions. Please speak to the guild owner.`).catch(err => {
                                                    return;
                                                });
                                            }).catch(err => {
                                                return;
                                            });
                                        });
                                    } else {
                                        bot.createMessage(msg.channel.id, `
\`\`\`
ERROR
Code: ${error.code}
Message: ${error.message}

For more help join the support server.
Get the invite link by doing s.support
\`\`\`
`).catch(err => {
                                            return;
                                        });
                                    }
                                });
                            }
                        })
                        .catch(err => {
                            if (err.name === 'booruError') {
                                bot.createMessage(msg.channel.id, {
                                    content: ``,
                                    embed: {
                                        color: 0xff0000,
                                        author: {
                                            name: ``,
                                            url: ``,
                                            icon_url: ``
                                        },
                                        description: `${err.message}`,
                                        fields: [{
                                            name: `For support join:`,
                                            value: `https://discord.gg/Vf4ne5b`,
                                            inline: true
                                        }]
                                    }
                                }).catch(err => {
                                    return;
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
                                        description: `${err}`,
                                        fields: [{
                                            name: `For support join:`,
                                            value: `https://discord.gg/Vf4ne5b`,
                                            inline: true
                                        }]
                                    }
                                }).catch(err => {
                                    return;
                                });
                            }
                        })
                }
            }
        }
    }
};