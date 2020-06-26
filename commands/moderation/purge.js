exports.run = function(client, message, args) {
    if(!args[0]) return message.reply('Usage: purge all|bots|user|[author] <amount>');
    if(args[0] === 'all') {
        if(!args[1]) return message.channel.send('Specify the amount');
        if(isNaN(args[1])) return message.channel.send('Specify the valid amount');
        if(parseInt(args[1]) > 100) return message.channel.send('Max 100 Messages at a time');

        if(client.game.hangman.has(message.guild.id)) {
            return message.channel.send(`The hangman game is running... Try again later`);
        }

        message.channel.messages.fetch({
            limit: args[1],
        }).then(messages => {
            const userMessages = messages.filter(msg => msg.author.bot);
            message.channel.bulkDelete(userMessages);
        }).catch(e => {
            if(e) return message.channel.send('Error: ', e);
        });
    } else if(args[0] === 'user') {
        if(!args[1]) return message.channel.send('Specify the amount');
        if(isNaN(args[1])) return message.channel.send('Specify the valid amount');
        if(parseInt(args[1]) > 100) return message.channel.send('Max 100 Messages at a time');

        message.channel.messages.fetch({
            limit: args[1],
        }).then(messages => {
            const userMessages = messages.filter(msg => !msg.author.bot);
            message.channel.bulkDelete(userMessages);
        }).catch(e => {
            if(e) return message.channel.send('Error: ', e);
        });
    } else if(args[0] === 'author') {
        if(!message.mention || message.mentions.users.size < 1) return message.channel.send('Mention a user to delete their message');
        if(!args[2]) return message.channel.send('Specify the amount');
        if(isNaN(args[2])) return message.channel.send('Specify the valid amount');
        if(parseInt(args[2]) > 100) return message.channel.send('Max 100 Messages at a time');

        message.channel.messages.fetch({
            limit: parseInt(args[2]),
        }).then(messages => {
            const userMessages = messages.filter(msg => msg.mentions.users.first() || msg.author);
            message.channel.bulkDelete(userMessages);
        }).catch(e => {
            if(e) return message.channel.send('Error: ', e);
        });
    } else {
        message.reply('Usage: purge all|bots|user|[author] <amount>');
    }
};

exports.help = {
    name: 'purge',
    aliases: [],
    args: ['all|bots|user|[author] [amount]'],
    permission: 'ADMIN',
    description: 'Purge X amount of messages from a channel',
};