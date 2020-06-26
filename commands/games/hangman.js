/* eslint-disable no-lonely-if */
exports.run = async (client, message) => {
    if(client.game.hangman.has(message.guild.id)) {
        return message.channel.send('The game is already running');
    }

    client.game.hangman.set(message.guild.id, true);

    message.channel.send(`<@${message.member.id}> is picking a sentence...`);

    message.author.createDM()
    .then(async dmChannel => {
        await dmChannel.send(`Please enter a sentence for a new hangman game... (this will expire in 15 seconds)`);

        const filter = m => m.author.id === message.member.id & !m.content.includes(client.prefix) && !m.author.bot;
        dmChannel.awaitMessages(filter, { maxMatches: 1, time: 15000, errors: ['time'] })
        .then(async collected => {
            let word = collected.first().content.toLowerCase();

            if(word.length < 4 || word.length > 25) {
                client.game.hangman.delete(message.guild.id);
                await dmChannel.send(`Your sentence should be 4-25 characters long. Game Cancelled`);
                message.author.deleteDM();
                return message.channel.send(`<@${message.member.id}> cancelled. Game Cancelled`);
            }

            if(!word.match(/^[a-zA-Z\s]+$/g)) {
                client.game.hangman.delete(message.guild.id);
                await dmChannel.send(`Your sentence contains characters that are not allowed. Game Cancelled`);
                message.author.deleteDM();
                return message.channel.send(`<@${message.member.id}> cancelled. Game Cancelled`);
            }

            let guessWord = [];
            for(let char of word) {
                let mode = 'hidden';
                if(char == ' ') mode = 'shown';

                guessWord.push({
                    char: char,
                    mode: mode,
                });
            }

            message.author.deleteDM();
            message.channel.send(`<@${message.member.id}> picked a sentence!\nStarting a new hangman game...`);
            let guessMessage = await message.channel.send(`\`\`\`Health: 10/10\n\n${word.replace(/\S/g, '_ ')}\`\`\``);
            guessMessage.sentencePickedBy = message.author;

            await this.collect(client, message.channel, word, guessWord, guessMessage, 10, 10);
        })
        .catch(async () => {
            client.game.delete(message.guild.id);
            await dmChannel.send('Game Cancelled');
            message.author.deleteDM();
            message.channel.send(`<@${message.member.id}> cancelled. Game Cancelled`);
        });
    });
};

exports.collect = async (client, channel, word, guessWord, guessMessage, health, maxHealth) => {
    const filter = m => m.content != ' ' && !m.content.includes(client.prefix) && !m.author.bot && m.author != guessMessage.sentencePickedBy;
    channel.awaitMessages(filter, { maxMatches: 1, time: 30000, errors: ['time'] })
    .then(async collected => {
        let first = collected.first();
        first.content = first.content.toLowerCase();

        let matchText = '';
        guessWord.forEach((elem, index) => {
            if(elem.char == first.content.charAt(0) || elem.mode == 'shown') {
                guessWord[index].mode = 'shown';
                matchText += `${elem.char} `;
            } else if(elem.char != ' ' || elem.mode == 'hidden') {
                matchText += '_ ';
            } else {
                matchText += ' ';
            }
        });

        if(guessMessage.deleted) {
            client.game.hangman.delete(channel.guild.id);
            return channel.send('Error occured. Game Cancelled');
        }

        if(guessWord.every(v => v.mode == 'shown')) {
            first.react('✅');
            first.react('🎉');
            client.game.hangman.delete(channel.guild.id);
            return guessMessage.edit(`\`\`\`Health: ${health}/${maxHealth}\n\n${matchText}\nYou Won!\`\`\``);
        }

        if(first.content.length > 1) {
            if(first.content == word) {
                first.react("✅");
                first.react("🎉");
                client.game.hangman.delete(channel.guild.id);
                return guessMessage.edit(`\`\`\`Health: ${health}/${maxHealth}\n\n${word}\nYou won!\`\`\``);
            } else {
                await first.react("🚫");
                first.delete(300);
                guessMessage.edit(`\`\`\`Health: ${health - 1}/${maxHealth}\n\n${matchText}\`\`\``);
                this.collect(client, channel, word, guessWord, guessMessage, health - 1, maxHealth);
            }
        } else {
            if(word.includes(first.content)) {
                await first.react('✅');
                first.delete(300);

                guessMessage.edit(`\`\`\`Health: ${health}/${maxHealth}\n\n${matchText}\`\`\``);
                this.collect(client, channel, word, guessWord, guessMessage, health, maxHealth);
            } else {
                await first.react('🚫');
                first.delete(300);

                if(health - 1 <= 0) {
                    client.game.hangman.delete(channel.guild.id);
                    return guessMessage.edit(`\`\`\`Health: 0/${maxHealth}\n\n${word}\nYou lose!\`\`\``);
                }

                guessMessage.edit(`\`\`\`Health: ${health - 1}/${maxHealth}\n\n${matchText}\`\`\``);
                this.collect(client, channel, word, guessWord, guessMessage, health - 1, maxHealth);
            }
        }
    })
    .catch(() => {
        if(guessMessage.deleted) {
            client.game.hangman.delete(channel.guild.id);
            return channel.send('Error occured. Game Cancelled');
        }

        client.game.hangman.delete(channel.guild.id);
        guessMessage.edit('```30 Seconds passed. Game Cancelled');
    });
};

exports.help = {
    name: 'hangman',
    aliases: [],
    args: [],
    permission: 'USER',
    description: 'Starts a new hangman game',
};