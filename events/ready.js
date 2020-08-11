const { client } = require('../index');
const Dashboard = require(`${process.cwd()}/dashboard/app`);

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const Servers = require('../models/servers');
const Users = require('../models/users');

client.on('ready', async () => {
    let presences = [
        {
            status: 'online',
            activity: {
                name: 'Anime Thighs',
                type: 'LISTENING',
            },
        },
        {
            status: 'online',
            activity: {
                name: 'Anime',
                type: 'WATCHING',
            },
        },
        {
            status: 'dnd',
            activity: {
                name: 'Visual Studio Code',
                type: 'PLAYING',
            },
        },
        {
            status: 'idle',
            activity: {
                name: 'Suggestions',
                type: 'LISTENING',
            },
        },
    ];

    let ownerActivityObj, ownerActivity, ownerStatus;

    setInterval(() => {
        client.guilds.cache.forEach(guild => {
            guild.members.cache.forEach(member => {
                if (member.id === process.env.OWNER_ID) {
                    ownerStatus = member.presence.status;
                    ownerActivityObj = member.presence.activities;
                    if (typeof (ownerActivityObj) === undefined || ownerActivityObj.length < 1) {
                        let index = Math.floor(Math.random() * presences.length);
                        client.user.setPresence(presences[index]);
                    } else {
                        if (ownerActivityObj[0].type === 'LISTENING') {
                            ownerActivity = {
                                name: `${ownerActivityObj[0].details}`,
                                type: 'LISTENING',
                            };
                        } else if (ownerActivityObj[0].type === 'PLAYING') {
                            ownerActivity = {
                                name: `${ownerActivityObj[0].name}`,
                                type: 'PLAYING',
                            };
                        }

                        let presence = {
                            status: ownerStatus,
                            activity: ownerActivity,
                        };

                        client.user.setPresence(presence);
                    }
                }
            });
        });
    }, 5000);

    client.guilds.cache.forEach(async guild => {
        let server = await Servers.findOne({ serverID: guild.id }).catch(err => console.error(err));

        if (!server) {
            let customGuild = guild;
            client.emit('guildCreate', customGuild);
            console.info(`Adding new guild to the database... (Guild ID: ${guild.id})`);
        } else {

            if (server.toggles.reaction_roles) {
                if (server.channels.reactions.length < 0) {
                    console.info('This guild doesn\'t have reaction channel set in the database');
                } else {
                    const channel = guild.channels.cache.find(ch => ch.name === server.channels.reactions);
                    if (!channel) {
                        console.info(`This server doesn't have reactions channel`);
                    } else if (channel.guild.id === server.serverID) {
                        try {
                            await channel.messages.fetch();
                        } catch (err) {
                            console.error('Error fetching messages');
                            console.error(err);
                            return;
                        }

                        const messages = channel.messages;
                        if (!messages) {
                            console.info('There is no messages in the channel');
                        } else {
                            server.messageID = channel.messages.cache.first().id;

                            console.log(`Watching message '${server.messageID}' in ${server.serverName} for reactions...`);
                        }
                    }
                }
            }

            for (let i = 1; i < Object.keys(server.roles).length; i++) {
                let role = Object.values(server.roles)[i];
                let gRole = guild.roles.cache.find(r => r.name === role.name);
                if (gRole) {
                    role.id = gRole.id;
                } else {
                    role.id = '';
                }
            }

            for(let j = 1; j < Object.keys(server.channels).length; j++) {
                let channel = Object.values(server.channels)[j];
                let gChan = guild.channels.cache.find(ch => ch.name === channel.name);
                if(gChan) {
                    channel.id = gChan.id;
                } else {
                    channel.id = '';
                }
            }

            guild.members.cache.forEach(member => {
                Users.findOne({
                    userID: member.user.id,
                }, (err, res) => {
                    if (err) console.error(err);

                    if (!res && !member.user.bot) {
                        client.emit('guildMemberAdd', member);
                        console.debug(`Adding new guild member to the database... (Guild ID: ${guild.id}, User ID: ${member.id}, Name: ${member.user.username})`);
                    }
                });
            });
        }

        server.save();
    });

    client.users.cache.filter(u => !u.bot).forEach(user => {
        Users.findOne({
            userID: user.id,
        }, (err, res) => {
            if (err) console.error(err);

            if (!res && !user.bot) {
                client.emit('guildMemberAdd', user);
                console.debug(`Adding new User to the database... (User ID: ${user.id}, Name: ${user.username})`);
            }
        });
    });

    Dashboard(client);

    console.info('Bot Engine is Running...');
});