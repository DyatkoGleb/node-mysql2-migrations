const comandNameParser = require('./CommandNameParser')
const colors = require('colors')
const fs = require('fs')
const migrationsFolder = 'database/migrations/'


class Migration {
    constructor() {}

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
    
    
    makeMigrationCreateText = (tableName) => {
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
    
    makeMigrationUpdateText = (tableName) => {
        return `const connection = require('mysql2-migration/lib/connection')
    
class CreateMigration 
{
    up = () => {
        connection.query(\`UPDATE ${tableName}\`)
    }
        
    down = () => {
        connection.query(\`UPDATE ${tableName}\`)
    }
}

module.exports = new CreateMigration()`
    }
    
    makeMigrationDropText = (tableName) => {
        return `const connection = require('mysql2-migration/lib/connection')
        
class CreateMigration 
{
    up = () => {
        connection.query(\`DROP TABLE ${tableName}\`)
    }
        
    down = () => {
        connection.query(\`CREATE TABLE ${tableName} (
            id int not null primary key auto_increment
        )\`)
    }
}

module.exports = new CreateMigration()`
    }
    
    makeMigrationText = (action, tableName) => {
        switch(action) {
            case 'create':
                return this.makeMigrationCreateText(tableName)
            case 'update':
                return this.makeMigrationUpdateText(tableName)
            case 'drop':
                return this.makeMigrationDropText(tableName)
        }
    }
    
    createMigrationsDir = () => {
        fs.mkdirSync(migrationsFolder, { recursive: true })
    }
    
    stopProcessAndShowReason = (reason) => {
        console.log(colors.red(reason))
        process.exit()
    }

    isRowsInMigrationsTableExists = async () => {
        return await this.connection.execute(`SELECT id FROM migrations LIMIT 1`).then(data => { return data })
    }

    getMigrations = async () => {
        return await this.connection.execute(`SELECT migration_name FROM migrations ORDER BY id DESC`).then(data => { return data })
    }

    getLastUppedMigration = async () => {
        return await this.connection.execute(`SELECT migration_name FROM migrations ORDER BY id DESC LIMIT 1`).then(data => { return data })
    }

    createMigartionsTableIfNotExists = async() => {
        if (!await this.isMigrationTableExists()) await this.createMigartionsTable()
    }

    createMigartionsTable = () => {
        this.connection.query(`CREATE TABLE migrations (
            id int not null primary key auto_increment,
            migration_name varchar(256) not null,
            date datetime not null
        )`)
    }

    isMigrationTableExists = async () => {
        try {
            return await this.isRowsInMigrationsTableExists()
        } catch (err) {
            if (err.sqlState === '42S02' && err.errno === 1146) {
                return false 
            } else {
                this.stopProcessAndShowReason(err)
            }
        }
    }

    updateMigrationsTable = async (migration_name, action) => {
        switch (action) {
            case 'up':
                await this.connection.execute(
                    `INSERT INTO migrations (migration_name, date) 
                    VALUES ('${migration_name}', '${new Date().toISOString().slice(0, 19).replace('T', ' ')}')`
                )
                break
            case 'down': 
                await this.connection.execute(`DELETE FROM migrations WHERE migration_name = '${migration_name}'`)
                break
        }
    }

    upSpecificMigration = async (file, action) => {
        const migration = require('../../../' + migrationsFolder + file)

        process.stdout.write('Migration ' + migrationsFolder + file + ' ' + action)

        try {
            if (await migration.up()) {
                await this.updateMigrationsTable(file, action)

                console.log(colors.green(' completed'))
            }
        } catch (err) {
            console.log(colors.red(' failed'))
            console.log(err)
        }
    }

    migrationUp = async (action, countMigrate) => {
        await this.createMigartionsTableIfNotExists()

        let lastMigration = await this.getLastUppedMigration().then(data => { return data[0][0] })
        let files = fs.readdirSync(migrationsFolder)

        if (lastMigration) {
            const migrationName = lastMigration.migration_name
            let migrationIndexInFilesArray = files.indexOf(migrationName)

            if (migrationIndexInFilesArray == -1 ) {
                this.stopProcessAndShowReason('Error: The migration files do not match the records in the database. File migration /' + migrationsFolder + migrationName + ' does not Exists')
            } else {
                files = files.slice(migrationIndexInFilesArray + 1)
            }
        } 
        
        files = files.slice(0, countMigrate)

        if (!files.length) {
            console.log(colors.yellow('Nothing to up'))
            return
        }

        for (let file of files) {
            await this.upSpecificMigration(file, action)
        }
    }

    migrationDown = async (action, countMigrate) => {
        if (!await this.isMigrationTableExists()) {
            console.log(colors.yellow('Nothing to down'))
            return
        }
        if (!await this.isRowsInMigrationsTableExists().then(result => { return result[0].length })) {
            console.log(colors.yellow('Nothing to down'))
            return
        }

        const migrations = await this.getMigrations()
        const files = fs.readdirSync(migrationsFolder)
        let indexDown = 0

        for (let name of migrations[0]) {
            if (indexDown == countMigrate) {
                break
            }

            const migrationName = name.migration_name		

            if (files.indexOf(migrationName) == -1 ) {
                this.stopProcessAndShowReason('Error: The migration files do not match the records in the database. File migration /' + migrationsFolder + migrationName + ' does not Exists')
            }

            const migration = require('../../../' + migrationsFolder + migrationName)
        
            if (await migration.down()) {
                await this.updateMigrationsTable(migrationName, action)
            }
            
            console.log('Migration ' + migrationsFolder + migrationName + ' ' + action + colors.green(' completed'))
            indexDown++
        }
    }

    checkExistsMigrationFiles = async (migrationsFolder) => {
        if (!fs.existsSync(migrationsFolder)) {
            this.stopProcessAndShowReason(`Error: Migrations in ${migrationsFolder} does not Exists`)
        }

        fs.readdir(migrationsFolder, (err, files) => {
            if (err) throw err
            
            if (!files.length) {
                this.stopProcessAndShowReason(`Error: Migrations in ${migrationsFolder} does not Exists`)
            }
        })
    }

    createMigration = () => {
        const enteredCommand = process.argv[3]
        const [action, migrationCommand, tableName] = comandNameParser.parse(enteredCommand)
        const migrationName = `${migrationsFolder + this.getCurrentDate()}_${this.getSecondsToday()}_${migrationCommand}.js`
    
        this.createMigrationsDir()
        
        fs.writeFile(migrationName, this.makeMigrationText(action, tableName), (err) => {
            if (err) throw err
            console.log(`Migration created ${migrationsFolder + migrationName}`)
        })
    }

    startMigration = async (action) => {
        this.connection = require('./connection')
        const migrateParam = process.argv[3]
        
        await this.checkExistsMigrationFiles(migrationsFolder)
        
        switch(action) {
            case 'up':
                const isParam = !migrateParam
                const isMigrationsCount = (typeof (+migrateParam) == 'number' && !isNaN(+migrateParam))

                if (isParam || isMigrationsCount) {
                    await this.migrationUp(action, migrateParam)
                } else {
                    await this.upSpecificMigration(migrateParam, action)
                }
                break
            case 'down':
                await this.migrationDown(action, migrateParam)
                break
        }

        this.connection.end()
    }
}


module.exports = new Migration()