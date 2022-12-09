const ConsoleLogger = require('./ConsoleLogger')


class CommandNameParser {
    columnAddActionReg = new RegExp('^(add_)[a-z0-9_]*(column_to)[a-z0-9_]*(_table)$')
    columnChangeActionReg = new RegExp('^(change_)[a-z0-9_]*(column)[a-z0-9_]*(_table)$')
    columnDropActionReg = new RegExp('^(drop_)[a-z0-9_]*(column_from)[a-z0-9_]*(_table)$')
    tableActionReg = new RegExp('^(?!.*column)^((create_)|(update_)|(drop_))[a-z0-9_]*(_table)$')
    lengthPostfix = 6

    parse = (enteredCommand) => {
        const isColumnMigration = this.columnAddActionReg.test(enteredCommand) || this.columnChangeActionReg.test(enteredCommand) || this.columnDropActionReg.test(enteredCommand)
        const isTableMigration = this.tableActionReg.test(enteredCommand)
        let action = ''
        let tableName = ''
        let columnName = ''

        enteredCommand = enteredCommand ? enteredCommand.toLowerCase() : enteredCommand

        if (isColumnMigration) {
            action = enteredCommand.split('_')[0]
            const withoutPreAndPostfixes = enteredCommand.split(action+'_')[1].slice(0, -this.lengthPostfix)

            if (action === 'add') {
                [columnName, tableName] = withoutPreAndPostfixes.split('_column_to_')
            } else if (action === 'change') {
                [columnName, tableName] = withoutPreAndPostfixes.split('_column_')
            } else if (action === 'drop'){
                [columnName, tableName] = withoutPreAndPostfixes.split('_column_from_')
            }
        } else if (isTableMigration) {
            action = enteredCommand.split('_')[0]
            tableName = enteredCommand.split(action+'_')[1].slice(0, -this.lengthPostfix)
        } else {
            ConsoleLogger.error('Error: Invalid migration name')
            ConsoleLogger.hint('\n[create/update/drop]_[table_name]_table\n[add/change/drop]_[column_name]_[to_/from_/ ][table_name]_table [column_type]')
            process.exit()
        }

        return [enteredCommand, action, tableName, columnName]
    }
}


module.exports = new CommandNameParser()