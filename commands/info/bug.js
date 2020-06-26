const axios = require('axios');

exports.run = (client, message, args) => {
    let bug = args.slice(0).join(' ');


    axios({
        'method': 'POST',
        'url': 'https://rapidprod-sendgrid-v1.p.rapidapi.com/mail/send',
        'headers': {
            'content-type': 'application/json',
            'x-rapidapi-host': 'rapidprod-sendgrid-v1.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPID_API_KEY,
            'accept': 'application/json',
            'useQueryString': true,
        }, 'data': {
            'personalizations': [{
                'to': [{
                    'email': process.env.OWNER_EMAIL,
                }], 'subject': `Bug report from ${message.member.displayName} in ${message.guild.name}`,
            }], 'from': {
                'email': `${message.member.displayName}@hinatabot.xyz`,
            }, 'content': [{
                'type': 'text/plain',
                'value': `${bug}\n\n\n${message.createdAt}`,
            }],
        },
    })
        .then(res => {
            if(typeof (res.data) !== 'undefined') {
                return message.channel.send('Bug report successfully sent');
            }
        })
        .catch((error) => {
            console.log(error);
            return message.channel.send('Couldn\'t send the bug report, please try again later');
        });
};

exports.help = {
    name: 'bug',
    aliases: [],
    args: ['[bug explanaiton]'],
    permission: 'USER',
    description: 'Report a bug',
};