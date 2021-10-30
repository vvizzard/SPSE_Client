const log = require('electron-log')

class BaseRepository {

    constructor(dao, table) {
        this.dao = dao;
        this.table = table;
    }

    createDB(entity, database) {
        let column = '';
        let props = '';
        let value = [];

        Object.keys(entity).map((key)=>{
            column += key+', ';
            props+='?, ';
            value.push(entity[key]);
        })
        column = column.slice(0, -2);
        props = props.slice(0, -2);

        let sql = 'INSERT INTO '+this.table+' ( '+column+' ) VALUES ( '+props+' )';

        // console.log('database:');
        // console.log(sql);
        // console.log(value);
        log.info('database:');
        log.info(sql);
        log.info(value);

        return this.dao.runDB( sql, value, database );
    }

    updateDB(id, entity, database) {
        let column = '';
        let value = [];

        Object.keys(entity).map((key)=>{
            column += key+' = ?, ';
            value.push(entity[key]);
        })
        value.push(id)
        column = column.slice(0, -2);

        let sql = 'UPDATE '+this.table+' SET '+column+' WHERE id = ?';

        // console.log('database:');
        // console.log(sql);
        // console.log(value);
        log.info('database:');
        log.info(sql);
        log.info(value);

        return this.dao.runDB( sql, value, database );
    }

    allDB(database, entity={}) {
        let sql = "SELECT * FROM " + this.table + " WHERE 1 = 1 ";
        let values = [];

        Object.keys(entity).map((key)=>{
            sql+='AND '+key+' = ? ';
            values.push(entity[key]);
        })

        // console.log('database:');
        // console.log(sql);
        // console.log(values);
        log.info('database:');
        log.info(sql);
        log.info(values);

        return this.dao.allDB(sql, values, database)
    };

    getDB(sql, params, database){
        return this.dao.getDB(sql, params, database)
    };

    validateDB(entity, val, database){
        // to be defined in children
        // console.log("Use UserRepository to access this methode");
        return null;
    }

    // allDB(sql, params, database){
    //     return this.dao.allDB(sql, params, database)
    // };

    get(sql, params){
        return this.dao.get(sql, params)
    };

    all(entity={}) {
        let sql = "SELECT * FROM " + this.table + " WHERE 1 = 1 ";
        let values = [];

        Object.keys(entity).map((key)=>{
            sql+='AND '+key+' = ? ';
            values.push(entity[key]);
        })

        // console.log('database:');
        // console.log(sql);
        // console.log(values);
        log.info('database:');
        log.info(sql);
        log.info(values);

        return this.dao.all(sql, values)
    };

    create(entity) {
        let column = '';
        let props = '';
        let value = [];

        Object.keys(entity).map((key)=>{
            column += key+', ';
            props+='?, ';
            value.push(entity[key]);
        })
        column = column.slice(0, -2);
        props = props.slice(0, -2);

        let sql = 'INSERT INTO '+this.table+' ( '+column+' ) VALUES ( '+props+' )';

        // console.log('database:');
        // console.log(sql);
        // console.log(values);
        log.info('database:');
        log.info(sql);
        log.info(values);

        return this.dao.run( sql, value );
    }

    updateDB(id, entity) {
        let column = '';
        let value = [];

        Object.keys(entity).map((key)=>{
            column += key+' = ?, ';
            value.push(entity[key]);
        })
        value.push(id)
        column = column.slice(0, -2);

        let sql = 'UPDATE '+this.table+' SET '+column+' WHERE id = ?';

        // console.log('database:');
        // console.log(sql);
        // console.log(value);
        log.info('database:');
        log.info(sql);
        log.info(value);

        return this.dao.runDB( sql, value );
    }

    validate(entity, val){
        // to be defined in children
        // console.log("Use UserRepository to access this methode");
        log.info("Use UserRepository to access this methode");
        return null;
    }

}

module.exports = BaseRepository;