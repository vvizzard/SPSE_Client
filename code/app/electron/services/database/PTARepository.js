const BaseRepository = require("./BaseRepository");
const log = require("electron-log");

class PTARepository extends BaseRepository {
  constructor(dao) {
    super(dao, "pta");
    this.entity = {};
  }

  /**
   * @name getPTA
   * @description get all ptas by the given thematique, there is no link with indicateur
   * @param {int} districtId
   * @param {string} date
   *
   * @returns {Array}
   */
  getPTA(districtId, date) {
    let sql =
      `SELECT 
      t.label as thematique, 
      i.label as indicateur, 
      p.valeur as objectif 
    FROM indicateur i 
    LEFT JOIN ( 
      SELECT * FROM pta p 
        WHERE p.district_id = ? AND p.date like "%` +
      date +
      `" 
    ) as p 
      ON p.indicateur_id = i.id 
    LEFT JOIN thematique t 
      ON t.id = i.thematique_id`;
    let values = [districtId];
    log.info("database: getPTA");
    log.info(sql);
    log.info(values);

    return this.dao.all(sql, values);
  }

  /**
   * @name getPTAComplete
   * @description get all ptas by the given thematique, there is no link with indicateur
   * @param {int} districtId
   * @param {string} date
   *
   * @returns {Array}
   */
  async getPTAComplete(districtId = null, date, where = {}) {
    let values = [];
    let sqlPTA =
      `SELECT p.indicateur_id, SUM(p.valeur) as valeur FROM pta p 
    WHERE p.date like "%` +
      date +
      `" GROUP BY p.indicateur_id`;

    if (districtId != null) {
      sqlPTA =
        `SELECT * FROM pta p 
      WHERE p.district_id = ? AND p.date like "%` +
        date +
        `"`;
      values.push(districtId);
    }

    let sql =
      `SELECT 
      i.id, 
      t.id as thematique_id, 
      t.label as thematique, 
      i.label as indicateur, 
      p.valeur as objectif 
    FROM indicateur i 
    LEFT JOIN (` +
      sqlPTA +
      `) as p 
      ON p.indicateur_id = i.id 
    LEFT JOIN thematique t 
      ON t.id = i.thematique_id WHERE 1 = 1 `;

    Object.keys(where).map((key) => {
      sql += "AND " + key + " = ? ";
      values.push(where[key]);
    });

    log.info("database: getPTAComplete");
    log.info(sql);
    log.info(values);

    return this.dao.all(sql, values);
  }
}

module.exports = PTARepository;
