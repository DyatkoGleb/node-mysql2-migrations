class CommandNameParser {
    parse = (enteredCommand) => {
        if (!enteredCommand) {
            console.log("Error: Invalid migration name\nHint: [create/update/drop]_[your_table_name]_table")
            process.exit()
        }
        if (!enteredCommand.replace(/[^a-z_]/g, '').length) {
            console.log("Error: Invalid migration name\nHint: [create/update/drop]_[your_table_name]_table")
            process.exit()
        }
        if (enteredCommand.indexOf('_') == -1) {
            console.log("Error: Invalid migration name\nHint: [create/update/drop]_[your_table_name]_table")
            process.exit()
        }

        enteredCommand = enteredCommand.replace(/[^a-z_]/g, '')
        const migrationCommand = enteredCommand
        const allowedActions = ['create', 'update', 'drop']
        const action = enteredCommand.split('_')[0]
        const tableName = enteredCommand.split('_')[1].split('_table')[0]
        const isEnteredCommandContainsAllowedAction = allowedActions.indexOf(action) != -1
        const isEnteredCommandContainsKeywordObject = enteredCommand.indexOf('_table') == -1
    
        if (!isEnteredCommandContainsAllowedAction || isEnteredCommandContainsKeywordObject || !tableName) {
            console.log("Error: Invalid migration name\nHint: [create/update/drop]_[your_table_name]_table")
            process.exit()
        }
    
        return [action, migrationCommand, tableName]
    }
}

module.exports = new CommandNameParser()