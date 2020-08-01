const Warframe = require('warframe.js');
const { MessageEmbed } = require('discord.js');

exports.run = async (client, message, args) => {
    let platform = args[0];
    if(platform === 'xbox') {
        platform = 'xb1';
    } else if(platform === 'playstation4') {
        platform = 'ps4';
    }
    const wf = new Warframe({
        platform: platform,
    });

    if (args[1] === 'alerts') {
        wf.alerts
            .then(alerts => {
                if(alerts.length < 1 || !alerts) {
                    return message.channel.send('```There are no alerts as of right now```');
                }
            });
    } else if (args[1] === 'earth' || args[1].includes('eidolon') || args[1].includes('plains')) {
        wf.cycleEarth
            .then(earth => {
                let until = earth.string.split(' ');
                until = until[until.length - 1];
                console.log(earth);
                message.channel.send(`\`\`\`Time: ${earth.state}\nTime Until ${until} finishes: ${earth.timeLeft}\`\`\``);
            });
    } else if (args[1] === 'cetus' || args[1] === 'fortuna') {
        wf.cycleCetus
            .then(cetus => {
                let until = cetus.string.split(' ');
                until = until[until.length - 1];
                console.log(cetus);
                message.channel.send(`\`\`\`Time: ${cetus.state}\nTime Until ${until}: ${cetus.timeLeft}\`\`\``);
            });
    } else if (args[1] === 'news' || args[1] === 'updates') {
        wf.news
            .then(updates => {
                let embed = new MessageEmbed()
                    .setTitle('Warframe Updates')
                    .setDescription('Sorted by Old to New');
                for (let i = 0; i < updates.length; i++) {
                    let update = updates[i];
                    embed.addField(update.langStrings.en, update.since);
                }

                message.channel.send({ embed });
            });
    } else if (args[1] === 'sortie' || args[1] === 'sorties') {
        wf.sorties
            .then(sorties => {
                let embed = new MessageEmbed()
                    .setTitle('Warframe Sorties')
                    .setDescription(`Faction: ${sorties.enemy.faction}, Boss: ${sorties.enemy.boss}`)
                    .addField('Time Left', sorties.countdown);

                sorties.missions.forEach(mission => {
                    embed.addField('Location', mission.node, true)
                        .addField('Type', mission.type, true)
                        .addField('Condition', mission.condition, true);
                });

                message.channel.send({ embed });
            });
    } else if (args[1].includes('baro') || args[1].includes('trader')) {
        wf.voidTrader
            .then(trader => {
                let embed = new MessageEmbed()
                    .setTitle(`Trader ${trader.name}`)
                    .setDescription(`Relay Location: ${trader.relay}`);
                if (!trader.active) {
                    embed.addField('Arrival', trader.fromString);
                } else {
                    embed.addField('Departure', trader.untilString);
                }
                if (args[2] === 'items' || args[2] === 'goodies' || args[2] === 'loot') {
                    trader.goodies.forEach(good => {
                        embed.addField('Item Name', good.item, true)
                            .addField('Ducat Cost', good.ducats, true)
                            .addField('Credits Cost', good.credits, true);
                    });
                }

                message.channel.send({ embed });
            });
    }
};

exports.help = {
    enabled: true,
    name: 'warframe',
    aliases: ['wf'],
    args: ['<platform>', '<earth/cetus/sorties/baro>', '[items]'],
    permission: 'MEMBER',
    description: 'Warframe Command',
};