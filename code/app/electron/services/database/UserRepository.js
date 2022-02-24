const BaseRepository = require("./BaseRepository");
const log = require("electron-log");

class UserRepository extends BaseRepository {
  constructor(dao) {
    super(dao, "user");
    let currTime = new Date().getTime();
    this.entity = {
      id: currTime,
      // "nom": "",
      // "email": "",
      // "tel": "",
      // "pw": "",
      category_id: 1,
      validate: 0,
    };
  }

  // CRUD without database

  /**
   * @name all
   * @description Get all user with entity as where clauses
   * @param {JSON} entity
   *
   * @returns {Array}
   */
  all(entity = {}) {
    let sql = `
      SELECT 
        u.*, 
        c.label, 
        c.rank, 
        r.id as region_id 
      FROM user AS u 
        JOIN category AS c ON u.category_id = c.id 
        JOIN district AS d ON d.id = u.district_id
        JOIN region AS r ON r.id = d.region_id
      WHERE 1 = 1 
    `;
    let values = [];

    Object.keys(entity).map((key) => {
      if (key == "district_id") {
        sql += `
          AND u.district_id in (
            SELECT id FROM district WHERE region_id in (
              SELECT region_id FROM district WHERE id = ?
            )
          )
        `;
      } else if (key == "rank") {
        let rank = entity[key].toString();
        rank = rank.includes(",") ? rank.split(",") : [].concat(rank);
        if (rank.length > 1) {
          sql += " AND ( rank = ? OR rank = ? ) ";
          values.push(parseInt(rank[0]));
          entity[key] = parseInt(rank[1]);
        } else {
          sql += " AND rank = ? ";
        }
      } else sql += " AND " + key + " = ? ";

      values.push(entity[key]);
    });

    log.info("UserRepository: all()");
    log.info(sql);
    log.info(values);
    log.info("------------------------------------------");

    return this.dao.all(sql, values);
  }

  create(properties) {
    Object.keys(properties).map((key) => {
      if (this.entity[key] != properties[key]) {
        this.entity[key] = properties[key];
      }
    });
    return super.create(this.entity);
  }

  update(properties) {
    Object.keys(properties).map((key) => {
      if (key !== "id")
        if (this.entity[key] != properties[key]) {
          this.entity[key] = properties[key];
        }
    });
    return super.update(properties["id"], this.entity);
  }

  validate(ids, val) {
    let column = "";
    let value = [];
    value.push(val);

    ids.forEach((id) => {
      column += "OR id = ? ";
      value.push(id);
    });

    let sql = "UPDATE user SET validate = ? WHERE 1 != 1 " + column;

    // console.log('database:');
    // console.log(sql);
    // console.log(value);
    log.info("database:");
    log.info(sql);
    log.info(value);

    return this.dao.run(sql, value);
  }

  // CRUD using database
  validateDB(ids, val, database) {
    let column = "";
    let value = [];
    value.push(val);

    ids.forEach((id) => {
      column += "OR id = ? ";
      value.push(id);
    });

    let sql = "UPDATE user SET validate = ? WHERE 1 != 1 " + column;

    // console.log('database:');
    // console.log(sql);
    // console.log(value);
    log.info("database:");
    log.info(sql);
    log.info(value);

    return this.dao.runDB(sql, value, database);
  }

  createDB(properties, database) {
    Object.keys(properties).map((key) => {
      if (this.entity[key] != properties[key]) {
        this.entity[key] = properties[key];
      }
    });
    return super.createDB(this.entity, database);
  }

  updateDB(properties, database) {
    Object.keys(properties).map((key) => {
      if (key !== "id")
        if (this.entity[key] != properties[key]) {
          this.entity[key] = properties[key];
        }
    });
    return super.updateDB(properties["id"], this.entity, database);
  }

  allDB(database, entity = {}) {
    let sql =
      "SELECT u.*, c.label, c.rank FROM user AS u JOIN category AS c ON u.category_id = c.id WHERE 1 = 1 ";
    let values = [];

    Object.keys(entity).map((key) => {
      sql += "AND " + key + " = ? ";
      values.push(entity[key]);
    });

    // console.log('database:');
    // console.log(sql);
    // console.log(values);
    log.info("database:");
    log.info(sql);
    log.info(values);

    return this.dao.allDB(sql, values, database);
  }
}

module.exports = UserRepository;
