/* eslint-disable no-lonely-if */
const Discord = require('discord.js');
const mongoose = require('mongoose');

const Servers = require('../../models/servers');

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

exports.run = async (client, message, args) => {
    if (!args[0]) {
        return message.reply('Please provide which setting you want to change');
    } else {
        Servers.findOne({
            serverID: message.guild.id,
        }, (err, settings) => {
            if (err) console.error(err);

            if (args[0] === 'prefix') {
                if (!args[1]) {
                    return message.reply(`Current prefix is "${settings.prefix}"`);
                } else {
                    message.reply(`Prefix set from "${settings.prefix}" to "${args[1]}"`);
                    settings.prefix = args[1];
                }
            } else if (args[0] === 'roles') {
                if (!args[1]) {
                    let embed = new Discord.MessageEmbed()
                        .setTitle('Roles List');
                    for (let i = 1; i < Object.keys(settings.roles).length; i++) {
                        let roleName = Object.keys(settings.roles)[i];
                        let roleValue = settings.roles[roleName];

                        if (roleValue === '') {
                            roleValue = 'Not Set';
                        }
                        embed.addField(roleName, roleValue, true);
                    }

                    return message.channel.send({ embed });
                } else if (args[1] === 'set' || args[1] === 'add') {
                    if (!args[2]) {
                        return message.reply('Please provide which role you want to set/add');
                    } else {
                        let roleTarget = args[2].toLowerCase();
                        if (!args[3]) {
                            return message.reply(`Please provide what should I set ${roleTarget} to...`);
                        } else {
                            let role = args[3];
                            if (role.includes('@')) {
                                role = message.guild.roles.cache.find(r => r.id === role);
                            }
                            if (typeof (settings.roles[roleTarget]) === 'undefined') {
                                return message.reply(`${roleTarget} doesn't exist`);
                            } else {
                                settings.roles[roleTarget] = role;
                            }
                        }
                    }
                } else if (args[1] === 'unset' || args[1] === 'remove') {
                    if (!args[2]) {
                        return message.reply('Please provide which role you want to unset/remove');
                    } else {
                        let roleTarget = args[2].toLowerCase();
                        if (typeof (settings.roles[roleTarget]) === 'undefined') {
                            return message.reply(`${roleTarget} doesn't exist`);
                        } else {
                            settings.roles[roleTarget] = '';
                        }
                    }
                } else {
                    return message.channel.send(`\`\`\`Use ${settings.prefix}settings roles <add/remove/set/unset> <role> <role | @role>\`\`\``);
                }
            } else if (args[0] === 'channels') {
                if (!args[1]) {
                    let embed = new Discord.MessageEmbed()
                        .setTitle('Channels List');
                    for (let i = 1; i < Object.keys(settings.channels).length; i++) {
                        let channelName = Object.keys(settings.channels)[i];
                        let channelValue = settings.channels[channelName];

                        if (channelName === '') {
                            channelValue = 'Not Set';
                        }
                        embed.addField(channelName, channelValue, true);
                    }

                    return message.channel.send({ embed });
                } else if (args[1] === 'set' || args[1] === 'add') {
                    if (!args[2]) {
                        return message.reply('Please provide which channel you want to set/add');
                    } else {
                        let channelTarget = args[2].toLowerCase();
                        if (!args[3]) {
                            return message.reply(`Please provid what should I set ${channelTarget} to...`);
                        } else {
                            let channel = args[3];
                            if (channel.includes('#')) {
                                return message.reply('For now you can\'t mention channels, it causes a database crash :(');
                                // channel = message.guild.channels.cache.find(c => c.id === args[3]);
                            }
                            if (typeof (settings.channels[channelTarget]) === 'undefined') {
                                return message.reply(`${channelTarget} doesn't exist`);
                            } else {
                                settings.channels[channelTarget] = channel;
                            }
                        }
                    }
                } else if (args[1] === 'unset' || args[1] === 'remove') {
                    if (!args[2]) {
                        return message.reply('Please provide which channel you want to unset/remove');
                    } else {
                        let channelTarget = args[2].toLowerCase();
                        if (typeof (settings.channels[channelTarget]) === 'undefined') {
                            return message.reply(`${channelTarget} doesn't exist`);
                        } else {
                            settings.channels[channelTarget] = '';
                        }
                    }
                } else {
                    return message.channel.send(`\`\`\`Use ${settings.prefix}settings channels <add/remove/set/unset> <channel> <channel | #channel>\`\`\``);
                }
            } else if (args[0] === 'notifications' || args[0] === 'notify' || args[0] === 'notif') {
                if (!args[1]) {
                    let embed = new Discord.MessageEmbed()
                        .setTitle('All Notifications');
                    for (let i = 1; i < Object.keys(settings.notifications).length; i++) {
                        let notificationsNames = Object.keys(settings.notifications)[i];
                        let notificationValues = settings.notifications[notificationsNames];

                        for (let j = 1; j < Object.keys(notificationValues).length; j++) {
                            let notifName = Object.keys(notificationValues)[j];
                            let notifValue = settings.notifications[notificationsNames][notifName];


                            if (notifValue === true) {
                                notifValue = 'On';
                            } else {
                                notifValue = 'Off';
                            }

                            embed.addField(notificationsNames, `${notifName}: ${notifValue}`, true);
                        }
                    }

                    return message.channel.send({ embed });
                } else {
                    let notif = args[1];
                    if (!args[2]) {
                        if (typeof (settings.notifications[notif]) === 'undefined') {
                            return message.channel.send(`\`\`\`${notif} Notification doesn't exist\`\`\``);
                        } else {
                            let embed = new Discord.MessageEmbed()
                                .setTitle(`${notif} Notification Settings`);
                            for (let i = 1; i < Object.keys(settings.notifications[notif]).length; i++) {
                                let notifName = Object.keys(settings.notifications[notif])[i];
                                let notifValue = settings.notifications[notif][notifName];

                                if (notifValue === true) {
                                    notifValue = 'On';
                                } else {
                                    notifValue = 'Off';
                                }

                                embed.addField(notifName, notifValue, true);
                            }

                            return message.channel.send({ embed });
                        }
                    } else if(args[2] === 'set' || args[2] === 'add') {
                        let type = args[3];
                        if(typeof (settings.notifications[notif][type]) === 'undefined') {
                            return message.channel.send(`\`\`\`${type} Notification Type doesn't exist\`\`\``);
                        } else {
                            let value = args[4];
                            if(value === 'on' || value == 'true') {
                                value = true;
                            } else if(value === 'off' || value == 'false') {
                                value = false;
                            } else {
                                return message.channel.send(`\`\`\`${value} must be On/Off or true/false\`\`\``);
                            }
                            settings.notifications[notif][type] = value;
                        }
                    } else if(args[2] === 'unset' || args[2] === 'remove') {
                        let type = args[3];
                        if(typeof (settings.notifications[notif][type]) === 'undefined') {
                            return message.channel.send(`\`\`\`${type} Notification Type doesn't exist\`\`\``);
                        } else {
                            settings.notifications[notif][type] = false;
                        }
                    }
                }
            }

            settings.save()
                .then(() => {
                    return message.channel.send('```Server Settings Updated!```');
                })
                .catch(err => {
                    console.error(err);
                    return message.channel.send('```Couldn\'t Update Server Settings!```');
                });
        });
    }
};

exports.help = {
    name: 'settings',
    aliases: ['sett', 'options', 'config', 'cfg'],
    args: ['[key]', '[value | @role]'],
    permission: 'OWNER',
    description: 'Edit the server settings',
};