exports.run = (client, message) => {
    message.channel.send('Ping?').then(m => m.edit(`API: ${m.createdTimestamp - message.createdTimestamp}ms. Web Socket: ${Math.round(client.ws.ping)}ms`));
};

exports.help = {
    enabled: true,
    name: 'ping',
    aliases: [],
    args: [],
    permission: 'USER',
    description: 'Pings Discord for API response',
};