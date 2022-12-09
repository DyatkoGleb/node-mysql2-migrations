### If you want to help, you can do anything from the following list:
- Rewrite the code so that it works with the first version of the [mysql] package.
- Handle the case when the [mysql]/[mysql2] package is not installed and output an error message.
- If the migration body is empty, after `up` this migration, show "completed\n".
- The ability to specify all parameters for a column when creating it in the command text.
- Add the "CHECK" property for multiple columns of the table.
- Add the ability to remove the "unique" property when changeColumn, with Migration class.

Or, if you have any improvements, you can create a new pull request.

[mysql]: https://www.npmjs.com/package/mysql
[mysql2]: https://www.npmjs.com/package/mysql2