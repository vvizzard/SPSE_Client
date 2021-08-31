const { ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();

const database = new sqlite3.Database('public/spse.sqlite3', err => {
    if (err) console.error('Database opening error: ', err);
});

ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg);
    // if (arg === 'ping') event.reply('asynchronous-reply', 'pong')
    // else event.reply('asynchronous-reply', 'why '+arg+'?');
    database.all('select * from user', (error, rows) => {
        console.log("database:");
        console.log(error && error.message || rows);
        event.reply(
            'asynchronous-reply', (error && error.message) ||rows
        )
    })
});