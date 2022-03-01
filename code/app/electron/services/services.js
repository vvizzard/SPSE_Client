const { ipcMain } = require("electron");
const log = require("electron-log");
// import fetch from "node-fetch";
// const sqlite3 = require('sqlite3').verbose();
const regions = require("../layer/regions.json");
const BaseDao = require("./database/BaseDao");
const BaseRepository = require("./database/BaseRepository");
const QuestionRepository = require("./database/QuestionRepository");
const ResponseRepository = require("./database/ReponseRepository");
const UserRepository = require("./database/UserRepository");
// const Exportation = require('./database/Exportation');
const Exportation = require("./Exportation");

const dao = new BaseDao("spse_db6117.sqlite3");

// Validate a user
ipcMain.on("asynchronous-validate", (event, name, entity, val) => {
  // verbose
  log.info("asynchronous-validate arg :");
  log.info("name :" + name);
  log.info("entity :" + JSON.stringify(entity));
  log.info("------");

  // database because we'll run 2 query
  let database = dao.getDatabase();

  // if need, specifie the repository
  let repository;
  if (name == "user") repository = new UserRepository(dao);
  else repository = new BaseRepository(dao, name);

  // Run the query
  repository
    .validateDB(entity, val, database)
    .then(() => {
      repository.allDB(database).then((rows) => {
        event.reply("asynchronous-reply", rows);
      });
    })
    .catch((error) => {
      log.error(error);
      event.reply("asynchronous-reply", []);
    });

  // Close database connection
  database.close;
});

ipcMain.on("asynchronous-add", (event, name, entity) => {
  // verbose
  log.info("asynchronous-add arg :");
  log.info("name :" + name);
  log.info("entity :" + JSON.stringify(entity));
  log.info("------");

  // database because we'll run 2 query
  let database = dao.getDatabase();

  // if need, specifie the repository
  let repository;
  if (name == "user") repository = new UserRepository(dao);
  else repository = new BaseRepository(dao, name);

  // Run the query

  repository
    .createDB(entity, database)
    .then(() => {
      repository.allDB(database).then((rows) => {
        event.reply("asynchronous-reply", rows);
      });
    })
    .catch((error) => {
      log.error(error);
      event.reply("asynchronous-reply", []);
    })
    .finally(() => {
      // Close database connection
      database.close;
    });
});

ipcMain.handle("asynchronous-get", (event, name, entity) => {
  // verbose
  log.info("asynchronous-get arg :");
  log.info("name :" + name);
  log.info("entity :" + JSON.stringify(entity));
  log.info("------");

  // if need, specifie the repository
  let repository;
  if (name == "user") repository = new UserRepository(dao);
  else if (name == "reponse") repository = new ResponseRepository(dao);
  else repository = new BaseRepository(dao, name);

  // Run the query
  return repository.all(entity);
});

ipcMain.on("asynchronous-get-trans", (event, name, entity) => {
  // verbose
  log.info("asynchronous-get-trans : args");
  log.info("event :" + event);
  log.info("name :" + name);
  log.info("entity :" + JSON.stringify(entity));
  log.info("-----------------------------");

  // if need, specifie the repository
  let repository;
  if (name == "user") repository = new UserRepository(dao);
  else if (name == "reponse" || name == "reponse_non_valide")
    repository = new ResponseRepository(dao);
  else repository = new BaseRepository(dao, name);

  if (name == "reponse" || name == "reponse_non_valide") {
    //if reponse
    repository
      .getReponses(entity, name)
      .then((rows) => {
        log.info("asynchronous-get-trans : response");
        log.info(rows);
        log.info("--------------------------");
        event.reply("asynchronous-reply", rows);
      })
      .catch((error) => {
        log.error(error);
        event.reply("asynchronous-reply", []);
      });
  } else {
    // Run the query
    repository
      .all(entity)
      .then((rows) => {
        event.reply("asynchronous-reply", rows);
      })
      .catch((error) => {
        log.error(error);
        event.reply("asynchronous-reply", []);
      });
  }
});

// ipcMain.on("asynchronous-get-district-user", (event, name, entity) => {
//   // verbose
//   log.info("asynchronous-get-district-user arg :");
//   log.info("name :" + name);
//   log.info("entity :" + JSON.stringify(entity));
//   log.info("------");

//   // if need, specifie the repository
//   let repository = new BaseRepository(dao, name);
//   // Run the query
//   repository
//     .get(
//       `SELECT d.*, u.id as utilisateur FROM district d LEFT JOIN user u ON u.district_id = d.id`
//       ,entity)
//     .then((rows) => {
//       event.reply("asynchronous-reply", rows);
//     })
//     .catch((error) => {
//       log.error(error);
//       event.reply("asynchronous-reply", []);
//     });
// });

