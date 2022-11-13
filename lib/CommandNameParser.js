const logHelper = require('./LogHelper')


class CommandNameParser {
    columnAddAction = new RegExp('^(add_)[a-z0-9_]*(column_to)[a-z0-9_]*(_table)$')
    columnChangeAction = new RegExp('^(change_)[a-z0-9_]*(column)[a-z0-9_]*(_table)$')
    columnDropAction = new RegExp('^(drop_)[a-z0-9_]*(column_from)[a-z0-9_]*(_table)$')
    tableAction = new RegExp('^(?!.*column)^((create_)|(drop_))[a-z0-9_]*(_table)$')

    parse = (enteredCommand) => {
        const isColumnMigration = this.columnAddAction.test(enteredCommand) || this.columnChangeAction.test(enteredCommand) || this.columnDropAction.test(enteredCommand)
        const isTableMigration = this.tableAction.test(enteredCommand)
        let action = ''
        let tableName = ''
        let columnName = ''

        enteredCommand = enteredCommand ? enteredCommand.toLowerCase() : enteredCommand

        if (isColumnMigration) {
            action = enteredCommand.split('_')[0]
            const withoutPreAndPostfixes = enteredCommand.split(action+'_')[1].slice(0, -6)

            if (action === 'add') {
                [columnName, tableName] = withoutPreAndPostfixes.split('_column_to_')
            } else if (action === 'change') {
                [columnName, tableName] = withoutPreAndPostfixes.split('_column_')
            } else if (action === 'drop'){
                [columnName, tableName] = withoutPreAndPostfixes.split('_column_from_')
            }
        } else if (isTableMigration) {
            action = enteredCommand.split('_')[0]
            tableName = enteredCommand.split(action+'_')[1].slice(0, -6)
        } else {
            logHelper.error('Error: Invalid migration name')
            logHelper.hint('\n[create/drop]_[table_name]_table\n[add/change/drop]_[column_name]_[to_/from_/ ][table_name]_table [column_type]')
            process.exit()
        }

        return [enteredCommand, action, tableName, columnName]
    }
}


module.exports = new CommandNameParser()