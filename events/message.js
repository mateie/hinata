const { client } = require('../index');

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const EmojiRegex = require('emoji-regex');
const Servers = require('../models/servers');
const Users = require('../models/users');
const XPCalc = require('../util/experience');

client.on('message', async message => {
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;

    await Servers.findOne({
        serverID: message.guild.id,
    }, (err, res) => {
        if (err) console.error(err);

        if (!res) {
            message.channel.send(`The Bot wasn't properly configured on your server... Please, invite it again. https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`);
            return message.guild.leave();
        }

        client.prefix = res.prefix;
    });

    let messageArray = message.content.split(' ');
    let cmd = messageArray[0].toLowerCase();
    let args = messageArray.slice(1);

    let commandFile = client.commands.get(cmd.slice(client.prefix.length)) || client.aliases.get(cmd.slice(client.prefix.length));
    if (message.content.startsWith(client.prefix) && commandFile) {
        await Servers.findOne({
            serverID: message.guild.id,
        }, (err, res) => {
            if (err) console.error(err);

            if (!res) {
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
                        name: 'MODERATOR',
                        id: res.roles.moderator,
                        allowed_roles: ['USER', 'MODERATOR'],
                    },
                    {
                        name: 'ADMIN',
                        id: res.roles.admin,
                        allowed_roles: ['USER', 'MODERATOR', 'ADMIN'],
                    },
                    {
                        name: 'OWNER',
                        id: res.roles.owner,
                        allowed_roles: ['USER', 'MODERATOR', 'ADMIN', 'OWNER'],
                    },
                    {
                        name: 'BOT_OWNER',
                        id: '401269337924829186',
                        allowed_roles: ['USER', 'MODERATOR', 'ADMIN', 'OWNER', 'BOT_OWNER'],
                    },
                ],
            };

            let lastMax = -1;
            permission.nodes.forEach((value, index) => {
                if (member.some(r => r.id == value.id) && value.allowed_roles.length > index) {
                    lastMax = index;
                }
            });

            permission.actual = lastMax;

            if (message.author.id == message.guild.ownerID) {
                permission.actual = permission.nodes.find(n => n.name == 'OWNER');
                lastMax = permission.actual.allowed_roles.length;
            }

            if (message.author.id == '401269337924829186') {
                permission.actual = permission.nodes.find(n => n.name == 'BOT_OWNER');
                lastMax = permission.actual.allowed_roles.length;
            }

            let ok = false;
            permission.nodes.forEach(value => {
                if (commandFile.help.permission == value.name && lastMax >= value.allowed_roles.length) {
                    ok = true;
                }
            });

            if(commandFile.help.enabled === false) {
                return message.channel.send(`${commandFile.help.name} command is **Disabled**`);
            }

            if (ok) {
                let requiredArgs = 0, optionalArgs = 0;
                commandFile.help.args.forEach(value => {
                    if (value.startsWith('<')) {
                        requiredArgs += 1;
                    }

                    if (value.startsWith('[')) {
                        // eslint-disable-next-line no-unused-vars
                        optionalArgs += 1;
                    }
                });

                if (args.length >= requiredArgs) {
                    commandFile.run(client, message, args, permission);
                } else {
                    let err = `Usage:\`\`\`${client.prefix}${commandFile.help.name} ${commandFile.help.args.join(' ')}\`\`\``;
                    message.channel.send(err);
                }
            }
        });
    } else {
        Users.findOne({
            serverID: message.guild.id,
            userName: message.member.user.username,
            userID: message.member.user.id,
        }, (err, res) => {
            if (err) console.error(err);

            if (!res) {
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
                if (addExp > 2) addExp = 2;

                res.xp += addExp;

                if (res.xp >= XPCalc.getXp(res.level + 1)) {
                    res.level += 1;
                    // message.channel.send(`<@${message.member.id}> advanced to level ${res.level}`);
                }

                res.save();
            }
        });
    }
});