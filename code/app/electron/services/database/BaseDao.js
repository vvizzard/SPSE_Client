const { app } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const log = require('electron-log')
const fs = require("fs");
var path = require('path');

// const Promise = require('bluebird')

class BaseDao {

    constructor(dbFilePath) {
        this.dbPath = dbFilePath
        this.checkDatabase()
    }

    checkDatabase() {
        try {
            var filebuffer = fs.readFileSync(path.join(app.getPath('userData'), this.dbPath));
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                fs.closeSync(fs.openSync(path.join(app.getPath('userData'), this.dbPath), 'w'));
                const database = this.getDatabase();
                this.setUpDatabase(database)
                database.close
                log.info('path of database : ')
                log.info(path.join(app.getPath('userData'), this.dbPath))
            } 
            else {
                throw err;
            }
        }
    }

    // set up database from scrach
    setUpDatabase(database) {
        let sql = [];
        // Create tables
        sql.push(`CREATE TABLE IF NOT EXISTS "category" (
            "id"	INTEGER NOT NULL UNIQUE,
            "label"	TEXT NOT NULL,
            "rank"	INTEGER NOT NULL DEFAULT 1,
            PRIMARY KEY("id")
        )`)
        sql.push(`CREATE TABLE IF NOT EXISTS "region" (
            "id"	INTEGER NOT NULL UNIQUE,
            "label"	TEXT NOT NULL,
            "comment"	INTEGER,
            "province_id"	INTEGER NOT NULL,
            FOREIGN KEY("province_id") REFERENCES "province"("id"),
            PRIMARY KEY("id")
        )`)
        sql.push(`CREATE TABLE IF NOT EXISTS "district" (
            "id"	INTEGER NOT NULL UNIQUE,
            "label"	TEXT NOT NULL,
            "comment"	INTEGER,
            "region_id"	INTEGER NOT NULL,
            FOREIGN KEY("region_id") REFERENCES "region"("id"),
            PRIMARY KEY("id")
        )`)
        sql.push(`CREATE TABLE IF NOT EXISTS "user" (
            "id"	INTEGER NOT NULL UNIQUE,
            "nom"	TEXT NOT NULL,
            "email"	TEXT NOT NULL,
            "tel"	TEXT NOT NULL,
            "pw"	TEXT NOT NULL,
            "category_id"	INTEGER,
            "validate"	INTEGER NOT NULL DEFAULT 0,
            "district_id"	INTEGER,
            FOREIGN KEY("district_id") REFERENCES "district"("id"),
            FOREIGN KEY("category_id") REFERENCES "category"("id"),
            PRIMARY KEY("id")
        )`)
        sql.push(`CREATE TABLE IF NOT EXISTS "thematique" (
            "id"	INTEGER NOT NULL UNIQUE,
            "label"	TEXT NOT NULL,
            "comment"	TEXT,
            PRIMARY KEY("id")
        )`)
        sql.push(`CREATE TABLE IF NOT EXISTS "indicateur" (
            "id"	INTEGER NOT NULL UNIQUE,
            "label"	TEXT NOT NULL,
            "comment"	INTEGER,
            "thematique_id"	INTEGER NOT NULL,
            FOREIGN KEY("thematique_id") REFERENCES "thematique"("id"),
            PRIMARY KEY("id")
        )`)
        sql.push(`CREATE TABLE IF NOT EXISTS "province" (
            "id"	INTEGER NOT NULL UNIQUE,
            "label"	TEXT NOT NULL,
            "comment"	TEXT,
            PRIMARY KEY("id")
        )`)
        sql.push(`CREATE TABLE IF NOT EXISTS "reponse" (
            "id"	INTEGER NOT NULL UNIQUE,
            "question_id"	INTEGER NOT NULL,
            "user_id"	INTEGER NOT NULL,
            "date"	TEXT NOT NULL,
            "link_gps"	TEXT,
            "link_photo"	TEXT,
            "reponse"	REAL NOT NULL,
            "comment"	TEXT,
            FOREIGN KEY("user_id") REFERENCES "user"("id"),
            FOREIGN KEY("question_id") REFERENCES "question"("id"),
            PRIMARY KEY("id")
        )`)
        sql.push(`CREATE TABLE IF NOT EXISTS "question" (
            "id"	INTEGER NOT NULL UNIQUE,
            "question"	TEXT,
            "is_principale"	INTEGER NOT NULL DEFAULT 0,
            "field_type"	INTEGER NOT NULL DEFAULT 1,
            "level"	NUMERIC NOT NULL DEFAULT 1,
            "frequence_resp"	INTEGER NOT NULL DEFAULT 1,
            "indicateur_id"	INTEGER,
            "question_mere_id" INTEGER,
            "objectif"	TEXT,
            "label"	REAL NOT NULL,
            "unite"	TEXT,
            FOREIGN KEY("indicateur_id") REFERENCES "indicateur"("id"),
            PRIMARY KEY("id")
        )`)

        // Add default values
        sql.push(`INSERT INTO "category" ("id","label","rank") VALUES (1,'cantonnement',1),
            (2,'RPSE',1),
            (3,'DREDD',2),
            (4,'DPSE',3)`
        )
        sql.push(`INSERT INTO "region" ("id","label","comment","province_id") VALUES (1,'Boeny',NULL,4),
        (2,'Analamanga',NULL,1)`)
        sql.push(`INSERT INTO "district" ("id","label","comment","region_id") VALUES (1,'Andranofasika',NULL,1),
        (2,'Andramasina',NULL,2),
        (3,'Marosakoa',NULL,1),
        (4,'Anjozorobe',NULL,2)`)
        sql.push(`INSERT INTO "user" ("id","nom","email","tel","pw","category_id","validate","district_id") VALUES (1,'RAZAFINDRAKOTO Franck','frazafindrakoto@gmail.com','0344578935','test',1,0,1),
        (2,'RABETRANO Princia','prabetrano@gmail.com','0342598744','test',4,1,2),
        (3,'RABEZANDRY Marcelle','mrabezandry@gmail.com','0345485246','test',2,0,3),
        (4,'RAKOTONANDRASANA Harilala','hrakotonandrasana@gmail.com','0341255548','test',3,0,4),
        (5,'RAZAFINJOELINA Tahiana','trazafinjoelina@gmail.com','0345123698','test',3,1,NULL)`)
        sql.push(`INSERT INTO "thematique" ("id","label","comment") VALUES (1,'Reboisement',NULL),
        (2,'Feux',NULL)`)
        sql.push(`INSERT INTO "indicateur" ("id","label","comment","thematique_id") VALUES (1,'Surface reboisé',NULL,1),
        (2,'Espèce otoctone reboisée',NULL,1),
        (3,'Surface brûlée',NULL,2),
        (4,'Longueur totale de par-feux',NULL,2)`)
        sql.push(`INSERT INTO "province" ("id","label","comment") VALUES (1,'Antananarivo','8864904553756276688'),
        (2,'Antsiranana','-8711031052795110745'),
        (3,'Toamasina','2810143387255338619'),
        (4,'Mahajanga','-949041082025301867'),
        (5,'Fianarantsoa','7270744785182717817'),
        (6,'Antsiranana','-6562433572110832805'),
        (7,'Toliara','-4460846208442074585')`)
        sql.push(`INSERT INTO "reponse" ("id","question_id","user_id","date","link_gps","link_photo","reponse","comment") VALUES (1,1,1,'21-12-2020',NULL,NULL,250.0,NULL),
        (2,2,1,'21-12-2020',NULL,NULL,12.0,NULL),
        (3,3,1,'21-12-2020',NULL,NULL,100.0,NULL),
        (4,4,1,'21-12-2021',NULL,NULL,25.0,NULL),
        (5,1,1,'21-12-2019',NULL,NULL,250.0,NULL),
        (6,2,1,'21-12-2019',NULL,NULL,10.0,NULL),
        (7,3,1,'21-12-2019',NULL,NULL,600.0,NULL),
        (8,4,1,'21-12-2019',NULL,NULL,75.0,NULL),
        (9,1,2,'21-12-2020',NULL,NULL,100.0,NULL),
        (10,2,2,'21-12-2020',NULL,NULL,100.0,NULL),
        (11,3,2,'21-12-2020',NULL,NULL,100.0,NULL),
        (12,4,2,'21-12-2020',NULL,NULL,100.0,NULL),
        (13,1,2,'21-12-2019',NULL,NULL,250.0,NULL),
        (14,2,2,'21-12-2019',NULL,NULL,10.0,NULL),
        (15,3,2,'21-12-2019',NULL,NULL,600.0,NULL),
        (16,4,2,'21-12-2019',NULL,NULL,75.0,NULL),
        (17,1,3,'21-12-2020',NULL,NULL,100.0,NULL),
        (18,2,3,'21-12-2020',NULL,NULL,100.0,NULL),
        (19,3,3,'21-12-2020',NULL,NULL,100.0,NULL),
        (20,4,3,'21-12-2020',NULL,NULL,100.0,NULL),
        (21,1,3,'21-12-2019',NULL,NULL,250.0,NULL),
        (22,2,3,'21-12-2019',NULL,NULL,10.0,NULL),
        (23,3,3,'21-12-2019',NULL,NULL,600.0,NULL),
        (24,4,3,'21-12-2019',NULL,NULL,75.0,NULL),
        (25,1,4,'21-12-2020',NULL,NULL,100.0,NULL),
        (26,2,4,'21-12-2020',NULL,NULL,100.0,NULL),
        (27,3,4,'21-12-2020',NULL,NULL,100.0,NULL),
        (28,4,4,'21-12-2020',NULL,NULL,100.0,NULL),
        (29,1,4,'21-12-2019',NULL,NULL,250.0,NULL),
        (30,2,4,'21-12-2019',NULL,NULL,10.0,NULL),
        (31,3,4,'21-12-2019',NULL,NULL,600.0,NULL),
        (32,4,4,'21-12-2019',NULL,NULL,75.0,NULL)`)
        sql.push(`INSERT INTO "question" ("id","question","is_principale","field_type","level","frequence_resp","indicateur_id","objectif","label","unite") VALUES (1,'Quelle est la superficie totale reboisée?',1,1,3,1,1,NULL,'Surface totale reboisée','ha'),
        (2,'Quel est le nombre total d''espèce otoctone reboisée',1,1,3,1,2,NULL,'Nombre d''espèce otoctone reboisée','Unité'),
        (3,'Quelle est la superficie totale brûlée?',1,1,3,1,3,NULL,'Surface brûlée','ha'),
        (4,'Quelle est la longueure totale de pare-feux?',1,1,3,1,4,NULL,'Longueure totale de pare-feux','km')`)

        // // Add default values
        // sql.push('INSERT INTO "category" ("id","label","rank") VALUES (1,\'cantonnement\',1),(2,\'RPSE\',1),(3,\'DREDD\',2),(4,\'DPSE\',3)')
        // sql.push('INSERT INTO "user" ("id","nom","email","tel","pw","category_id","validate") VALUES (1,\'RAZAFINDRAKOTO Franck\',\'frazafindrakoto@gmail.com\',\'0344578935\',\'test\',1,0),(2,\'RABETRANO Princia\',\'prabetrano@gmail.com\',\'0342598744\',\'test\',4,0),(3,\'RABEZANDRY Marcelle\',\'mrabezandry@gmail.com\',\'0345485246\',\'test\',2,0),(4,\'RAKOTONANDRASANA Harilala\',\'hrakotonandrasana@gmail.com\',\'0341255548\',\'test\',3,1),(5,\'RAZAFINJOELINA Tahiana\',\'trazafinjoelina@gmail.com\',\'0345123698\',\'test\',3,1)')
        // Run sql
        sql.forEach(line => {
            const temp = database.exec(line) //(line, [], database)
        });
    }

    getDatabase() {
        return new sqlite3.Database(path.join(app.getPath('userData'), this.dbPath), (err) => {
            if (err) {
                // console.log('Could not connect to database', err)
                log.error('Could not connect to database', err)
                log.error('path : ' + path.join(app.getPath('userData'), this.dbPath))
            } else {
                // console.log('Connected to database')
                log.info('Connected to database')
            }
        });
    }
    
    runDB(sql, params = [], database) {
        return new Promise((resolve, reject) => {
            database.run(sql, params, function (err) {
                if (err) {
                    // console.log('Error running sql ' + sql)
                    // console.log(err)
                    log.error('Error running sql ' + sql)
                    log.error(err)
                    reject(err)
                } else {
                    resolve({ id: this.lastID })
                }
            });
        })
    }

    getDB(sql, params = [], database) {
        return new Promise((resolve, reject) => {
            database.get(sql, params, (err, result) => {
                if (err) {
                    // console.log('Error running sql: ' + sql)
                    // console.log(err)
                    log.error('Error running sql: ' + sql)
                    log.error(err)
                    reject(err)
                } else {
                    // console.log("database:");
                    // console.log(result);
                    log.info("database:");
                    log.info(result);

                    resolve(result)
                }
            });
        })
    }

    allDB(sql, params = [], database) {
        return new Promise((resolve, reject) => {
            database.all(sql, params, (err, rows) => {
                if (err) {
                    // console.log('Error running sql: ' + sql)
                    // console.log(err)
                    log.error('Error running sql: ' + sql)
                    log.error(err)
                    reject(err)
                } else {
                    // console.log("database:");
                    // console.log(sql);
                    // console.log(params);
                    // console.log(rows);
                    log.info("database:");
                    log.info(sql);
                    log.info(params);
                    log.info(rows);

                    resolve(rows)
                }
            });
        })
    }

    run(sql, params = []) {
        let database = this.getDatabase();
        const resp = this.runDB(sql, params, database);
        database.close
        return resp
    }

    get(sql, params = []) {
        let database = this.getDatabase();
        const resp = this.getDB(sql, params, database)
        database.close
        return resp
    }
    
    all(sql, params = []) {
        let database = this.getDatabase()
        const resp = this.allDB(sql, params, database)
        database.close
        return resp
    }

}

module.exports = BaseDao;