ipcMain.on("asynchronous-delete", (event, name, entity) => {
  // verbose
  log.info("asynchronous-delete :");
  log.info("table :" + name);
  log.info("id :" + JSON.stringify(entity));
  log.info("------");

  // if need, specifie the repository
  let repository;
  if (name == "user") repository = new UserRepository(dao);
  else if (name == "reponse" || name == "reponse_non_valide")
    repository = new ResponseRepository(dao);
  else repository = new BaseRepository(dao, name);

  repository
    .delete(entity)
    .then((rows) => {
      log.info("services (delete) : ");
      log.info(rows);
      event.reply("asynchronous-reply", rows);
    })
    .catch((error) => {
      log.error(error);
      event.reply("asynchronous-reply", []);
    });
});

ipcMain.on("asynchronous-deletes", (event, name, entity) => {
  // verbose
  log.info("asynchronous-deletes :");
  log.info("table :" + name);
  log.info("id :" + JSON.stringify(entity));
  log.info("------");

  // if need, specifie the repository
  let repository;
  if (name == "user") repository = new UserRepository(dao);
  else if (name == "reponse" || name == "reponse_non_valide")
    repository = new ResponseRepository(dao);
  else repository = new BaseRepository(dao, name);

  repository
    .deletes(entity)
    .then((rows) => {
      log.info("services (delete) : ");
      log.info(rows);
      event.reply("asynchronous-reply", rows);
    })
    .catch((error) => {
      log.error(error);
      event.reply("asynchronous-reply", []);
    });
});

ipcMain.handle("map-get", (event, name, entity) => {
  // verbose
  log.info("map-get arg :");
  log.info("name :" + name);
  log.info("entity :" + JSON.stringify(entity));
  log.info("------");

  const exp = new Exportation();
  const temp = exp.getMaps(entity.thematique, entity.year, dao);

  return temp;

  if (name == "region") return regions;
  if (name == "reponse") return regions;
});

// ipcMain.handle('export', (event, name, entity) => {
//     // verbose
//     log.info('export :');
//     log.info('name :'+name);
//     log.info('entity :'+JSON.stringify(entity));
//     log.info('------');

//     repository = new BaseRepository(dao, 'indicateur');
//     const sheet = {}

//     if(name == "thematique") {
//         sheet.sheet = 'Canevas'
//         sheet.columns = []
//         repository.all(entity).then(row=>{
//             repository.table = 'question'
//             row.forEach(rr => {
//                 repository.all({indicateur_id: rr.id}).then(val=>{
//                     val.forEach(vv => {
//                         sheet.columns.push({
//                             label : vv.question,
//                             value: vv.label
//                         })
//                     });
//                 }).finally(data=>{
//                     sheet.content = []
//                     const exp = new Exportation()
//                     log.info('eto oooooo :');
//                     log.info(sheet)
//                     return exp.save([sheet])
//                 })
//             });
//         })

//     }

// });

// Export
ipcMain.on("export", (event, name, entity) => {
  // verbose
  log.info("export :");
  log.info("name :" + name);
  log.info("entity :" + JSON.stringify(entity));
  log.info("------");

  repository = new QuestionRepository(dao);
  let sheet = {};
  let indicateur = {};
  let gloss = {};

  if (name == "thematique") {
    sheet.sheet = "Canevas";
    sheet.columns = [];

    indicateur.sheet = "Indicateur";
    indicateur.columns = [];

    gloss.sheet = "Glossaire";
    gloss.columns = [];

    let content = {};
    let content1 = [];
    let content2 = {};

    repository
      .getAllQuestionByThematique(entity)
      .then((row) => {
        log.info("tafiditra log iooooooooo");
        log.info(row);

        row.forEach((vv) => {
          sheet.columns.push({
            label: vv.obligatoire == 1 ? "* " + vv.question : vv.question,
            value: vv.obligatoire == 1 ? "* " + vv.label : vv.label,
          });

          log.info("tafiditra log, isaky ny row ary ito aloha");
          log.info(sheet.columns);
          log.info(vv.indicateur);

          content[vv.label] = "";
          if (vv.indicateur && vv.indicateur != null && vv.indicateur != "") {
            if (indicateur.columns.length == 0) {
              indicateur.columns.push({
                label: "Indicateur",
                value: "indicateur",
              });
            }
            content1.push({ indicateur: vv.indicateur });
          }
        });

        sheet.content = [content];
        indicateur.content = content1;
        const exp = new Exportation();
        log.info("eto oooooo dataaaaaa:");
        log.info(sheet);
        log.info(indicateur);
        const data = [sheet, indicateur];
        // log.info(sheet)
        log.info(data);
        exp.save(data).then((res) => {
          event.reply("export-reply", res);
        });
      })
      .catch((error) => {
        log.error(error);
        event.reply("export-reply", []);
      });
  }
});

