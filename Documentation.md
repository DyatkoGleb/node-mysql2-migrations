# Documentation

Once created, your migration file should look like this:
```
const Migration = require('mysql2-migration/lib/Migration')

module.exports = new class extends Migration
{
    up = async () => {
        return await this.createTable('users',
            this.id(),
            this.timestamps()
        )
    }
    
    down = async () => {
        return await this.dropTable('users')
    }
}
```
To create columns, you can use methods of the Migration class to simplify this process.

For example:
```
up = async () => {
    return await this.createTable('books',
        this.id(),
        this.unsignedBigInt('author_id'),
        this.string('name', 256).notNull(),
        this.bool('verificated').notNull().default(0),
        this.foreign('author_id').references('id').on('authors').onDelete('cascade'),
        this.timestamps()
    )
}
```
Or, if you lack functionality or it is more convenient for you to create sql queries, you can do it or combine.

For example:
```
up = async () => {
    return await this.createTable('users',
        'id INT AUTO_INCREMENT PRIMARY KEY',
        'phone varchar(256)',
        this.timestamps()
    )
}
```

### Available types

- string(name, length) - VARCHAR(length)
- tinyText(name) - TINYTEXT
- text(name) - TEXT
- mediumText(name) - MEDIUMTEXT
- largeText(name) - LARGETEXT
- json(name) - JSON
- int(name) - INT
- unsignedInt(name) - INT UNSIGNED
- bigInt(name) - BIGINT
- unsignedBigInt(name) - BIGINT UNSIGNED
- smallInt(name) - SMALLINT
- unsignedSmallInt(name) - SMALLINT UNSIGNED
- mediumInt(name) - MEDIUMINT
- unsignedMediumInt(name) - MEDIUMINT UNSIGNED
- tinyInt(name) - TINYINT
- unsignedTinyInt(name) - TINYINT UNSIGNED
- bool(name) - BOOL
- decimal(name, precision, scale) - DECIMAL(precision, scale)
- float(name, precision, scale) - FLOAT(precision, scale)
- double(name, precision, scale) - DOUBLE(precision, scale)
- date(name) - DATE
- datetime(name) - DATETIME
- timestamp(name) - TIMESTAMP
- year(name) - YEAR
- enum(name, allowed) - ENUM(allowed)
- set(name, allowed) - SET(allowed)
- tinyBlob(name) - TINYBLOB
- blob(name) - BLOB
- mediumBlob(name) - MEDIUMBLOB
- largeBlob(name) - LARGEBLOB

### Custom types

- id() - Create column like `id BIGINT UNSIGNED AUTOINCREMENT PRIMARY KEY`
- timestamps - Create two TIMESTAMP columns 'created_at' & 'updated_at'

### Additional attributes

- notNull() - NOT NULL
- default() - DEFAULT VALUE (pass 0/1 if bool)
- autoincrement() - AUTO_INCREMENT
- primaryKey() - PRIMARY KEY
- check(condition) - CHECK
- unique(columnNames) - UNIQUE, can be used for a column or for multiple columns

### Foreign key
- foreign(foreignKey) - FOREIGN KEY (foreignKey)
- references(reference) - REFERENCES tableName (reference)
- on(tableName) - REFERENCES tableName (reference)
- onDelete(type) - ON DELETE type