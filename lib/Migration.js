const connection = require('./connection')


class Migration {
    columnsForQuery = {}
    columnNow = ''

    createTable = async (tableName, ...args) => {
        let columns = ''

        for (let columnName in this.columnsForQuery) {
            let column = columnName + ' ' + this.columnsForQuery[columnName].arguments.join(' ')
            columns += column + ', '
        }

        for (let column of args) {
            if (typeof column === 'string') {
                columns += column + ', '
            }
        }

        columns = columns.slice(0, -2)

        return await connection.query(await this.buildCreateTableQuery(tableName, columns))
    }

    dropTable = async (tableName) => {
        return  await connection.query(`DROP TABLE ${tableName}`)
    }

    addColumn = async (tableName, ...args) => {
        let column = ''

        for (let columnName in this.columnsForQuery) {
            column = columnName + ' ' + this.columnsForQuery[columnName].arguments.join(' ')
        }

        for (let col of args) {
            if (typeof col === 'string') {
                column += col
            }
        }

        return await connection.query(this.buildAddColumnQuery(tableName, column))
    }

    changeColumn = async (tableName, ...args) => {
        let column = ''

        for (let columnName in this.columnsForQuery) {
            column = columnName + ' ' + this.columnsForQuery[columnName].arguments.join(' ')
        }

        for (let col of args) {
            if (typeof col === 'string') {
                column += col
            }
        }

        return await connection.query(this.buildChangeColumnQuery(tableName, column))
    }

    dropColumn = async (tableName, columnName) => {
        return await connection.query(`ALTER TABLE ${tableName} DROP ${columnName}`)
    }

    buildCreateTableQuery = (tableName, columns) => {
        return `CREATE TABLE ${tableName} (${columns})`
    }

    buildAddColumnQuery = (tableName, column) => {
        return`ALTER TABLE ${tableName} ADD ${column}`
    }

    buildChangeColumnQuery = (tableName, column) => {
        return `ALTER TABLE ${tableName} MODIFY ${column}`
    }

    setVariableType = (column, type) => {
        this.columnNow = column
        this.columnsForQuery[column] = { arguments: [type] }
        return this
    }

    setPrecisionScaleType = (column, type, precision, scale = 0) => {
        this.columnNow = column

        if (precision) {
            this.columnsForQuery[column] = { arguments: [type + '(' + precision + ',' + scale + ')'] }
        } else  {
            this.columnsForQuery[column] = { arguments: [type] }
        }

        return this
    }

    string = (column, length = 256) => {
        this.columnNow = column
        this.columnsForQuery[column] = { arguments: [`VARCHAR(${length})`] }
        return this
    }

    tinyText = (column) => { return this.setVariableType(column, 'TINYTEXT') }

    text = (column) => { return this.setVariableType(column, 'TEXT') }

    mediumText = (column) => { return this.setVariableType(column, 'MEDIUMTEXT') }

    largeText = (column) => { return this.setVariableType(column, 'LARGETEXT') }

    json = (column) => { return this.setVariableType(column, 'JSON') }

    int = (column) => { return this.setVariableType(column, 'INT') }

    unsignedInt = (column) => { return this.setVariableType(column, 'INT UNSIGNED') }

    bigInt = (column) => { return this.setVariableType(column, 'BIGINT') }

    unsignedBigInt = (column) => { return this.setVariableType(column, 'BIGINT UNSIGNED') }

    smallInt = (column) => { return this.setVariableType(column, 'SMALLINT') }

    unsignedSmallInt = (column) => { return this.setVariableType(column, 'SMALLINT UNSIGNED') }

    mediumInt = (column) => { return this.setVariableType(column, 'MEDIUMINT') }

    unsignedMediumInt = (column) => { return this.setVariableType(column, 'MEDIUMINT UNSIGNED') }

    tinyInt = (column) => { return this.setVariableType(column, 'TINYINT') }

    unsignedTinyInt = (column) => { return this.setVariableType(column, 'TINYINT UNSIGNED') }

    bool = (column) => { return this.setVariableType(column, 'BOOL') }

    decimal = (column, precision= 0, scale = 0) => {  return this.setPrecisionScaleType(column, 'DECIMAL', precision, scale)  }

    float = (column, precision, scale = 0) => {  return this.setPrecisionScaleType(column, 'FLOAT', precision, scale)  }

    double = (column, precision, scale = 0) => {  return this.setPrecisionScaleType(column, 'DOUBLE', precision, scale)  }

    date = (column) => { return this.setVariableType(column, 'DATE') }

    datetime = (column) => { return this.setVariableType(column, 'DATETIME') }

    timestamp = (column) => { return this.setVariableType(column, 'TIMESTAMP') }

    year = (column) => { return this.setVariableType(column, 'YEAR') }

    enum = (column, allowed) => {
        this.columnNow = column
        allowed = allowed.map(item => '\'' + item + '\'').join(', ')
        this.columnsForQuery[column] = { arguments: [`ENUM(${allowed})`] }
        return this
    }

    set = (column, allowed) => {
        this.columnNow = column
        allowed = allowed.map(item => '\'' + item + '\'').join(', ')
        this.columnsForQuery[column] = { arguments: [`SET(${allowed})`] }
        return this
    }

    tinyBlob = (column) => { return this.setVariableType(column, 'TINYBLOB') }

    blob = (column) => { return this.setVariableType(column, 'BLOB') }

    mediumBlob = (column) => { return this.setVariableType(column, 'MEDIUMBLOB') }

    largeBlob = (column) => { return this.setVariableType(column, 'LARGEBLOB') }

    id = () => { return this.unsignedBigInt('id').autoincrement().primaryKey() }

    timestamps = () => {
        this.timestamp('created_at');
        this.timestamp('updated_at');

        return this
    }

    notNull = () => {
        this.columnsForQuery[this.columnNow].arguments.push('NOT NULL')
        return this
    }

    default = (value) => {
        this.columnsForQuery[this.columnNow].arguments.push(`DEFAULT '${value}'`)
        return this
    }

    autoincrement = () => {
        this.columnsForQuery[this.columnNow].arguments.push('AUTO_INCREMENT')
        return this
    }

    primaryKey = () => {
        this.columnsForQuery[this.columnNow].arguments.push('PRIMARY KEY')
        return this
    }
}


module.exports = Migration