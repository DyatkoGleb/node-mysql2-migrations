const colors = require('colors')


class ConsoleLogger {
    error = (text) => {
        console.log(colors.red(text))
    }

    warning = (text) => {
        console.log(colors.yellow(text))
    }

    success = (text) => {
        console.log(colors.green(text))
    }

    hint = (text) => {
        console.log(colors.cyan('Hint: ' + text))
    }

    message = (text) => {
        console.log(text)
    }
}


module.exports = new ConsoleLogger()