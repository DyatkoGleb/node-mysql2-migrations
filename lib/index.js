const migration = require('./migration')
const colors = require('colors')
const fs = require('fs')
const action = process.argv[2]


if (!fs.existsSync('./config/database.js')) {
    console.log(colors.red('Error: File configuration config/database.js does not exist'))
    process.exit()
}


if (action === '-h' || action === '--help' || action === 'help') {
    console.log('Usage: node [file_with_package_connection] [commands] [additional_parameter]\n')
    console.log('Commands:')
    console.log('  create           Create mirgation [create/update/drop]_[your_table_name]_table')
    console.log('  up [N]           Runs all or [N/migration_name] the pending UP migrations, or UP a specific migration. Ex.: up 2022_22_07_00675_create_users_table.js')
    console.log('  down [N]         Runs all or [N] the migrations DOWN from last upped.')
    console.log('  -h, --help, help')
}
else if (action === 'down' || action === 'up') {
    migration.startMigration(action)
} else if (action === 'create') {
    migration.createMigration()
} else if (action === undefined) {
    console.log(colors.red("Error: You didn't pass the command.\nHint: [create/update/drop]_[your_table_name]_table"))
} else {
    console.log(colors.red("Error: Not allowed command.\nHint: Allowed command: create, up [N], down [N], help"))
}
