const { GeneralError } = require('../util/errors');
const { renderTemplate, capFirstLetter, capAllLetters } = require('../dashboard');
const { Permissions } = require('discord.js');

const handleErrors = (err, req, res, next) => {
    if (err instanceof GeneralError) {
        // renderTemplate(req, res, 'error.ejs', { perms: Permissions, capL: capFirstLetter, capA: capAllLetters, error: err });
        return res.status(err.getCode()).json({
            status: 'error',
            code: err.getCode(),
            message: err.message,
        });
    }

    // renderTemplate(req, res, 'error.ejs', { perms: Permissions, capL: capFirstLetter, capA: capAllLetters, error: err });
    return res.status(500).json({
        status: 'error',
        code: err.getCode(),
        message: err.message,
    });
}

module.exports = handleErrors;