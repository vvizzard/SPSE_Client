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
   * @param {int} districtId The district id/if null = all
   * @param {string} date
   *
   * @returns {Array}
   */
  async getPTA(districtId = null, date = "2021") {
    const dist = districtId ? "AND p.district_id =" + districtId : " ";
    let sql =
      `SELECT 
      t.label as thematique, 
      i.label as indicateur, 
      SUM (p.valeur) as objectif,
      p.validated 
    FROM indicateur i 
    LEFT JOIN ( 
      SELECT * FROM pta p 
        WHERE 1 = 1 ` +
      dist +
      ` AND p.date like "%` +
      date +
      `" 
    ) as p 
      ON p.indicateur_id = i.id 
    LEFT JOIN thematique t 
      ON t.id = i.thematique_id
    GROUP BY t.label, i.label, p.validated`;
    let values = [];
    log.info("database: getPTA");
    log.info(sql);
    log.info({ districtId, date });

    return this.dao.all(sql, values);
  }

  /**
   * @name getPTAFile
   * @description get all ptas file
   * @param {int} districtId
   * @param {string} date
   *
   * @returns {Array}
   */
  getPTAFile(districtId, date) {
    let sql =
      `SELECT DISTINCT p.date, d.label as district, p.file FROM pta p LEFT JOIN district d ON d.id = p.district_id WHERE p.district_id = ? AND p.date like "%` +
      date +
      `"`;
    let values = [districtId];
    log.info("database: getPTAFile");
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

  // Tsy dia ilaina
  /**
   * @name getPTAByThematique
   * @description Get indicateurs by giving thematique and date
   * @param {*} database Database connection
   * @param {int} thematiqueId Id of the thematique to get PTA from
   * @param {*} date The year to get
   * @param {int} districtId The district to get PTA from, if null National
   * @returns
   */
  async getPTAByThematique(database, thematiqueId, date, districtId = null) {
    try {
      const indicateurRepo = new BaseRepository(this.dao, "indicateur");
      // const ptaRepo = new BaseRepository(this.dao, "pta");

      const indicateurs = await indicateurRepo.allDB(database, {
        thematique_id: thematiqueId,
      });
      if (indicateurs.length == 0) throw new Error("Indicateur vide");

      const ptas = await this.getPTA(districtId, date);
      log.warn(ptas);

      return indicateurs.map((indicateur) => {
        let ptaInd = ptas.filter((e) => e.indicateur_id === indicateur.id);
        if (ptaInd.length > 0) {
          let ptaValue = ptaInd.reduce((total, curr) => {
            return total + curr.valeur;
          }, ptaInd[0].valeur);
          return {
            indicateur: indicateur.id,
            valeur: ptaValue,
            date: date,
          };
        }
      });
    } catch (error) {
      log.error(error);
      return [];
    }
  }
}

module.exports = PTARepository;
