exports.run = (client, message, args) => {
    let newName = args.slice(1).join(' ');
    let mention = message.mentions.users.first();

    let user;
    let msg;

    if(!mention) {
        user = message.guilds.members.get(args[0]);
        if(!user) return message.reply('You must mention a user or give me a valid UserID for me to rename them').catch(console.error);
    } else {
        if(newName.length === 0 || !newName) {
            msg = `${message.author.username} returned ${mention} name to back to original`;
        } else {
            msg = `${message.author.username} renamed ${mention}`;
        }
        user = message.guild.member(mention);
    }

    message.channel.send(msg);
    user.setNickname(newName).catch(e => {
        if(e) return message.channel.send(`An error occured: \`\`\`${e}\`\`\``);
    });

};

exports.help = {
    enabled: true,
    name: 'rename',
    aliases: ['nick', 'nickname'],
    args: ['<@mention|userID>', '[new name]'],
    permission: 'ADMIN',
    description: 'Rename the mentioned user',
};