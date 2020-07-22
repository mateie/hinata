const { MessageEmbed } = require('js');

const mcData = require('minecraft-data')('1.16');
const mcLib = require('minecraft-lib');
const mcServer = require('minecraft-server-status');

exports.run = async (client, message, args) => {
    if (args[0] === 'item') {
        let itemArg = args[1];
        if (!itemArg) {
            let allItems = mcData.itemsArray;
            let randomItem = allItems[Math.floor(Math.random() * allItems.length)];

            let item = {
                id: randomItem.id,
                name: randomItem.displayName,
                maxStack: randomItem.stackSize,
            };

            return message.channel.send(`\`\`\`Random Item: ${item.name}\nID: ${item.id}\nStack Size: ${item.maxStack}\`\`\``);
        } else {
            let mcItem = mcData.itemsByName[itemArg];
            if (!mcItem) {
                return message.reply('That item doesn\'t exist');
            }

            let item = {
                id: mcItem.id,
                name: mcItem.displayName,
                maxStack: mcItem.stackSize,
            };

            return message.channel.send(`\`\`\`Item: ${item.name}\nID: ${item.id}\nStack Size: ${item.maxStack}\`\`\``);
        }
    } else if (args[0] === 'block') {
        let blockArg = args[1];
        if (!blockArg) {
            let allBlocks = mcData.blocksArray;
            let randomBlock = allBlocks[Math.floor(Math.random() * allBlocks.length)];

            let block = {
                id: randomBlock.id,
                name: randomBlock.displayName,
                hardness: randomBlock.hardness,
                diggable: randomBlock.diggable,
                light: randomBlock.emitLight,
                transparent: randomBlock.transparent,
                maxStack: randomBlock.stackSize,
            };

            let breakSpeed;
            if (block.hardness == 0) {
                breakSpeed = 'Instant';
            } else if (block.hardness > 0.1 && block.hardness < 0.5) {
                breakSpeed = 'Very Fast';
            } else if (block.hardness > 0.6 && block.hardness < 3) {
                breakSpeed = 'Fast';
            } else if (block.hardness >= 3 && block.hardness <= 10) {
                breakSpeed = 'Slow';
            } else if (block.hardness > 10 && block.hardness < 100) {
                breakSpeed = 'Very Slow';
            } else if (block.hardness >= 100) {
                breakSpeed = 'Unbreakable';
            }

            let embed = new MessageEmbed()
                .setTitle(`Random Block ${block.name}`)
                .setDescription(`Block ID: ${block.id}`)
                .addField('Hardness', block.hardness, true);
            if (block.diggable === true) {
                embed.addField('Breakable', 'Yes', true);
            } else {
                embed.addField('Breakable', 'No', true);
            }
            embed.addField('Break Speed', breakSpeed, true);
            if (block.light === 0) {
                embed.addField('Light', 'Doesn\'t emit', true);
            } else {
                embed.addField('Light', `${block.light} Blocks`, true);
            }
            if (block.transparent === true) {
                embed.addField('Transparent', 'Yes', true);
            } else {
                embed.addField('Transparent', 'No', true);
            }
            if (block.maxStack === 0) {
                embed.addField('Stack Size', 'Doesn\'t Stack', true);
            } else {
                embed.addField('Stack Size', block.maxStack, true);
            }

            return message.channel.send({ embed });
        } else {
            let mcBlock = mcData.blocksByName[blockArg];
            if (!mcBlock) {
                message.reply('That block doesn\'t exist');
            }

            let block = {
                id: mcBlock.id,
                name: mcBlock.displayName,
                hardness: mcBlock.hardness,
                diggable: mcBlock.diggable,
                light: mcBlock.emitLight,
                transparent: mcBlock.transparent,
                maxStack: mcBlock.stackSize,
            };

            let breakSpeed;
            if (block.hardness == 0) {
                breakSpeed = 'Instant';
            } else if (block.hardness > 0.1 && block.hardness < 0.5) {
                breakSpeed = 'Very Fast';
            } else if (block.hardness > 0.6 && block.hardness < 3) {
                breakSpeed = 'Fast';
            } else if (block.hardness >= 3 && block.hardness <= 10) {
                breakSpeed = 'Slow';
            } else if (block.hardness > 10 && block.hardness < 100) {
                breakSpeed = 'Very Slow';
            } else if (block.hardness >= 100) {
                breakSpeed = 'Unbreakable';
            }

            let embed = new MessageEmbed()
                .setTitle(`${block.name} Block`)
                .setDescription(`Block ID: ${block.id}`)
                .addField('Hardness', block.hardness, true);
            if (block.diggable === true) {
                embed.addField('Breakable', 'Yes', true);
            } else {
                embed.addField('Breakable', 'No', true);
            }
            embed.addField('Break Speed', breakSpeed, true);
            if (block.light === 0) {
                embed.addField('Light', 'Doesn\'t emit', true);
            } else {
                embed.addField('Light', `${block.light} Blocks`, true);
            }
            if (block.transparent === true) {
                embed.addField('Transparent', 'Yes', true);
            } else {
                embed.addField('Transparent', 'No', true);
            }
            if (block.maxStack === 0) {
                embed.addField('Stack Size', 'Doesn\'t Stack', true);
            } else {
                embed.addField('Stack Size', block.maxStack, true);
            }

            return message.channel.send({ embed });
        }
    } else if (args[0] === 'biomes') {
        let biomes = mcData.biomesArray;
        let randomBiome = biomes[Math.floor(Math.random() * biomes.length)];

        let biome = {
            id: randomBiome.id,
            name: randomBiome.displayName,
            rainfall: randomBiome.rainfall,
            temperature: randomBiome.temperature,
        };

        return message.channel.send(`\`\`\`Random Biome: ${biome.name}\nID: ${biome.id}\nRain: ${biome.rainfall}\nTemperature: ${biome.temperature}`);
    } else if (args[0] === 'entity') {
        let entityArg = args[1];

        if (!entityArg) {
            let entities = mcData.entitiesArray;
            let randomEntity = entities[Math.floor(Math.random() * entities.length)];

            if (randomEntity.category.includes(' ')) {
                randomEntity.category = randomEntity.category.split(' ');
                randomEntity.category = randomEntity.category[0];
            }

            let entity = {
                id: randomEntity.id,
                name: randomEntity.displayName,
                width: randomEntity.width,
                height: randomEntity.height,
                category: randomEntity.category,
            };

            let embed = new MessageEmbed()
                .setTitle(`Random Entity ${entity.name}`)
                .setDescription(`Entity ID: ${entity.id}`)
                .addField('Width', entity.width, true)
                .addField('Height', entity.height, true)
                .addField('Category', entity.category, true);

            return message.channel.send({ embed });
        } else {
            let mcEntity = mcData.entitiesByName[entityArg];

            if (!mcEntity) {
                return message.reply('That entity doesn\'t exist');
            } else {
                if (mcEntity.category.includes(' ')) {
                    mcEntity.category = mcEntity.category.split(' ');
                    mcEntity.category = mcEntity.category[0];
                }

                let entity = {
                    id: mcEntity.id,
                    name: mcEntity.displayName,
                    width: mcEntity.width,
                    height: mcEntity.height,
                    category: mcEntity.category,
                };

                let embed = new MessageEmbed()
                    .setTitle(`${entity.name} Entity`)
                    .setDescription(`Entity ID: ${entity.id}`)
                    .addField('Width', entity.width, true)
                    .addField('Height', entity.height, true)
                    .addField('Category', entity.category, true);

                return message.channel.send({ embed });
            }
        }
    } else if (args[0] === 'server') { // Disabled Thumbnail for the server for now, since heroku doesn't work with it.
        let server = args[1];

        if (!server) {
            return message.reply('Server IP/Domain not provided');
        } else {
            // let imageBuffer, iconDir, iconName, icon;

            if (!server.includes(':')) {
                server = server.split(':');
                server[1] = 25565;
            } else {
                server = server.split(':');
                server[1] = parseInt(server[1]);
            }

            mcServer(server[0], server[1], srv => {
                if (srv.status === 'error') {
                    return message.reply(`${this.capitalize(srv.error)}`);
                }
                if (srv.online === false) {
                    return message.reply('The following server is offline or doesn\'t exist');
                }
                /* if (srv.favicon !== null || srv.favicon !== undefined) {

                    imageBuffer = this.decodeBase64Image(srv.favicon);
                    iconDir = `${process.cwd()}/data/images/`;
                    iconName = `server_icon_${randomstr.generate(5)}.png`;
                    icon = `${iconDir}${iconName}`;
                    fs.writeFile(icon, imageBuffer.data, err => {
                        if (err) console.error(err);
                    });
                }*/

                let lastOnline = new Date(parseInt(srv.last_online * 1000)).toDateString();

                let serverInfo = {
                    status: srv.online,
                    description: srv.motd,
                    players: {
                        online: srv.players.now,
                        max: srv.players.max,
                    },
                    version: srv.server.name,
                    last_online: lastOnline,
                };

                if (serverInfo.description.match(/§(?=)[a-z]/gm)) {
                    serverInfo.description = serverInfo.description.replace(/§(?=)[a-z1-9]/gm, '');
                    if (serverInfo.description.includes('§')) {
                        serverInfo.description = serverInfo.description.replace('§', '');
                    }
                }

                let embed = new MessageEmbed()
                    .setTitle('Server Info')
                    .setDescription(serverInfo.description)
                    /* .attachFiles([`${icon}`])
                    .setThumbnail(`attachment://${iconName}`)*/
                    .addField('Players Online', serverInfo.players.online, true)
                    .addField('Max Players', serverInfo.players.max, true)
                    .addField('Last Online', serverInfo.last_online, true)
                    .setFooter(`Version: ${serverInfo.version}`);

                return message.channel.send({ embed });
                /* .then(() => {
                    fs.unlinkSync(icon);
                });*/
            });
        }
    } else if(args[0] === 'user' || args[0] === 'account') {
        let account = args[1];
        if(!account) {
            return message.reply('Username not provided');
        } else {
            mcLib.players.get(account)
            .then(p => {
                let player = {
                    id: p.uuid,
                    name: p.username,
                    skin: {
                        url: p.textures.skin_url,
                        cape: p.textures.cape_url,
                        slim: p.textures.slim,
                    },
                    name_history: [],
                };

                Object.keys(p.username_history._history).forEach(name => {
                    player.name_history.push(name);
                });

                player.name_history = player.name_history.join(', ');

                let embed = new MessageEmbed()
                .setTitle(`${player.name}'s Minecraft Profile`)
                .setThumbnail(player.skin.url)
                .addField(`UUID`, player.id);
                if(player.skin.cape === null) {
                    embed.addField('Cape', 'No', true);
                } else {
                    embed.addField('Cape', 'Yes', true);
                }
                if(player.skin.slim === true) {
                    embed.addField('Skin Type', 'Alex', true);
                } else {
                    embed.addField('Skin Type', 'Steve', true);
                }
                embed.addField('Username History', player.name_history);

                return message.channel.send({ embed });
            })
            .catch(err => {
                console.error(err);
                return message.reply('Could\'t find that user');
            });
        }
    } else {
        message.reply(`Usage: ${this.help.args[0]} ${this.help.args[1]}`);
    }
};

exports.decodeBase64Image = (dataString) => {
    let matches = dataString.match(/^data:([A-Za-z-+/]+);base64,(.+)$/), response = {};

    if (matches.length !== 3) {
        return new Error('Invalid Input String');
    }

    response.type = matches[1];
    response.data = new Buffer.from(matches[2], 'base64');

    return response;
};

exports.capitalize = (str) => {
    if (typeof (str) === 'string') {
        return str.replace(/^\w/, c => c.toUpperCase());
    } else {
        return console.error('Non string provided');
    }
};

exports.help = {
    enabled: true,
    name: 'minecraft',
    args: ['<item/block/biomes/entity/server/user|account>', '<item name/block name/*/entity name/server ip|port or hostname/username>'],
    aliases: ['mc'],
    permission: 'USER',
    description: 'Minecraft Database',
};