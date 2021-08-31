const { ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();

const database = new sqlite3.Database('public/spse.sqlite3', err => {
    if (err) console.error('Database opening error: ', err);
});

ipcMain.on('asynchronous-users', (event, arg) => {
    database.all('select * from user', (error, rows) => {
        console.log("database:");
        console.log(error && error.message || rows);
        event.reply(
            'asynchronous-users-reply', (error && error.message) ||rows
        )
        database.close;
    })
});

// tokony ao anatin'ny main no importer-na fa tsy ao anatin'i electron dia avy eo main no atao ao anati'i electron