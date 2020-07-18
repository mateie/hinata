const Discord = require('discord.js');
const GitHub = require('octonode');

const Client = GitHub.client({
    username: process.env.GITHUB_USERNAME,
    password: process.env.GITHUB_PASSWORD,
});

exports.run = async (client, message) => {
    let repo = Client.repo('mateie/hinata');

    repo.commits((err, res) => {
        if(err) console.error(err);

        let info = res;

        const embed = new Discord.MessageEmbed()
        .setAuthor(info[0].committer.login, info[0].committer.avatar_url, info[0].committer.html_url)
        .setTitle(`Last 5 Changes for ${client.user.username}`);
        for(let i = 0; i < 5; i++) {
            embed.addField(`\u200b`, `${info[i].commit.message}`);
        }

        message.channel.send({ embed });

    });
};

exports.help = {
    enabled: true,
    name: 'changelog',
    aliases: ['changes', 'github', 'updates'],
    args: [],
    permission: 'USER',
    description: 'Changelogs of the latest Bruh Bot release',
};