// Import
ipcMain.on("import", (event, name, entity) => {
  // verbose
  log.info("import :");
  log.info("name :" + name);
  log.info("entity :" + JSON.stringify(entity));
  log.info("------");

  const exp = new Exportation();

  const resp = exp
    .read(
      entity,
      new BaseRepository(dao, "question"),
      new ResponseRepository(dao)
    )
    .then((result) => {
      event.reply("import-reply", result);
    })
    .catch((error) => {
      log.error(error);
      event.reply("import-reply", false);
    });
  // .catch((err) => {
  //   event.reply("import-reply", false);
  // });
});

// Upload
ipcMain.on("import-geojson", (event, name, entity) => {
  // verbose
  log.info("upload :");
  log.info("name :" + name);
  log.info("entity :" + JSON.stringify(entity));
  log.info("------");

  const exp = new Exportation();

  const resp = exp
    .upload()
    .then((result) => {
      event.reply("reply", result);
    })
    .catch((error) => {
      log.error(error);
      event.reply("reply", false);
    });
  // .catch((err) => {
  //   event.reply("import-reply", false);
  // });
});

// validation
ipcMain.on("valider-terminer", (event, name, entity) => {
  // verbose
  log.info("valider-terminer :");
  log.info("name :" + name);
  log.info("entity :" + JSON.stringify(entity));
  log.info("------");

  let temp = new ResponseRepository(dao);

  const exp = new Exportation();
  temp
    .validate(entity)
    .then((tp) => {
      exp.validationSynch(entity, temp).then((rs) => {
        event.reply("asynchronous-reply", tp);
      });
    })
    .catch((error) => {
      log.error(error);
      event.reply("asynchronous-reply", false);
    });
});

ipcMain.on("rejeter", (event, name, entity) => {
  // verbose
  log.info("rejeter :");
  log.info("name :" + name);
  log.info("entity :" + JSON.stringify(entity));
  log.info("------");

  let temp = new ResponseRepository(dao);

  const exp = new Exportation();
  exp
    .validation("reject", entity.district_id)
    .then((val) => {
      if (val) {
        temp
          .reject(entity)
          .then((tp) => {
            event.reply("asynchronous-reply", tp);
          })
          .catch((error) => {
            throw error;
          });
      }
    })
    .catch((error) => {
      log.error(error);
      event.reply("asynchronous-reply", false);
    });
});

ipcMain.on("terminer", (event, name, entity) => {
  // verbose
  log.info("terminer :");
  log.info("name :" + name);
  log.info("entity :" + JSON.stringify(entity));
  log.info("------");

  let temp = new ResponseRepository(dao);

  const exp = new Exportation();
  exp
    .validation("terminer", entity.district_id)
    .then((val) => {
      if (val) {
        let tp = temp.terminer(entity);
        event.reply("asynchronous-reply", tp != false);
      }
    })
    .catch((error) => {
      log.error(error);
      event.reply("asynchronous-reply", false);
    });
});

ipcMain.on("asynchronous-register", (event, name, entity) => {
  // verbose
  log.info("register :");
  log.info("entity :" + JSON.stringify(entity));
  log.info("------");

  const exp = new Exportation();
  exp
    .inscription(entity)
    .then((val) => {
      if (val) {
        event.reply("asynchronous-reply", val);
      }
    })
    .catch((error) => {
      log.error(error);
      event.reply("asynchronous-reply", false);
    });
});

ipcMain.on("asynchronous-get-district-validation", (event, name, entity) => {
  // verbose
  log.info("asynchronous-get-district-validation arg :");
  log.info("name :" + name);
  log.info("entity :" + JSON.stringify(entity));
  log.info("------");

  // if need, specifie the repository
  let repository = new BaseRepository(dao, name);
  // Run the query
  repository
    .districtsByRegion(entity)
    .then((rows) => {
      log.info("services : repository.all : ");
      log.info(rows);
      event.reply("districts", rows);
      log.info("reeeeeeeeeeeeeeeeeeeeeeeeeeeeeo");
    })
    .catch((error) => {
      log.info("erreur asynchronous-get-district-validation");
      log.info(error);
      log.error("erreur asynchronous-get-district-validation");
      log.error(error);
      log.info("tsaaaaaaaaaaaaa meeeeeeeeeeeeeeeeeety");
      event.reply("districts", false);
    });
});

ipcMain.on("synchroniser", (event, name, entity) => {
  const exp = new Exportation();
  exp.synchroniser(new BaseRepository(dao, "user")).then((res) => {
    event.reply("asynchronous-reply", []);
  });
});
