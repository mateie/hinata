/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
const { client } = require('../index');

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const EmojiRegex = require('emoji-regex');
const packageInfo = require('../package.json');
const Servers = require('../models/servers');
const Users = require('../models/users');
const XPCalc = require('../util/experience');

client.on('message', async message => {
    if(message.author.bot) return;
    if(message.channel.type === 'dm') return;

    await Servers.findOne({
        serverID: message.guild.id,
    }, (err, res) => {
        if(err) console.error(err);

        if(!res) {
            message.channel.send(`The Bot wasn't properly configured on your server... Please, invite it again. https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`);
            return message.guild.leave();
        }

        client.prefix = res.prefix;
        client.spamChannel = res.channels.spam;
    });

    let messageArray = message.content.split(' ');
    let cmd = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);

    let commandFile = client.commands.get(cmd.slice(client.prefix.length)) || client.aliases.get(cmd.slice(client.prefix.length));
    if(message.content.startsWith(client.prefix) && commandFile) {
        Servers.findOne({
            serverID: message.guild.id,
        }, (err, res) => {
            if(err) console.error(err);

            if(!res) {
                message.channel.send(`The Bot wasn't properly configured on your server... Please, invite it again. https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`);
                return message.guild.leave();
            }

            let everyone = message.guild.roles.cache.find(role => role.name === '@everyone');

            let member = message.member.roles.cache;
            let permission = {
                actual: -1,
                nodes: [
                    {
                        name: '@everyone',
                        id: everyone.id,
                        allowed_roles: ['@everyone'],
                    },
                    {
                        name: 'MUTE',
                        id: res.roles.mute,
                        allowed_roles: ['MUTE'],
                    },
                    {
                        name: 'USER',
                        id: res.roles.user,
                        allowed_roles: ['USER'],
                    },
                    {
                        name: 'DJ',
                        id: res.roles.dj,
                        allowed_roles: ['USER', 'DJ'],
                    },
                    {
                        name: 'ADMIN',
                        id: res.roles.admin,
                        allowed_roles: ['USER', 'DJ', 'ADMIN'],
                    },
                    {
                        name: 'OWNER',
                        id: res.roles.owner,
                        allowed_roles: ['USER', 'DJ', 'ADMIN', 'OWNER'],
                    },
                    {
                        name: 'BOT_OWNER',
                        id: '401269337924829186',
                        allowed_roles: ['USER', 'DJ', 'ADMIN', 'OWNER', 'BOT_OWNER'],
                    },
                ],
            };

            let lastMax = -1;
            permission.nodes.forEach((value, index) => {
                if(member.some(r => r.id == value.id) && index > lastMax) {
                    lastMax = index;
                }
            });

            permission.actual = lastMax;

            if(message.author.id == message.guild.ownerID) {
                permission.actual = permission.nodes.findIndex(n => n.name == 'OWNER');
                lastMax = permission.actual;
            }

            if(message.author.id == '401269337924829186') {
                permission.actual = permission.nodes.findIndex(n => n.name == 'BOT_OWNER');
                lastMax = permission.actual;
            }

            let ok = false;
            permission.nodes.forEach((value, index) => {
                if(commandFile.help.permission == value.name && lastMax >= index) {
                    ok = true;
                }
            });

            if(ok) {
                let requiredArgs = 0, optionalArgs = 0;
                commandFile.help.args.forEach(value => {
                    if(value.startsWith('<')) {
                        requiredArgs += 1;
                    }

                    if(value.startsWith('[')) {
                        optionalArgs += 1;
                    }
                });

                if(args.length >= requiredArgs || args.length <= requiredArgs) {
                    client.settings = {
                        roles: permission,
                        version: packageInfo.version,
                        repository: packageInfo.repository.url,
                        iconURL: 'https://cdn.discordapp.com/avatars/401269337924829186/06bbff31bbf6f1114bdad5e17dfbc59f.png?size=4096',
                    };

                    if(process.env.DEBUG == 'true') {
                        client.settings.version += '-dev';
                    }

                    commandFile.run(client, message, args);
                } else {
                    let err = `Usage: ${client.prefix}${commandFile.help.name} ${commandFile.help.args.join(' ')}`;
                    message.channel.send(err);
                }
            }
        });
    } else if(!client.spamChannel.includes(message.channel.id)) {
        Users.findOne({
            serverID: message.guild.id,
            userName: message.member.user.username,
            userID: message.member.user.id,
        }, (err, res) => {
            if(err) console.error(err);

            if(!res) {
                const newUser = new Users({
                    serverID: message.guild.id,
                    userName: message.member.user.username,
                    userID: message.member.user.id,
                    level: 0,
                    xp: 0,
                });

                newUser.save();
            } else {
                const regex = EmojiRegex();

                message.content = message.content
                .replace(/\s/g, '')
                .replace(/@everyone/g, '')
                .replace(/@here/g, '')
                .replace(/<:[A-Za-z0-9_]+:[0-9]+>/g, "")
                .replace(regex, '');

                let length = message.content.length;
                length -= message.mentions.channels.size * 21;
                length -= message.mentions.roles.size * 22;
                length -= message.mentions.users.size * 22;

                let addExp = length <= 3 ? 0 : parseFloat((length / 20).toFixed(2));
                if(addExp > 2) addExp = 2;

                res.xp += addExp;

                if(res.xp >= XPCalc.getXp(res.level + 1)) {
                    res.level += 1;
                    message.channel.send(`<@${message.member.id}> advanced to level ${res.level}`);
                }

                res.save();
            }
        });
    }
});