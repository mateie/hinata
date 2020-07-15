const axios = require('axios');

const Servers = require('../../models/servers');

exports.run = (client, message, args) => {
    if (args[0] === 'add') {
        const game = args[1].toLowerCase();

        if (!game) {
            return message.reply('Please provide a game name');
        }

        if (message.guild.roles.cache.find(ch => ch.name === game.toUpperCase())) {
            return message.reply(`${game.toUpperCase()} role already exists`);
        }

        let emoji = message.attachments.first();

        if (!emoji) {
            return message.reply('Please attach an icon file');
        }

        axios({
            url: `https://api-v3.igdb.com/search`,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'user-key': process.env.IGDB_API_KEY,
            },
            data: `search "${game}"; fields *;`,
        })
            .then(async res => {
                let resGame = res.data[0];
                if (!resGame) {
                    return message.reply(`${game} doesn't exist, please provide a valid game`);
                }

                let originalGameName = res.data[0].name.toLowerCase();
                let gameNames = res.data[0].alternative_name.toLowerCase();

                if (!gameNames.includes(game) && !originalGameName.includes(game)) {
                    return message.reply(`${game} doesn't exist, please enter a valid game`);
                }

                const gameRole = {
                    data: {
                        name: game.toUpperCase(),
                        color: this.randomHex(),
                        mentionable: true,
                    },
                    reason: `Automatically generated role for ${game.toUpperCase()}`,
                };

                await message.guild.roles.create(gameRole);

                let role = message.guild.roles.cache.find(ch => ch.name === game.toUpperCase());

                const gameEmoji = {
                    reason: `Automatically generated Emoji for ${game.toUpperCase()}`,
                };

                let existsEmoji = message.guild.emojis.cache.find(e => e.name === game);
                if (!existsEmoji) {
                    await message.guild.emojis.create(emoji.url, game, gameEmoji);
                } else {
                    message.reply('Not creating a new Emoji, it already exists');
                }

                const gameCat = {
                    type: 'category',
                    permissionOverwrites: [
                        {
                            id: message.guild.roles.everyone,
                            deny: ['VIEW_CHANNEL'],
                        },
                        {
                            id: role.id,
                            allow: ['VIEW_CHANNEL'],
                        },
                    ],
                };

                const parent = await message.guild.channels.create(game.toUpperCase(), gameCat);

                const options = {
                    gameTextGnrl: {
                        type: 'text',
                        parent: parent,
                        topic: `General channel for ${game.toUpperCase()}`,
                        reason: `Automatically Generated Channel for ${game.toUpperCase()}`,
                    },
                    gameTextTaP: {
                        type: 'text',
                        parent: parent,
                        topic: `Tips and Tricks channel for ${game.toUpperCase()}`,
                        reason: `Automatically Generated Channel for ${game.toUpperCase()}`,
                    },
                    gameVoice: {
                        type: 'voice',
                        parent: parent,
                        reason: `Automatically Generated Channel for ${game.toUpperCase()}`,
                        userLimit: 5,
                    },
                    gameVoiceCstm: {
                        type: 'voice',
                        parent: parent,
                        reason: `Automatically Generated Channel for ${game.toUpperCase()}`,
                        userLimit: 10,
                    },
                };


                await message.guild.channels.create(`${game.toLowerCase()}-chat`, options.gameTextGnrl);
                await message.guild.channels.create('tips-and-tricks', options.gameTextTaP);
                for (let i = 1; i <= 5; i++) {
                    await message.guild.channels.create(`Unranked #${i}`, options.gameVoice);
                }
                for (let j = 1; j <= 5; j++) {
                    await message.guild.channels.create(`Ranked #${j}`, options.gameVoice);
                }
                for (let k = 1; k <= 2; k++) {
                    await message.guild.channels.create(`Custom #${k}`, options.gameVoiceCstm);
                }

                Servers.findOne({
                    serverID: message.guild.id,
                }, async (err, resp) => {
                    if (err) console.error(err);

                    let channel = message.guild.channels.cache.find(ch => ch.name === resp.reactionChannels[0]);
                    let msg = channel.messages.cache.get(resp.messageID);
                    let msgEmoji = message.guild.emojis.cache.find(e => e.name === game);
                    await msg.react(msgEmoji);
                });

                await message.reply(`Game: ${game.toUpperCase()} added`);

            })
            .catch(e => {
                console.error(e);
            });
    } else if (args[0] === 'remove') {
        const game = args[1].toLowerCase();

        if (!game) {
            return message.reply('Please enter a game name');
        }

        if (!message.guild.roles.cache.find(ch => ch.name === game.toUpperCase())) {
            return message.reply(`${game.toUpperCase()} doesn't exist`);
        }

        axios({
            url: `https://api-v3.igdb.com/search`,
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'user-key': process.env.IGDB_API_KEY,
            },
            data: `search "${game}"; fields *;`,
        })
            .then(async res => {
                let originalGamesName = res.data[0].name.toLowerCase();
                let gameNames = res.data[0].alternative_name.toLowerCase();

                if (!gameNames.includes(game) && !originalGamesName.includes(game)) {
                    return message.reply(`${game} doesn't exist, please enter a valid game`);
                }

                let parent = message.guild.channels.cache.find(ch => ch.name === game.toUpperCase());

                let gameCustom;
                for (let i = 1; i <= 2; i++) {
                    gameCustom = message.guild.channels.cache.find(ch => ch.name === `Custom #${i}`);
                    if (gameCustom.parentID === parent.id) {
                        await gameCustom.delete();
                    }
                }

                let gameRanked;
                for (let j = 1; j <= 5; j++) {
                    gameRanked = message.guild.channels.cache.find(ch => ch.name === `Ranked #${j}`);
                    if (gameRanked.parentID === parent.id) {
                        await gameRanked.delete();
                    }
                }

                let gameUnranked;
                for (let k = 1; k <= 5; k++) {
                    gameUnranked = message.guild.channels.cache.find(ch => ch.name === `Unranked #${k}`);
                    if (gameUnranked.parentID === parent.id) {
                        await gameUnranked.delete();
                    }
                }

                let gameGnrlTxt = message.guild.channels.cache.find(ch => ch.name === `${game.toLowerCase()}-chat`);
                if (gameGnrlTxt.parentID === parent.id) {
                    await gameGnrlTxt.delete();
                }

                let gameTaPTxt = message.guild.channels.cache.find(ch => ch.name === 'tips-and-tricks');
                if (gameTaPTxt.parentID === parent.id) {
                    await gameTaPTxt.delete();
                }

                await parent.delete();

                let gameEmoji = message.guild.emojis.cache.find(e => e.name === game.toLowerCase());
                await gameEmoji.delete();

                let gameRole = message.guild.roles.cache.find(r => r.name === game.toUpperCase());
                await gameRole.delete();

                Servers.findOne({
                    serverID: message.guild.id,
                }, async (err, resp) => {
                    if (err) console.error(err);

                    let channel = message.guild.channels.cache.find(ch => ch.name === resp.reactionChannels[0]);
                    let msg = channel.messages.cache.get(resp.messageID);
                    let msgReaction = msg.reactions.cache.find(e => e._emoji.name === game);

                    await msgReaction.remove();
                });

                await message.reply(`Game: ${game.toUpperCase()} removed`);
            });
    }
};

exports.randomHex = () => {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

exports.help = {
    name: 'game',
    aliases: [],
    args: ['<add/remove>', '<game name>'],
    permission: 'OWNER',
    description: 'Game Managment',
};