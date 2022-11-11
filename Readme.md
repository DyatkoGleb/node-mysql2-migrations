# node-mysql2-migrations
![Node.js Version][node-version-image]

A tool to support migration using the mysql 2 package in node.js
## Prerequisites
A node project with [mysql2] used for database.

## Install
It can be installed using npm.

```
npm i mysql2-migration
```

## Setup
1. Create a file in config directory where you define your database config. (./config/database.js)

**database.js:**
```
module.exports = {
    host: 'localhost', // optional
    port: '3306', // optional
    user: 'user',
    database: 'database',
    password: 'password'
}
```
2. In the root of your project, create a file with the package connection. (Should be on one level with node_modules)

**migration.js:**

```
require('mysql2-migrations')
```
## Create a migration

Run
```
node migration.js create create_users_table
node migration.js create drop_users_table
node migration.js create add_phone_column_to_users_table
node migration.js create change_phone_column_users_table
node migration.js create drop_phone_column_from_users_table
```
After that, you can find your migration in ./database/migrations.


## Executing Migrations

There are few ways to run migrations.
1. Run `node migration.js up`. Runs all the pending `up` migrations.
2. Run `node migration.js up 1`. Runs only 1 `up` migrations.
3. Run `node migration.js up 2022_22_07_00675_create_users_table.js`. Runs a migration with name 2022_22_07_00675_create_users_table.js.
4. Run `node migration.js down`. Runs all the migrations `down` from last upped.
5. Run `node migration.js down 1`. Runs only 1 `down` migrations.

## If you forgot something
```
node migration.js help
```

[node-version-image]: https://img.shields.io/badge/dynamic/xml?color=success&label=node&query=%27%20%3E%3D%20%27&suffix=v12.22.12&url=https%3A%2F%2Fnodejs.org%2F
[mysql2]: (https://github.com/sidorares/node-mysql2)