const comandNameParser = require('mysql2-migration/lib/CommandNameParser')
const logHelper = require('mysql2-migration/lib/LogHelper')
const fs = require('fs')
const migrationsFolder = 'database/migrations/'


class FileMigration {
    create = () => {
        const enteredCommand = process.argv[3]
        const [migrationCommand, action, tableName, columnName] = comandNameParser.parse(enteredCommand)
        const migrationName = `${migrationsFolder + this.getCurrentDate()}_${this.getSecondsToday()}_${migrationCommand}.js`
        const migrationText = this.makeMigrationText(action, tableName, columnName)

        this.createMigrationsDir()

        this.createMigrationFile(migrationName, migrationText)
    }

    createMigrationFile(migrationName, migrationText) {
        fs.writeFile(migrationName, migrationText, (err) => {
            if (err) logHelper.error(err)

            logHelper.message(`Migration created ${migrationsFolder + migrationName}`)
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

    makeMigrationText = (action, tableName, columnName) => {
        if (columnName) {
            switch(action) {
                case 'add':
                    return this.makeTextMigrationAddColumn(tableName, columnName)
                case 'change':
                    return this.makeTextMigrationChangeColumn(tableName, columnName)
                case 'drop':
                    return this.makeTextMigrationDropColumn(tableName, columnName)
            }
        } else {
            switch(action) {
                case 'create':
                    return this.makeTextMigrationCreateTable(tableName)
                case 'drop':
                    return this.makeTextMigrationDropTable(tableName)
            }
        }
    }

    makeTextMigrationCreateTable = (tableName) => {
        return `const connection = require('mysql2-migration/lib/connection')
        
class CreateMigration 
{
    up = async () => {
        return await connection.query(\`CREATE TABLE ${tableName} (
            id int not null primary key auto_increment,

            created_at datetime not null,
            updated_at datetime not null
        )\`)
    }
    
    down = async () => {
        return await connection.query(\`DROP TABLE ${tableName}\`)
    }
}

module.exports = new CreateMigration()`
    }

    makeTextMigrationDropTable = (tableName) => {
        return `const connection = require('mysql2-migration/lib/connection')
        
class CreateMigration 
{
    up = async () => {
        return await connection.query(\`DROP TABLE ${tableName}\`)
    }
        
    down = async () => {
        return await connection.query(\`CREATE TABLE ${tableName} (
            id int not null primary key auto_increment
        )\`)
    }
}

module.exports = new CreateMigration()`
    }

    makeTextMigrationAddColumn = (tableName, columnName) => {
        return `const connection = require('mysql2-migration/lib/connection')
        
class CreateMigration 
{
    up = async () => {
        return await connection.query(\`ALTER TABLE ${tableName} ADD ${columnName}\`)
    }
    
    down = async () => {
        return await connection.query(\`ALTER TABLE ${tableName} DROP ${columnName}\`)
    }
}

module.exports = new CreateMigration()`
    }

    makeTextMigrationChangeColumn = (tableName, columnName) => {
        return `const connection = require('mysql2-migration/lib/connection')
        
class CreateMigration 
{
    up = async () => {
        return await connection.query(\`ALTER TABLE ${tableName} ALTER COLUMN ${columnName}\`)
    }
    
    down = async () => {
        return await connection.query(\`ALTER TABLE ${tableName} ALTER COLUMN ${columnName}\`)
    }
}

module.exports = new CreateMigration()`
    }

    makeTextMigrationDropColumn = (tableName, columnName) => {
        return `const connection = require('mysql2-migration/lib/connection')
        
class CreateMigration 
{
    up = async () => {
        return await connection.query(\`ALTER TABLE ${tableName} DROP ${columnName}\`)
    }
    
    down = async () => {
        return await connection.query(\`ALTER TABLE ${tableName} ADD ${columnName}\`)
    }
}

module.exports = new CreateMigration()`
    }
}


module.exports = new FileMigration()