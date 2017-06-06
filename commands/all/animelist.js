module.exports = {
  desc: "Gets info about your anime list using the following tags <watching/completed/onhold>. (note: completed doesn't return all completed.)",
  usage: "<watching/completed/onhold>, <mal username>",
  aliases: ['mallist', 'alist'],
  cooldown: 10,
  task(bot, msg, suffix) {
    var args = suffix.toString();
    var data = args.split(', '),
      type = data[0],
      username = data[1];
    var myAnimeList = require('myanimelist')({
      username: `${username}`
    })
    if (type === undefined) return 'wrong usage';
    var type = type.toLowerCase();
    if (type === 'watching') {
      myAnimeList.getAnimeList(1, (err, resp) => {
        if (err) {
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
        var t = resp.map(function (title) {
          return title.series_title;
        }).toString();
        var titles = t.split(',').join('\n');
        var s = resp.map(function (score) {
          return score.my_score;
        }).toString();
        var scores = s.split(',').join('\n');
        var w = resp.map(function (watched) {
          return watched.my_watched_episodes;
        }).toString();
        var watchedep = s.split(',').join('\n');
        let embed = {
          color: 0xf4ce11,
          author: {
            name: `Currently Watching`,
            url: ``,
            icon_url: ``
          },
          description: ``,
          fields: [{
              name: `Titles:`,
              value: `${titles === null ? `None` : ''}${titles !== null ? titles : ''}`,
              inline: true
            },
            {
              name: `Score:`,
              value: `${scores === null ? `None` : ''}${scores !== null ? scores : ''}`,
              inline: true
            }
          ]
        }
        bot.createMessage(msg.channel.id, {
          embed: embed
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
      })
    } else if (type === 'completed') {
      var myAnimeList = require('myanimelist')({
        username: `${username}`
      })
      myAnimeList.getAnimeList(2, (err, resp) => {
        if (err) {
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
        var t = resp.map(function (title) {
          return title.series_title;
        }).toString();
        var titles = t.split(',').join('\n');
        var s = resp.map(function (score) {
          return score.my_score;
        }).toString();
        var scores = s.split(',').join('\n');
        var w = resp.map(function (watched) {
          return watched.my_watched_episodes;
        }).toString();
        var watchedep = s.split(',').join('\n');
        let embed = {
          color: 0xf4ce11,
          author: {
            name: `Completed`,
            url: ``,
            icon_url: ``
          },
          description: ``,
          fields: [{
              name: `Titles:`,
              value: `${titles === null ? `None` : ''}${titles !== null ? titles : ''}`,
              inline: true
            },
            {
              name: `Score:`,
              value: `${scores === null ? `None` : ''}${scores !== null ? scores : ''}`,
              inline: true
            }
          ]
        }
        bot.createMessage(msg.channel.id, {
          embed: embed
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
      })
    } else if (type === 'onhold') {
      var myAnimeList = require('myanimelist')({
        username: `${username}`
      })
      myAnimeList.getAnimeList(3, (err, resp) => {
        if (err) {
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
        var t = resp.map(function (title) {
          return title.series_title;
        }).toString();
        var titles = t.split(',').join('\n');
        var s = resp.map(function (score) {
          return score.my_score;
        }).toString();
        var scores = s.split(',').join('\n');
        var w = resp.map(function (watched) {
          return watched.my_watched_episodes;
        }).toString();
        var watchedep = s.split(',').join('\n');
        let embed = {
          color: 0xf4ce11,
          author: {
            name: `On Hold`,
            url: ``,
            icon_url: ``
          },
          description: ``,
          fields: [{
              name: `Titles:`,
              value: `${titles === null ? `None` : ''}${titles !== null ? titles : ''}`,
              inline: true
            },
            {
              name: `Score:`,
              value: `${scores === null ? `None` : ''}${scores !== null ? scores : ''}`,
              inline: true
            }
          ]
        }
        bot.createMessage(msg.channel.id, {
          embed: embed
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
      })
    }
  }
}