const BaseRepository = require("./BaseRepository");
const log = require('electron-log')

class UserRepository extends BaseRepository {

    constructor(dao) {
        super(dao, "user");
        let currTime = new Date().getTime();
        this.entity = {
            "id": currTime,
            // "nom": "",
            // "email": "",
            // "tel": "",
            // "pw": "",
            "category_id": 1,
            "validate": 0
        }
    }

    createDB(properties, database) {
        Object.keys(properties).map((key)=>{
            if (this.entity[key] != properties[key]) {
                this.entity[key] = properties[key]
            }
        })
        return super.createDB(this.entity, database);
    }

    updateDB(properties, database) {
        Object.keys(properties).map((key)=>{
            if(key !== "id")
            if (this.entity[key] != properties[key]) {
                this.entity[key] = properties[key]
            }
        })
        return super.updateDB(properties["id"], this.entity, database);
    }

    validateDB(ids, val, database) {
        let column = '';
        let value = [];
        value.push(val);

        ids.forEach(id => {
            column += 'OR id = ? ';
            value.push(id);
        });

        let sql = 'UPDATE user SET validate = ? WHERE 1 != 1 '+column;

        // console.log('database:');
        // console.log(sql);
        // console.log(value);
        log.info('database:');
        log.info(sql);
        log.info(value);

        return this.dao.runDB( sql, value, database );
    }

    // getAllDB(database) {
    //     return super.allDB('select * from user', [], database)
    // }

    allDB(database, entity={}) {
        let sql = "SELECT u.*, c.label, c.rank FROM user AS u JOIN category AS c ON u.category_id = c.id WHERE 1 = 1 ";
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

    create(properties) {
        Object.keys(properties).map((key)=>{
            if (this.entity[key] != properties[key]) {
                this.entity[key] = properties[key]
            }
        })
        return super.create(this.entity);
    }

    update(properties) {
        Object.keys(properties).map((key)=>{
            if(key !== "id")
            if (this.entity[key] != properties[key]) {
                this.entity[key] = properties[key]
            }
        })
        return super.update(properties["id"], this.entity);
    }

    validate(ids, val) {
        let column = '';
        let value = [];
        value.push(val)

        ids.forEach(id => {
            column += 'OR id = ? ';
            value.push(id);
        });

        let sql = 'UPDATE user SET validate = ? WHERE 1 != 1 '+column;

        // console.log('database:');
        // console.log(sql);
        // console.log(value);
        log.info('database:');
        log.info(sql);
        log.info(value);

        return this.dao.run( sql, value );
    }

    // getAll() {
    //     return super.all('select * from user', [])
    // }

    all(entity={}) {
        let sql = "SELECT u.*, c.label, c.rank FROM user AS u JOIN category AS c ON u.category_id = c.id WHERE 1 = 1 ";
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



}

module.exports = UserRepository;