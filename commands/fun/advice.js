const request = require('superagent');

exports.run = async (client, message) => {
    request
    .get('http://api.adviceslip.com/advice')
    .end((err, res) => {
        if(!err && res.status === 200) {
            try {
                JSON.parse(res.text);
            } catch(e) {
                return message.channel.send('An API Error Occured');
            }
            const advice = JSON.parse(res.text);
            message.channel.send(advice.slip.advice);
        } else {
            console.error(`REST Call Failed: ${err}, Status Code: ${res.status}`);
        }
    });
};

exports.help = {
    name: 'advice',
    aliases: [],
    args: [],
    permission: 'USER',
    descirption: 'Sends a Life advice',
};