const Discord = require('discord.js');
const GitHub = require('octonode');

const Client = GitHub.client(process.env.GITHUB_API_TOKEN);

exports.run = async (client, message) => {
    let repository = Client.repo('mateie/bruhbot');

    repository.releases((err, res) => {
        if(err) console.error(err);

        let latest = res[0];

        let changelogEmbed = new Discord.MessageEmbed()
        .setTitle(`Changelog: Bruh Bot`)
        .setURL(latest.html_url)
        .addField(latest.name, `Released by ${latest.author.login}`)
        .addField(`Notes`, latest.body.split('#').join(''));

        message.channel.send(changelogEmbed);
    });
};

exports.help = {
    name: 'changelog',
    aliases: ['changes', 'github', 'updates'],
    args: [],
    permission: 'USER',
    description: 'Changelogs of the latest Bruh Bot release',
};