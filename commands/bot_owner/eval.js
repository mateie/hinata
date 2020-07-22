exports.run = (client, message, args) => {
    args = args.join(' ');
    try {
        let evaled = eval(args);
        if(typeof (evaled) !== 'string') {
            evaled = require('util').inspect(evaled);
            message.channel.send(`\`\`\`xl\n${this.clean(evaled)}\n\`\`\``);
        }
    } catch(err) {
        message.channel.send(`\`Error\` \`\`\`xl\n${this.clean(err)}\n\`\`\``);
    }
};

exports.help = {
    enabled: true,
    name: 'eval',
    aliases: [],
    args: ['<text>'],
    permission: 'BOT_OWNER',
    description: 'Evaluates a JS String',
};

exports.clean = text => {
    if(typeof (text) === 'string') {
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
    } else {
        return text;
    }
};
