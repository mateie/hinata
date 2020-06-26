let rps = ["**:moyal: Rock", "**:pencil: Paper**", "**:scissors: Scissors**"];
function random() { return `${rps[Math.floor(Math.random() * Math.floor(2))]}`;}

exports.run = (client, message, args) => {
    let choice = args.join(' ').toLowerCase();
    if(choice === '') return message.reply('Specify rock, paper or scissors');
    if (choice !== "rock" && choice !== "paper" && choice !== "scissors") return message.reply(`Specify rock, paper or scissors. ${choice} doesn't exist`);
    message.reply(random());
};

exports.help = {
    name: 'rps',
    aliases: ['rockpaperscissors'],
    args: [],
    permission: 'USER',
    description: 'Rock, Paper, Scissors',
};