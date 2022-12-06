const LogHelper = require('./LogHelper')
const colors = require('colors')
const fs = require('fs')
const migrationsFolder = 'database/migrations/'


class Migrator {
    startMigration = async (action) => {
        this.connection = require('./connection')
        const migrateParam = process.argv[3]

        await this.checkExistsMigrationFiles(migrationsFolder)

        if (action === 'up') {
            const isParamNotExist = !migrateParam
            const isMigrationsCount = (typeof (+migrateParam) == 'number' && !isNaN(+migrateParam))

            if (isParamNotExist || isMigrationsCount) {
                await this.migrationUp(action, migrateParam)
            } else {
                await this.upSpecificMigration(action, migrateParam)
            }
        } else if (action === 'down') {
            await this.migrationDown(action, migrateParam)
        }

        this.connection.end()
    }

    refresh = async () => {
        this.connection = require('./connection')

        await this.connection.query('SET foreign_key_checks = 0')

        const tables = await this.connection.query('SHOW TABLES').then(data => { return data[0] })

        for (let table of tables) {
            const tableName = table[Object.keys(table)]
            await this.connection.query('DROP TABLE IF EXISTS ' + tableName)
        }

        await this.connection.query('SET foreign_key_checks = 1')

        return await this.startMigration('up')
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

    createMigrationsTableIfNotExists = async() => {
        if (!await this.isMigrationTableExists()) await this.createMigrationsTable()
    }

    createMigrationsTable = () => {
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
                LogHelper.error(err)
                process.exit()
            }
        }
    }

    updateMigrationsTable = async (migration_name, action) => {
        if (action === 'up') {
            await this.connection.execute(
               `INSERT INTO migrations (migration_name, date) 
                VALUES ('${migration_name}', '${new Date().toISOString().slice(0, 19).replace('T', ' ')}')`
            )
        } else if (action === 'down') {
            await this.connection.execute(`DELETE FROM migrations WHERE migration_name = '${migration_name}'`)
        }
    }

    getMigrationFiles = async (lastMigrationName, countMigrate) => {
        let files = fs.readdirSync(migrationsFolder)

        if (lastMigrationName) {
            const migrationName = lastMigrationName.migration_name
            let migrationIndexInFilesArray = files.indexOf(migrationName)

            if (migrationIndexInFilesArray === -1 ) {
                LogHelper.error('Error: The migration files do not match the records in the database. File migration /' + migrationsFolder + migrationName + ' does not Exists')
            } else {
                files = files.slice(migrationIndexInFilesArray + 1)
            }
        }

        return files.slice(0, countMigrate)
    }

    upSpecificMigration = async (action, file) => {
        const migration = require('../../../' + migrationsFolder + file)

        process.stdout.write('Migration ' + migrationsFolder + file + ' ' + action)

        try {
            if (await migration.up()) {
                await this.updateMigrationsTable(file, action)
                LogHelper.success(' completed')
            }
        } catch (err) {
            console.log()
            LogHelper.error(err)
            process.exit()
        }
    }

    migrationUp = async (action, countMigrate) => {
        await this.createMigrationsTableIfNotExists()

        const lastMigrationName = await this.getLastUppedMigration().then(data => { return data[0][0] })
        const migrationFiles = await this.getMigrationFiles(lastMigrationName, countMigrate)

        if (!migrationFiles.length) {
            LogHelper.warning('Nothing to up')
            return
        }

        for (let file of migrationFiles) {
            await this.upSpecificMigration(action, file)
        }
    }

    downSpecificMigration = async (action, files, migrationName) => {
        if (files.indexOf(migrationName) === -1 ) {
            LogHelper.error('Error: The migration files do not match the records in the database. File migration /' + migrationsFolder + migrationName + ' does not Exists')
            process.exit()
        }

        const migration = require('../../../' + migrationsFolder + migrationName)

        if (await migration.down()) {
            await this.updateMigrationsTable(migrationName, action)
        }

        LogHelper.message('Migration ' + migrationsFolder + migrationName + ' ' + action + colors.green(' completed'))
    }

    migrationDown = async (action, countMigrate) => {
        if (!await this.isMigrationTableExists() || !await this.isRowsInMigrationsTableExists().then(result => { return result[0].length })) {
            LogHelper.warning('Nothing to up')
            return
        }

        const migrations = await this.getMigrations()
        const files = fs.readdirSync(migrationsFolder)
        let indexDown = 0

        for (let migration of migrations[0]) {
            if (indexDown == countMigrate) break

            await this.downSpecificMigration(action, files, migration.migration_name)

            indexDown++
        }
    }

    checkExistsMigrationFiles = async (migrationsFolder) => {
        if (!fs.existsSync(migrationsFolder)) {
            LogHelper.error(`Error: Migrations in ${migrationsFolder} does not Exists`)
            process.exit()
        }

        fs.readdir(migrationsFolder, (err, files) => {
            if (err) LogHelper.error(err)
            
            if (!files.length) {
                LogHelper.error(`Error: Migrations in ${migrationsFolder} does not Exists`)
                process.exit()
            }
        })
    }
}


module.exports = new Migrator()