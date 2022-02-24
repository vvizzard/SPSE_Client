const BaseRepository = require("./BaseRepository");
const log = require("electron-log");

class QuestionRepository extends BaseRepository {
  constructor(dao) {
    super(dao, "question");
    this.entity = {};
  }

  allDB(database, entity = {}) {
    let level = "district";
    let date = "2019";
    let entities = [];
    let sqlWhere = "";

    Object.keys(entity).map((key) => {
      if (key == "level") level = entity[key];
      else if (key == "date") date = entity[key];
      else {
        sqlWhere += "AND " + key + " = ? ";
        entities.push(entity[key]);
      }
    });

    const sqlDistrict = `SELECT * FROM ` + level + ` WHERE 1 = 1 ` + sqlWhere;
    log.info("database allByDistrict district:");
    log.info(sqlDistrict);

    return this.dao.allDB(sqlDistrict, entities, database).then((result) => {
      const sql =
        level == "district"
          ? `SELECT q.id As question, r.*, u.nom, 
                    u.category_id, u.district_id, 
                    dist.label AS district, cat.label AS category,
                    q.question as qst, q.label as question_label,
                    q.unite as unite, q.is_principale, q.question_mere_id
                FROM question AS q
                LEFT JOIN question AS r ON q.id = r.question_id
                JOIN user AS u ON u.id = r.user_id 
                JOIN district AS dist ON dist.id = u.district_id
                JOIN category AS cat ON cat.id = u.category_id
                WHERE r.date like "%` +
            date +
            `" AND district_id = ? 
                ORDER BY r.id ASC `
          : `SELECT q.id As question, SUM(r.question) as question, u.nom, 
                u.category_id, dist.region_id as district_id, 
                reg.label AS district, cat.label AS category,
                q.question as qst, q.label as question_label,
                q.unite as unite, q.is_principale, q.question_mere_id
            FROM question AS q
            LEFT JOIN question AS r ON q.id = r.question_id
            JOIN user AS u ON u.id = r.user_id 
            JOIN district AS dist ON dist.id = u.district_id
            JOIN region AS reg ON reg.id = dist.region_id
            JOIN category AS cat ON cat.id = u.category_id
            WHERE r.date like "%` +
            date +
            `" AND region_id = ? 
            ORDER BY r.id ASC `;

      log.info("Question repository : database allByDistrict item:");
      log.info(sql);

      return Promise.all(
        result.map((res) => {
          const values = [res.id];
          log.info(values);
          return this.dao.allDB(sql, values, database);
        })
      );
    });
  }

  getAllQuestionByThematique(thematiqueId) {
    // let sql = `SELECT q.id, q.label, q.question, q.indicateur_id
    // FROM thematique t
    //     LEFT JOIN indicateur i ON t.id = i.thematique_id
    //     LEFT JOIN question q ON q.indicateur_id = i.id
    // WHERE t.id = ?
    // UNION
    //     SELECT q.id, q.label, q.question , q.indicateur_id
    //     FROM question q
    //     WHERE q.indicateur_id is null
    //         AND q.question_mere_id in (
    //             SELECT q.id
    //             FROM thematique t
    //                 LEFT JOIN indicateur i ON t.id = i.thematique_id
    //                 LEFT JOIN question q ON q.indicateur_id = i.id
    //             WHERE t.id = ?
    //         )`;
    let sql = `SELECT distinct q.*, i.label as indicateur 
    FROM question q 
      LEFT JOIN  indicateur i ON i.id_question=q.id
    WHERE q.question_mere_id in (
        SELECT q.id FROM question q
        WHERE q.id in (
          SELECT q.question_mere_id
          FROM thematique t
            LEFT JOIN indicateur i ON t.id = i.thematique_id
            LEFT JOIN question q ON i.id_question=q.id
          WHERE t.id = ?
        ) OR q.id in (
          SELECT q.id
          FROM thematique t
            LEFT JOIN indicateur i ON t.id = i.thematique_id
            LEFT JOIN question q ON i.id_question=q.id
          WHERE t.id = ? AND q.is_principale = 1
        )
    ) UNION SELECT distinct q.*, i.label as indicateur 
        FROM question q 
          LEFT JOIN  indicateur i ON i.id_question=q.id
        WHERE ( 
          q.id in (
            SELECT q.id FROM question q
            WHERE q.id in (
              SELECT q.question_mere_id
              FROM thematique t
                  LEFT JOIN indicateur i ON t.id = i.thematique_id
                  LEFT JOIN question q ON i.id_question=q.id
              WHERE t.id = ?
            ) OR q.id in (
              SELECT q.id
              FROM thematique t
                LEFT JOIN indicateur i ON t.id = i.thematique_id
                LEFT JOIN question q ON i.id_question=q.id
              WHERE t.id = ? AND q.is_principale = 1
            ) 
          )
    ) ORDER BY q.id ASC`;
    let values = [thematiqueId, thematiqueId, thematiqueId, thematiqueId];
    log.info("database:");
    log.info(sql);
    log.info(values);

    return this.dao.all(sql, values);
  }

  /**
   * @name getAllQuestionWihtoutIndicateurByThematique
   * @description get all questions by the given thematique, there is no link with indicateur
   * @param {int} thematiqueId 
   * 
   * @returns {Array}
   */
  getAllQuestionWihtoutIndicateurByThematique(thematiqueId) {
    let sql = `SELECT distinct q.*
    FROM question q 
      LEFT JOIN  indicateur i ON i.id_question=q.id
    WHERE q.question_mere_id in (
        SELECT q.id FROM question q
        WHERE q.id in (
          SELECT q.question_mere_id
          FROM thematique t
            LEFT JOIN indicateur i ON t.id = i.thematique_id
            LEFT JOIN question q ON i.id_question=q.id
          WHERE t.id = ?
        ) OR q.id in (
          SELECT q.id
          FROM thematique t
            LEFT JOIN indicateur i ON t.id = i.thematique_id
            LEFT JOIN question q ON i.id_question=q.id
          WHERE t.id = ? AND q.is_principale = 1
        )
    ) UNION SELECT distinct q.*
        FROM question q 
          LEFT JOIN  indicateur i ON i.id_question=q.id
        WHERE ( 
          q.id in (
            SELECT q.id FROM question q
            WHERE q.id in (
              SELECT q.question_mere_id
              FROM thematique t
                  LEFT JOIN indicateur i ON t.id = i.thematique_id
                  LEFT JOIN question q ON i.id_question=q.id
              WHERE t.id = ?
            ) OR q.id in (
              SELECT q.id
              FROM thematique t
                LEFT JOIN indicateur i ON t.id = i.thematique_id
                LEFT JOIN question q ON i.id_question=q.id
              WHERE t.id = ? AND q.is_principale = 1
            ) 
          )
    ) ORDER BY q.id ASC`;
    let values = [thematiqueId, thematiqueId, thematiqueId, thematiqueId];
    log.info("database:");
    log.info(sql);
    log.info(values);

    return this.dao.all(sql, values);
  }
}

module.exports = QuestionRepository;
