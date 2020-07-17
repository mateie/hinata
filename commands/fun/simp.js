const { MessageEmbed } = require('discord.js');
exports.run = async (bot, message) => {
    const person = message.mentions.members.first();
    if (!person) {
        let hoes;
        const simprate = Math.random() * 100;
        const simpIndex = Math.floor(simprate / 10);
        const simpRounded = Math.round(simprate);
        // console.log(simpRounded);
        if(simpRounded >= 60) {
            // console.log('Above 60')
            hoes = Math.random() * 6;
            hoes = Math.round(10 * hoes) / 10;
        } else if(simpRounded <= 10) {
            // console.log('Below 10');
            hoes = Math.max(Math.floor(Math.random()) * 10, Math.random() * 90);
            hoes = Math.round(10 * hoes) / 10;
        } else {
            // console.log('Below 60 and Above 10');
            hoes = Math.max(Math.floor(Math.random() * 3) * 10, Math.random() * 50);
            hoes = Math.round(10 * hoes) / 10;
        }
        const simpLevel = "🤡 ".repeat(simpIndex) + "🍑".repeat(10 - simpIndex);
        const embed = new MessageEmbed()
            .setTitle(`simp rate for ${message.author.tag}`)
            .setDescription(`🤡 Simp level:${simpRounded}%\nAverage Hoes a year: ${hoes}\n\n${simpLevel}`)
            .setColor(0xf29583);
        if (simpRounded >= 70) embed.setFooter('Woah you a hard core simp');
        if (simpRounded > 69 && hoes > 2) embed.setDescription(`🤡 Simp level:${simpRounded}%\nAverage Hoes a year: ${hoes} (unaccurate)\n\n${simpLevel}`);
        message.channel.send(embed);
    } else {
        const hoes = (Math.random() * 20);
        const hoeIndex = Math.round(10 * hoes) / 10;
        const simprate = Math.random() * 100;
        const simpIndex = Math.floor(simprate / 10);
        const simpLevel = "🤡 ".repeat(simpIndex) + "🍑".repeat(10 - simpIndex);
        const pembed = new MessageEmbed()
            .setTitle(`simp rate for ${person.user.username}`)
            .setDescription(`🤡 Simp level:${Math.round(simprate)}%\nAverage Hoes a year: ${hoeIndex}\n\n${simpLevel}`)
            .setColor(0xf29583);
        if (Math.round(simprate) >= 70) pembed.setFooter(`Woah ${person.user.tag} simpin a lil to much`);
        if (Math.round(simprate) > 69 && Math.floor(hoes) > 2) pembed.setDescription(`🤡 Simp level:${Math.round(simprate)}%\nAverage Hoes a year: ${hoeIndex} (unaccurate)\n\n${simpLevel}`);
        message.channel.send(pembed);
    }
};

exports.help = {
    enabled: true,
    name: 'simp',
    aliases: [],
    args: ['[person]'],
    permission: 'USER',
    descritpion: 'Simp Meter',
};