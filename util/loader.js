const fs = require('fs');
const packageInfo = require('../package.json');

exports.init = () => {
    console.log(`Initializing Hinata ${packageInfo.version}...\n`);
};

exports.events = () => {
    console.log(`Loading events...`);

    let totalEvents = 0;

    let files = fs.readdirSync('./events/');
    let jsFiles = files.filter(f => f.split('.').pop() === 'js');
    totalEvents += jsFiles.length;

    jsFiles.forEach(event => {
        require(`../events/${event}`);
        console.info(`${event} loaded`);
    });

    if(totalEvents > 0) {
        console.info(`${totalEvents} events loaded \n`);
    } else {
        console.warn('Events not found\n');
    }
};

exports.commands = client => {
    console.info('Loading commands...');

    let totalCommands = 0;

    let categories = fs.readdirSync('./commands');
    categories.forEach(category => {
        let commands = fs.readdirSync(`./commands/${category}`);
        let jsFiles = commands.filter(f => f.split('.').pop() === 'js');
        totalCommands += jsFiles.length;

        commands.forEach(command => {
            let props = require(`../commands/${category}/${command}`);
            props.help.category = category;

            if(!client.categories.includes(category)) {
                client.categories.push(category);
            }

            props.help.aliases.forEach(value => {
                client.aliases.set(value, props);
            });

            client.commands.set(props.help.name, props);

            console.info(`${category}/${command} loaded`);
        });
    });

    if(totalCommands > 0) {
        console.info(`${totalCommands} commands loaded`);
        console.info(`${client.categories.length} categories loaded\n`);
    } else {
        console.warn(`Commands not found\n`);
    }
};