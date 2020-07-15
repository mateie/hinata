/* eslint-disable no-shadow */
const Discord = require('discord.js');
const Request = require('request');

exports.run = async (client, message, args) => {
    let country = new String();
    if(!args[0] || args[0] == 'world' || args[0] == 'global' || args[0] == 'all') country = 'all';
    else country = args.join(' ');

    let options = {
        method: 'GET',
        url: 'https://covid-193.p.rapidapi.com/',
        qs: {},
        headers: {
            'x-rapidapi-host': 'covid-193.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPID_API_KEY,
        },
    };

    if(country == 'all') {
        options.url += 'statistics';
        options.qs = { country: country };
        Request(options, async (err, res, body) => {
            if(err) return console.error(err);
            body = JSON.parse(body);

            message.channel.send(this.createEmbed(client, body, 'Global'));
        });
    } else {
        options.url += 'countries';
        options.qs = { search: country };

        Request(options, async (err, res, body) => {
            if(err) return console.error(err);
            body = JSON.parse(body);

            if(body.results == 0) {
                return message.channel.send('Provided country was not found');
            }

            let existingCountry = body.response[0];
            options.url = 'https://covid-193.p.rapidapi.com/statistics';
            options.qs = { country: existingCountry };

            Request(options, async (err, res, body) => {
                if(err) return console.error(err);
                body = JSON.parse(body);

                message.channel.send(this.createEmbed(client, body, existingCountry));
            });
        });
    }
};

exports.createEmbed = (client, body, header) => {
    let time = new Date(Date.parse(body.response[0].time));

    let embed = new Discord.MessageEmbed()
    .setTitle(`COVID-19 ${header} Statistics`)
    .addField('Total cases', new Intl.NumberFormat('en-US', { useGrouping: true }).format(body.response[0].cases.total))
    .addField('Total deaths', new Intl.NumberFormat('en-US', { useGrouping: true }).format(body.response[0].deaths.total))
    .addField('Last update', time.toUTCString());

    return embed;
};

exports.help = {
    enabled: true,
    name: 'covid19',
    aliases: ['coronavirus', 'covid'],
    args: ['[country|world|global|all]'],
    permission: 'USER',
    description: 'Displays COVID-19 Statistics',
};