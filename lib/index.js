const migration = require('./migration')
const logHelper = require('./LogHelper')
const fileMigration = require('./FileMigration')
const fs = require('fs')
const action = process.argv[2]


if (!fs.existsSync('./config/database.js')) {
    logHelper.error('Error: File configuration config/database.js does not exist')
    process.exit()
}


if (action === '-h' || action === '--help' || action === 'help') {
    console.log('Usage: node [file_with_package_connection] [commands] [additional_parameter]\n')
    console.log('Commands:')
    console.log('  create                   Create mirgation:   \n\t\t\t   [create/drop]_[table_name]_table   \n\t\t\t   [add/change/drop]_[column_name]_[to_/from_/ ][table_name]_table')
    console.log('  up [N/migration_name]    Runs all or [N/migration_name] the pending UP migrations, or UP a specific migration. Ex.: up 2022_22_07_00675_create_users_table.js')
    console.log('  down [N]                 Runs all or [N] the migrations DOWN from last upped.')
    console.log('\n  -h, --help, help')
}
else if (action === 'down' || action === 'up') {
    migration.startMigration(action)
} else if (action === 'create') {
    fileMigration.create()
} else if (action === undefined) {
    logHelper.error(`Error: You didn't pass the command.`)
    logHelper.hint('Allowed command: create, up [N], down [N], help')
} else {
    logHelper.error(`Error: Not allowed command.`)
    logHelper.hint('Allowed command: create, up [N], down [N], help')
}
