const BaseRepository = require("./BaseRepository");
const log = require("electron-log");
const QuestionRepository = require("./QuestionRepository");
const PTARepository = require("./PTARepository");
const BaseDao = require("./BaseDao");

class ResponseRepository extends BaseRepository {
  /**
   *
   * @param {BaseDao} dao
   */
  constructor(dao) {
    super(dao, "reponse");
    this.entity = {};
  }

  /**
   * @name getReponses
   * @description Get reponses, questions, district and indicateurs
   * formated for front end use
   * @param {*} entity JSON in wich we should put
   * region_id or district_id, thid (thematique_id), date (year),
   * comment (validation is in the comment attribute)
   * @param {*} table reponse or reponse_non_valide
   *
   * @returns {JSON}
   */
  async getReponses(entity = {}, table = "reponse_non_valide") {
    // get database
    const database = this.dao.getDatabase();

    // thid is needed so set default value if not given
    entity.thid = entity.thid ? entity.thid : 1;

    // get questions
    const questionRepository = new QuestionRepository(this.dao);
    const questions =
      await questionRepository.getAllQuestionWihtoutIndicateurByThematique(
        entity.thid
      );

    // get reponses
    const reponses = await this.getReponseByDistrictByRegion(
      database,
      entity,
      table,
      questions
    );

    // get indicateurs
    const indicateurs = await this.getIndicateur(
      entity.thid, //The default value of thid is 1
      reponses
    );

    // get PTA for each indicator
    const ptaRepository = new PTARepository(this.dao);
    var pta = [];
    if (entity && entity.district_id) {
      pta = await ptaRepository.getPTAComplete(
        entity.district_id,
        entity.date.split("-")[1],
        {
          thematique_id: entity.thid,
        }
      );
    } else {
      pta = await ptaRepository.getPTAComplete(null, entity.date, {
        thematique_id: entity.thid,
      });
    }

    return this.formatResponse(questions, reponses, indicateurs, pta);
  }

  /**
   * @name formatResponse
   * @description Format response for front-end use
   * @param {Array} questions
   * @param {Array} reponses
   * @param {JSON} indicateurs
   * @param {Array} pta
   *
   * @returns {JSON} Formated response
   */
  async formatResponse(questions, reponses, indicateurs, pta) {
    // check if there is district in reponses
    if (
      !reponses ||
      reponses.length == 0 ||
      !reponses[0] ||
      !reponses[0]._District_
    ) {
      return false;
    }

    // change district so it can be in the header of table in front
    questions[0] = { label: " District ", question: " District " };

    // make PTA as object
    let newPTA = {};
    pta.forEach((p) => {
      newPTA[p.indicateur.replaceAll(/[^a-zA-Z0-9]/g, "_")] = p.objectif;
    });

    // format responses
    const farany = {
      // district: reponses[0]._District_,
      indicateurs: indicateurs,
      reponses: reponses,
      questions: questions,
      pta: newPTA,
    };

    log.info("Get reponse : format réponse");
    log.info(farany);
    log.info("------------------------------");

    return farany;
  }

