/* eslint-disable no-lonely-if */
/* eslint-disable no-shadow */
const { client } = require('../index');

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const Servers = require('../models/servers');
const Users = require('../models/users');

client.on('ready', async () => {
    let presence = [
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

    if (process.env.STREAMERS === true) {
    } else {
        console.log('Streamers presence is disabled');
        setInterval(() => {
            client.guilds.cache.forEach(guild => {
                guild.members.cache.forEach(member => {
                    if (member.id === process.env.OWNER_ID) {
                        ownerStatus = member.presence.status;
                        ownerActivityObj = member.presence.activities;
                        if (typeof (ownerActivityObj) === undefined || ownerActivityObj.length < 1) {
                            let index = Math.floor(Math.random() * presence.length);
                            client.user.setPresence(presence[index]);
                        } else {
                            if (ownerActivityObj[0].type === 'LISTENING') {
                                if (ownerActivityObj[0].state.includes(';')) {
                                    ownerActivityObj[0].state = ownerActivityObj[0].state.replace(';', ',');
                                }
                                ownerActivity = {
                                    name: `${ownerActivityObj[0].details} by ${ownerActivityObj[0].state}`,
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
        }, 10000);
    }

    let ownerActivityObj, ownerActivity, ownerStatus;

    client.guilds.cache.forEach(guild => {
        Servers.findOne({
            serverID: guild.id,
        }, async (err, res) => {
            if (err) console.error(err);

            if (!res) {
                let customGuild = guild;
                client.emit('guildCreate', customGuild);
                console.info(`Adding new guild to the database... (Guild ID: ${guild.id})`);
                /* } else {
                    if (res.channels.reactions.length < 0) {
                        console.info('This guild doesn\'t have reaction channel set in the database');
                    } else {
                        const channel = client.channels.cache.find(ch => ch.name === res.channels.reactions);
                        if (!channel) {
                            console.info(`This server doesn't have ${res.channels.reaction} channel`);
                        } else {
                            if (channel.guild.id === res.serverID) {

                                try {
                                    channel.messages.fetch();
                                } catch (err) {
                                    console.error('Error fetching messages', err);
                                    return;
                                }

                                const messages = channel.messages;

                                console.log(messages);

                                if (!messages) {
                                    console.info('There is no message in the channel');
                                } else {
                                    res.messageID = channel.messages.cache.first().id;
                                    res.save();

                                    console.log(`Watching message '${res.messageID}' in ${res.servername} for reactions...`);
                                }
                            }
                        }
                    }*/
            }

        });
        guild.members.cache.forEach(member => {
            Users.findOne({
                serverID: guild.id,
                userID: member.user.id,
            }, (err, res) => {
                if (err) console.error(err);

                if (!res && !member.user.bot) {
                    client.emit('guildMemberAdd', member);
                    console.debug(`Adding new guild member to the database... (Guild ID: ${guild.id}, User ID: ${member.id}, Name: ${member.user.username})`);
                }
            });
        });
    });

    console.info('Running...');
});