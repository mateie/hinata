const Discord = require('discord.js');
const GitHub = require('octonode');

const Client = GitHub.client(process.env.GITHUB_API_TOKEN);

exports.run = async (client, message) => {
    let repo = Client.repo('mateie/hinata');

    repo.commits((err, res) => {
        if(err) console.error(err);

        let info = res[0];

        const embed = new Discord.MessageEmbed()
        .setAuthor(info.committer.login, info.committer.avatar_url, info.committer.html_url)
        .setTitle(`Changelog for ${client.user.username}`)
        .setDescription(info.commit.message);

        message.channel.send({ embed });

    });
};

exports.help = {
    name: 'changelog',
    aliases: ['changes', 'github', 'updates'],
    args: [],
    permission: 'USER',
    description: 'Changelogs of the latest Bruh Bot release',
};