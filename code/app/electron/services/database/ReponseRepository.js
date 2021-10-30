const BaseRepository = require("./BaseRepository");
const log = require('electron-log')

class ResponseRepository extends BaseRepository {

    constructor(dao) {
        super(dao, "reponse");
        this.entity = {
            
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

    // allDB(database, entity={}) {
    //     let sql = "SELECT u.*, c.label, c.rank FROM user AS u JOIN category AS c ON u.category_id = c.id WHERE 1 = 1 ";
    //     let values = [];

    //     Object.keys(entity).map((key)=>{
    //         sql+='AND '+key+' = ? ';
    //         values.push(entity[key]);
    //     })

    //     // console.log('database:');
    //     // console.log(sql);
    //     // console.log(values);
    //     log.info('database:');
    //     log.info(sql);
    //     log.info(values);

    //     return this.dao.allDB(sql, values, database)
    // };

    // allByDistrict(database, entity={}) {
    allDB(database, entity={}) {

        let level = "district"
        let date = "2019"
        let entities = []
        let sqlWhere = "";

        Object.keys(entity).map((key)=>{
            if(key=="level") level = entity[key]
            else if(key=="date") date = entity[key]
            else {
                sqlWhere += 'AND '+key+' = ? '
                entities.push(entity[key])
            }
        })

        const sqlDistrict = `SELECT * FROM `+level+` WHERE 1 = 1 `+sqlWhere;
        log.info('database allByDistrict district:');
        log.info(sqlDistrict);

        return this.dao.allDB(sqlDistrict, entities, database).then(result => {
            const sql = level=="district"
            ?`SELECT q.id As question, r.*, u.nom, 
                    u.category_id, u.district_id, 
                    dist.label AS district, cat.label AS category,
                    q.question as qst, q.label as question_label,
                    q.unite as unite, q.is_principale, q.question_mere_id
                FROM question AS q
                LEFT JOIN reponse AS r ON q.id = r.question_id
                JOIN user AS u ON u.id = r.user_id 
                JOIN district AS dist ON dist.id = u.district_id
                JOIN category AS cat ON cat.id = u.category_id
                WHERE r.date like "%` + date + `" AND district_id = ? 
                ORDER BY r.id ASC `
            :`SELECT q.id As question, SUM(r.reponse) as reponse, u.nom, 
                u.category_id, dist.region_id as district_id, 
                reg.label AS district, cat.label AS category,
                q.question as qst, q.label as question_label,
                q.unite as unite, q.is_principale, q.question_mere_id
            FROM question AS q
            LEFT JOIN reponse AS r ON q.id = r.question_id
            JOIN user AS u ON u.id = r.user_id 
            JOIN district AS dist ON dist.id = u.district_id
            JOIN region AS reg ON reg.id = dist.region_id
            JOIN category AS cat ON cat.id = u.category_id
            WHERE r.date like "%` + date + `" AND region_id = ? 
            ORDER BY r.id ASC `;
            
            log.info('Response repository : database allByDistrict item:');
            log.info(sql);

            return Promise.all(result.map(res => {
                const values = [res.id]
                log.info(values);
                return this.dao.allDB(sql, values, database)
            }));
        })
    };

    all(entity={}) {
        let level = "district"
        let date = "2019"
        let entities = []
        let sqlWhere = "";

        Object.keys(entity).map((key)=>{
            if(key=="level") level = entity[key]
            else if(key=="date") date = entity[key]
            else {
                sqlWhere += 'AND '+key+' = ? '
                entities.push(entity[key])
            }
        })

        let database = this.dao.getDatabase();

        const sqlDistrict = `SELECT * FROM `+level+` WHERE 1 = 1 `+sqlWhere;
        log.info('database allByDistrict district:');
        log.info(sqlDistrict);

        return this.dao.allDB(sqlDistrict, entities, database).then(result => {
            const sql = level=="district"
            ?`SELECT q.id As question, r.*, u.nom, 
                    u.category_id, u.district_id, 
                    dist.label AS district, cat.label AS category,
                    q.question as qst, q.label as question_label,
                    q.unite as unite, q.is_principale, q.question_mere_id
                FROM question AS q
                LEFT JOIN reponse AS r ON q.id = r.question_id
                JOIN user AS u ON u.id = r.user_id 
                JOIN district AS dist ON dist.id = u.district_id
                JOIN category AS cat ON cat.id = u.category_id
                WHERE r.date like "%` + date + `" AND district_id = ? 
                ORDER BY r.id ASC `
            :`SELECT q.id As question, SUM(r.reponse) as reponse, u.nom, 
                u.category_id, dist.region_id as district_id, 
                reg.label AS district, cat.label AS category,
                q.question as qst, q.label as question_label,
                q.unite as unite, q.is_principale, q.question_mere_id
            FROM question AS q
            LEFT JOIN reponse AS r ON q.id = r.question_id
            JOIN user AS u ON u.id = r.user_id 
            JOIN district AS dist ON dist.id = u.district_id
            JOIN region AS reg ON reg.id = dist.region_id
            JOIN category AS cat ON cat.id = u.category_id
            WHERE r.date like "%` + date + `" AND region_id = ? 
            ORDER BY r.id ASC `;
            
            log.info('Response repository : database allByDistrict item:');
            log.info(sql);

            return Promise.all(result.map(res => {
                const values = [res.id]
                log.info(values);
                return this.dao.allDB(sql, values, database)
            }));
        }).finally(()=>database.close())
    };

    // get(entity={}) {
    //     let level = "district"
    //     let date = "2019"
    //     let entities = {}

    //     Object.keys(entity).map((key)=>{
    //         if(key=="level") level = entity[key]
    //         else if(key=="date") date = entity[key]
    //         else entities.push(entity[key])
    //     })

    //     let database = this.dao.getDatabase();
        
    //     const sql = `SELECT q.id As question, r.*, u.nom, 
    //             u.category_id, u.district_id, 
    //             dist.label AS district, cat.label AS category,
    //             q.question as qst
    //         FROM question AS q
    //         LEFT JOIN reponse AS r ON q.id = r.question_id
    //         JOIN user AS u ON u.id = r.user_id 
    //         JOIN district AS dist ON dist.id = u.district_id
    //         JOIN category AS cat ON cat.id = u.category_id
    //         WHERE r.date like "%` + date + `" AND district_id = ? 
    //         ORDER BY r.question_id ASC `;
        
    //     log.info('Response repository : database get item:');
    //     log.info(sql);

    //     const values = entities
    //     log.info(values);
    //     return this.dao.allDB(sql, values, database)        
    // };

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

    // all(entity={}) {
    //     let sql = "SELECT u.*, c.label, c.rank FROM user AS u JOIN category AS c ON u.category_id = c.id WHERE 1 = 1 ";
    //     let values = [];

    //     Object.keys(entity).map((key)=>{
    //         sql+='AND '+key+' = ? ';
    //         values.push(entity[key]);
    //     })

    //     // console.log('database:');
    //     // console.log(sql);
    //     // console.log(values);
    //     log.info('database:');
    //     log.info(sql);
    //     log.info(values);

    //     return this.dao.all(sql, values)
    // };



}

module.exports = ResponseRepository;