  /**
   * @name getIndicateur
   * @description Get indicateurs value by givin the thematique
   * and the reponses in wich calculate the indicateurs
   * @param {*} thematique
   * @param {Array} reponses
   *
   * @returns {JSON} JSON containing calculated indicateurs
   */
  async getIndicateur(thematique, reponses) {
    try {
      const indicateurs = await this.groupIndicateurWithQuestion(thematique);
      let indicateur = {};
      let indicateurTemporaire = {};
      reponses.forEach((resp) => {
        indicateurs.forEach((ind) => {
          if (!ind.question_filtre) {
            // SUM
            if (
              indicateurTemporaire[
                ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")
              ] &&
              indicateurTemporaire[ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")][
                "somme"
              ]
            ) {
              if (
                resp[ind.question_principale.replaceAll(/[^a-zA-Z0-9]/g, "_")]
              ) {
                indicateurTemporaire[
                  ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")
                ]["somme"] +=
                  resp[
                    ind.question_principale.replaceAll(/[^a-zA-Z0-9]/g, "_")
                  ];
              }
            } else {
              let indTemp = {};
              if (
                resp[ind.question_principale.replaceAll(/[^a-zA-Z0-9]/g, "_")]
              ) {
                indTemp.somme =
                  resp[
                    ind.question_principale.replaceAll(/[^a-zA-Z0-9]/g, "_")
                  ];
              } else {
                indTemp.somme = 0;
              }
              indicateurTemporaire[ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")] =
                indTemp;
            }
            // COUNT
            if (
              indicateurTemporaire[ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")][
                "count"
              ]
            ) {
              if (
                resp[ind.question_principale.replaceAll(/[^a-zA-Z0-9]/g, "_")]
              ) {
                indicateurTemporaire[
                  ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")
                ]["count"]++;
              }
            } else {
              indicateurTemporaire[ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")][
                "count"
              ] = 1;
            }
          } else {
            if (
              !indicateurTemporaire[ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")]
            ) {
              indicateurTemporaire[ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")] =
                {};
            }
            if (
              !indicateurTemporaire[ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")][
                resp[ind.question_filtre.replaceAll(/[^a-zA-Z0-9]/g, "_")]
              ]
            ) {
              indicateurTemporaire[ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")][
                resp[ind.question_filtre.replaceAll(/[^a-zA-Z0-9]/g, "_")]
              ] = {};
            }
            let indicateurTemp = {};
            let first = false;
            if (
              indicateurTemporaire[ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")][
                resp[ind.question_filtre.replaceAll(/[^a-zA-Z0-9]/g, "_")]
              ]["somme"]
            ) {
              if (
                resp[ind.question_principale.replaceAll(/[^a-zA-Z0-9]/g, "_")]
              ) {
                indicateurTemporaire[
                  ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")
                ][resp[ind.question_filtre.replaceAll(/[^a-zA-Z0-9]/g, "_")]][
                  "somme"
                ] +=
                  resp[
                    ind.question_principale.replaceAll(/[^a-zA-Z0-9]/g, "_")
                  ];
              }
            } else {
              if (
                resp[ind.question_principale.replaceAll(/[^a-zA-Z0-9]/g, "_")]
              )
                indicateurTemp.somme =
                  resp[
                    ind.question_principale.replaceAll(/[^a-zA-Z0-9]/g, "_")
                  ];
              else indicateurTemp.somme = 0;
              first = true;
            }

            if (
              indicateurTemporaire[ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")][
                resp[ind.question_filtre.replaceAll(/[^a-zA-Z0-9]/g, "_")]
              ]["count"]
            ) {
              indicateurTemporaire[ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")][
                resp[ind.question_filtre.replaceAll(/[^a-zA-Z0-9]/g, "_")]
              ]["count"]++;
            } else {
              indicateurTemp.count = 1;
              first = true;
            }

            if (first) {
              indicateurTemporaire[ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")][
                resp[ind.question_filtre.replaceAll(/[^a-zA-Z0-9]/g, "_")]
              ] = indicateurTemp;
            }
          }
        });
      });

      indicateurs.forEach((ind) => {
        if (indicateurTemporaire[ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")]) {
          if (ind.sum == 1) {
            if (
              indicateurTemporaire[ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")][
                "somme"
              ]
            ) {
              indicateur[ind.label] =
                indicateurTemporaire[
                  ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")
                ]["somme"];
            } else {
              Object.entries(
                indicateurTemporaire[ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")]
              ).map(([key, value]) => {
                if (key.toLowerCase() != "non") {
                  let parenthese =
                    key.toLocaleLowerCase() != "oui" ? " ( " + key + " )" : "";
                  indicateur[ind.label + parenthese] = value["somme"];
                } else {
                  if (!indicateur[ind.label]) indicateur[ind.label] = 0;
                }
              });
            }
          } else if (ind.count == 1) {
            if (
              indicateurTemporaire[ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")][
                "count"
              ]
            ) {
              indicateur[ind.label] =
                indicateurTemporaire[
                  ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")
                ]["count"];
            } else {
              Object.entries(
                indicateurTemporaire[ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")]
              ).map(([key, value]) => {
                if (key.toLowerCase() != "non") {
                  let parenthese =
                    key.toLocaleLowerCase() != "oui" ? " ( " + key + " )" : "";
                  indicateur[ind.label + parenthese] = value["count"];
                } else {
                  if (!indicateur[ind.label]) indicateur[ind.label] = 0;
                }
              });
            }
          } else if (ind.moy == 1) {
            if (
              indicateurTemporaire[ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")][
                "somme"
              ]
            ) {
              indicateur[ind.label] =
                indicateurTemporaire[
                  ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")
                ]["somme"] /
                indicateurTemporaire[
                  ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")
                ]["count"];
            } else {
              Object.entries(
                indicateurTemporaire[ind.label.replaceAll(/[^a-zA-Z0-9]/g, "_")]
              ).map(([key, value]) => {
                if (key.toLowerCase() != "non") {
                  let parenthese =
                    key.toLocaleLowerCase() != "oui" ? " ( " + key + " )" : "";
                  indicateur[ind.label + parenthese] =
                    value["somme"] / value["count"];
                } else {
                  if (!indicateur[ind.label]) indicateur[ind.label] = 0;
                }
              });
            }
          }
        }
      });
      log.info("getIndicateurs : indicateurs");
      log.info(indicateur);
      log.info("------------------------------");
      return indicateur;
    } catch (error) {
      log.info("GetIndicateur : error");
      throw error;
    }
  }

  /**
   * @name groupIndicateurWithQuestion
   * @description Get array of indicateur with questions and filter
   * @param {int} thematiqueId
   * @returns {Array}
   */
  async groupIndicateurWithQuestion(thematiqueId) {
    try {
      let indicateurs = await this.dao.all(
        `SELECT 
              i.*, 
              q.label as question_principale,
              qq.label as question_filtre
          FROM indicateur i 
              LEFT JOIN question q ON q.id = i.id_question
              LEFT JOIN question qq ON qq.indicateur_id = i.id
          WHERE thematique_id = ?`,
        [thematiqueId]
      );
      return indicateurs;
    } catch (error) {
      log.info("GroupIndicateurWithQuestion : error");
      throw error;
    }
  }

  /**
   * @name populateReponse
   * @description Populate the given reponse object by the data given
   * @param {JSON} reponseTemplate JSON of reponse object
   * @param {Array} data Array of reponses to put in Reponse
   *
   * @returns {JSON} Populated reponse
   */
  populateReponse(reponseTemplate, data) {
    try {
      // let reponse = reponseTemplate;
      let reponseRehetra = [];
      let reponse = {};
      let lines = [...new Set(data.map((item) => item.line_id))];
      lines.forEach((line) => {
        const dataFiltered = data.filter((e) => e.line_id === line);
        dataFiltered.forEach((element) => {
          // if (reponse[element.label.replaceAll(/[^a-zA-Z0-9]/g, "_")] == null) {
          //   reponse[element.label.replaceAll(/[^a-zA-Z0-9]/g, "_")] = [];
          // }
          reponse[element.label.replaceAll(/[^a-zA-Z0-9]/g, "_")] =
            // element.reponse
            element.label.includes("Fichiers") ||
            element.label.includes("Image")
              ? "https://spse.llanddev.org/upload/" + element.reponse
              : element.reponse;
          // : "";
        });
        reponseRehetra.push(reponse);
        reponse = {};
      });

      log.info("populateReponse : first step : first group");
      // log.info(reponse);
      log.info(reponseRehetra);
      log.info("----------------------------------");

      let farany = [];

      reponseRehetra.forEach((elt) => {
        elt["_District_"] = data[0].district;
        farany.push(elt);
      });

      // var secondKey = Object.keys(reponse)[1]; //fetched the key at second index
      // const nbrResp = reponse[secondKey].length;

      // for (let i = 0; i < nbrResp; i++) {
      //   let temp = {};
      //   temp["_District_"] = data[0].district;
      //   farany.push(temp);
      // }

      // for (const [key, value] of Object.entries(reponse)) {
      //   if (value)
      //     value.forEach((element, idx) => {
      //       if (!farany[idx]) {
      //         farany[idx] = {};
      //       }
      //       farany[idx][key] = element;
      //     });
      // }

      log.info("populateReponse : last step : after regrouping");
      log.info(farany);
      log.info("----------------------------------");

      return farany;
    } catch (error) {
      return [];
    }
  }

  /**
   * @name newReponse
   * @description Initialisation of a response object
   * by giving the questions
   * @param {Array} questions Array of questions to put as attribute
   *
   * @returns {JSON} JSON object with questions as attribute
   * and null values
   */
  newReponse(questions) {
    var reponse = {};
    questions.forEach((element) => {
      reponse[element.label.replaceAll(/[^a-zA-Z0-9]/g, "_")] = null;
    });
    return reponse;
  }

  /**
   * @name getReponseByDistrictByRegion
   * @description Get array of reponse/reponse_non_valide by
   * givine the right params
   * @param {import("sqlite3").sqlite3.Database} database
   * @param {JSON} entity JSON in wich we should put
   * region_id or district_id, thid (thematique_id), date (year),
   * comment (validation is in the comment attribute)
   * NB: if not set, thid = 1 and date = 2022
   * @param {String} table reponse or reponse_non_valide
   * @param {Array} questions list of questions if already disponible.
   * If it's not filled, the function will get it by thid
   *
   * @returns {Array} Reponse as array of Q&A
   */
  async getReponseByDistrictByRegion(
    database,
    entity = {},
    table = "reponse_non_valide",
    questions = []
  ) {
    // Default parameters
    let thId = 1;
    let date = "%2022";
    let districtId = null;
    let regionId = null;

    // Parameters and additionals sql if needed
    let entities = [];
    let additionalWhereClauses = "";

    // Custom parameters if there are
    Object.keys(entity).map((key) => {
      if (key == "date") {
        date = "%" + entity[key];
      } else if (key == "thid") {
        thId = entity[key];
      } else if (key == "district_id") {
        districtId = entity[key];
      } else if (key == "region_id") {
        regionId = entity[key];
      } else if (key == "comment") {
        entities.push(entity[key]);
        if (table == "reponse_non_valide") {
          additionalWhereClauses += " AND resp.comment = ? ";
        }
      } else {
        additionalWhereClauses += "AND " + key + " = ? ";
        entities.push(entity[key]);
      }
    });

    // Get question by thématique
    // Get response by thématique using question
    // JOIN question with reponse
    // Filter the result
    let sql =
      `
      SELECT 
        qs.label, 
        resp.*, 
        dist.id as district_id, 
        dist.label as district, 
        region.id as region_id, 
        region.label as region 
      FROM (
        SELECT distinct q.id, q.label
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
          ) UNION SELECT distinct q.id, q.label
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
          ) ORDER BY q.id ASC
      ) AS qs LEFT JOIN (
        SELECT * FROM ` +
      table +
      ` rnv 
        WHERE rnv.question_id in (
          SELECT distinct q.id
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
          ) UNION SELECT distinct q.id
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
          ) ORDER BY q.id ASC
        )
      ) AS resp ON resp.question_id = qs.id 
        LEFT JOIN user u ON u.id = resp.user_id
        LEFT JOIN district dist ON dist.id = u.district_id
        LEFT JOIN region ON region.id = dist.region_id
      WHERE 1 = 1 
    `;
    let values = [thId, thId, thId, thId, thId, thId, thId, thId];

    // Add filter by date
    sql += `AND date like ? `;
    values.push(date);

    // Add district filter
    if (districtId != null) {
      sql += `AND district_id = ?`;
      values.push(districtId);
    }

    // ADD additional filter if needed
    // sql += additionalWhereClauses;
    // values = values.concat(entities);

    // Execute
    const rsp = await this.dao.allDB(sql, values, database);

    log.info("getReponseByDistrictByRegion");
    log.info(sql);
    log.info(values);
    log.info(rsp);
    log.info("-----------------------------");

    if (rsp.length == 0) return [];

    // Make new response by putting all the question
    const questionRepository = new QuestionRepository(this.dao);
    questions.length == 0
      ? (questions =
          await questionRepository.getAllQuestionWihtoutIndicateurByThematique(
            entity.thid
          ))
      : 0;
    questions.unshift({ label: "_District_", reponse: rsp[0].district });
    let reponse = this.newReponse(questions);

    log.info("getReponseByDistrictByRegion : make reponse");
    log.info(questions);
    log.info(reponse);
    log.info("-----------------------------");

    // Populate response
    let final = []; // Store the response here

    if (districtId != null) {
      // filter reponse by district
      let valiny = rsp.filter((item) => item.district_id == districtId);
      final = this.populateReponse(reponse, valiny);
    } else {
      // filter data by region
      let data =
        regionId != null
          ? rsp.filter((item) => item.region_id == regionId)
          : rsp;

      // get all district in the region
      const districts = [...new Set(data.map((item) => item.district_id))];

      // get by districts in the region
      districts.forEach((district) => {
        // reset reponse
        reponse = this.newReponse(questions);

        // filter reponse by district
        let filtered = data.filter((item) => item.district_id == district);
        final = final.concat(this.populateReponse(reponse, filtered));
      });
    }

    log.info("getReponseByDistrictByRegion : populated reponse");
    log.info(final);
    log.info("--------------------------------");

    return final;
  }

  /**
   * @name findReponsesByThematique
   * @description Find all reponse by thematique and year
   * @param {JSON} entity JSON in wich we should put
   * @param {import("sqlite3").sqlite3.Database} database
   * @param {String} table reponse_non_valide/reponse
   *
   * @returns {Array} Reponse as array
   */
  async findReponsesByThematique(
    entity = {},
    database = null,
    table = "reponse_non_valide"
  ) {
    // Set value to database if needed
    if (database == null) database = this.dao.getDatabase();

    // Default parameters
    let thId = 1;
    let date = "%2022";
    let districtId = null;
    let regionId = null;

    // Parameters and additionals sql if needed
    let entities = [];
    let additionalWhereClauses = "";

    // Custom parameters if there are
    Object.keys(entity).map((key) => {
      if (key == "date") {
        date = "%" + entity[key];
      } else if (key == "thid") {
        thId = entity[key];
      } else if (key == "district_id") {
        districtId = entity[key];
      } else if (key == "region_id") {
        regionId = entity[key];
      } else if (key == "comment") {
        entities.push(entity[key]);
        if (table == "reponse_non_valide") {
          additionalWhereClauses += " AND resp.comment = ? ";
        }
      } else {
        additionalWhereClauses += "AND " + key + " = ? ";
        entities.push(entity[key]);
      }
    });

    // Get question by thématique
    // Get response by thématique using question
    // JOIN question with reponse
    // Filter the result
    let sql =
      `
      SELECT 
        qs.label, 
        resp.*, 
        dist.id as district_id, 
        dist.label as district, 
        region.id as region_id, 
        region.label as region 
      FROM (
        SELECT distinct q.id, q.label
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
          ) UNION SELECT distinct q.id, q.label
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
          ) ORDER BY q.id ASC
      ) AS qs LEFT JOIN (
        SELECT * FROM ` +
      table +
      ` rnv 
        WHERE rnv.question_id in (
          SELECT distinct q.id
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
          ) UNION SELECT distinct q.id
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
          ) ORDER BY q.id ASC
        )
      ) AS resp ON resp.question_id = qs.id 
        LEFT JOIN user u ON u.id = resp.user_id
        LEFT JOIN district dist ON dist.id = u.district_id
        LEFT JOIN region ON region.id = dist.region_id
      WHERE 1 = 1 
    `;
    let values = [thId, thId, thId, thId, thId, thId, thId, thId];

    // Add filter by date
    sql += `AND date like ? `;
    values.push(date);

    // Add district filter
    if (districtId != null) {
      sql += `AND district_id = ?`;
      values.push(districtId);
    }

    // Execute
    const rsp = await this.dao.allDB(sql, values, database);

    log.info("findReponsesByThematique : reponses");
    log.info(rsp);
    log.info("-----------------------------");

    return rsp;
  }

  // Synchronisation operations

  /**
   * @name deleteAllNonValide
   * @description Delete non valide reponse by userId and questionId
   * @param {int} userId Id of user who inserted the reponse
   * @param {*} oneQuestionId Id of one question to
   * get all related question
   *
   * @returns
   */
  deleteAllNonValide(userId, oneQuestionId) {
    let sql = `DELETE FROM reponse_non_valide 
    WHERE user_id = ? 
    AND question_id in (SELECT q.id 
      FROM question q
      WHERE q.id = ?
        OR q.question_mere_id = ?
      UNION 
        SELECT q.id 
        FROM question q
        WHERE q.id in (
          SELECT q.question_mere_id FROM question q WHERE q.id = ?
        )
      UNION 
        SELECT q.id 
        FROM question q
        WHERE q.question_mere_id in (
          SELECT q.question_mere_id FROM question q WHERE q.id = ?
        )
    )`;

    log.info("DeleteAllNonValide:");
    log.info(sql);
    log.info(userId);

    return this.dao.run(sql, [
      userId,
      oneQuestionId,
      oneQuestionId,
      oneQuestionId,
      oneQuestionId,
    ]);
  }

  /**
   * @name deleteAllNonValideByThematique
   * @description Delete non valide reponse by userId and questionId
   * @param {int} userId Id of user who inserted the reponse
   * @param {*} oneQuestionId Id of one question to
   * get all related question
   *
   * @returns
   */
  deleteAllNonValideByThematique(userId, thematiqueId, date = null) {
    if (date === null) return false;
    let sql =
      `DELETE FROM reponse_non_valide 
    WHERE user_id = ? ` +
      (date ? `AND date ilike "%` + date + `"` : ``) +
      `
    AND question_id in (SELECT distinct q.id
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
      ) ORDER BY q.id ASC)
    )`;

    log.info("DeleteAllNonValideBythematique:");
    log.info(sql);
    log.info(userId);

    return this.dao.run(sql, [
      userId,
      thematiqueId,
      thematiqueId,
      thematiqueId,
      thematiqueId,
    ]);
  }

  // Validation operations

  /**
   * @name validate
   * @description Validate a reponse_non_valide reponse,
   * once it is validated, it can be sent to reponse
   * @param {int} districtId District id of the reponse to be validated
   *
   * @returns
   */
  validate(districtId) {
    let sql = `UPDATE reponse_non_valide 
            SET comment = 1 
            WHERE user_id in (
                SELECT id FROM user WHERE district_id = ?
            ) `;

    log.info("validate by district:");
    log.info(sql);
    log.info(districtId);

    return this.dao.run(sql, [districtId]);
  }

  /**
   * @name reject
   * @description Reject a reponse_non_valide reponse to bring it back
   * to RPSE or cantonnement
   * @param {int} districtId District id of the reponse to be validated
   *
   * @returns
   */
  reject(districtId) {
    let sql = `UPDATE reponse_non_valide 
            SET comment = 0 
            WHERE user_id in (
                SELECT id FROM user WHERE district_id = ?
            ) `;

    log.info("reject by district:");
    log.info(sql);
    log.info(districtId);

    return this.dao.run(sql, [districtId]);
  }

  /**
   * @name terminer
   * @description Clean reponse_non_valide and put the validated data
   * in reponse
   * @param {JSON} entity Technically we only need district_id
   */
  terminer(entity) {
    const districtId = entity.district_id;
    // const userId = entity.user_id;
    let nv = this.dao
      .all(
        `SELECT * FROM reponse_non_valide WHERE user_id in (
          SELECT id FROM user WHERE district_id = ?
        )`,
        [districtId]
      )
      .then((rows) => {
        log.info("terminer all geted");
        log.info(rows);
        this.table = "reponse";
        rows.forEach((row) => {
          log.info("chaque ligne à importer");
          log.info(row);
          let reponse = {
            user_id: row.user_id,
            date: row.date,
            question_id: row.question_id,
            reponse: row.reponse,
          };
          this.create(reponse).then((tp) => {
            log.info("DELETE FROM reponse_non_valide WHERE id = ?");
            log.info([row.id]);
            this.dao.run("DELETE FROM reponse_non_valide WHERE id = ?", [
              row.id,
            ]);
          });
        });
      })
      .catch((err) => {
        log.info(err);
        return false;
      });
  }

  // Basic CRUD
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

  // Sao sanatria ilaina dia aleo ato aloha

  allDB(database, entity = {}) {
    let level = "district";
    let date = "2019";
    let entities = [];
    let sqlWhere = "";
    let sqlWherePrinc = "";
    let thId = 0;

    Object.keys(entity).map((key) => {
      if (key == "level") level = entity[key];
      else if (key == "date") date = entity[key];
      else if (key == "thid") {
        thId = entity[key];
        sqlWherePrinc +=
          thId > 0
            ? `AND (
                    q.indicateur_id in (
                        SELECT id FROM indicateur WHERE thematique_id = ?
                    ) OR q.question_mere_id in (
                        SELECT id FROM question WHERE indicateur_id in (
                            SELECT id FROM indicateur WHERE thematique_id = ?
                        )
                    ) 
                ) `
            : "";
      } else {
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
                    q.unite as unite, q.is_principale, q.question_mere_id,
                    q.indicateur_id as indicateur_id
                FROM question AS q
                LEFT JOIN indicateur ind ON ind.id = q.indicateur_id
                LEFT JOIN thematique th ON th.id = ind.thematique_id
                LEFT JOIN reponse AS r ON q.id = r.question_id
                JOIN user AS u ON u.id = r.user_id 
                JOIN district AS dist ON dist.id = u.district_id
                JOIN category AS cat ON cat.id = u.category_id
                WHERE r.date like "%` +
            date +
            `" AND district_id = ?  ` +
            sqlWherePrinc +
            ` ORDER BY r.id ASC, q.id ASC `
          : `SELECT q.id As question, SUM(r.reponse) as reponse, u.nom, 
                u.category_id, dist.region_id as district_id, 
                reg.label AS district, cat.label AS category,
                q.question as qst, q.label as question_label,
                q.unite as unite, q.is_principale, q.question_mere_id,
                q.indicateur_id as indicateur_id
            FROM question AS q
            LEFT JOIN indicateur ind ON ind.id = q.indicateur_id
            LEFT JOIN thematique th ON th.id = ind.thematique_id
            LEFT JOIN reponse AS r ON q.id = r.question_id
            JOIN user AS u ON u.id = r.user_id 
            JOIN district AS dist ON dist.id = u.district_id
            JOIN region AS reg ON reg.id = dist.region_id
            JOIN category AS cat ON cat.id = u.category_id
            WHERE r.date like "%` +
            date +
            `" AND region_id = ? ` +
            sqlWherePrinc +
            ` ORDER BY r.id ASC, q.id ASC `;

      log.info("Response repository : database allByDistrict item:");
      log.info(sql);

      return Promise.all(
        result.map((res) => {
          const values = [res.id];
          if (thId > 0) {
            values.push(thId);
            values.push(thId);
          }
          log.info(values);
          return this.dao.allDB(sql, values, database);
        })
      );
    });
  }

  all(entity = {}) {
    let level = "district";
    let date = "2019";
    let thId = 0;
    let entities = [];
    let sqlWhere = "";
    let sqlWherePrinc = "";

    Object.keys(entity).map((key) => {
      if (key == "level") level = entity[key];
      else if (key == "date") date = entity[key];
      else if (key == "thid") {
        thId = entity[key];
        sqlWherePrinc +=
          thId > 0
            ? `AND (
                    q.indicateur_id in (
                        SELECT id FROM indicateur WHERE thematique_id = ?
                    ) OR q.question_mere_id in (
                        SELECT id FROM question WHERE indicateur_id in (
                            SELECT id FROM indicateur WHERE thematique_id = ?
                        )
                    ) 
                ) `
            : "";
      } else {
        sqlWhere += "AND " + key + " = ? ";
        entities.push(entity[key]);
      }
    });

    let database = this.dao.getDatabase();

    const sqlDistrict = `SELECT * FROM ` + level + ` WHERE 1 = 1 ` + sqlWhere;
    log.info("database allByDistrict district:");
    log.info(sqlDistrict);

    return this.dao
      .allDB(sqlDistrict, entities, database)
      .then((result) => {
        const sql =
          level == "district"
            ? `SELECT q.id As question, r.*, u.nom, 
                    u.category_id, u.district_id, 
                    dist.label AS district, cat.label AS category,
                    q.question as qst, q.label as question_label,
                    q.unite as unite, q.is_principale, q.question_mere_id,
                    q.indicateur_id as indicateur_id
                FROM question AS q
                LEFT JOIN indicateur ind ON ind.id = q.indicateur_id
                LEFT JOIN thematique th ON th.id = ind.thematique_id
                LEFT JOIN reponse AS r ON q.id = r.question_id
                JOIN user AS u ON u.id = r.user_id 
                JOIN district AS dist ON dist.id = u.district_id
                JOIN category AS cat ON cat.id = u.category_id
                WHERE r.date like "%` +
              date +
              `" AND district_id = ? ` +
              sqlWherePrinc +
              ` ORDER BY r.id ASC, q.id ASC `
            : `SELECT q.id As question, SUM(r.reponse) as reponse, u.nom, 
                u.category_id, dist.region_id as district_id, 
                reg.label AS district, cat.label AS category,
                q.question as qst, q.label as question_label,
                q.unite as unite, q.is_principale, q.question_mere_id,
                q.indicateur_id as indicateur_id
            FROM question AS q
            LEFT JOIN indicateur ind ON ind.id = q.indicateur_id
            LEFT JOIN thematique th ON th.id = ind.thematique_id
            LEFT JOIN reponse AS r ON q.id = r.question_id
            JOIN user AS u ON u.id = r.user_id 
            JOIN district AS dist ON dist.id = u.district_id
            JOIN region AS reg ON reg.id = dist.region_id
            JOIN category AS cat ON cat.id = u.category_id
            WHERE r.date like "%` +
              date +
              `" AND region_id = ? 
            ` +
              sqlWherePrinc +
              ` ORDER BY r.id ASC, q.id ASC `;

        log.info("Response repository : database allByDistrict item:");
        log.info(sql);

        return Promise.all(
          result.map((res) => {
            let values = [res.id];
            if (thId > 0) {
              values.push(thId);
              values.push(thId);
            }
            log.info(values);
            return this.dao.allDB(sql, values, database);
          })
        );
      })
      .finally(() => database.close());
  }

  allNDB(database, entity = {}, table = "reponse_non_valide") {
    // getReponseByDistrict(database, entity = {districtId: 16, thid: 11});

    let level = "district";
    let date = "2019";
    let entities = [];
    let sqlWhere = "";
    let sqlWherePrinc = "";
    let thId = 0;
    let comment = false;

    Object.keys(entity).map((key) => {
      if (key == "level") level = entity[key];
      else if (key == "date") date = entity[key];
      else if (key == "comment") {
        comment = entity[key];
        if (table == "reponse_non_valide") {
          sqlWherePrinc += " AND r.comment = " + comment + " ";
        }
      } else if (key == "thid") {
        thId = entity[key];
        sqlWherePrinc +=
          thId > 0
            ? `AND (
                      q.id in (
                          SELECT q.question_mere_id FROM question q WHERE id in (
                              SELECT id_question FROM indicateur WHERE thematique_id = ?
                          )
                      ) OR q.id in (
                          SELECT q.id FROM question q WHERE q.question_mere_id in (
                              SELECT q.question_mere_id FROM question WHERE id in (
                                  SELECT id_question FROM indicateur WHERE thematique_id = ?
                              )
                          )
                      ) 
                  )`
            : "";
      } else {
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
          ? `SELECT 
            q.id as question, 
            r.*, 
            u.nom, u.category_id, u.district_id, 
            d.label as district, c.label as category,
            q.question as qst, q.label as question_label,
            q.unite as unite, q.is_principale, q.question_mere_id,
            q.indicateur_id as indicateur_id
        FROM question q 
            LEFT JOIN ` +
            table +
            ` r ON r.question_id = q.id
            LEFT JOIN indicateur i ON i.id_question = q.id
            LEFT JOIN thematique t ON t.id = i.thematique_id
            LEFT JOIN user u ON u.id = r.user_id
            LEFT JOIN district d ON d.id = u.district_id
            LEFT JOIN category c ON c.id = u.category_id
            WHERE r.date like "%` +
            date +
            `" AND district_id = ? ` +
            sqlWherePrinc +
            ` ORDER BY r.id ASC, q.id ASC `
          : `SELECT q.id As question, SUM(r.reponse) as reponse, u.nom, 
            u.category_id, dist.region_id as district_id, 
            reg.label AS district, cat.label AS category,
            q.question as qst, q.label as question_label,
            q.unite as unite, q.is_principale, q.question_mere_id,
            q.indicateur_id as indicateur_id
        FROM question AS q
        LEFT JOIN ` +
            table +
            ` AS r ON q.id = r.question_id
        LEFT JOIN indicateur ind ON ind.id = q.indicateur_id
        LEFT JOIN thematique th ON th.id = ind.thematique_id
        JOIN user AS u ON u.id = r.user_id 
        JOIN district AS dist ON dist.id = u.district_id
        JOIN region AS reg ON reg.id = dist.region_id
        JOIN category AS cat ON cat.id = u.category_id
        WHERE r.date like "%` +
            date +
            `" AND region_id = ? 
        ` +
            sqlWherePrinc +
            ` ORDER BY r.id ASC, q.id ASC `;

      log.info("Response repository : database allByDistrict item:");
      log.info(sql);

      return Promise.all(
        result.map(async (res) => {
          let values = [res.id];
          if (thId > 0) {
            values.push(thId);
            values.push(thId);
          }
          log.info(values);
          const rsp = await this.dao.allDB(sql, values, database);
          return this.makeReponseInside(rsp, entity);
        })
      );
    });
  }

  async allN(entity = {}, table = "reponse_non_valide") {
    let level = "district";
    let date = "2019";
    let thId = 0;
    let entities = [];
    let sqlWhere = "";
    let sqlWherePrinc = "";
    let comment = false;

    Object.keys(entity).map((key) => {
      if (key == "level") level = entity[key];
      else if (key == "date") date = entity[key];
      else if (key == "comment") {
        comment = entity[key];
        if (table == "reponse_non_valide") {
          sqlWherePrinc += " AND r.comment = " + comment + " ";
        }
      } else if (key == "thid") {
        thId = entity[key];
        sqlWherePrinc +=
          thId > 0
            ? `AND (
                    q.id in (
                        SELECT q.question_mere_id FROM question q WHERE id in (
                            SELECT id_question FROM indicateur WHERE thematique_id = ?
                        )
                    ) OR q.id in (
                        SELECT q.id FROM question q WHERE q.question_mere_id in (
                            SELECT q.question_mere_id FROM question WHERE id in (
                                SELECT id_question FROM indicateur WHERE thematique_id = ?
                            )
                        )
                    ) 
                )`
            : "";
      } else {
        sqlWhere += "AND " + key + " = ? ";
        entities.push(entity[key]);
      }
    });

    let database = this.dao.getDatabase();

    const nandrasana = await this.getReponses(
      (entity = { thid: 11, region_id: 16 })
    );
    log.info("ito ary ilay nandrasana");
    log.info(nandrasana);
    log.info("tokony efa nipoitra ilay nandrasana");

    const sqlDistrict = `SELECT * FROM ` + level + ` WHERE 1 = 1 ` + sqlWhere;
    log.info("database allByDistrict district:");
    log.info(sqlDistrict);

    return this.dao
      .allDB(sqlDistrict, entities, database)
      .then((result) => {
        const sql =
          level == "district"
            ? `SELECT 
                q.id as question, 
                r.*, 
                u.nom, u.category_id, u.district_id, 
                d.label as district, c.label as category,
                q.question as qst, q.label as question_label,
                q.unite as unite, q.is_principale, q.question_mere_id,
                q.indicateur_id as indicateur_id
            FROM question q 
                LEFT JOIN ` +
              table +
              ` r ON r.question_id = q.id
                LEFT JOIN indicateur i ON i.id_question = q.id
                LEFT JOIN thematique t ON t.id = i.thematique_id
                LEFT JOIN user u ON u.id = r.user_id
                LEFT JOIN district d ON d.id = u.district_id
                LEFT JOIN category c ON c.id = u.category_id
                WHERE r.date like "%` +
              date +
              `" AND district_id = ? ` +
              sqlWherePrinc +
              ` ORDER BY r.id ASC, q.id ASC `
            : `SELECT q.id As question, SUM(r.reponse) as reponse, u.nom, 
                u.category_id, dist.region_id as district_id, 
                reg.label AS district, cat.label AS category,
                q.question as qst, q.label as question_label,
                q.unite as unite, q.is_principale, q.question_mere_id,
                q.indicateur_id as indicateur_id
            FROM question AS q
            LEFT JOIN ` +
              table +
              ` AS r ON q.id = r.question_id
            LEFT JOIN indicateur ind ON ind.id = q.indicateur_id
            LEFT JOIN thematique th ON th.id = ind.thematique_id
            JOIN user AS u ON u.id = r.user_id 
            JOIN district AS dist ON dist.id = u.district_id
            JOIN region AS reg ON reg.id = dist.region_id
            JOIN category AS cat ON cat.id = u.category_id
            WHERE r.date like "%` +
              date +
              `" AND region_id = ? 
            ` +
              sqlWherePrinc +
              ` ORDER BY r.id ASC, q.id ASC `;

        log.info("Response repository : database allByDistrict item:");
        log.info(sql);

        return Promise.all(
          result.map(async (res) => {
            let values = [res.id];
            if (thId > 0) {
              values.push(thId);
              values.push(thId);
            }
            log.info(values);
            const rsp = await this.dao.allDB(sql, values, database);
            return this.makeReponseInside(rsp, entity);
          })
        );
      })
      .finally(() => database.close());
  }

  async makeReponse(entity, validate = true) {
    var valiny = [];
    const questionRepository = new QuestionRepository(this.dao);
    const questions = await questionRepository.getAllQuestionByThematique(
      entity.thid
    );

    log.info("make Reponse : question ");
    log.info(questions);
    const reponses = validate
      ? await this.all(entity)
      : await this.allN(entity);
    log.info("make Reponse : reponses ");
    log.info(reponses);
    let reponseEnCours = this.newReponse(questions);

    log.info("averina eto ilay reponse : reponse");
    log.info(reponses);
    log.info("mety ve");

    reponses[0].forEach((element, idx) => {
      if (element.is_principale == 1) {
        if (idx > 0) {
          valiny.push(reponseEnCours);
          reponseEnCours = this.newReponse(questions);
        }
        reponseEnCours["_District_"] = element.district;
      }
      reponseEnCours[element.qst.replaceAll(/[^a-zA-Z0-9]/g, "_")] =
        element.reponse;
    });
    if (reponses.length > 0) {
      valiny.push(reponseEnCours);
    }

    const indicateurs = await this.getIndicateur(entity.thid, valiny);

    // Put district in questions so it can be header in screen
    let specialQuestion = [];
    specialQuestion[0] = {
      label: " District ",
      question: " District ",
    };
    questions.forEach((element) => {
      specialQuestion.push(element);
    });

    const farany = {
      indicateurs: indicateurs,
      reponses: valiny,
      questions: specialQuestion,
    };

    log.info("reponse as object");
    log.info(farany);

    return farany;
  }

  async makeReponseInside(reponses, entity) {
    try {
      var valiny = [];
      const questionRepository = new QuestionRepository(this.dao);
      const questions = await questionRepository.getAllQuestionByThematique(
        entity.thid
      );

      log.info("make Reponse : question ");
      log.info(questions);
      let reponseEnCours = this.newReponse(questions);

      reponses.forEach((element, idx) => {
        if (element.is_principale == 1) {
          if (idx > 0) {
            valiny.push(reponseEnCours);
            reponseEnCours = this.newReponse(questions);
          }
          reponseEnCours["_District_"] = element.district;
        }
        reponseEnCours[element.qst.replaceAll(/[^a-zA-Z0-9]/g, "_")] =
          element.reponse;
      });
      if (reponses.length > 0) {
        valiny.push(reponseEnCours);
      }

      const indicateurs = await this.getIndicateur(entity.thid, valiny);

      // Put district in questions so it can be header in screen
      let specialQuestion = [];
      specialQuestion[0] = {
        label: " District ",
        question: " District ",
      };
      questions.forEach((element) => {
        specialQuestion.push(element);
      });

      const farany = {
        district: valiny[0] ? valiny[0]._District_ : "",
        indicateurs: indicateurs,
        reponses: valiny,
        questions: specialQuestion,
      };

      log.info("reponse as object");
      log.info(farany);

      return farany;
    } catch (error) {
      log.info("Maker reponse inside error");
      throw error;
    }
  }

  async makeReponseMultiple(reponses, entity, level = "district") {
    try {
      var farany = {};
      for (let index = 0; index < reponses.length; index++) {
        const temp = await makeReponseInside(reponses[index], entity);
        farany[level] = temp;
      }
      return farany;
    } catch (error) {
      log.info("MakeReposeMultiple error");
      throw error;
    }
  }

  validateDB(ids, val, database) {
    let column = "";
    let value = [];
    value.push(val);

    ids.forEach((id) => {
      column += "OR id = ? ";
      value.push(id);
    });

    let sql = "UPDATE user SET validate = ? WHERE 1 != 1 " + column;

    log.info("validate DB:");
    log.info(sql);
    log.info(value);

    return this.dao.runDB(sql, value, database);
  }
}

module.exports = ResponseRepository;
