const comandNameParser = require('mysql2-migration/lib/CommandNameParser')
const ConsoleLogger = require('mysql2-migration/lib/ConsoleLogger')
const fs = require('fs')
const migrationsFolder = 'database/migrations/'


class FileMigration {
    create = () => {
        const enteredCommand = process.argv[3]
        const columnType = process.argv[4]
        const [migrationCommand, action, tableName, columnName] = comandNameParser.parse(enteredCommand)
        const migrationName = `${migrationsFolder + this.getCurrentDate()}_${this.getSecondsToday()}_${migrationCommand}.js`
        const migrationText = this.makeMigrationText(action, tableName, columnName, columnType)

        this.createMigrationsDir()

        this.createMigrationFile(migrationName, migrationText)
    }

    createMigrationFile(migrationName, migrationText) {
        fs.writeFile(migrationName, migrationText, (err) => {
            if (err) ConsoleLogger.error(err)

            ConsoleLogger.message(`Created migration ${migrationsFolder + migrationName}`)
        })
    }

    getCurrentDate = () => {
        const today = new Date()
        const year = today.getFullYear()
        let month = today.getMonth() + 12
        let day = today.getDate()

        if (month < 10) month = '0' + month
        if (day < 10) day = '0' + day

        return year + '_' + month + '_' + day
    }

    getSecondsToday = () => {
        const date = new Date()
        const counterLength = 5
        const seconds = date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()

        return String(seconds).padStart(counterLength, '0')
    }

    createMigrationsDir = () => {
        fs.mkdirSync(migrationsFolder, { recursive: true })
    }

    makeMigrationText = (action, tableName, columnName, columnType) => {
        if (columnName) {
            switch(action) {
                case 'add':
                    return this.makeTextMigrationAddColumn(tableName, columnName, columnType)
                case 'change':
                    return this.makeTextMigrationChangeColumn(tableName, columnName, columnType)
                case 'drop':
                    return this.makeTextMigrationDropColumn(tableName, columnName, columnType)
            }
        } else {
            switch(action) {
                case 'create':
                    return this.makeTextMigrationCreateTable(tableName)
                case 'update':
                    return this.makeTextMigrationUpdateTable(tableName)
                case 'drop':
                    return this.makeTextMigrationDropTable(tableName)
            }
        }
    }

    makeTextMigrationCreateTable = (tableName) => {
        return `const Migration = require('mysql2-migration/lib/Migration')

module.exports = new class extends Migration
{
    up = async () => {
        return await this.createTable(\'${tableName}\',
            this.id(),
            this.timestamps()
        )
    }
    
    down = async () => {
        return await this.dropTable(\'${tableName}\')
    }
}`
    }

    makeTextMigrationUpdateTable = (tableName) => {
        return `const Migration = require('mysql2-migration/lib/Migration')

module.exports = new class extends Migration
{
    up = async () => {
        /*
        await this.dropColumn(\'${tableName}\','phone')
        return await this.addColumn(\'${tableName}\', this.int('age'))
        */
    }
        
    down = async () => {
       /* 
        await this.dropColumn(\'${tableName}\','age')
        return await this.addColumn(\'${tableName}\', this.string('phone'))
        */
    }
}`
    }

    makeTextMigrationDropTable = (tableName) => {
        return `const Migration = require('mysql2-migration/lib/Migration')

module.exports = new class extends Migration
{
    up = async () => {
        return await this.dropTable(\'${tableName}\')
    }
        
    down = async () => {
        return await this.createTable(\'${tableName}\',
            this.id(),
            this.timestamps()
        )
    }
}`
    }

    makeTextMigrationAddColumn = (tableName, columnName, columnType) => {
        let column = columnType ? `this.${columnType}(\'${columnName}\')` : `\'${columnName}\'`

        return `const Migration = require('mysql2-migration/lib/Migration')

module.exports = new class extends Migration
{
    up = async () => {
        return await this.addColumn(\'${tableName}\', ${column})
    }
    
    down = async () => {
        return await this.dropColumn(\'${tableName}\',\'${columnName}\')
    }
}`
    }

    makeTextMigrationChangeColumn = (tableName, columnName, columnType) => {
        let column = columnType ? `this.${columnType}(\'${columnName}\')` : `\'${columnName}\'`

        return `const Migration = require('mysql2-migration/lib/Migration')
        
module.exports = new class extends Migration
{
    up = async () => {
        return await this.changeColumn(\'${tableName}\', ${column})
    }
    
    down = async () => {
        return await this.changeColumn(\'${tableName}\', \'${columnName}\')
    }
}`
    }

    makeTextMigrationDropColumn = (tableName, columnName, columnType) => {
        let column = columnType ? `this.${columnType}(\'${columnName}\')` : `\'${columnName}\'`

        return `const Migration = require('mysql2-migration/lib/Migration')
        
module.exports = new class extends Migration
{
    up = async () => {
        return await this.dropColumn(\'${tableName}\',\'${columnName}\')
    }
    
    down = async () => {
        return await this.addColumn(\'${tableName}\', ${column})
    }
}`
    }
}


module.exports = new FileMigration()