const logHelper = require('./LogHelper')


class CommandNameParser {
    parse = (enteredCommand) => {
        const columnAddAction = new RegExp('^(add_)[a-z0-9_]*(column_to)[a-z0-9_]*(_table)$')
        const columnChangeAction = new RegExp('^(change_)[a-z0-9_]*(column)[a-z0-9_]*(_table)$')
        const columnDropAction = new RegExp('^(drop_)[a-z0-9_]*(column_from)[a-z0-9_]*(_table)$')
        const tableAction = new RegExp('^(?!.*column)^((create_)|(drop_))[a-z0-9_]*(_table)$')
        let action = ''
        let tableName = ''
        let columnName = ''

        enteredCommand = enteredCommand ? enteredCommand.toLowerCase() : enteredCommand

        if (columnAddAction.test(enteredCommand) || columnChangeAction.test(enteredCommand) || columnDropAction.test(enteredCommand)) {
            action = enteredCommand.split('_')[0]
            const withoutPreAndPostfoxes = enteredCommand.split(action+'_')[1].slice(0, -6)
            if (action === 'add') {
                [columnName, tableName] = withoutPreAndPostfoxes.split('_column_to_')
            } else if (action === 'change') {
                [columnName, tableName] = withoutPreAndPostfoxes.split('_column_')
            } else if (action === 'drop'){
                [columnName, tableName] = withoutPreAndPostfoxes.split('_column_from_')
            }
        } else if (tableAction.test(enteredCommand)) {
            action = enteredCommand.split('_')[0]
            tableName = enteredCommand.split(action+'_')[1].slice(0, -6)
        } else {
            logHelper.error('Error: Invalid migration name')
            logHelper.hint('\n[create/drop]_[table_name]_table\n[add/change/drop]_[column_name]_[to_/from_/ ][table_name]_table')
            process.exit()
        }

        return [enteredCommand, action, tableName, columnName]
    }
}


module.exports = new CommandNameParser()