const request = require('request-promise');
const kiss = require('../../kiss.json');
var randomItem = require('random-item');

module.exports = {
  desc: "Kiss someone.",
  usage: "<username | ID | @username>",
  aliases: ['kisses', 'kissu'],
  cooldown: 2,
  guildOnly: true,
  task(bot, msg) {
		const user = this.findMember(msg, args);
    const gif = randomItem(kiss);
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
        description: `<@${msg.author.id}> **hugs** <@${msg.mentions[0].id}>`,
        image: {
          url: `${gif}`
        }
      }
    });
  }
}
