const log = require("electron-log");

class BaseRepository {
  constructor(dao, table) {
    this.dao = dao;
    this.table = table;
  }

  formatDate(d) {
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    let year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [day, month, year].join("-");
  }

  createDB(entity, database) {
    let column = "";
    let props = "";
    let value = [];
    entity["id"] = entity["id"]
      ? entity["id"]
      : Date.now() + "" + Math.floor(Math.random() * 10);
    Object.keys(entity).map((key) => {
      column += key + ", ";
      props += "?, ";
      value.push(entity[key]);
    });
    column = column.slice(0, -2);
    props = props.slice(0, -2);

    let sql =
      "INSERT INTO " +
      this.table +
      " ( " +
      column +
      " ) VALUES ( " +
      props +
      " )";

    log.info("database:");
    log.info(sql);
    log.info(value);

    return this.dao.runDB(sql, value, database);
  }

  updateDB(id, entity, database) {
    let column = "";
    let value = [];

    Object.keys(entity).map((key) => {
      column += key + " = ?, ";
      value.push(entity[key]);
    });
    value.push(id);
    column = column.slice(0, -2);

    let sql = "UPDATE " + this.table + " SET " + column + " WHERE id = ?";

    log.info("database:");
    log.info(sql);
    log.info(value);

    return this.dao.runDB(sql, value, database);
  }

  allDB(database, entity = {}) {
    let sql = "SELECT * FROM " + this.table + " WHERE 1 = 1 ";
    let values = [];

    Object.keys(entity).map((key) => {
      sql += "AND " + key + " = ? ";
      values.push(entity[key]);
    });

    log.info("database:");
    log.info(sql);
    log.info(values);

    return this.dao.allDB(sql, values, database);
  }

  getDB(sql, params, database) {
    return this.dao.getDB(sql, params, database);
  }

  validateDB(entity, val, database) {
    // to be defined in children
    // console.log("Use UserRepository to access this methode");
    return null;
  }

  // allDB(sql, params, database){
  //     return this.dao.allDB(sql, params, database)
  // };

  get(sql, params) {
    return this.dao.get(sql, params);
  }

  async all(entity = {}) {
    let sql = "SELECT * FROM " + this.table + " WHERE 1 = 1 ";
    let values = [];

    // ary amin'ny valeur no tena tokony asiana % sao tratra tampoka
    Object.keys(entity).map((key) => {
      if (key == "date") {
        sql += "AND " + key + ' like "%' + entity[key] + '" ';
      } else {
        sql += "AND " + key + " = ? ";
        values.push(entity[key]);
      }
    });

    log.info("database:");
    log.info(sql);
    log.info(values);

    return this.dao.all(sql, values);
  }

  async create(entity) {
    let column = "";
    let props = "";
    let value = [];
    entity["id"] = entity["id"]
      ? entity["id"]
      : Date.now() + "" + Math.floor(Math.random() * 10);
    Object.keys(entity).map((key) => {
      column += key + ", ";
      props += "?, ";
      value.push(entity[key]);
    });
    column = column.slice(0, -2);
    props = props.slice(0, -2);

    let sql =
      "INSERT INTO " +
      this.table +
      " ( " +
      column +
      " ) VALUES ( " +
      props +
      " )";

    log.info("database:");
    log.info(sql);
    log.info(value);

    return this.dao.run(sql, value);
  }

  updateDB(id, entity) {
    let column = "";
    let value = [];

    Object.keys(entity).map((key) => {
      column += key + " = ?, ";
      value.push(entity[key]);
    });
    value.push(id);
    column = column.slice(0, -2);

    let sql = "UPDATE " + this.table + " SET " + column + " WHERE id = ?";

    log.info("database:");
    log.info(sql);
    log.info(value);

    return this.dao.runDB(sql, value);
  }

  deleteDB(id, database) {
    let sql = "DELETE FROM " + this.table + " WHERE id = ?";
    log.info("DELETE:");
    log.info(sql);
    log.info(id);
    return this.dao.runDB(sql, id, database);
  }

  delete(id) {
    let sql = "DELETE FROM " + this.table + " WHERE id = ?";
    log.info("DELETE:");
    log.info(sql);
    log.info(id);
    return this.dao.run(sql, id);
  }

  async deletes(ids) {
    const database = this.dao.getDatabase();
    let valiny = true;
    for (let index = 0; index < ids.length; index++) {
      const t = await this.deleteDB(ids[index], database);
      valiny = t ? true : false;
    }
    database.close();
    return valiny;
  }

  deleteWhere(where = null) {
    if (where == null) return false;

    let sql = "DELETE FROM " + this.table + " WHERE 1 = 1 ";

    let values = [];
    Object.keys(where).map((key) => {
      if (key == "date") {
        sql += "AND " + key + ' like "%' + where[key] + '" ';
      } else {
        sql += "AND " + key + " = ? ";
        values.push(where[key]);
      }
    });

    log.info("DELETE:");
    log.info(sql);
    log.info(values);
    return this.dao.run(sql, values);
  }

  async clean(entity) {
    try {
      let sql = "DELETE FROM " + this.table + " WHERE 1=1";
      log.info("CLEAN:" + this.table);
      log.info(sql);
      const del = await this.dao.run(sql);
      for (let index = 0; index < entity.length; index++) {
        const element = await this.create(entity[index]);
      }
    } catch (error) {
      log.info("districtsByRegion : error");
      throw error;
    }
  }

  async cleanAll(sql) {
    try {
      let sqlDel = "DELETE FROM " + this.table + " WHERE 1=1";
      if (this.table == "reponse_non_valide") {
        sqlDel += " AND comment = 1";
      }
      log.info("CLEAN:" + this.table);
      log.info(sqlDel);
      const del = await this.dao.run(sqlDel);

      log.info("clean all");
      log.info(sql);
      const element = await this.dao.execute(sql);
    } catch (error) {
      log.info("cleanALL : error");
      log.info(error);
      log.info("-----------------------------");
    }
  }

  validate(entity, val) {
    // to be defined in children
    // console.log("Use UserRepository to access this methode");
    log.info("Use UserRepository to access this methode");
    return null;
  }

  async districtsByRegion(idDistrict) {
    let sql = `SELECT * FROM district WHERE region_id  
            in (SELECT region_id FROM district WHERE id = ?) `;

    log.info("database:");
    log.info(sql);
    log.info([idDistrict]);
    log.warn("first");

    try {
      let valiny = [];
      log.info("anomboka aka an'ilay user ary");
      log.info("district id:" + idDistrict);
      const temp = await this.dao.all(sql, [idDistrict]);
      log.info("tokony azo ary ilay 48");
      log.info(temp);
      log.warn('second');
      sql = `SELECT id FROM user WHERE district_id = ? AND validate = -1`;
      log.warn(temp);
      for (let index = 0; index < temp.length; index++) {
        log.error(temp[index]);
        log.error(index);
        const t = await this.dao.all(sql, [temp[index].id]);
        log.warn(t);
        log.info("ao anaty boucle");
        log.info(t);
        temp[index]["user_id"] = t[0].id;
        log.warn("third");
        // log.info("tralalalal lliliiili lallala")
        // log.info(t)
        // log.info(temp[index])
        valiny.push(temp[index]);
      }
      return valiny;
    } catch (error) {
      log.info("districtsByRegion : error");
      throw error;
    }
  }
}

module.exports = BaseRepository;
