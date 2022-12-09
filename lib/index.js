const Migrator = require('./Migrator')
const ConsoleLogger = require('./ConsoleLogger')
const fileMigration = require('./FileMigration')
const fs = require('fs')
const action = process.argv[2]


if (!fs.existsSync('./config/database.js')) {
    ConsoleLogger.error('Error: File configuration config/database.js does not exist')
    process.exit()
}


if (action === '-h' || action === '--help' || action === 'help') {
    console.log('Usage: node [file_with_package_connection] [commands] [additional_parameter]\n')
    console.log('Commands:')
    console.log('  create                   Create mirgation:   \n\t\t\t   [create/update/drop]_[table_name]_table   \n\t\t\t   [add/change/drop]_[column_name]_[to_/from_/ ][table_name]_table [column_type]')
    console.log('  up [N/migration_name]    Runs all or [N/migration_name] the pending UP migrations, or UP a specific migration. Ex.: up 2022_22_07_00675_create_users_table.js')
    console.log('  down [N]                 Runs all or [N] the migrations DOWN from last upped.')
    console.log('  refresh                  Deletes all tables and runs all the pending `up` migrations.')
    console.log('\n  -h, --help, help')
}
else if (action === 'down' || action === 'up') {
    Migrator.startMigration(action)
} else if (action === 'create') {
    fileMigration.create()
} else if (action === 'refresh') {
    Migrator.refresh()
} else if (action === undefined) {
    ConsoleLogger.error(`Error: You didn't pass the command.`)
    ConsoleLogger.hint('Allowed command: create, up [N], down [N], help')
} else {
    ConsoleLogger.error(`Error: Not allowed command.`)
    ConsoleLogger.hint('Allowed command: create, up [N], down [N], help')
}
