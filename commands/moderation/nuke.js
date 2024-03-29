const Servers = require(`${process.cwd()}/models/servers`);

exports.run = async (client, message, args) => {
    const randomNukeGIF = ['https://media.giphy.com/media/HhTXt43pk1I1W/giphy.gif', 'https://media.giphy.com/media/uSHMDTUL7lKso/giphy.gif', 'https://media.giphy.com/media/OMPqWQVhND9Vm/giphy.gif'];

    await Servers.findOne({
        serverID: message.guild.id,
    }, async (err, settings) => {

        if (err) return console.error(err);

        if (!args[0]) {
            const channel = message.guild.channels.cache.find(ch => ch.name === message.channel.name);
            const options = {
                type: channel.type,
                topic: channel.topic,
                nsfw: channel.nsfw,
                parent: channel.parentID,
                permissionOverwrites: channel.permissionOverwrites,
                position: channel.rawPosition,
                rateLimitPerUser: channel.rateLimitPerUser,
            };

            channel.delete();

            const newChannel = await message.guild.channels.create(channel.name, options);

            let dbChannel = false;

            while (!dbChannel) {
                Object.values(settings.channels).forEach((ch, index) => {
                    if (index > 1) {
                        if (channel.id === ch.id) {
                            ch.id = newChannel.id;
                            dbChannel = true;
                        }
                    }
                });
            }

            settings.save();

            return newChannel.send(`This Channel has been Nuked by ${message.member}`, { files: [randomNukeGIF[Math.floor(Math.random() * randomNukeGIF.length)]] });
        } else {
            const argsChannel = args[0];
            const channel = message.guild.channels.cache.find(ch => ch.name === argsChannel);

            let options = new Object();

            if (channel.type === 'text') {
                options = {
                    type: channel.type,
                    topic: channel.topic,
                    nsfw: channel.nsfw,
                    parent: channel.parentID,
                    permissionOverwrites: channel.permissionOverwrites,
                    position: channel.rawPosition,
                    rateLimitPerUser: channel.rateLimitPerUser,
                };

                channel.delete();
                const newChannel = await message.guild.channels.create(channel.name, options);

                newChannel.send(`**${message.author.username}** nuked this channel :sunglasses:`, { files: [randomNukeGIF[Math.floor(Math.random() * randomNukeGIF.length)]] })
                    .then(msg => msg.delete({ timeout: 3000 }));
            } else if (channel.type === 'voice') {
                options = {
                    type: channel.type,
                    bitrate: channel.bitrate,
                    userLimit: channel.userLimit,
                    parent: channel.parentID,
                    permissionOverwrites: channel.permissionOverwrites,
                    position: channel.rawPosition,
                };

                channel.delete();
                await message.guild.channels.create(channel.name, options);

                return message.channel.send(`**${message.author.username}** nuked ${channel.name} channel :flushed:`, { files: [randomNukeGIF[Math.floor(Math.random() * randomNukeGIF.length)]] });
            } else if (channel.type === 'category') {
                message.channel.send('Are you sure? Type !CONFIRM, if yes');
                const filter = m => m.author.id === message.author.id;
                message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
                    .then(async collected => {
                        let answer = collected.first().content;

                        if (answer.includes('CONFIRM')) {
                            options = {
                                type: channel.type,
                                permissionOverwrites: channel.permissionOverwrites,
                                position: channel.rawPosition,
                            };

                            const child = channel.children;

                            console.log(child);

                            child.forEach(async c => {
                                await c.delete();
                            });

                            await channel.delete();
                            await message.guild.channels.create(channel.name, options);

                            return message.channel.send(`**${message.author.username}** nuked ${channel.name} category :flushed:`, { files: [randomNukeGIF[Math.floor(Math.random() * randomNukeGIF.length)]] });
                        } else {
                            return message.channel.send(`Nuking of ${channel.name} has been cancelled`);
                        }
                    })
                    .catch(err => {
                        console.error(err);
                        return message.channel.send('You had 60 seconds, the time ran out');
                    });
            }
        }

        settings.save().catch(err => console.error(err));

    });
};

exports.help = {
    enabled: false,
    name: 'nuke',
    aliases: [],
    args: ['[channel category/channel name]'],
    permission: 'OWNER',
    description: 'Nukes the channel',
};