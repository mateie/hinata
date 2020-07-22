exports.run = (client, message) => {
    let milliseconds = parseInt((client.uptime % 1000) / 100),
    seconds = parseInt((client.uptime / 1000) & 60),
    minutes = parseInt((client.uptime / (1000 * 60)) % 60),
    hours = parseInt((client.uptime / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? '0' + hours : hours;
    minutes = (minutes < 10) ? '0' + minutes : minutes;
    seconds = (seconds < 10) ? '0' + seconds : seconds;

    message.channel.send(`:chart_with_upwards_trend: I've been running for **${hours}** Hours, **${minutes}** Minutes and **${seconds}**.${milliseconds} Seconds`);
};

exports.help = {
    enabled: true,
    name: 'uptime',
    aliases: [],
    args: [],
    permission: 'USER',
    description: 'Shows how long the bot has been online for',
};