module.exports = {
  desc: "Change your nickname.",
  aliases: ['setnick', 'nick', 'changenick'],
  cooldown: 5,
  guildOnly: true,
	usage: "<nickname>",
  task(bot, msg, args) {
    bot.editGuildMember(msg.channel.guild.id, msg.author.id, {
      nick: args
    }).then(sentMsg => {
      if (args === '') return bot.createMessage(msg.channel.id, {
        content: ``,
        embed: {
          color: 0xf4ce11,
          author: {
            name: ``,
            url: ``,
            icon_url: ``
          },
          description: `Successfully reset your nickname`
        }
      })
      bot.createMessage(msg.channel.id, {
        content: ``,
        embed: {
          color: 0xf4ce11,
          author: {
            name: ``,
            url: ``,
            icon_url: ``
          },
          description: `Successfully changed your nickname to **${args}**`
        }
      })
    }).catch(err => {
      var string = `${err}`,
        substring = '403 FORBIDDEN on PATCH';
      if (string.includes(substring)) return bot.createMessage(msg.channel.id, {
        content: ``,
        embed: {
          color: 0xff0000,
          author: {
            name: ``,
            url: ``,
            icon_url: ``
          },
          description: `Can't edit your nickname, privilege too low.`,
          fields: [{
            name: `For support join:`,
            value: `https://discord.gg/Vf4ne5b`,
            inline: true
          }]
        }
      });
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
      });
    })
  }
};
