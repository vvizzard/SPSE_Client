const { ipcMain } = require('electron');
const log = require('electron-log')
// const sqlite3 = require('sqlite3').verbose();
const regions = require('../layer/regions.json');

const BaseDao = require('./database/BaseDao')
const BaseRepository = require('./database/BaseRepository');
const ResponseRepository = require('./database/ReponseRepository');
const UserRepository = require('./database/UserRepository')

const dao = new BaseDao('spse_db.sqlite3');

// Validate a user
ipcMain.on('asynchronous-validate', (event, name, entity, val) => {
    // verbose
    // console.log('asynchronous-validate arg :');
    // console.log('name :'+name);
    // console.log('entity :'+JSON.stringify(entity));
    // console.log('------');
    log.info('asynchronous-validate arg :');
    log.info('name :'+name);
    log.info('entity :'+JSON.stringify(entity));
    log.info('------');

    // database because we'll run 2 query
    let database = dao.getDatabase();
    
    // if need, specifie the repository
    let repository; 
    if(name == "user") repository = new UserRepository(dao);

    else repository = new BaseRepository(dao, name);
    
    // Run the query
    repository.validateDB(entity, val, database).then(()=>{
        repository.allDB(database).then(rows => {
            event.reply(
                'asynchronous-reply', rows
            );
        });
    });

    // Close database connection
    database.close;

});

ipcMain.on('asynchronous-add', (event, name, entity) => {
    // verbose
    // console.log('asynchronous-add arg :');
    // console.log('name :'+name);
    // console.log('entity :'+JSON.stringify(entity));
    // console.log('------');
    log.info('asynchronous-add arg :');
    log.info('name :'+name);
    log.info('entity :'+JSON.stringify(entity));
    log.info('------');

    // database because we'll run 2 query
    let database = dao.getDatabase();
    
    // if need, specifie the repository
    let repository; 
    if(name == "user") repository = new UserRepository(dao);

    else repository = new BaseRepository(dao, name);
    
    // // Run the query
    // repository.createDB(entity, database).then(()=>{
    //     var resp = repository.allDB(database);
    //     // close database
    //     database.close;
    //     return resp;
    // });

    // Run the query
    repository.createDB(entity, database).then(()=>{
        repository.allDB(database).then(rows => {
            event.reply(
                'asynchronous-reply', rows
            );
        });
    });

    // Close database connection
    database.close;
});

ipcMain.handle('asynchronous-get', (event, name, entity) => {
    // verbose
    log.info('asynchronous-get arg :');
    log.info('name :'+name);
    log.info('entity :'+JSON.stringify(entity));
    log.info('------');

    // if need, specifie the repository
    let repository; 
    if(name == "user") repository = new UserRepository(dao);
    if(name == "reponse") repository = new ResponseRepository(dao);

    else repository = new BaseRepository(dao, name);
    
    // Run the query
    return repository.all(entity);
});

ipcMain.on('asynchronous-get-trans', (event, name, entity) => {
    // verbose
    log.info('asynchronous-get-trans arg :');
    log.info('name :'+name);
    log.info('entity :'+JSON.stringify(entity));
    log.info('------');

    // if need, specifie the repository
    let repository; 
    if(name == "user") repository = new UserRepository(dao);
    if(name == "reponse") repository = new ResponseRepository(dao);

    else repository = new BaseRepository(dao, name);    

    // Run the query
    repository.all(entity).then(rows => {
        log.info("services : repository.all : ");
        log.info(rows);
        event.reply(
            'asynchronous-reply', rows
        );
    });
});

ipcMain.handle('map-get', (event, name, entity) => {
    // verbose
    log.info('map-get arg :');
    log.info('name :'+name);
    log.info('entity :'+JSON.stringify(entity));
    log.info('------');

    if(name == "region") return regions;
    if(name == "reponse") return regions;
});