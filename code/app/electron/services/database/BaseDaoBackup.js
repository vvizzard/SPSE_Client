const { app } = require("electron");
const sqlite3 = require("sqlite3").verbose();
const log = require("electron-log");
const fs = require("fs");
var path = require("path");

// const Promise = require('bluebird )

class BaseDao {
  constructor(dbFilePath) {
    this.dbPath = dbFilePath;
    this.checkDatabase();
  }

  checkDatabase() {
    try {
      var filebuffer = fs.readFileSync(
        path.join(app.getPath("userData"), this.dbPath)
      );
    } catch (err) {
      if (err.code === "ENOENT") {
        fs.closeSync(
          fs.openSync(path.join(app.getPath("userData"), this.dbPath), "w")
        );
        const database = this.getDatabase();
        this.setUpDatabase(database);
        database.close;
        log.info("path of database : ");
        log.info(path.join(app.getPath("userData"), this.dbPath));
      } else {
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
        )`);
    sql.push(`CREATE TABLE IF NOT EXISTS "region" (
            "id"	INTEGER NOT NULL UNIQUE,
            "label"	TEXT NOT NULL,
            "comment"	INTEGER,
            "province_id"	INTEGER NOT NULL,
            FOREIGN KEY("province_id") REFERENCES "province"("id"),
            PRIMARY KEY("id")
        )`);
    sql.push(`CREATE TABLE IF NOT EXISTS "district" (
            "id"	INTEGER NOT NULL UNIQUE,
            "label"	TEXT NOT NULL,
            "comment"	INTEGER,
            "region_id"	INTEGER NOT NULL,
            FOREIGN KEY("region_id") REFERENCES "region"("id"),
            PRIMARY KEY("id")
        )`);
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
        )`);
    sql.push(`CREATE TABLE IF NOT EXISTS "thematique" (
            "id"	INTEGER NOT NULL UNIQUE,
            "label"	TEXT NOT NULL,
            "comment"	TEXT,
            PRIMARY KEY("id")
        )`);
    sql.push(`CREATE TABLE "indicateur" (
            "id"	INTEGER NOT NULL UNIQUE,
            "label"	TEXT NOT NULL,
            "comment"	INTEGER,
            "thematique_id"	INTEGER NOT NULL,
            "sum"	INTEGER NOT NULL DEFAULT 0,
            "moy"	INTEGER NOT NULL DEFAULT 0,
            "count"	INTEGER NOT NULL DEFAULT 0,
            "id_question"	INTEGER,
            FOREIGN KEY("thematique_id") REFERENCES "thematique"("id"),
            FOREIGN KEY("id_question") REFERENCES "question"("id"),
            PRIMARY KEY("id")
        )`);
    sql.push(`CREATE TABLE IF NOT EXISTS "province" (
            "id"	INTEGER NOT NULL UNIQUE,
            "label"	TEXT NOT NULL,
            "comment"	TEXT,
            PRIMARY KEY("id")
        )`);
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
        )`);
    sql.push(`CREATE TABLE IF NOT EXISTS "reponse_non_valide" (
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
        )`);
    sql.push(`CREATE TABLE "question" (
            "id"	INTEGER NOT NULL UNIQUE,
            "question"	TEXT,
            "is_principale"	INTEGER NOT NULL DEFAULT 0,
            "field_type"	INTEGER NOT NULL DEFAULT 1,
            "level"	NUMERIC NOT NULL DEFAULT 1,
            "obligatoire"	INTEGER NOT NULL DEFAULT 1,
            "indicateur_id"	INTEGER,
            "question_mere_id"	INTEGER,
            "objectif"	TEXT,
            "label"	REAL NOT NULL,
            "unite"	TEXT,
            FOREIGN KEY("indicateur_id") REFERENCES "indicateur"("id"),
            PRIMARY KEY("id")
        )`);

    // Add default values
    sql.push(`INSERT INTO "category" ("id","label","rank") VALUES 
            (1,'cantonnement',1),
            (0,'RPSE (Centrale)',0),
            (2,'RPSE',1),
            (3,'DREDD',2),
            (4,'DPSE',3)`);

    sql.push(`INSERT INTO province (id,label,comment) VALUES 
    (1,'Antananarivo','8864904553756276688'),
    (2,'Antsiranana','-8711031052795110745'),
    (5,'Fianarantsoa','7270744785182717817'),
    (4,'Mahajanga','-949041082025301867'),
    (3,'Toamasina','2810143387255338619'),
    (6,'Toliara','-4460846208442074585')`);

    sql.push(`INSERT INTO "region" ("id","label","comment","province_id") VALUES 
    ( 1,"ANALAMANGA", NULL, 1),
    ( 2,"BONGOLAVA", NULL, 1),
    ( 3,"ITASY", NULL, 1),
    ( 4,"VAKINANKARATRA", NULL, 1),
    ( 5,"DIANA", NULL, 2),
    ( 6,"SAVA", NULL, 2),
    ( 7,"AMORON I MANIA", NULL, 3),
    ( 8,"ATSIMO ATSINANA", NULL, 3),
    ( 9,"HAUTE MATSIATRA", NULL, 3),
    ( 10,"IHOROMBE", NULL, 3),
    ( 11,"VATOVAVY", NULL, 3),
    ( 12,"FITOVINANY", NULL, 3),
    ( 13,"BETSIBOKA", NULL, 4),
    ( 14,"BOENY", NULL, 4),
    ( 15,"MELAKY", NULL, 4),
    ( 16,"SOFIA", NULL, 4),
    ( 17,"ALAOTRA MANGORO", NULL, 5),
    ( 18,"ANALANJIROFO", NULL, 5),
    ( 19,"ATSINANANA", NULL, 5),
    ( 20,"ANDROY", NULL, 6),
    ( 21,"ANOSY", NULL, 6),
    ( 22,"ATSIMO ANDREFANA", NULL, 6),
    ( 23,"MENABE", NULL, 6)`);

    sql.push(`INSERT INTO "district" ("id","label","comment","region_id") VALUES 
    (1, "AMBALAVAO ", NULL, 9),
    (2, "AMBANJA ", NULL, 5),
    (3, "AMBATO BOENI ", NULL, 14),
    (4, "AMBATOFINANDRAHANA ", NULL, 7),
    (5, "AMBATOLAMPY ", NULL, 4),
    (6, "AMBATOMAINTY ", NULL, 15),
    (7, "AMBATONDRAZAKA ", NULL, 17),
    (8, "AMBILOBE ", NULL, 5),
    (9, "AMBOASARY SUD ", NULL, 21),
    (10, "AMBOHIDRATRIMO ", NULL, 1),
    (11, "AMBOHIMAHASOA ", NULL, 9),
    (12, "AMBOSITRA ", NULL, 7),
    (13, "AMBOVOMBE ANDROY ", NULL, 20),
    (14, "AMPANIHY OUEST ", NULL, 22),
    (15, "AMPARAFARAVOLA ", NULL, 17),
    (16, "ANALALAVA ", NULL, 16),
    (17, "ANDAPA ", NULL, 6),
    (18, "ANDILAMENA ", NULL, 17),
    (19, "ANDRAMASINA ", NULL, 1),
    (20, "ANJOZOROBE ", NULL, 1),
    (21, "ANKAZOABO SUD ", NULL, 22),
    (22, "ANKAZOBE ", NULL, 1),
    (23, "ANOSIBE AN ALA ", NULL, 17),
    (24, "ANTALAHA ", NULL, 6),
    (25, "ANTANAMBAO MANAMPONTSY ", NULL, 19),
    (26, "ANTANANARIVO ATSIMONDRANO ", NULL, 1),
    (27, "ANTANANARIVO AVARADRANO ", NULL, 1),
    (28, "ANTANANARIVO RENIVOHITRA", NULL, 1),
    (29, "ANTANIFOTSY ", NULL, 4),
    (30, "ANTSALOVA ", NULL, 15),
    (31, "ANTSIRABE I ", NULL, 4),
    (32, "ANTSIRABE II ", NULL, 4),
    (33, "ANTSIRANANA I ", NULL, 5),
    (34, "ANTSIRANANA II ", NULL, 5),
    (35, "ANTSOHIHY ", NULL, 16),
    (36, "ARIVONIMAMO ", NULL, 3),
    (37, "BEALANANA ", NULL, 16),
    (38, "BEFANDRIANA NORD ", NULL, 16),
    (39, "BEFOTAKA ATSIMO ", NULL, 8),
    (40, "BEKILY ", NULL, 20),
    (41, "BELO SUR TSIRIBIHINA ", NULL, 23),
    (42, "BELOHA ANDROY ", NULL, 20),
    (43, "BENENITRA ", NULL, 22),
    (44, "BEROROHA ", NULL, 22),
    (45, "BESALAMPY ", NULL, 15),
    (46, "BETAFO ", NULL, 4),
    (47, "BETIOKY SUD ", NULL, 22),
    (48, "BETROKA ", NULL, 21),
    (49, "BRICKAVILLE ", NULL, 19),
    (50, "FANDRIANA ", NULL, 7),
    (51, "FARAFANGANA ", NULL, 8),
    (52, "FARATSIHO ", NULL, 4),
    (53, "FENERIVE EST ", NULL, 18),
    (54, "FENOARIVOBE ", NULL, 2),
    (55, "FIANARANTSOA ", NULL, 9),
    (56, "IAKORA ", NULL, 10),
    (57, "IFANADIANA ", NULL, 11),
    (58, "IHOSY ", NULL, 10),
    (59, "IKALAMAVONY ", NULL, 9),
    (60, "IKONGO ", NULL, 12),
    (61, "ISANDRA ", NULL, 9),
    (62, "IVOHIBE ", NULL, 10),
    (63, "KANDREHO ", NULL, 13),
    (64, "LALANGINA ", NULL, 9),
    (65, "MAEVATANANA ", NULL, 13),
    (66, "MAHABO ", NULL, 23),
    (67, "MAHAJANGA I ", NULL, 14),
    (68, "MAHAJANGA II ", NULL, 14),
    (69, "MAHANORO ", NULL, 19),
    (70, "MAINTIRANO ", NULL, 15),
    (71, "MAMPIKONY ", NULL, 16),
    (72, "MANAKARA ", NULL, 12),
    (73, "MANANARA-NORD ", NULL, 18),
    (74, "MANANDRIANA ", NULL, 7),
    (75, "MANANJARY ", NULL, 11),
    (76, "MANDOTO ", NULL, 4),
    (77, "MANDRITSARA ", NULL, 16),
    (78, "MANJA ", NULL, 23),
    (79, "MANJAKANDRIANA ", NULL, 1),
    (80, "MAROANTSETRA ", NULL, 18),
    (81, "MAROLAMBO ", NULL, 19),
    (82, "MAROVOAY ", NULL, 14),
    (83, "MIANDRIVAZO ", NULL, 23),
    (84, "MIARINARIVO ", NULL, 3),
    (85, "MIDONGY SUD ", NULL, 8),
    (86, "MITSINJO ", NULL, 14),
    (87, "MORAFENOBE ", NULL, 15),
    (88, "MORAMANGA ", NULL, 17),
    (89, "MOROMBE ", NULL, 22),
    (90, "MORONDAVA ", NULL, 23),
    (91, "NOSY VARIKA ", NULL, 11),
    (92, "NOSY-BE ", NULL, 5),
    (93, "PORT-BERGE ", NULL, 16),
    (94, "SAINTE MARIE ", NULL, 18),
    (95, "SAKARAHA ", NULL, 22),
    (96, "SAMBAVA ", NULL, 6),
    (97, "SOALALA ", NULL, 14),
    (98, "SOANIERANA IVONGO ", NULL, 18),
    (99, "SOAVINANDRIANA ", NULL, 3),
    (100, "TAOLANARO ", NULL, 21),
    (101, "TOAMASINA I ", NULL, 19),
    (102, "TOAMASINA II ", NULL, 19),
    (103, "TOLIARY I ", NULL, 22),
    (104, "TOLIARY II ", NULL, 22),
    (105, "TSARATANANA ", NULL, 13),
    (106, "TSIHOMBE ", NULL, 20),
    (107, "TSIROANOMANDIDY ", NULL, 2),
    (108, "VANGAINDRANO ", NULL, 8),
    (109, "VATOMANDRY ", NULL, 19),
    (110, "VAVATENINA ", NULL, 18),
    (111, "VOHEMAR ", NULL, 6),
    (112, "VOHIBATO ", NULL, 9),
    (113, "VOHIPENO ", NULL, 12),
    (114, "VONDROZO ", NULL, 8)`);

    // sql.push(`INSERT INTO Region (id, label, comment, province_id) VALUES
    // ( 1,"ANALAMANGA", NULL, 1),
    // ( 2,"BONGOLAVA", NULL, 1),
    // ( 3,"ITASY", NULL, 1),
    // ( 4,"VAKINANKARATRA", NULL, 1),
    // ( 5,"DIANA", NULL, 2),
    // ( 6,"SAVA", NULL, 2),
    // ( 7,"AMORON I MANIA", NULL, 3),
    // ( 8,"ATSIMO ATSINANA", NULL, 3),
    // ( 9,"HAUTE MATSIATRA", NULL, 3),
    // ( 10,"IHOROMBE", NULL, 3),
    // ( 11,"VATOVAVY", NULL, 3),
    // ( 12,"FITOVINANY", NULL, 3),
    // ( 13,"BETSIBOKA", NULL, 4),
    // ( 14,"BOENY", NULL, 4),
    // ( 15,"MELAKY", NULL, 4),
    // ( 16,"SOFIA", NULL, 4),
    // ( 17,"ALAOTRA MANGORO", NULL, 5),
    // ( 18,"ANALANJIROFO", NULL, 5),
    // ( 19,"ATSINANANA", NULL, 5),
    // ( 20,"ANDROY", NULL, 6),
    // ( 21,"ANOSY", NULL, 6),
    // ( 22,"ATSIMO ANDREFANA", NULL, 6),
    // ( 23,"MENABE", NULL, 6)`);

    // sql.push(`INSERT INTO district (id, label, comment, region_id) VALUES
    // (1, "AMBALAVAO ", NULL, 9),
    // (2, "AMBANJA ", NULL, 5),
    // (3, "AMBATO BOENI ", NULL, 14),
    // (4, "AMBATOFINANDRAHANA ", NULL, 7),
    // (5, "AMBATOLAMPY ", NULL, 4),
    // (6, "AMBATOMAINTY ", NULL, 15),
    // (7, "AMBATONDRAZAKA ", NULL, 17),
    // (8, "AMBILOBE ", NULL, 5),
    // (9, "AMBOASARY SUD ", NULL, 21),
    // (10, "AMBOHIDRATRIMO ", NULL, 1),
    // (11, "AMBOHIMAHASOA ", NULL, 9),
    // (12, "AMBOSITRA ", NULL, 7),
    // (13, "AMBOVOMBE ANDROY ", NULL, 20),
    // (14, "AMPANIHY OUEST ", NULL, 22),
    // (15, "AMPARAFARAVOLA ", NULL, 17),
    // (16, "ANALALAVA ", NULL, 16),
    // (17, "ANDAPA ", NULL, 6),
    // (18, "ANDILAMENA ", NULL, 17),
    // (19, "ANDRAMASINA ", NULL, 1),
    // (20, "ANJOZOROBE ", NULL, 1),
    // (21, "ANKAZOABO SUD ", NULL, 22),
    // (22, "ANKAZOBE ", NULL, 1),
    // (23, "ANOSIBE AN ALA ", NULL, 17),
    // (24, "ANTALAHA ", NULL, 6),
    // (25, "ANTANAMBAO MANAMPONTSY ", NULL, 19),
    // (26, "ANTANANARIVO ATSIMONDRANO ", NULL, 1),
    // (27, "ANTANANARIVO AVARADRANO ", NULL, 1),
    // (28, "ANTANANARIVO RENIVOHITRA", NULL, 1),
    // (29, "ANTANIFOTSY ", NULL, 4),
    // (30, "ANTSALOVA ", NULL, 15),
    // (31, "ANTSIRABE I ", NULL, 4),
    // (32, "ANTSIRABE II ", NULL, 4),
    // (33, "ANTSIRANANA I ", NULL, 5),
    // (34, "ANTSIRANANA II ", NULL, 5),
    // (35, "ANTSOHIHY ", NULL, 16),
    // (36, "ARIVONIMAMO ", NULL, 3),
    // (37, "BEALANANA ", NULL, 16),
    // (38, "BEFANDRIANA NORD ", NULL, 16),
    // (39, "BEFOTAKA ATSIMO ", NULL, 8),
    // (40, "BEKILY ", NULL, 20),
    // (41, "BELO SUR TSIRIBIHINA ", NULL, 23),
    // (42, "BELOHA ANDROY ", NULL, 20),
    // (43, "BENENITRA ", NULL, 22),
    // (44, "BEROROHA ", NULL, 22),
    // (45, "BESALAMPY ", NULL, 15),
    // (46, "BETAFO ", NULL, 4),
    // (47, "BETIOKY SUD ", NULL, 22),
    // (48, "BETROKA ", NULL, 21),
    // (49, "BRICKAVILLE ", NULL, 19),
    // (50, "FANDRIANA ", NULL, 7),
    // (51, "FARAFANGANA ", NULL, 8),
    // (52, "FARATSIHO ", NULL, 4),
    // (53, "FENERIVE EST ", NULL, 18),
    // (54, "FENOARIVOBE ", NULL, 2),
    // (55, "FIANARANTSOA ", NULL, 9),
    // (56, "IAKORA ", NULL, 10),
    // (57, "IFANADIANA ", NULL, 11),
    // (58, "IHOSY ", NULL, 10),
    // (59, "IKALAMAVONY ", NULL, 9),
    // (60, "IKONGO ", NULL, 12),
    // (61, "ISANDRA ", NULL, 9),
    // (62, "IVOHIBE ", NULL, 10),
    // (63, "KANDREHO ", NULL, 13),
    // (64, "LALANGINA ", NULL, 9),
    // (65, "MAEVATANANA ", NULL, 13),
    // (66, "MAHABO ", NULL, 23),
    // (67, "MAHAJANGA I ", NULL, 14),
    // (68, "MAHAJANGA II ", NULL, 14),
    // (69, "MAHANORO ", NULL, 19),
    // (70, "MAINTIRANO ", NULL, 15),
    // (71, "MAMPIKONY ", NULL, 16),
    // (72, "MANAKARA ", NULL, 12),
    // (73, "MANANARA-NORD ", NULL, 18),
    // (74, "MANANDRIANA ", NULL, 7),
    // (75, "MANANJARY ", NULL, 11),
    // (76, "MANDOTO ", NULL, 4),
    // (77, "MANDRITSARA ", NULL, 16),
    // (78, "MANJA ", NULL, 23),
    // (79, "MANJAKANDRIANA ", NULL, 1),
    // (80, "MAROANTSETRA ", NULL, 18),
    // (81, "MAROLAMBO ", NULL, 19),
    // (82, "MAROVOAY ", NULL, 14),
    // (83, "MIANDRIVAZO ", NULL, 23),
    // (84, "MIARINARIVO ", NULL, 3),
    // (85, "MIDONGY SUD ", NULL, 8),
    // (86, "MITSINJO ", NULL, 14),
    // (87, "MORAFENOBE ", NULL, 15),
    // (88, "MORAMANGA ", NULL, 17),
    // (89, "MOROMBE ", NULL, 22),
    // (90, "MORONDAVA ", NULL, 23),
    // (91, "NOSY VARIKA ", NULL, 11),
    // (92, "NOSY-BE ", NULL, 5),
    // (93, "PORT-BERGE ", NULL, 16),
    // (94, "SAINTE MARIE ", NULL, 18),
    // (95, "SAKARAHA ", NULL, 22),
    // (96, "SAMBAVA ", NULL, 6),
    // (97, "SOALALA ", NULL, 14),
    // (98, "SOANIERANA IVONGO ", NULL, 18),
    // (99, "SOAVINANDRIANA ", NULL, 3),
    // (100, "TAOLANARO ", NULL, 21),
    // (101, "TOAMASINA I ", NULL, 19),
    // (102, "TOAMASINA II ", NULL, 19),
    // (103, "TOLIARY I ", NULL, 22),
    // (104, "TOLIARY II ", NULL, 22),
    // (105, "TSARATANANA ", NULL, 13),
    // (106, "TSIHOMBE ", NULL, 20),
    // (107, "TSIROANOMANDIDY ", NULL, 2),
    // (108, "VANGAINDRANO ", NULL, 8),
    // (109, "VATOMANDRY ", NULL, 19),
    // (110, "VAVATENINA ", NULL, 18),
    // (111, "VOHEMAR ", NULL, 6),
    // (112, "VOHIBATO ", NULL, 9),
    // (113, "VOHIPENO ", NULL, 12),
    // (114, "VONDROZO ", NULL, 8)`);

    sql.push(`INSERT INTO "user" ("id","nom","email","tel","pw","category_id","validate","district_id") VALUES (1,'RAZAFINDRAKOTO Franck','frazafindrakoto@gmail.com','0344578935','test',1,0,1),
        (2,'RABETRANO Princia','prabetrano@gmail.com','0342598744','test',4,1,2),
        (3,'RABEZANDRY Marcelle','mrabezandry@gmail.com','0345485246','test',2,0,3),
        (4,'RAKOTONANDRASANA Harilala','hrakotonandrasana@gmail.com','0341255548','test',3,0,4),
        (5,'RAZAFINJOELINA Tahiana','trazafinjoelina@gmail.com','0345123698','test',3,1,NULL),
        (6,'admin','admin','admin','admin',4,1,1)`);

    sql.push(`INSERT INTO "thematique" ("id","label","comment") VALUES 
        (1,'Actes administratifs (Exploitation)', 'Cantonnement'),
        (2,'Actes administratifs (Recherche)', 'Cantonnement'),
        (3,'Aires prot??g??es (AP)','Cantonnement'),
        (4,'Biodiversit??','Cantonnement'),
        (5,'Cadre national et international (juridique, politique, strat??gique)','Centrale'),
        (6,'Changement Climatique et REDD+ (r??gion)','Cantonnement'),
        (7, 'Changement Climatique et REDD+ (centrale)', 'Centrale'),
        (8,'Contr??les environnementaux','Cantonnement'),
        (9, 'Contr??les for??stiers', 'Cantonnement'),
        (10,'Partenariat','Centrale'),
        (11,'Economie verte','Cantonnement'),
        (12,'Environnement (pollution, ??valuation environnementale, gouvernance)','Centrale'),
        (13,'Feux??','Cantonnement'),
        (14,'Finances','Centrale'),
        (15,'Informations g??n??rales','Centrale'),
        (16,'Informations, education, communication (IEC)','Tous'),
        (17,'Logistique (Infrastructure)','Tous'),
        (18, 'Logistique (Mat??riel roulant)', 'Tous'),
        (19, 'Logistique (Mat??riel informatique)', 'Tous'),
        (20, 'Logistique (Mat??riel mobilier)', 'Tous'),
        (21,'Outils (guide, manuel)','Centrale'),
        (22,'Planification, programmation, suivi-evaluation','Centrale'),
        (23,'Reboisement et gestion des terres','Cantonnement'),
        (24,'Recherche et d??veloppement','Centrale'),
        (25,'Responsabilit?? Soci??tale des Entreprises (RSE : reboisements, ??ducation environnementale, ...)','Centrale'),
        (26,'Ressources humaines','Tous'),
        (27,'Transfert de gestion','Centrale'),
        (28, 'P??pini??re', 'Cantonnement'),
        (29,'Developpement durable (economie, sociale, environnement, culture)','Centrale'),
        (30,'Paiement des services environnementaux (PSE)','Centrale'),
        (31,'Corruption','Tous')`);

    // Actes administratifs
    /*(1, "Quantit?? de produit ayant un permis de coupe", "", 1, 1, 0, 0),
    //(2, "Quantit?? de produit ayant un autorisatin de coupe", "", 1, 1, 0, 0),
    //(3, "Quantit?? de produit ayant un permis d'exploitation", "", 1, 1, 0, 0),*/
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (1, "Quantit?? de produit d??clar??", "", 1, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (1, "Commune d'intervention pour les actes", 1, 1, 3, 1, NULL, NULL, NULL, "Commune d'intervention pour les actes", ""),
      (2, "Type d'actes administratrifs (permis de coupe, autorisation de coupe, permis d'exploitation, convention de collecte PFNL)", 0, 1, 3, 1, NULL, 1, NULL, "Type d'actes administratrifs (permis de coupe, autorisation de coupe, permis d'exploitation, convention de collecte PFNL)", ""),
      (3, "R??f??rence de l'acte administratif", 0, 1, 3, 1, NULL, 1, NULL, "R??f??rence de l'acte administratif", ""),
      (4, "Types de produits inscrits dans l'acte administratif (Anacarde (kg), Baie rose (kg), Bois COS (m??), Bois de chauffe (st??re), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))", 0, 1, 3, 1, 1, 1, NULL, "Types de produits inscrits dans l'acte administratif (Anacarde (kg), Baie rose (kg), Bois COS (m??), Bois de chauffe (st??re), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))", ""),
      (5, "Esp??ces concern??es par l'acte administratif", 0, 1, 3, 1, NULL, 1, NULL, "Esp??ces concern??es par l'acte administratif", ""),
      (6, "Quantit?? totale des produits inscrits dans l'acte administratif", 0, 1, 3, 1, NULL, 1, NULL, "Quantit?? totale des produits inscrits dans l'acte administratif", ""),
      (7, "Quantit?? des produits export??s inscrits dans l'acte administratif", 0, 1, 3, 1, NULL, 1, NULL, "Quantit?? des produits export??s inscrits dans l'acte administratif", ""),
      (8, "Destination des produits inscrits dans l'acte administratif (autoconsommation/march?? local/march?? national/exportation)", 0, 1, 3, 1, NULL, 1, NULL, "Destination des produits inscrits dans l'acte administratif (autoconsommation/march?? local/march?? national/exportation)", ""),
      (9, "Existence d'autorisation de transport octroy??e (oui/non)", 0, 1, 3, 1, NULL, 1, NULL, "Existence d'autorisation de transport octroy??e (oui/non)", ""),
      (10, "R??f??rence d'autorisation de transport", 0, 1, 3, 1, NULL, 1, NULL, "R??f??rence d'autorisation de transport", ""),
      (11, "Existence de laissez-passer d??livr?? (oui/non)", 0, 1, 3, 1, NULL, 1, NULL, "Existence de laissez-passer d??livr?? (oui/non)", ""),
      (12, "R??f??rence de laissez-passer", 0, 1, 3, 1, NULL, 1, NULL, "R??f??rence de laissez-passer", ""),
      (13, "Nom de l'op??rateur", 0, 1, 3, 0, NULL, 1, NULL, "Nom de l'op??rateur", ""),
      (14, "Exportateur agr???? (oui/non)", 0, 1, 3, 0, NULL, 1, NULL, "Exportateur agr???? (oui/non)", ""),
      (15, "Valeur (annuelle) des produits ?? l'exportation (Ariary)", 0, 1, 3, 0, NULL, 1, NULL, "Valeur (annuelle) des produits ?? l'exportation (Ariary)", ""),
      (16, "Acte de conformit??/de refus d'importation des produits avec r??f??rence", 0, 1, 3, 0, NULL, 1, NULL, "Acte de conformit??/de refus d'importation des produits avec r??f??rence", ""),
      (17, "Observations actes administratifs exploitation", 0, 1, 3, 0, NULL, 1, NULL, "Observations actes administratifs exploitation", ""),
      (18, "Source de donn??es actes administratifs exploitation", 0, 1, 3, 1, NULL, 1, NULL, "Source de donn??es actes administratifs exploitation", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 6 WHERE id = 1`);

    // Acte administratif (recherche)
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (2, "Nombre d'autorisation de recherche d??livr??e", "", 2, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (19, "Autorisation de recherche d??livr??e (oui/non)", 1, 1, 3, 1, 2, NULL, NULL, "Autorisation de recherche d??livr??e (oui/non)", ""),
      (20, "R??f??rence d'autorisation de recherche", 0, 1, 3, 1, NULL, 19, NULL, "R??f??rence d'autorisation de recherche", ""),
      (21, "Produits associ??s (faune ou flore)", 0, 1, 3, 1, NULL, 19, NULL, "Produits associ??s (faune ou flore)", ""),
      (22, "Esp??ces mises en jeu", 0, 1, 3, 0, NULL, 19, NULL, "Esp??ces mises en jeu", ""),
      (23, "Quotas de pr??l??vement", 0, 1, 3, 0, NULL, 19, NULL, "Quotas de pr??l??vement", ""),
      (24, "Observations actes administratifs recherche", 0, 1, 3, 0, NULL, 19, NULL, "Observations actes administratifs recherche", ""),
      (25, "Source de donn??es actes administratifs recherche", 0, 1, 3, 1, NULL, 19, NULL, "Source de donn??es actes administratifs recherche", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 19 WHERE id = 2`);

    //Aires prot??g??es
    // Superficie des Aires prot??g??es terrestres
    // Superficie des Aires prot??g??es marines
    // Nombre AP ayant un gestionnaire
    // Efficacit?? de gestion
    // Nombre des aires prot??g??es marines
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (5, "Superficie des Aires prot??g??es", "", 3, 1, 0, 0),
      (6, "Nombre des aires prot??g??es g??r??es", "", 3, 0, 0, 1),
      (7, "Nombre de m??nages b??n??ficiant des activit??s de conservations/d??veloppement (AGR)", "", 3, 1, 0, 0),
      (8, "Nombre d'activit??s r??alis??es dans les PAG", "", 3, 1, 0, 0),
      (10, "Superficie restaur??e", "", 3, 1, 0, 0)`
    );
    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (60, "Nom de l'AP", 1, 1, 3, 1, 9, NULL, NULL, "Nom de l'AP", ""),
      (61, "Cat??gorie de l'AP (I, II, III, IV, V, VI, Autre)", 0, 1, 3, 1, NULL, 60, NULL, "Cat??gorie de l'AP (I, II, III, IV, V, VI, Autre)", ""),
      (62, "Statut temporaire ou d??finitif", 0, 1, 3, 0, NULL, 60, NULL, "Statut temporaire ou d??finitif", ""),
      (63, "D??cret si d??finitif", 0, 1, 3, 0, NULL, 60, NULL, "D??cret si d??finitif", ""),
      (64, "Shapefile de l'AP", 0, 1, 3, 1, NULL, 60, NULL, "Shapefile de l'AP", ""),
      (65, "Type : terrestre ou marine", 0, 1, 3, 1, 5, 60, NULL, "Type : terrestre ou marine", ""),
      (66, "Pr??sence de zones humides (oui/non)", 0, 1, 3, 1, NULL, 60, NULL, "Pr??sence de zones humides (oui/non)", ""),
      (67, "Superficie zones humides (ha)", 0, 1, 3, 1, NULL, 60, NULL, "Superficie zones humides (ha)", ""),
      (68, "Nom du gestionnaire", 0, 1, 3, 1, 6, 60, NULL, "Nom du gestionnaire", ""),
      (69, "Nombre de m??nages b??n??ficiant des activit??s de conservations/d??veloppement (AGR)", 0, 1, 3, 1, NULL, 60, NULL, "Nombre de m??nages b??n??ficiant des activit??s de conservations/d??veloppement (AGR)", ""),
      (70, "Existence de PAG ??labor?? (oui/non)", 0, 1, 3, 1, NULL, 60, NULL, "Existence de PAG ??labor?? (oui/non)", ""),
      (71, "Nombre d'activit??s dans le PAG", 0, 1, 3, 1, NULL, 60, NULL, "Nombre d'activit??s dans le PAG", ""),
      (72, "Nombre d'activit??s r??alis??es dans le PAG", 0, 1, 3, 1, NULL, 60, NULL, "Nombre d'activit??s r??alis??es dans le PAG", ""),
      (73, "Existence de PGES ??labor?? (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "Existence de PGES ??labor?? (oui/non)", ""),
      (74, "Existence de EIE r??alis?? (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "Existence de EIE r??alis?? (oui/non)", ""),
      (75, "Existence de permis environnemental d??livr?? (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "Existence de permis environnemental d??livr?? (oui/non)", ""),
      (76, "AP red??limit??e (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP red??limit??e (oui/non)", ""),
      (77, "Superficie de l'AP (ha)", 0, 1, 3, 1, NULL, 60, NULL, "Superficie de l'AP (ha)", ""),
      (78, "Superficie restaur??e dans l'AP (ha)", 0, 1, 3, 1, NULL, 60, NULL, "Superficie restaur??e dans l'AP (ha)", ""),
      (79, "Contrat de d??l??gation de gestion sign?? (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "Contrat de d??l??gation de gestion sign?? (oui/non)", ""),
      (80, "AP disposant de structures op??rationnelles de gestion (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP disposant de structures op??rationnelles de gestion (oui/non)", ""),
      (81, "AP dont la cr??ation et la gestion sont appuy??es (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP dont la cr??ation et la gestion sont appuy??es (oui/non)", ""),
      (82, "Type d'appui pour l'AP (dotation mat??riels, formation, AGR, ???)", 0, 1, 3, 0, NULL, 60, NULL, "Type d'appui pour l'AP (dotation mat??riels, formation, AGR, ???)", ""),
      (83, "Source de financement de l'AP (interne ou externe)", 0, 1, 3, 1, NULL, 60, NULL, "Source de financement de l'AP (interne ou externe)", ""),
      (84, "Projet d'appui de l'AP (si externe)", 0, 1, 3, 1, NULL, 60, NULL, "Projet d'appui de l'AP (si externe)", ""),
      (85, "AP dot??e d'un syst??me de gestion administrative et financi??re (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP dot??e d'un syst??me de gestion administrative et financi??re (oui/non)", ""),
      (86, "AP dot??e d'un syst??me de suivi ??cologique op??rationnel (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP dot??e d'un syst??me de suivi ??cologique op??rationnel (oui/non)", ""),
      (87, "AP disposant d'un r??sultat de suivi ??cologique (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP disposant d'un r??sultat de suivi ??cologique (oui/non)", ""),
      (88, "AP dot??e de syst??me de gestion des feux (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP dot??e de syst??me de gestion des feux (oui/non)", ""),
      (89, "AP dot??e d'un syst??me de surveillance et de contr??le op??rationnel (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP dot??e d'un syst??me de surveillance et de contr??le op??rationnel (oui/non)", ""),
      (90, "AP avec maintenance/entretien des infrastructures de conservation assur??s (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP avec maintenance/entretien des infrastructures de conservation assur??s (oui/non)", ""),
      (91, "AP dot??e d'infrastructures ??cotouristiques (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP dot??e d'infrastructures ??cotouristiques (oui/non)", ""),
      (92, "AP avec maintenance et entretien des infrastructures ??cotouristiques et de service assur??s (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP avec maintenance et entretien des infrastructures ??cotouristiques et de service assur??s (oui/non)", ""),
      (93, "AP faisant objet d'un zonage mat??rialis?? (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP faisant objet d'un zonage mat??rialis?? (oui/non)", ""),
      (94, "AP mettant en ??uvre dans leurs ZP des programmes sp??cifiques d'??ducation environnementale (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP mettant en ??uvre dans leurs ZP des programmes sp??cifiques d'??ducation environnementale (oui/non)", ""),
      (95, "AP faisant objet de restauration d???habitats (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP faisant objet de restauration d???habitats (oui/non)", ""),
      (96, "Indice d'efficacit?? globale de gestion de l'AP", 0, 1, 3, 1, NULL, 60, NULL, "Indice d'efficacit?? globale de gestion de l'AP", ""),
      (97, "Liste des menaces et pressions recens??es", 0, 1, 3, 0, NULL, 60, NULL, "Liste des menaces et pressions recens??es", ""),
      (98, "Taux de r??duction des menaces au niveau de l'AP (%)", 0, 1, 3, 0, NULL, 60, NULL, "Taux de r??duction des menaces au niveau de l'AP (%)", ""),
      (99, "Taux de d??forestation annuelle (%)", 0, 1, 3, 0, NULL, 60, NULL, "Taux de d??forestation annuelle (%)", ""),
      (100, "Nom de sites hors AP disposant de plan d'am??nagement et de gestion ??cotouristique op??rationnel (liste)", 0, 1, 3, 0, NULL, 60, NULL, "Nom de sites hors AP disposant de plan d'am??nagement et de gestion ??cotouristique op??rationnel (liste)", ""),
      (101, "Observations AP", 0, 1, 3, 0, NULL, 60, NULL, "Observations AP", ""),
      (102, "Source de donn??es AP", 0, 1, 3, 1, NULL, 60, NULL, "Source de donn??es AP", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 77 WHERE id = 5`);
    sql.push(`UPDATE indicateur set id_question = 68 WHERE id = 6`);
    sql.push(`UPDATE indicateur set id_question = 69 WHERE id = 7`);
    sql.push(`UPDATE indicateur set id_question = 72 WHERE id = 8`);
    sql.push(`UPDATE indicateur set id_question = 78 WHERE id = 10`);

    //Biodiversit??

    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (11, "Nombre d'esp??ces objet de trafic illicite", "", 4, 0, 0, 1),
      (12, "Quantit?? saisie ", "", 4, 1, 0, 0)`
    );
    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (103, "Esp??ce inventori??e", 1, 1, 3, 1, 12, NULL, NULL, "Esp??ce inentori??e", ""),
      (104, "Nom vernaculaire", 0, 1, 3, 1, NULL, 103, NULL, "Nom vernaculaire", ""),
      (105, "Commune d'intervention pour l'inventaire", 0, 1, 3, 1, NULL, 103, NULL, "Commune d'intervention pour l'inventaire", ""),
      (106, "Longitude (degr?? d??cimal) : X", 0, 1, 3, 1, NULL, 103, NULL, "Longitude (degr?? d??cimal) : X", ""),
      (107, "Latitude (degr?? d??cimal) : Y", 0, 1, 3, 1, NULL, 103, NULL, "Latitude (degr?? d??cimal) : Y", ""),
      (108, "Shapefile correspondant biodiversit??", 0, 1, 3, 0, NULL, 103, NULL, "Shapefile correspondant biodiversit??", ""),
      (109, "Statut UICN", 0, 1, 3, 0, NULL, 103, NULL, "Statut UICN", ""),
      (110, "End??mique (oui/non)", 0, 1, 3, 0, NULL, 103, NULL, "End??mique (oui/non)", ""),
      (111, "Ressource phare (oui/non)", 0, 1, 3, 0, NULL, 103, NULL, "Ressource phare (oui/non)", ""),
      (112, "Ressource menac??e (oui/non)", 0, 1, 3, 0, NULL, 103, NULL, "Ressource menac??e (oui/non)", ""),
      (113, "Cible de conservation (oui/non)", 0, 1, 3, 0, NULL, 103, NULL, "Cible de conservation (oui/non)", ""),
      (114, "Nom de l'AP de provenance de la ressource", 0, 1, 3, 0, NULL, 103, NULL, "Nom de l'AP de provenance de la ressource", ""),
      (115, "Liste des menaces et pressions recens??es", 0, 1, 3, 0, NULL, 103, NULL, "Liste des menaces et pressions recens??es", ""),
      (116, "Liste PFL associ??s", 0, 1, 3, 0, NULL, 103, NULL, "Liste PFL associ??s", ""),
      (117, "PFL inscrit dans CITES (oui/non)", 0, 1, 3, 0, NULL, 103, NULL, "PFL inscrit dans CITES (oui/non)", ""),
      (118, "Liste PFNL associ??s", 0, 1, 3, 0, NULL, 103, NULL, "Liste PFNL associ??s", ""),
      (119, "PFNL inscrit dans CITES (oui/non)", 0, 1, 3, 0, NULL, 103, NULL, "PFNL inscrit dans CITES (oui/non)", ""),
      (120, "Existence de fili??re concernant la ressource/biodiversit?? (oui/non)", 0, 1, 3, 0, NULL, 103, NULL, "Existence de fili??re concernant la ressource/biodiversit?? (oui/non)", ""),
      (121, "Appui financier et/ou technique de la fili??re (oui/non)", 0, 1, 3, 0, NULL, 103, NULL, "Appui financier et/ou technique de la fili??re (oui/non)", ""),
      (122, "Source de financement de l'inventaire de biodiversit?? (interne ou externe)", 0, 1, 3, 1, NULL, 103, NULL, "Source de financement de l'inventaire de biodiversit?? (interne ou externe)", ""),
      (123, "Projet d'appui pour l'inventaire de biodiversit?? (si externe)", 0, 1, 3, 1, NULL, 103, NULL, "Projet d'appui pour l'inventaire de biodiversit?? (si externe)", ""),
      (124, "Esp??ce objet de trafic illicite (oui/non)", 0, 1, 3, 1, NULL, 103, NULL, "Esp??ce objet de trafic illicite (oui/non)", ""),
      (125, "Date de constat", 0, 1, 3, 0, NULL, 103, NULL, "Date de constat", ""),
      (126, "Quantit?? saisie", 0, 1, 3, 1, NULL, 103, NULL, "Quantit?? saisie", ""),
      (127, "Unit?? de mesures des effets saisis", 0, 1, 3, 0, NULL, 103, NULL, "Unit?? de mesures des effets saisis", ""),
      (128, "Dossier de traffic trait?? (oui/non)", 0, 1, 3, 0, NULL, 103, NULL, "Dossier de traffic trait?? (oui/non)", ""),
      (129, "R??f??rence du dossier", 0, 1, 3, 0, NULL, 103, NULL, "R??f??rence du dossier", ""),
      (130, "Images de la biodiversit??", 0, 1, 3, 0, NULL, 103, NULL, "Images de la biodiversit??", ""),
      (131, "Observations biodiversit??", 0, 1, 3, 0, NULL, 103, NULL, "Observations biodiversit??", ""),
      (132, "Source de donn??es biodiversit??", 0, 1, 3, 1, NULL, 103, NULL, "Source de donn??es biodiversit??", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 103 WHERE id = 11`);
    sql.push(`UPDATE indicateur set id_question = 126 WHERE id = 12`);

    //Cadre national et international

    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (13, "Nombre total de textes", "", 5, 0, 0, 1),
      (14, "Nombre de textes mis ?? jour", "", 5, 0, 0, 1),
      (15, "Nombre de texte", "", 5, 0, 0, 1),
      (16, "Nombre de textes adopt??s", "", 5, 0, 0, 1)`
    );
    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (133, "Intitul?? du cadre", 1, 1, 3, 1, NULL, NULL, NULL, "Intitul?? du cadre", ""),
      (134, "Type (Convention, Loi, D??cret, Arr??t??, Circulaire)", 0, 1, 3, 1, 15, 133, NULL, "Type (Convention, Loi, D??cret, Arr??t??, Circulaire)", ""),
      (135, "Cadre legislatif ou technique", 0, 1, 3, 1, NULL, 133, NULL, "Cadre legislatif ou technique", ""),
      (136, "Th??matique", 0, 1, 3, 1, NULL, 133, NULL, "Th??matique", ""),
      (137, "Objectifs du cadre", 0, 1, 3, 1, NULL, 133, NULL, "Objectifs du cadre", ""),
      (138, "Date de promulgation", 0, 1, 3, 1, NULL, 133, NULL, "Date de promulgation", ""),
      (139, "Date de validation", 0, 1, 3, 1, NULL, 133, NULL, "Date de validation", ""),
      (140, "Secteur concern?? par le cadre", 0, 1, 3, 1, NULL, 133, NULL, "Secteur concern?? par le cadre", ""),
      (141, "L??giferer (oui/non)", 0, 1, 3, 1, NULL, 133, NULL, "L??giferer (oui/non)", ""),
      (142, "Nouveau (oui/non)", 0, 1, 3, 1, NULL, 133, NULL, "Nouveau (oui/non)", ""),
      (143, "Mis ?? jour (oui/non)", 0, 1, 3, 1, 14, 133, NULL, "Mis ?? jour (oui/non)", ""),
      (144, "Ratifi?? (oui/non)", 0, 1, 3, 1, NULL, 133, NULL, "Ratifi?? (oui/non)", ""),
      (145, "Adopt?? (oui/non)", 0, 1, 3, 1, 16, 133, NULL, "Adopt?? (oui/non)", ""),
      (146, "Cadre mis en ??uvre (oui/non)", 0, 1, 3, 1, NULL, 133, NULL, "Cadre mis en ??uvre (oui/non)", ""),
      (147, "Int??grant la coh??rence intersectorielle sur la gestion environnementale et climatique (oui/non)", 0, 1, 3, 1, NULL, 133, NULL, "Int??grant la coh??rence intersectorielle sur la gestion environnementale et climatique (oui/non)", ""),
      (148, "Textes d'application (liste)", 0, 1, 3, 1, NULL, 133, NULL, "Textes d'application (liste)", ""),
      (149, "Observations cadre", 0, 1, 3, 0, NULL, 133, NULL, "Observations cadre", ""),
      (150, "Source de donn??es cadre", 0, 1, 3, 1, NULL, 133, NULL, "Source de donn??es cadre", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 133 WHERE id = 13`);
    sql.push(`UPDATE indicateur set id_question = 133 WHERE id = 14`);
    sql.push(`UPDATE indicateur set id_question = 133 WHERE id = 15`);
    sql.push(`UPDATE indicateur set id_question = 133 WHERE id = 16`);

    // CC et REDD+
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (18, "Nombre de victime touch??es par les catastrophes naturelles", "", 6, 1, 0, 0)`
    );
    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (151, "Nature des catastrophes naturelles", 1, 1, 3, 1, NULL, NULL, NULL, "Nature des catastrophes naturelles", ""),
      (167, "Date de la catastrophe naturelle", 0, 1, 3, 1, NULL, 151, NULL, "Date de la catastrophe naturelle", ""),
      (168, "Nombre de victimes corporelles dues aux catastrophes naturelles", 0, 1, 3, 1, NULL, 151, NULL, "Nombre de victimes corporelles dues aux catastrophes naturelles", ""),
      (169, "Nombre de personnes d??plac??es pour cause d???al??as climatiques", 0, 1, 3, 1, NULL, 151, NULL, "Nombre de personnes d??plac??es pour cause d???al??as climatiques", ""),
      (170, "Mat??riels endommag??s dus aux catastrophes naturelles", 0, 1, 3, 1, NULL, 151, NULL, "Mat??riels endommag??s dus aux catastrophes naturelles", ""),
      (171, "Ampleur des dommages mat??riels dus aux catastrophes naturelles (faible, moyen, fort)", 0, 1, 3, 1, NULL, 151, NULL, "Ampleur des dommages mat??riels dus aux catastrophes naturelles (faible, moyen, fort)", ""),
      (172, "Liste de zones enclav??es suite aux al??as climatiques", 0, 1, 3, 1, NULL, 151, NULL, "Liste de zones enclav??es suite aux al??as climatiques", ""),
      (173, "Observations CC et REDD+", 0, 1, 3, 1, NULL, 151, NULL, "Observations CC et REDD+", ""),
      (174, "Source de donn??es CC et REDD+", 0, 1, 3, 1, NULL, 151, NULL, "Source de donn??es CC et REDD+", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 168 WHERE id = 18`);

    // CC et REDD+ (centrale)
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (87, "Nombre de m??nages b??n??ficiaires d'action de lutte contre le changement climatique", "", 7, 1, 0, 0),
      (88, "Surface de for??ts g??r??es dans le cadre du CC et REDD+", "", 7, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (735, "Nom des plans de mise en ??uvre de la Politique Nationale de Lutte contre le Changement Climatique mise en place", 1, 1, 3, 1, NULL, NULL, NULL, "Nom des plans de mise en ??uvre de la Politique Nationale de Lutte contre le Changement Climatique mise en place", ""),
      (736, "Nom de projet d'adaptation et r??silience au changement climatique et REDD+", 0, 1, 3, 1, NULL, 735, NULL, "Nom de projet d'adaptation et r??silience au changement climatique et REDD+", ""),
      (737, "Plan et projet mis en ??uvre (oui/non)", 0, 1, 3, 1, NULL, 735, NULL, "Plan et projet mis en ??uvre (oui/non)", ""),
      (738, "Activit??s sectorielles ou projets int??grant le climat et le changement climatique (liste)", 0, 1, 3, 1, NULL, 735, NULL, "Activit??s sectorielles ou projets int??grant le climat et le changement climatique (liste)", ""),
      (739, "Stations climatologiques participant ?? la veille climatique et agrom??t??orologique (liste)", 0, 1, 3, 1, NULL, 735, NULL, "Stations climatologiques participant ?? la veille climatique et agrom??t??orologique (liste)", ""),
      (740, "Action de lutte contre le changement climatique int??gr??e dans la promotion d'une ??conomie r??siliente (liste)", 0, 1, 3, 1, NULL, 735, NULL, "Action de lutte contre le changement climatique int??gr??e dans la promotion d'une ??conomie r??siliente (liste)", ""),
      (741, "Commune d'intervention pour la lutte contre CC", 0, 1, 3, 1, NULL, 735, NULL, "Commune d'intervention pour la lutte contre CC", ""),
      (742, "Nombre de m??nages b??n??ficiaires pour la lutte contre CC", 0, 1, 3, 1, NULL, 735, NULL, "Nombre de m??nages b??n??ficiaires pour la lutte contre CC", ""),
      (743, "Nombre de femmes b??n??ficiaires pour la lutte contre CC", 0, 1, 3, 1, NULL, 735, NULL, "Nombre de femmes b??n??ficiaires pour la lutte contre CC", ""),
      (744, "Nombre de jeunes b??n??ficiaires pour la lutte contre CC", 0, 1, 3, 1, NULL, 735, NULL, "Nombre de jeunes b??n??ficiaires pour la lutte contre CC", ""),
      (745, "Source de financement pour la lutte contre CC (interne ou externe)", 0, 1, 3, 1, NULL, 735, NULL, "Source de financement pour la lutte contre CC (interne ou externe)", ""),
      (746, "Projet d'appui pour la lutte contre CC (si externe)", 0, 1, 3, 1, NULL, 735, NULL, "Projet d'appui pour la lutte contre CC (si externe)", ""),
      (747, "Surface de for??ts g??r??es dans le cadre du CC et REDD+ (ha)", 0, 1, 3, 1, NULL, 735, NULL, "Surface de for??ts g??r??es dans le cadre du CC et REDD+ (ha)", ""),
      (748, "Shapefile correspondant CC et REDD+", 0, 1, 3, 1, NULL, 735, NULL, "Shapefile correspondant CC et REDD+", ""),
      (749, "Taux d'emission de CO2 (%)", 0, 1, 3, 1, NULL, 735, NULL, "Taux d'emission de CO2 (%)", ""),
      (750, "Observations CC, REDD+", 0, 1, 3, 0, NULL, 735, NULL, "Observations CC, REDD+", ""),
      (751, "Source de donn??es CC, REDD+", 0, 1, 3, 1, NULL, 735, NULL, "Source de donn??es CC, REDD+", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 742 WHERE id = 87`);
    sql.push(`UPDATE indicateur set id_question = 747 WHERE id = 88`);

    //Controles environnementaux
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (19, "Nombre de contr??les environnementaux effectu??s", "", 8, 0, 0, 1),
      (20, "Nombre d'infractions environnementales constat??es", "", 8, 1, 0, 0),
      (21, "Nombre de dossiers d'infractions environnementales trait??s", "", 8, 1, 0, 0),
      (22, "Nombre de plaintes environnementales re??ues", "", 8, 1, 0, 0),
      (23, "Nombre de plaintes environnementales trait??es (par secteur)", "", 8, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (175, "Intitul?? de la mission de contr??le environnemental", 1, 1, 3, 1, NULL, NULL, NULL, "Intitul?? de la mission de contr??le environnemental", ""),
      (176, "Date de la mission de contr??le environnemental", 0, 1, 3, 0, NULL, 175, NULL, "Date de la mission de contr??le environnemental", ""),
      (177, "Mission de contr??le environnemental effectu??e ou r??alis??e (oui/non)", 0, 1, 3, 1, NULL, 175, NULL, "Mission de contr??le environnemental effectu??e ou r??alis??e (oui/non)", ""),
      (178, "Commune de r??alisation du contr??le environnemental", 0, 1, 3, 1, NULL, 175, NULL, "Commune de r??alisation du contr??le environnemental", ""),
      (179, "Nombre d'infraction environnementale", 0, 1, 3, 1, NULL, 175, NULL, "Nombre d'infraction environnementale", ""),
      (180, "Nature de l'infraction environnementale", 0, 1, 3, 0, NULL, 175, NULL, "Nature de l'infraction environnementale", ""),
      (181, "Motif de PV d'infraction environnementale ??tabli (constat)", 0, 1, 3, 0, NULL, 175, NULL, "Motif de PV d'infraction environnementale ??tabli (constat)", ""),
      (182, "R??f??rence de dossiers d'infractions environnementales", 0, 1, 3, 1, NULL, 175, NULL, "R??f??rence de dossiers d'infractions environnementales", ""),
      (183, "Nombre de dossier d'infractions environnementales trait??", 0, 1, 3, 1, NULL, 175, NULL, "Nombre de dossier d'infractions environnementales trait??", ""),
      (184, "Existence de dispositifs de contr??le environnemental de proximit?? (oui/non)", 0, 1, 3, 0, NULL, 175, NULL, "Existence de dispositifs de contr??le environnemental de proximit?? (oui/non)", ""),
      (185, "Dispositifs de contr??le redynamis??s (oui/non)", 0, 1, 3, 0, NULL, 175, NULL, "Dispositifs de contr??le redynamis??s (oui/non)", ""),
      (186, "Nombre de plaintes environnementales re??ues", 0, 1, 3, 1, NULL, 175, NULL, "Nombre de plaintes environnementales re??ues", ""),
      (187, "Intitul?? de plaintes environnementales d??pos??es avec r??f??rence", 0, 1, 3, 0, NULL, 175, NULL, "Intitul?? de plaintes environnementales d??pos??es avec r??f??rence", ""),
      (188, "Date de d??position de la plainte", 0, 1, 3, 0, NULL, 175, NULL, "Date de d??position de la plainte", ""),
      (189, "Nombre de plaintes environnementales trait??es", 0, 1, 3, 1, NULL, 175, NULL, "Nombre de plaintes environnementales trait??es", ""),
      (190, "Secteur concern?? (Agriculture, Industrie, Service)", 0, 1, 3, 1, 23, 175, NULL, "Secteur concern?? (Agriculture, Industrie, Service)", ""),
      (191, "Date de d??but de traitement", 0, 1, 3, 0, NULL, 175, NULL, "Date de d??but de traitement", ""),
      (192, "Nombre de plaintes environnementales r??solues", 0, 1, 3, 1, NULL, 175, NULL, "Nombre de plaintes environnementales r??solues", ""),
      (193, "Date de r??solution des plaintes", 0, 1, 3, 0, NULL, 175, NULL, "Date de r??solution des plaintes", ""),
      (194, "Mesures correctives et recommandations", 0, 0, 3, 1, NULL, 175, NULL, "Mesures correctives et recommandations", ""),
      (195, "Observations contr??les environnementaux", 0, 0, 3, 1, NULL, 175, NULL, "Observations contr??les environnementaux", ""),
      (196, "Source de donn??es contr??les environnementaux", 0, 1, 3, 1, NULL, 175, NULL, "Source de donn??es contr??les environnementaux", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 175 WHERE id = 19`);
    sql.push(`UPDATE indicateur set id_question = 179 WHERE id = 20`);
    sql.push(`UPDATE indicateur set id_question = 183 WHERE id = 21`);
    sql.push(`UPDATE indicateur set id_question = 186 WHERE id = 22`);
    sql.push(`UPDATE indicateur set id_question = 189 WHERE id = 23`);

    // Controle forestier
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (24, "Nombre de contr??les forestiers effectu??s", "", 9, 0, 0, 1),
      (25, "Nombre d'infractions foresti??res constat??es", "", 9, 1, 0, 0),
      (26, "Nombre de dossiers d'infractions foresti??res trait??s", "", 9, 1, 0, 0),
      (27, "Nombre d'infractions forestiers d??f??r??es", "", 9, 1, 0, 0),
      (28, "Nombre de cas de transaction avant jugement", "", 9, 1, 0, 0),
      (29, "Quantit?? de produits saisis (par type de produit)", "", 9, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (197, "Intitul?? de la mission de contr??le forestier", 1, 1, 3, 1, NULL, NULL, NULL, "Intitul?? de la mission de contr??le forestier", ""),
      (198, "Date de la mission de contr??le forestier", 0, 1, 3, 0, NULL, 197, NULL, "Date de la mission de contr??le forestier", ""),
      (199, "Mission de contr??le forestier effectu??e ou r??alis??e (oui/non)", 0, 1, 3, 1, NULL, 197, NULL, "Mission de contr??le forestier effectu??e ou r??alis??e (oui/non)", ""),
      (200, "Commune de r??alisation du contr??le forestier", 0, 1, 3, 0, NULL, 197, NULL, "Commune de r??alisation du contr??le forestier", ""),
      (201, "Nombre d'infraction foresti??re", 0, 1, 3, 1, NULL, 197, NULL, "Nombre d'infraction foresti??re", ""),
      (202, "Motif du PV d'infraction foresti??re (constat)", 0, 1, 3, 0, NULL, 197, NULL, "Motif du PV d'infraction foresti??re (constat)", ""),
      (203, "Intitul?? du PV de saisie avec r??f??rence", 0, 1, 3, 1, NULL, 197, NULL, "Intitul?? du PV de saisie avec r??f??rence", ""),
      (204, "Type de produit saisi (PFL, PFNL)", 0, 1, 3, 0, 29, 197, NULL, "Type de produit saisi (PFL, PFNL)", ""),
      (205, "Nature du produit saisi (brut, fini)", 0, 1, 3, 0, NULL, 197, NULL, "Nature du produit saisi (brut, fini)", ""),
      (206, "Esp??ce du produit saisi", 0, 1, 3, 0, NULL, 197, NULL, "Esp??ce du produit saisi", ""),
      (207, "Date de saisi du produit", 0, 1, 3, 0, NULL, 197, NULL, "Date de saisi du produit", ""),
      (208, "Designation du produit saisi", 0, 1, 3, 27, NULL, 197, NULL, "Designation du produit saisi", ""),
      (209, "Quantit?? de produit saisi", 0, 1, 3, 1, NULL, 197, NULL, "Quantit?? de produit saisi", ""),
      (210, "Date de sequestre", 0, 1, 3, 0, NULL, 197, NULL, "Date de sequestre", ""),
      (211, "Localisation des produits sequestr??s (localit??)", 0, 1, 3, 0, NULL, 197, NULL, "Localisation des produits sequestr??s (localit??)", ""),
      (212, "R??f??rence conclusions emis par les repr??sentants minist??riels vers le parquet", 0, 1, 3, 0, NULL, 197, NULL, "R??f??rence conclusions emis par les repr??sentants minist??riels vers le parquet", ""),
      (213, "Nombre infraction d??f??r??e", 0, 1, 3, 1, NULL, 197, NULL, "Nombre infraction d??f??r??e", ""),
      (214, "Intitul?? du dossier transmis au parquet avec r??f??rence", 0, 1, 3, 1, NULL, 197, NULL, "Intitul?? du dossier transmis au parquet avec r??f??rence", ""),
      (215, "Nombre de transaction avant jugement", 0, 1, 3, 1, NULL, 197, NULL, "Nombre de transaction avant jugement", ""),
      (216, "Nature de l'infraction verbalis??e", 0, 1, 3, 0, NULL, 197, NULL, "Nature de l'infraction verbalis??e", ""),
      (217, "R??f??rence de dossiers d'infractions foresti??res", 0, 1, 3, 1, NULL, 197, NULL, "R??f??rence de dossiers d'infractions foresti??res", ""),
      (218, "Nombre de dossier d'infractions foresti??res trait??", 0, 1, 3, 1, NULL, 197, NULL, "Nombre de dossier d'infractions foresti??res trait??", ""),
      (219, "Mesures correctives et recommandations", 0, 1, 3, 0, NULL, 197, NULL, "Mesures correctives et recommandations", ""),
      (220, "Existence de dispositifs de contr??le forestier de proximit?? (oui/non)", 0, 1, 3, 0, NULL, 197, NULL, "Existence de dispositifs de contr??le forestier de proximit?? (oui/non)", ""),
      (221, "En cas d??frichement, surface defrich??e (ha)", 0, 1, 3, 0, NULL, 197, NULL, "En cas d??frichement, surface defrich??e (ha)", ""),
      (222, "Dispositifs de contr??le redynamis??s (oui/non)", 0, 1, 3, 0, NULL, 197, NULL, "Dispositifs de contr??le redynamis??s (oui/non)", ""),
      (223, "Observations contr??les forestiers", 0, 1, 3, 0, NULL, 197, NULL, "Observations contr??les forestiers", ""),
      (224, "Source de donn??es contr??les forestiers", 0, 1, 3, 1, NULL, 197, NULL, "Source de donn??es contr??les forestiers", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 197 WHERE id = 24`);
    sql.push(`UPDATE indicateur set id_question = 201 WHERE id = 25`);
    sql.push(`UPDATE indicateur set id_question = 218 WHERE id = 26`);
    sql.push(`UPDATE indicateur set id_question = 213 WHERE id = 27`);
    sql.push(`UPDATE indicateur set id_question = 215 WHERE id = 28`);
    sql.push(`UPDATE indicateur set id_question = 209 WHERE id = 29`);

    //Partenariat
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (30, "Nombre de conventions de partenariat d??velopp??es et sign??es", "", 10, 0, 0, 1),
      (31, "Nombre de projets issus des partenariats", "", 10, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (225, "Nom de la Convention de partenariat ??labor??e", 1, 1, 3, 1, NULL, NULL, NULL, "Nom de la Convention de partenariat ??labor??e", ""),
      (226, "Type de partenariat (PPP, international, ???)", 0, 1, 3, 0, NULL, 225, NULL, "Type de partenariat (PPP, international, ???)", ""),
      (227, "Convention de partenariat sign??e (oui/non)", 0, 1, 3, 1, NULL, 225, NULL, "Convention de partenariat sign??e (oui/non)", ""),
      (228, "Objet de la convention de partenariat", 0, 1, 3, 1, NULL, 225, NULL, "Objet de la convention de partenariat", ""),
      (229, "Il s'agit de projet (oui/non)", 0, 1, 3, 1, 31, 225, NULL, "Il s'agit de projet (oui/non)", ""),
      (230, "si oui, quel/quels projet(s) ?", 0, 1, 3, 1, NULL, 225, NULL, "si oui, quel/quels projet(s) ?", ""),
      (231, "Date d'??laboration de la convention de partenariat", 0, 1, 3, 0, NULL, 225, NULL, "Date d'??laboration de la convention de partenariat", ""),
      (232, "Date de signature de la convention de partenariat", 0, 1, 3, 0, NULL, 225, NULL, "Date de signature de la convention de partenariat", ""),
      (233, "Entit??s signataires", 0, 1, 3, 0, NULL, 225, NULL, "Entit??s signataires", ""),
      (234, "Dur??e de la convention de partenariat", 0, 1, 3, 0, NULL, 225, NULL, "Dur??e de la convention de partenariat", ""),
      (235, "Cibles de la convention de partenariat", 0, 1, 3, 0, NULL, 225, NULL, "Cibles de la convention de partenariat", ""),
      (236, "Nombre de m??nages b??n??ficiaires dans le cadre du partenariat", 0, 1, 3, 0, NULL, 225, NULL, "Nombre de m??nages b??n??ficiaires dans le cadre du partenariat", ""),
      (237, "Observations partenariat", 0, 1, 3, 0, NULL, 225, NULL, "Observations partenariat", ""),
      (238, "Source de donn??es partenariat", 0, 1, 3, 1, NULL, 225, NULL, "Source de donn??es partenariat", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 225 WHERE id = 30`);
    sql.push(`UPDATE indicateur set id_question = 229 WHERE id = 31`);

    // Economie verte
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (32, "Nombre de certifications vertes promues par cha??ne de valeurs li??es aux ressources naturelles", "", 11, 0, 0, 1),
      (33, "Nombre d'emplois verts d??cents cr????s", "", 11, 1, 0, 0),
      (34, "Nombre d'alternative ??cologique promue", "", 11, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (239, "Commune d'implantation de l'??conomie verte", 1, 1, 3, 1, NULL, NULL, NULL, "Commune d'implantation de l'??conomie verte", ""),
      (240, "Cha??ne de valeur verte promue", 0, 1, 3, 1, 32, 239, NULL, "Cha??ne de valeur verte promue", ""),
      (241, "Ressource naturelle mise en jeu dans la cha??ne de valeur", 0, 1, 3, 0, NULL, 239, NULL, "Ressource naturelle mise en jeu dans la cha??ne de valeur", ""),
      (242, "Existence de certifications vertes promues par cha??ne de valeur li??e aux ressources naturelles (oui/non)", 0, 1, 3, 1, 32, 239, NULL, "Existence de certifications vertes promues par cha??ne de valeur li??e aux ressources naturelles (oui/non)", ""),
      (243, "Superficie (ha) des ressources g??r??es en vue de l???exploitation durable", 0, 1, 3, 0, NULL, 239, NULL, "Superficie (ha) des ressources g??r??es en vue de l???exploitation durable", ""),
      (244, "Nature du produit (PFNL ou PFL)", 0, 1, 3, 0, NULL, 239, NULL, "Nature du produit (PFNL ou PFL)", ""),
      (245, "Quantit?? produit brut", 0, 1, 3, 0, NULL, 239, NULL, "Quantit?? produit brut", ""),
      (246, "Unit?? produit brut", 0, 1, 3, 0, NULL, 239, NULL, "Unit?? produit brut", ""),
      (247, "Quantit?? produit brut vendu", 0, 1, 3, 0, NULL, 239, NULL, "Quantit?? produit brut vendu", ""),
      (248, "Unit?? produit brut vendu", 0, 1, 3, 0, NULL, 239, NULL, "Unit?? produit brut vendu", ""),
      (249, "Prix unitaire de vente de produit brut (Ariary)", 0, 1, 3, 0, NULL, 239, NULL, "Prix unitaire de vente de produit brut (Ariary)", ""),
      (250, "Quantit?? produit transform??", 0, 1, 3, 0, NULL, 239, NULL, "Quantit?? produit transform??", ""),
      (251, "Unit?? produit transform??", 0, 1, 3, 0, NULL, 239, NULL, "Unit?? produit transform??", ""),
      (252, "Quantit?? produit transform?? vendu", 0, 1, 3, 0, NULL, 239, NULL, "Quantit?? produit transform?? vendu", ""),
      (253, "Unit?? produit transform?? vendu", 0, 1, 3, 0, NULL, 239, NULL, "Unit?? produit transform?? vendu", ""),
      (254, "Prix unitaire de vente de produit transform?? (Ariary)", 0, 1, 3, 0, NULL, 239, NULL, "Prix unitaire de vente de produit transform?? (Ariary)", ""),
      (255, "Destination des produits (vente locale, exportation, ???)", 0, 1, 3, 0, NULL, 239, NULL, "Destination des produits (vente locale, exportation, ???)", ""),
      (256, "Nombre de m??nages b??n??ficiaires??de la cha??ne de valeur", 0, 1, 3, 0, NULL, 239, NULL, "Nombre de m??nages b??n??ficiaires??de la cha??ne de valeur", ""),
      (257, "Nombre de femmes b??n??ficiaires de la cha??ne de valeur", 0, 1, 3, 0, NULL, 239, NULL, "Nombre de femmes b??n??ficiaires de la cha??ne de valeur", ""),
      (258, "Nombre de jeune b??n??ficiaires de la cha??ne de valeur (15 ?? 24 ans)", 0, 1, 3, 0, NULL, 239, NULL, "Nombre de jeune b??n??ficiaires de la cha??ne de valeur (15 ?? 24 ans)", ""),
      (259, "Nombre total de personnes impliqu??es??directement dans la cha??ne de valeur", 0, 1, 3, 0, NULL, 239, NULL, "Nombre total de personnes impliqu??es??directement dans la cha??ne de valeur", ""),
      (260, "Existence de suivis ??cologiques (oui/non)", 0, 1, 3, 0, NULL, 239, NULL, "Existence de suivis ??cologiques (oui/non)", ""),
      (261, "Cha??ne de valeur appuy??e financi??rement et/ou techniquement (oui/non)", 0, 1, 3, 0, NULL, 239, NULL, "Cha??ne de valeur appuy??e financi??rement et/ou techniquement (oui/non)", ""),
      (262, "Organisme d'appui de la cha??ne de valeur", 0, 1, 3, 1, NULL, 239, NULL, "Organisme d'appui de la cha??ne de valeur", ""),
      (263, "Projet d'appui de la cha??ne de valeur", 0, 1, 3, 1, NULL, 239, NULL, "Projet d'appui de la cha??ne de valeur", ""),
      (264, "Nombre d'emplois verts d??cents cr????s", 0, 1, 3, 1, NULL, 239, NULL, "Nombre d'emplois verts d??cents cr????s", ""),
      (265, "Nombre total d'empoy??s recrut??s par les emplois verts cr????s", 0, 1, 3, 0, NULL, 239, NULL, "Nombre total d'empoy??s recrut??s par les emplois verts cr????s", ""),
      (266, "Nombre de femme employ??es dans les emplois verts", 0, 1, 3, 0, NULL, 239, NULL, "Nombre de femme employ??es dans les emplois verts", ""),
      (267, "Types d'alternatives d??velopp??es (charbon vert, r??sidus de culture, gaz butane, ethanol, ??nergie solaire, biogaz, sac ??cologique, autres)", 0, 1, 3, 1, NULL, 239, NULL, "Types d'alternatives d??velopp??es (charbon vert, r??sidus de culture, gaz butane, ethanol, ??nergie solaire, biogaz, sac ??cologique, autres)", ""),
      (268, "Quantit?? produite par type d'alternative", 0, 1, 3, 0, NULL, 239, NULL, "Quantit?? produite par type d'alternative (liste)", ""),
      (269, "Alternative promue (oui/non)", 0, 1, 3, 1, 34, 239, NULL, "Alternative promue (oui/non)", ""),
      (270, "Nombre total de m??nage adoptant les alternatives", 0, 1, 3, 0, NULL, 239, NULL, "Nombre total de m??nage adoptant les alternatives", ""),
      (271, "Prix unitaire des alternatives (Ariary)", 0, 1, 3, 0, NULL, 239, NULL, "Prix unitaire des alternatives (Ariary)", ""),
      (272, "Observations ??conomie verte", 0, 1, 3, 0, NULL, 239, NULL, "Observations ??conomie verte", ""),
      (273, "Source de donn??es ??conomie verte", 0, 1, 3, 0, NULL, 239, NULL, "Source de donn??es ??conomie verte", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 242 WHERE id = 32`);
    sql.push(`UPDATE indicateur set id_question = 264 WHERE id = 33`);
    sql.push(`UPDATE indicateur set id_question = 269 WHERE id = 34`);

    // Environnement (pollution, ??valuation environnemental,...)
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (35, "Nombre de mise en conformit??, permis et/ou autorisation environnementale (PREE), permis environnementaux d??livr??s", "", 12, 0, 0, 1),
      (36, "Nombre d'infrastructures de gestion de d??chets cr????es", "", 12, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (274, "Nom de l'infrastructure de gestion de pollution mis en place", 1, 1, 3, 1, NULL, NULL, NULL, "Nom de l'infrastructure de gestion de pollution mis en place", ""),
      (275, "Objet de l'infrastructure de gestion de pollution mis en place (centre de tri, centre de traitement des d??chets)", 0, 1, 3, 1, NULL, 274, NULL, "Objet de l'infrastructure de gestion de pollution mis en place (centre de tri, centre de traitement des d??chets)", ""),
      (276, "Type de d??chets trait??s (solides, m??dicaux, ??l??ctroniques, liquides???)", 0, 1, 3, 1, NULL, 274, NULL, "Type de d??chets trait??s (solides, m??dicaux, ??l??ctroniques, liquides???)", ""),
      (277, "Commune d'implantantion de l'infrastructure de gestion de pollution", 0, 1, 3, 1, NULL, 274, NULL, "Commune d'implantantion de l'infrastructure de gestion de pollution", ""),
      (278, "Date de cr??ation de l'infrastructure", 0, 1, 3, 0, NULL, 274, NULL, "Date de cr??ation de l'infrastructure", ""),
      (279, "Infrastucture de gestion de pollution op??rationnelle (oui/non)", 0, 1, 3, 0, NULL, 274, NULL, "Infrastucture de gestion de pollution op??rationnelle (oui/non)", ""),
      (280, "D??chets valoris??s par an (kg)", 0, 1, 3, 0, NULL, 274, NULL, "D??chets valoris??s par an (kg)", ""),
      (281, "Disponibilit?? de kit d'analyse et de contr??le de pollution (oui/non)", 0, 1, 3, 0, NULL, 274, NULL, "Disponibilit?? de kit d'analyse et de contr??le de pollution (oui/non)", ""),
      (282, "Existence des observatoires de pollution (oui/non)", 0, 1, 3, 0, NULL, 274, NULL, "Existence des observatoires de pollution (oui/non)", ""),
      (283, "Observatoire op??rationnel (oui/non)", 0, 1, 3, 0, NULL, 274, NULL, "Observatoire op??rationnel (oui/non)", ""),
      (284, "Disponibilit?? de d??charges d'ordures (oui/non)", 0, 1, 3, 0, NULL, 274, NULL, "Disponibilit?? de d??charges d'ordures (oui/non)", ""),
      (285, "Emplacement de la d??charge (localit??)", 0, 1, 3, 0, NULL, 274, NULL, "Emplacement de la d??charge (localit??)", ""),
      (286, "Decharge d'ordures op??rationnelle (oui/non)", 0, 1, 3, 1, NULL, 274, NULL, "Decharge d'ordures op??rationnelle (oui/non)", ""),
      (287, "Existence de laboratoires nationaux et de centres de recherches renforc??s techniquement et mat??riellement pour le traitement de d??chets (oui/non)", 0, 1, 3, 0, NULL, 274, NULL, "Existence de laboratoires nationaux et de centres de recherches renforc??s techniquement et mat??riellement pour le traitement de d??chets (oui/non)", ""),
      (288, "si oui, lequel/lesquels?", 0, 1, 3, 0, NULL, 274, NULL, "si oui, lequel/lesquels?", ""),
      (289, "Nom du projet d'investissement souhaitant s'implant??", 0, 1, 3, 1, NULL, 274, NULL, "Nom du projet d'investissement souhaitant s'implant??", ""),
      (290, "Secteur d'activit?? (Agriculture, Industriel, Service)", 0, 1, 3, 0, NULL, 274, NULL, "Secteur d'activit?? (Agriculture, Industriel, Service)", ""),
      (291, "Existence de permis environnementaux d??livr??s (oui/non)", 0, 1, 3, 0, 32, 274, NULL, "Existence de permis environnementaux d??livr??s (oui/non)", ""),
      (292, "Projet d'investissement conforme au D??cret MECIE (oui/non)", 0, 1, 3, 0, NULL, 274, NULL, "Projet d'investissement conforme au D??cret MECIE (oui/non)", ""),
      (293, "Date de quittance", 0, 1, 3, 0, NULL, 274, NULL, "Date de quittance", ""),
      (294, "Projet d'investissement ayant un Programme d'Engagement Environnemental (PREE) (oui/non)", 0, 1, 3, 0, NULL, 274, NULL, "Projet d'investissement ayant un Programme d'Engagement Environnemental (PREE) (oui/non)", ""),
      (295, "Existence de suivi environnemental men?? sur la mise en ??uvre de cahiers des charges environnementales (oui/non)", 0, 1, 3, 0, NULL, 274, NULL, "Existence de suivi environnemental men?? sur la mise en ??uvre de cahiers des charges environnementales (oui/non)", ""),
      (296, "Activit??s relatives ?? l'??ducation environnementale r??alis??es (liste)", 0, 1, 3, 0, NULL, 274, NULL, "Activit??s relatives ?? l'??ducation environnementale r??alis??es (liste)", ""),
      (297, "Nombre des agents asserment??s en tant qu'OPJ pour les contr??les et inspections environnementales", 0, 1, 3, 0, NULL, 274, NULL, "Nombre des agents asserment??s en tant qu'OPJ pour les contr??les et inspections environnementales", ""),
      (298, "Observations environnement", 0, 1, 3, 1, NULL, 274, NULL, "Observations environnement", ""),
      (299, "Source de donn??es environnement", 0, 1, 3, 1, NULL, 274, NULL, "Source de donn??es environnement", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 291 WHERE id = 35`);
    sql.push(`UPDATE indicateur set id_question = 274 WHERE id = 36`);

    // Feux
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (37, "Surfaces br??l??es (par type)", "", 13, 1, 0, 0),
      (38, "Longueur totale de pare-feu", "", 13, 1, 0, 0),
      (39, "Nombre de structures op??rationnelles de gestion des feux", "", 13, 0, 0, 1),
      (40, "Nombre de structure de gestion des feux", "", 13, 0, 0, 1),
      (41, "Nombre de syst??me d'alerte de feux", "", 13, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (300, "Commune de localisation de point de feux et surfaces br??l??es suivant les points GPS des activit??s de patrouilles et de contr??le", 1, 1, 3, 1, NULL, NULL, NULL, "Commune de localisation de point de feux et surfaces br??l??es suivant les points GPS des activit??s de patrouilles et de contr??le", ""),
      (301, "Longitude point de feux (degr?? d??cimal) : X", 0, 1, 3, 1, NULL, 300, NULL, "Longitude point de feux (degr?? d??cimal) : X", ""),
      (302, "Latitude point de feux (degr?? d??cimal) : Y", 0, 1, 3, 1, NULL, 300, NULL, "Latitude point de feux (degr?? d??cimal) : Y", ""),
      (303, "Date de cas de feux", 0, 1, 3, 0, NULL, 300, NULL, "Date de cas de feux", ""),
      (304, "Shapefile des points de feux", 0, 1, 3, 1, NULL, 300, NULL, "Shapefile des points de feux", ""),
      (305, "Superficie des zones brul??es suivant les points GPS des activit??s de patrouilles et de contr??le sur terrain (ha)", 0, 1, 3, 1, NULL, 300, NULL, "Superficie des zones brul??es suivant les points GPS des activit??s de patrouilles et de contr??le sur terrain (ha)", ""),
      (306, "Type : For??t ou hors for??t", 0, 1, 3, 1, 37, 300, NULL, "Type : For??t ou hors for??t", ""),
      (307, "Shapefile des surfaces br??l??es", 0, 1, 3, 1, NULL, 300, NULL, "Shapefile des surfaces br??l??es", ""),
      (308, "Date de zones br??l??es", 0, 1, 3, 0, NULL, 300, NULL, "Date de zones br??l??es", ""),
      (309, "Existence de dispositifs de d??tection et suivi des feux (oui/non)", 0, 1, 3, 1, 38, 300, NULL, "Existence de dispositifs de d??tection et suivi des feux (oui/non)", ""),
      (310, "Emplacement de dispositifs de d??tection et suivi des feux (localit??)", 0, 1, 3, 0, NULL, 300, NULL, "Emplacement de dispositifs de d??tection et suivi des feux (localit??)", ""),
      (311, "Type de dispositif de d??tection et suivi des feux (cr????/renforc??)", 0, 1, 3, 0, NULL, 300, NULL, "Type de dispositif de d??tection et suivi des feux (cr????/renforc??)", ""),
      (312, "Dispositif de d??tection et suivi des feux op??rationnel (oui/non)", 0, 1, 3, 1, NULL, 300, NULL, "Dispositif de d??tection et suivi des feux op??rationnel (oui/non)", ""),
      (313, "Existence de comit??s/structures de lutte contre les feux (oui/non)", 0, 1, 3, 1, 40, 300, NULL, "Existence de comit??s/structures de lutte contre les feux (oui/non)", ""),
      (314, "Emplacement de comit??s/structures de lutte contre les feux (localit??)", 0, 1, 3, 0, NULL, 300, NULL, "Emplacement de comit??s/structures de lutte contre les feux (localit??)", ""),
      (315, "Type de comit??/structure de lutte contre les feux (cr????/renforc??)", 0, 1, 3, 1, NULL, 300, NULL, "Type de comit??/structure de lutte contre les feux (cr????/renforc??)", ""),
      (316, "Comit??/structure de lutte contre les feux form?? (oui/non)", 0, 1, 3, 1, NULL, 300, NULL, "Comit??/structure de lutte contre les feux form?? (oui/non)", ""),
      (317, "Comit??/structure de lutte contre les feux op??rationnel (oui/non)", 0, 1, 3, 1, 96, 300, NULL, "Comit??/structure de lutte contre les feux op??rationnel (oui/non)", ""),
      (318, "Emplacement du pare-feu (localit??)", 0, 1, 3, 0, NULL, 300, NULL, "Emplacement du pare-feu (localit??)", ""),
      (319, "Longitude pare-feu (degr?? d??cimal) : X", 0, 1, 3, 1, NULL, 300, NULL, "Longitude pare-feu (degr?? d??cimal) : X", ""),
      (320, "Latitude pare-feu (degr?? d??cimal) : Y", 0, 1, 3, 1, NULL, 300, NULL, "Latitude pare-feu (degr?? d??cimal) : Y", ""),
      (321, "Longueur de pare-feu ??tabli (km)", 0, 1, 3, 1, NULL, 300, NULL, "Longueur de pare-feu ??tabli (km)", ""),
      (322, "Shapefile des pare-feux", 0, 1, 3, 1, NULL, 300, NULL, "Shapefile des pare-feux", ""),
      (323, "Nature du pare-feu (nouvellement mis en place, entretenu)", 0, 1, 3, 0, NULL, 300, NULL, "Nature du pare-feu (nouvellement mis en place, entretenu)", ""),
      (324, "R??f??rence PV d'infraction (constatation de feux)", 0, 1, 3, 1, NULL, 300, NULL, "R??f??rence PV d'infraction (constatation de feux)", ""),
      (325, "Observations feux", 0, 1, 3, 0, NULL, 300, NULL, "Observations feux", ""),
      (326, "Source de donn??es feux", 0, 1, 3, 1, NULL, 300, NULL, "Source de donn??es feux", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 305 WHERE id = 37`);
    sql.push(`UPDATE indicateur set id_question = 321 WHERE id = 38`);
    sql.push(`UPDATE indicateur set id_question = 317 WHERE id = 39`);
    sql.push(`UPDATE indicateur set id_question = 313 WHERE id = 40`);
    sql.push(`UPDATE indicateur set id_question = 309 WHERE id = 41`);

    // Finance
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (42, "Recettes per??ues (par th??matiques d'int??r??ts)", "", 14, 1, 0, 0),
      (43, "Montant du fond public", "", 14, 1, 0, 0),
      (44, "Montant du financement ext??rieur ou priv??", "", 14, 1, 0, 0),
      (45, "Montant des dons", "", 14, 1, 0, 0),
      (46, "Montant de pr??ts budg??taires", "", 14, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (327, "Th??matiques d'inter??t du minist??re en charge des for??ts et de l'environnement", 1, 1, 3, 1, 39, NULL, NULL, "Th??matiques d'inter??t du minist??re en charge des for??ts et de l'environnement", ""),
      (328, "Activit??s ?? r??aliser", 0, 1, 3, 0, NULL, 327, NULL, "Activit??s ?? r??aliser", ""),
      (329, "Acteurs dans la r??alisatoin des activit??s", 0, 1, 3, 0, NULL, 327, NULL, "Acteurs dans la r??alisatoin des activit??s", ""),
      (330, "Budget pr??vu pour la r??alisation des activit??s pour le secteur environnement (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Budget pr??vu pour la r??alisation des activit??s pour le secteur environnement (Ariary)", ""),
      (331, "Budget de fonctionnement (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Budget de fonctionnement (Ariary)", ""),
      (332, "Montant du fond public (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Montant du fond public (Ariary)", ""),
      (333, "Montant du financement ext??rieur ou priv?? (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Montant du financement ext??rieur ou priv?? (Ariary)", ""),
      (334, "PIP/CDMT/ budgets programmes ??tablis (liste)", 0, 1, 3, 0, NULL, 327, NULL, "PIP/CDMT/ budgets programmes ??tablis (liste)", ""),
      (335, "Programmes/projets relatifs ?? la protection de l'environnement et la gestion des ressources naturelles/de la biodiversit?? ayant obtenus des financements ext??rieurs (liste)", 0, 1, 3, 0, NULL, 327, NULL, "Programmes/projets relatifs ?? la protection de l'environnement et la gestion des ressources naturelles/de la biodiversit?? ayant obtenus des financements ext??rieurs (liste)", ""),
      (336, "Mecanismes de perennisation financi??re mise en place et op??rationnel (liste)", 0, 1, 3, 0, NULL, 327, NULL, "Mecanismes de perennisation financi??re mise en place et op??rationnel (liste)", ""),
      (337, "Actions environnementales dans les programmes d'investissement r??gional/communal (liste)", 0, 1, 3, 0, NULL, 327, NULL, "Actions environnementales dans les programmes d'investissement r??gional/communal (liste)", ""),
      (338, "Montant allou?? pour action environnementale dans les programmes d'investissement r??gional/communal (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Montant allou?? par action environnementale dans les programmes d'investissement r??gional/communal (Ariary)", ""),
      (339, "Montant des dons  (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Montant des dons  (Ariary)", ""),
      (340, "Montant de pr??ts budg??taires (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Montant de pr??ts budg??taires (Ariary)", ""),
      (341, "Montant engag?? pour la r??alisation des activit??s (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Montant engag?? pour la r??alisation des activit??s (Ariary)", ""),
      (342, "Montant d??caiss?? pour la r??alisation des activit??s (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Montant d??caiss?? pour la r??alisation des activit??s (Ariary)", ""),
      (343, "Origine de recette (exploitation des PFL, collecte des PFNL, vente des produits saisis, exportation des PFL,exportation des PFNL, visites touristique dans les aires prot??g??es)", 0, 1, 3, 1, NULL, 327, NULL, "Origine de recette (exploitation des PFL, collecte des PFNL, vente des produits saisis, exportation des PFL,exportation des PFNL, visites touristique dans les aires prot??g??es)", ""),
      (344, "Recette per??ue (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Recette per??ue (Ariary)", ""),
      (345, "Observations finances", 0, 1, 3, 0, NULL, 327, NULL, "Observations finances", ""),
      (346, "Source de donn??es finances", 0, 1, 3, 1, NULL, 327, NULL, "Source de donn??es finances", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 344 WHERE id = 42`);
    sql.push(`UPDATE indicateur set id_question = 332 WHERE id = 43`);
    sql.push(`UPDATE indicateur set id_question = 333 WHERE id = 44`);
    sql.push(`UPDATE indicateur set id_question = 339 WHERE id = 45`);
    sql.push(`UPDATE indicateur set id_question = 340 WHERE id = 46`);

    // Information g??nerals
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (47, "Nombre de Districts", "", 15, 0, 0, 1),
      (48, "Nombre de communes", "", 15, 1, 0, 0),
      (49, "Nombre de population", "", 15, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (347, "Intitul?? du Districts", 1, 1, 3, 1, NULL, NULL, NULL, "Intitul?? du Districts", ""),
      (348, "Liste Communes", 0, 1, 3, 0, NULL, 347, NULL, "Liste Communes", ""),
      (349, "Nombre de communes", 0, 1, 3, 1, 48, 347, NULL, "Nombre de communes", ""),
      (350, "Nombre de population", 0, 1, 3, 1, 49, 347, NULL, "Nombre de population", ""),
      (351, "Nombre homme", 0, 1, 3, 1, NULL, 347, NULL, "Nombre homme", ""),
      (352, "Nombre femme", 0, 1, 3, 1, NULL, 347, NULL, "Nombre femme", ""),
      (353, "Nombre enfant", 0, 1, 3, 1, NULL, 347, NULL, "Nombre enfant", ""),
      (354, "Nombre de m??nage", 0, 1, 3, 1, NULL, 347, NULL, "Nombre de m??nage", ""),
      (355, "Association oeuvrant dans la gestion de l'environnement et des ressources naturelles (liste)", 0, 1, 3, 1, NULL, 347, NULL, "Association oeuvrant dans la gestion de l'environnement et des ressources naturelles (liste)", ""),
      (356, "Nombre total de membre des associations", 0, 1, 3, 1, NULL, 347, NULL, "Nombre total de membre des associations", ""),
      (357, "Nombre de projets en cours", 0, 1, 3, 1, NULL, 347, NULL, "Nombre de projets en cours", ""),
      (358, "Observations info g??n??rales", 0, 1, 3, 0, NULL, 347, NULL, "Observations info g??n??rales", ""),
      (359, "Source de donn??es info g??n??rales", 0, 1, 3, 1, NULL, 347, NULL, "Source de donn??es info g??n??rales", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 347 WHERE id = 47`);
    sql.push(`UPDATE indicateur set id_question = 349 WHERE id = 48`);
    sql.push(`UPDATE indicateur set id_question = 350 WHERE id = 49`);

    //IEC
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (50, "Nombre d'IEC effectu??es ", "", 16, 0, 0, 1),
      (51, "Nombre de participants form??s", "", 16, 1, 0, 0),
      (52, "Nombre d'agents de l'admnistration form??s", "", 16, 1, 0, 0),
      (53, "Nombre de s??ance de formation", "", 16, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (400, "Th??matique de l'IEC", 1, 1, 3, 1, NULL, NULL, NULL, "Th??matique de l'IEC", ""),
      (401, "Intitul?? de l'IEC", 0, 1, 3, 1, NULL, 400, NULL, "Intitul?? de l'IEC", ""),
      (402, "Nature de l'IEC (formation, sensibilisation)", 0, 1, 3, 1, 53, 400, NULL, "Nature de l'IEC (formation, sensibilisation)", ""),
      (403, "Support produit (designation)", 0, 1, 3, 0, NULL, 400, NULL, "Support produit (designation)", ""),
      (404, "Date de d??but et de fin de l'IEC", 0, 1, 3, 0, NULL, 400, NULL, "Date de d??but et de fin de l'IEC", ""),
      (405, "Initiateur de l'IEC", 0, 1, 3, 0, NULL, 400, NULL, "Initiateur de l'IEC", ""),
      (406, "Projet d'appui de l'IEC", 0, 1, 3, 1, NULL, 400, NULL, "Projet d'appui de l'IEC", ""),
      (407, "Nombre de s??ance", 0, 1, 3, 1, NULL, 400, NULL, "Nombre de s??ance", ""),
      (408, "Nombre total de participants", 0, 1, 3, 1, NULL, 400, NULL, "Nombre total de participants", ""),
      (409, "Nombre de participants - de 14 ans", 0, 1, 3, 1, NULL, 400, NULL, "Nombre de participants - de 14 ans", ""),
      (410, "Nombre de participants de 15 ?? 24 ans", 0, 1, 3, 1, NULL, 400, NULL, "Nombre de participants de 15 ?? 24 ans", ""),
      (411, "Nombre de participants 25 ans et +", 0, 1, 3, 1, NULL, 400, NULL, "Nombre de participants 25 ans et +", ""),
      (412, "Nombre de repr??sentant d'une OSC ayant particip??", 0, 1, 3, 1, NULL, 400, NULL, "Nombre de repr??sentant d'une OSC ayant particip??", ""),
      (413, "Nombre de repr??sentant de structures locales ayant particip??", 0, 1, 3, 1, NULL, 400, NULL, "Nombre de repr??sentant de structures locales ayant particip??", ""),
      (414, "Nombre d'agents de l'administration ayant particip??", 0, 1, 3, 1, NULL, 400, NULL, "Nombre d'agents de l'administration ayant particip??", ""),
      (415, "Cible (??l??ve, population locale, VOI, ???)", 0, 1, 3, 0, NULL, 400, NULL, "Cible (??l??ve, population locale, VOI, ???)", ""),
      (416, "Niveau d'intervention (District, Commune, Fokontany)", 0, 1, 3, 0, NULL, 400, NULL, "Niveau d'intervention (District, Commune, Fokontany)", ""),
      (417, "Nom de la Commune b??n??ficiant de l'IEC", 0, 1, 3, 1, NULL, 400, NULL, "Nom de la Commune b??n??ficiant de l'IEC", ""),
      (418, "Nom de la localit?? b??n??ficiant de l'IEC", 0, 1, 3, 0, NULL, 400, NULL, "Nom de la localit?? b??n??ficiant de l'IEC", ""),
      (419, "IEC m??dia classique (radio, t??l??vision, journaux)", 0, 1, 3, 1, NULL, 400, NULL, "IEC m??dia classique (radio, t??l??vision, journaux)", ""),
      (420, "IEC nouveau m??dia (r??seaux sociaux, ?? pr??ciser)", 0, 1, 3, 1, NULL, 400, NULL, "IEC nouveau m??dia (r??seaux sociaux, ?? pr??ciser)", ""),
      (421, "Observations IEC", 0, 1, 3, 0, NULL, 400, NULL, "Observations IEC", ""),
      (422, "Source de donn??es IEC", 0, 1, 3, 1, NULL, 400, NULL, "Source de donn??es IEC", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 401 WHERE id = 50`);
    sql.push(`UPDATE indicateur set id_question = 408 WHERE id = 51`);
    sql.push(`UPDATE indicateur set id_question = 414 WHERE id = 52`);
    sql.push(`UPDATE indicateur set id_question = 407 WHERE id = 53`);

    // Logistique infrastructure
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (54, "Nombre d'infrastructures fonctionnelles", "", 17, 0, 0, 1),
      (55, "Nombre d'infrastructures construites ou r??habilit??es", "", 17, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (423, "Type d'infrastructure (b??timent, route, barrage, ??cole, ???)", 1, 1, 3, 1, NULL, NULL, NULL, "Type d'infrastructure (b??timent, route, barrage, ??cole, ???)", ""),
      (424, "Destination (administrative, logement, garage, ???)", 0, 1, 3, 1, NULL, 423, NULL, "Destination (administrative, logement, garage, ???)", ""),
      (425, "Commune d'implantation de l'infrastructure", 0, 1, 3, 1, NULL, 423, NULL, "Commune d'implantation de l'infrastructure", ""),
      (426, "Emplacement de l'infrastructure (localit??)", 0, 1, 3, 0, NULL, 423, NULL, "Emplacement de l'infrastructure (localit??)", ""),
      (427, "Secteur impliqu?? (??ducation, sant??, travaux publics, ...)", 0, 1, 3, 1, NULL, 423, NULL, "Secteur impliqu?? (??ducation, sant??, travaux publics, ...)", ""),
      (428, "Nouvellement construite ou r??habilit??e ou existante", 0, 1, 3, 1, 55, 423, NULL, "Nouvellement construite ou r??habilit??e ou existante", ""),
      (429, "Date d'op??rationnalisation/utilisation/r??habilitation de l'infrastructure", 0, 1, 3, 0, NULL, 423, NULL, "Date d'op??rationnalisation/utilisation/r??habilitation de l'infrastructure", ""),
      (430, "Infrastructure actuellement op??rationnelle (oui/non)", 0, 1, 3, 1, 54, 423, NULL, "Infrastructure actuellement op??rationnelle (oui/non)", ""),
      (431, "Etat actuel de l'infrastructure (mauvais, moyen, bon)", 0, 1, 3, 0, NULL, 423, NULL, "Etat actuel de l'infrastructure (mauvais, moyen, bon)", ""),
      (432, "Niveau de localisation infrastructures op??rationnelles (Direction centrale, Direction r??gionale, cantonnement, triage)", 0, 1, 3, 1, NULL, 423, NULL, "Niveau de localisation infrastructures op??rationnelles (Direction centrale, Direction r??gionale, cantonnement, triage)", ""),
      (433, "STD ou CTD", 0, 1, 3, 1, 55, 423, NULL, "STD ou CTD", ""),
      (434, "Personnes/services utilisant le(s) infrastructure(s) (STD, pr??ciser si CTD)", 0, 1, 3, 1, NULL, 423, NULL, "Personnes/services utilisant le(s) infrastructure(s) (STD, pr??ciser si CTD)", ""),
      (435, "Budget pour la construction/r??habilitation de l'infrastructure (Ariary)", 0, 1, 3, 0, NULL, 423, NULL, "Budget pour la construction/r??habilitation de l'infrastructure (Ariary)", ""),
      (436, "Budget pour l'entretien de l'infrastructure (Ariary)", 0, 1, 3, 0, NULL, 423, NULL, "Budget pour l'entretien de l'infrastructure (Ariary)", ""),
      (437, "Source de financement de l'infrastructure (interne ou externe)", 0, 1, 3, 1, NULL, 423, NULL, "Source de financement de l'infrastructure (interne ou externe)", ""),
      (438, "Projet d'appui de l'infrastructure (si externe)", 0, 1, 3, 1, NULL, 423, NULL, "Projet d'appui de l'infrastructure (si externe)", ""),
      (439, "Images infrastructure", 0, 1, 3, 1, NULL, 423, NULL, "Images infrastructure", ""),
      (440, "Observations infrastructure", 0, 1, 3, 0, NULL, 423, NULL, "Observations infrastructure", ""),
      (441, "Source de donn??es infrastructure", 0, 1, 3, 1, NULL, 423, NULL, "Source de donn??es infrastructure", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 430 WHERE id = 54`);
    sql.push(`UPDATE indicateur set id_question = 428 WHERE id = 55`);

    // Logistique (Mat??riel roulant)
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (56, "Nombre de mat??riel roulant ", "", 18, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (442, "D??signation du mat??riel roulant", 1, 1, 3, 1, 56, NULL, NULL, "D??signation du mat??riel roulant", ""),
      (443, "Marque du mat??riel roulant", 0, 1, 3, 0, NULL, 442, NULL, "Marque du mat??riel roulant", ""),
      (444, "Commune d'emplacement du mat??riel roulant", 0, 1, 3, 1, NULL, 442, NULL, "Commune d'emplacement du mat??riel roulant", ""),
      (445, "Date d'acquisition/utilisation du mat??riel roulant", 0, 1, 3, 1, NULL, 442, NULL, "Date d'acquisition/utilisation du mat??riel roulant", ""),
      (446, "Mat??riel roulant actuellement op??rationnel (oui/non)", 0, 1, 3, 1, NULL, 442, NULL, "Mat??riel roulant actuellement op??rationnel (oui/non)", ""),
      (447, "Etat actuel du mat??riel roulant (mauvais, moyen, bon)", 0, 1, 3, 1, 56, 442, NULL, "Etat actuel du mat??riel roulant (mauvais, moyen, bon)", ""),
      (448, "Niveau de localisation de mat??riel roulant en ??tat de marche (Direction centrale, Direction r??gionale, cantonnement, triage)", 0, 1, 3, 1, NULL, 442, NULL, "Niveau de localisation de mat??riel roulant en ??tat de marche (Direction centrale, Direction r??gionale, cantonnement, triage)", ""),
      (449, "Personnes/services utilisant le(s) mat??riel(s) roulant(s)", 0, 1, 3, 1, NULL, 442, NULL, "Personnes/services utilisant le(s) mat??riel(s) roulant(s)", ""),
      (450, "Budget pour l'acquisition du mat??riel roulant (Ariary)", 0, 1, 3, 0, NULL, 442, NULL, "Budget pour l'acquisition du mat??riel roulant (Ariary)", ""),
      (451, "Budget pour l'entretien du mat??riel roulant (Ariary)", 0, 1, 3, 0, NULL, 442, NULL, "Budget pour l'entretien du mat??riel roulant (Ariary)", ""),
      (452, "Source de financement du mat??riel roulant (interne ou externe)", 0, 1, 3, 1, NULL, 442, NULL, "Source de financement du mat??riel roulant (interne ou externe)", ""),
      (453, "Projet d'appui du mat??riel roulant (si externe)", 0, 1, 3, 1, NULL, 442, NULL, "Projet d'appui du mat??riel roulant (si externe)", ""),
      (454, "Images mat??riel roulant", 0, 1, 3, 1, NULL, 442, NULL, "Images mat??riel roulant", ""),
      (455, "Observations mat??riel roulant", 0, 1, 3, 0, NULL, 442, NULL, "Observations mat??riel roulant", ""),
      (456, "Source de donn??es mat??riel roulant", 0, 1, 3, 1, NULL, 442, NULL, "Source de donn??es mat??riel roulant", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 442 WHERE id = 56`);

    //  Logistique (mat??riel informatique)
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (57, "Nombre de mat??riel informatique ", "", 19, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (457, "D??signation du mat??riel informatique", 1, 1, 3, 1, 57, NULL, NULL, "D??signation du mat??riel informatique", ""),
      (458, "Marque du mat??riel informatique", 0, 1, 3, 0, NULL, 457, NULL, "Marque du mat??riel informatique", ""),
      (459, "Commune d'emplacement du mat??riel informatique", 0, 1, 3, 1, NULL, 457, NULL, "Commune d'emplacement du mat??riel informatique", ""),
      (460, "Date d'acquisition/utilisation du mat??riel informatique", 0, 1, 3, 1, NULL, 457, NULL, "Date d'acquiqition/utilisation du mat??riel informatique", ""),
      (461, "Mat??riel informatique actuellement op??rationnel (oui/non)", 0, 1, 3, 1, NULL, 457, NULL, "Mat??riel informatique actuellement op??rationnel (oui/non)", ""),
      (462, "Etat actuel du mat??riel informatique (mauvais, moyen, bon)", 0, 1, 3, 1, 57, 457, NULL, "Etat actuel du mat??riel informatique (mauvais, moyen, bon)", ""),
      (463, "A condamner ou ?? r??parer", 0, 1, 3, 1, NULL, 457, NULL, "A condamner ou ?? r??parer", ""),
      (464, "Niveau de localisation de mat??riels informatiques en ??tat de marche (Direction centrale, Direction r??gionale, cantonnement, triage)", 0, 1, 3, 1, NULL, 457, NULL, "Niveau de localisation de mat??riels informatiques en ??tat de marche (Direction centrale, Direction r??gionale, cantonnement, triage)", ""),
      (465, "Personnes/services utilisant le(s) mat??riel(s) informatique(s)", 0, 1, 3, 1, NULL, 457, NULL, "Personnes/services utilisant le(s) mat??riel(s) informatique(s)", ""),
      (466, "Budget pour l'acquisition du mat??riel informatique (Ariary)", 0, 1, 3, 0, NULL, 457, NULL, "Budget pour l'acquisition du mat??riel informatique (Ariary)", ""),
      (467, "Budget pour l'entretien du mat??riel informatique (Ariary)", 0, 1, 3, 0, NULL, 457, NULL, "Budget pour l'entretien du mat??riel informatique (Ariary)", ""),
      (468, "Source de financement du mat??riel informatique (interne ou externe)", 0, 1, 3, 1, NULL, 457, NULL, "Source de financement du mat??riel informatique (interne ou externe)", ""),
      (469, "Projet d'appui du mat??riel informatique (si externe)", 0, 1, 3, 1, NULL, 457, NULL, "Projet d'appui du mat??riel informatique (si externe)", ""),
      (470, "Images mat??riel informatique", 0, 1, 3, 1, NULL, 457, NULL, "Images mat??riel informatique", ""),
      (471, "Observations mat??riel informatique", 0, 1, 3, 0, NULL, 457, NULL, "Observations mat??riel informatique", ""),
      (472, "Source de donn??es mat??riel informatique", 0, 1, 3, 1, NULL, 457, NULL, "Source de donn??es mat??riel informatique", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 457 WHERE id = 57`);

    // Logistique (mat??riel immobilier)
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (58, "Nombre de mat??riel immobilier ", "", 20, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (473, "D??signation du mat??riel immobilier", 1, 1, 3, 1, 58, NULL, NULL, "D??signation du mat??riel immobilier", ""),
      (474, "Commune d'emplacement du mat??riel immobilier", 0, 1, 3, 1, NULL, 473, NULL, "Commune d'emplacement du mat??riel immobilier", ""),
      (475, "Date d'acquisition/utilisation du mat??riel immobilier", 0, 1, 3, 1, NULL, 473, NULL, "Date d'acquiqition/utilisation du mat??riel immobilier", ""),
      (476, "Mat??riel immobilier actuellement op??rationnel (oui/non)", 0, 1, 3, 1, NULL, 473, NULL, "Mat??riel immobilier actuellement op??rationnel (oui/non)", ""),
      (477, "Etat actuel du mat??riel immobilier (mauvais, moyen, bon)", 0, 1, 3, 1, 58, 473, NULL, "Etat actuel du mat??riel immobilier (mauvais, moyen, bon)", ""),
      (478, "Niveau de localisation de mat??riels immobiliers en ??tat de marche (Direction centrale, Direction r??gionale, cantonnement, triage)", 0, 1, 3, 1, NULL, 473, NULL, "Niveau de localisation de mat??riels immobiliers en ??tat de marche (Direction centrale, Direction r??gionale, cantonnement, triage)", ""),
      (479, "Personnes/services utilisant le(s) mat??riel(s) immobilier(s)", 0, 1, 3, 1, NULL, 473, NULL, "Personnes/services utilisant le(s) mat??riel(s) immobilier(s)", ""),
      (480, "Budget pour l'acquisition du mat??riel immobilier (Ariary)", 0, 1, 3, 0, NULL, 473, NULL, "Budget pour l'acquisition du mat??riel immobilier (Ariary)", ""),
      (481, "Budget pour l'entretien du mat??riel immobilier (Ariary)", 0, 1, 3, 0, NULL, 473, NULL, "Budget pour l'entretien du mat??riel immobilier (Ariary)", ""),
      (482, "Source de financement du mat??riel immobilier (interne ou externe)", 0, 1, 3, 1, NULL, 473, NULL, "Source de financement du mat??riel immobilier (interne ou externe)", ""),
      (483, "Projet d'appui du mat??riel immobilier (si externe)", 0, 1, 3, 1, NULL, 473, NULL, "Projet d'appui du mat??riel immobilier (si externe)", ""),
      (484, "Images mat??riel immobilier", 0, 1, 3, 1, NULL, 473, NULL, "Images mat??riel immobilier", ""),
      (485, "Observations mat??riel immobilier", 0, 1, 3, 0, NULL, 473, NULL, "Observations mat??riel immobilier", ""),
      (486, "Source de donn??es mat??riel immobilier", 0, 1, 3, 1, NULL, 473, NULL, "Source de donn??es mat??riel immobilier", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 473 WHERE id = 58`);

    // Outil
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (59, "Nombre de guides produits", "", 21, 0, 0, 1),
      (60, "Outils disponible et utilis??", "", 21, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (487, "Outil ou guide", 1, 1, 3, 1, 59, NULL, NULL, "Outil ou guide", ""),
      (488, "Titre de l'outil ou du guide", 0, 1, 3, 1, NULL, 487, NULL, "Titre de l'outil ou du guide", ""),
      (489, "Objet de l'outil ou du guide", 0, 1, 3, 1, NULL, 487, NULL, "Objet de l'outil ou du guide", ""),
      (490, "Nature de l'outil", 0, 1, 3, 1, NULL, 487, NULL, "Nature de l'outil", ""),
      (491, "Th??matique de l'outil ou du guide", 0, 1, 3, 1, NULL, 487, NULL, "Th??matique de l'outil ou du guide", ""),
      (492, "Commune d'application de l'outil ou du guide", 0, 1, 3, 1, NULL, 487, NULL, "Commune d'application de l'outil ou du guide", ""),
      (493, "Outil ou guide op??rationnel (oui/non)", 0, 1, 3, 1, NULL, 487, NULL, "Outil ou guide op??rationnel (oui/non)", ""),
      (494, "Utilisateur de l'outil ou du guide", 0, 1, 3, 1, NULL, 487, NULL, "Utilisateur de l'outil ou du guide", ""),
      (495, "Nombre d'outil ou de guide produit", 0, 1, 3, 1, NULL, 487, NULL, "Nombre d'outil ou de guide produit", ""),
      (496, "Nombre d'outil ou de guide distribu?? et utilis??", 0, 1, 3, 1, NULL, 487, NULL, "Nombre d'outil ou de guide distribu?? et utilis??", ""),
      (497, "Budget pour la cr??ation de l'outil ou du guide (Ariary)", 0, 1, 3, 0, NULL, 487, NULL, "Budget pour la cr??ation de l'outil ou du guide (Ariary)", ""),
      (498, "Source de financement de l'outil ou du guide (interne ou externe)", 0, 1, 3, 1, NULL, 487, NULL, "Source de financement de l'outil ou du guide (interne ou externe)", ""),
      (499, "Projet d'appui de l'outil ou du guide (si externe)", 0, 1, 3, 1, NULL, 487, NULL, "Projet d'appui de l'outil ou du guide (si externe)", ""),
      (500, "Images (outils et guides)", 0, 1, 3, 1, NULL, 487, NULL, "Images (outils et guides)", ""),
      (501, "Observations outils", 0, 1, 3, 0, NULL, 487, NULL, "Observations outils", ""),
      (502, "Source de donn??es outils", 0, 1, 3, 1, NULL, 487, NULL, "Source de donn??es outils", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 487 WHERE id = 59`);
    sql.push(`UPDATE indicateur set id_question = 496 WHERE id = 60`);

    // Plannification programmation evaluation
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (61, "Nombre de programmes qui ont fait l'objet de planification", "", 22, 0, 0, 1),
      (62, "Nombre de programmes qui ont fait l'objet de suivi", "", 22, 0, 0, 1),
      (63, "Nombre de programmes qui ont fait l'objet d'??valuation", "", 22, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (503, "Programme ou projet", 1, 1, 3, 1, NULL, NULL, NULL, "Programme ou projet", ""),
      (504, "Intitul?? du programme ou projet", 0, 1, 3, 1, NULL, 503, NULL, "Intitul?? du programme ou projet", ""),
      (505, "Commune d'intervention du programme ou projet", 0, 1, 3, 1, NULL, 503, NULL, "Commune d'intervention du programme ou projet", ""),
      (506, "Date de commencement du programme ou projet", 0, 1, 3, 1, NULL, 503, NULL, "Date de commencement du programme ou projet", ""),
      (507, "Date de cl??ture du programme ou projet", 0, 1, 3, 1, NULL, 503, NULL, "Date de cl??ture du programme ou projet", ""),
      (508, "Programme ou projet ayant ??t?? l'objet de planifiaction (oui/non)", 0, 1, 3, 1, 61, 503, NULL, "Programme ou projet ayant ??t?? l'objet de planifiaction (oui/non)", ""),
      (509, "Programme ou projet ayant ??t?? l'objet de suivi (oui/non)", 0, 1, 3, 1, 62, 503, NULL, "Programme ou projet ayant ??t?? l'objet de suivi (oui/non)", ""),
      (510, "Programme ou projet ayant ??t?? l'objet d'??valuation (oui/non)", 0, 1, 3, 1, 63, 503, NULL, "Programme ou projet ayant ??t?? l'objet d'??valuation (oui/non)", ""),
      (511, "Identifiant du projet", 0, 1, 3, 1, NULL, 503, NULL, "Identifiant du projet", ""),
      (512, "Source de financement du programme ou projet", 0, 1, 3, 1, NULL, 503, NULL, "Source de financement du programme ou projet", ""),
      (513, "Budget attribu?? aux activit??s de planification (Ariary)", 0, 1, 3, 1, NULL, 503, NULL, "Budget attribu?? aux activit??s de planification (Ariary)", ""),
      (514, "Budget attribu?? aux activit??s de suivi (Ariary)", 0, 1, 3, 1, NULL, 503, NULL, "Budget attribu?? aux activit??s de suivi (Ariary)", ""),
      (515, "Budget attribu?? aux activit??s d'??valuation (Ariary)", 0, 1, 3, 1, NULL, 503, NULL, "Budget attribu?? aux activit??s d'??valuation (Ariary)", ""),
      (516, "Existence de base de donn??es (oui/non)", 0, 1, 3, 1, NULL, 503, NULL, "Existence de base de donn??es (oui/non)", ""),
      (517, "Si oui, existence de mise ?? jour (oui/non)", 0, 1, 3, 1, NULL, 503, NULL, "Si oui, existence de mise ?? jour (oui/non)", ""),
      (518, "Observations PPSE", 0, 1, 3, 0, NULL, 503, NULL, "Observations PPSE", ""),
      (519, "Source de donn??es PPSE", 0, 1, 3, 1, NULL, 503, NULL, "Source de donn??es PPSE", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 508 WHERE id = 61`);
    sql.push(`UPDATE indicateur set id_question = 509 WHERE id = 62`);
    sql.push(`UPDATE indicateur set id_question = 510 WHERE id = 63`);

    // reboisement
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (64, "Superficie rebois??e ", "", 23, 1, 0, 0),
      (65, "Superficie restaur??e", "", 23, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (520, "Insitution", 1, 1, 3, 0, NULL, NULL, NULL, "Insitution", ""),
      (521, "DREDD/CIREDD", 0, 1, 3, 0, NULL, 520, NULL, "DREDD/CIREDD", ""),
      (522, "Commune d'intervention pour le reboisement", 0, 1, 3, 1, NULL, 520, NULL, "Commune d'intervention pour le reboisement", ""),
      (523, "Fokontany d'intervention pour le reboisement", 0, 1, 3, 0, NULL, 520, NULL, "Fokontany d'intervention pour le reboisement", ""),
      (524, "Site/Localit??", 0, 1, 3, 0, NULL, 520, NULL, "Site/Localit??", ""),
      (525, "Situation juridique (terrain domanial, priv??)", 0, 1, 3, 1, NULL, 520, NULL, "Situation juridique (terrain domanial, priv??)", ""),
      (526, "Longitude surface rebois??e (en degr?? d??cimal) : X", 0, 1, 3, 1, NULL, 520, NULL, "Longitude surface rebois??e (en degr?? d??cimal) : X", ""),
      (527, "Latitude surface rebois??e (en degr?? d??cimal) : Y", 0, 1, 3, 1, NULL, 520, NULL, "Latitude surface rebois??e (en degr?? d??cimal) : Y", ""),
      (528, "Entit?? ou personne responsable du reboisement", 0, 1, 3, 1, NULL, 520, NULL, "Entit?? ou personne responsable du reboisement", ""),
      (529, "Objectif de reboisement (restauration, energ??tique, bois d'??uvre, ???)", 0, 1, 3, 1, NULL, 520, NULL, "Objectif de reboisement (restauration, energ??tique, bois d'??uvre, ???)", ""),
      (530, "Superficie restaur??e si restauration (ha)", 0, 1, 3, 0, NULL, 520, NULL, "Superficie restaur??e si restauration (ha)", ""),
      (531, "Ecosyst??me (mangrove, zone humide, for??t humide, for??t s??che, ???)", 0, 1, 3, 1, 64, 520, NULL, "Ecosyst??me (mangrove, zone humide, for??t humide, for??t s??che, ???)", ""),
      (532, "Surface totale pr??vue (ha)", 0, 1, 3, 0, NULL, 520, NULL, "Surface totale pr??vue (ha)", ""),
      (533, "Nombre de plants mis en terre", 0, 1, 3, 1, NULL, 520, NULL, "Nombre de plants mis en terre", ""),
      (534, "Esp??ce des plants", 0, 1, 3, 1, NULL, 520, NULL, "Esp??ce des plants", ""),
      (535, "Autochtone ou exotique", 0, 1, 3, 1, NULL, 520, NULL, "Autochtone ou exotique", ""),
      (536, "Croissance rapide (oui/non)", 0, 1, 3, 1, NULL, 520, NULL, "Croissance rapide (oui/non)", ""),
      (537, "Date de mise en terre", 0, 1, 3, 1, NULL, 520, NULL, "Date de mise en terre", ""),
      (538, "Source de plants", 0, 1, 3, 1, NULL, 520, NULL, "Source de plants", ""),
      (539, "Superficie rebois??e (ha)", 0, 1, 3, 1, NULL, 520, NULL, "Superficie rebois??e (ha)", ""),
      (540, "Shapefile surface rebois??e", 0, 1, 3, 1, NULL, 520, NULL, "Shapefile surface rebois??e", ""),
      (541, "Source de financement du reboisement (interne ou externe)", 0, 1, 3, 1, NULL, 520, NULL, "Source de financement du reboisement (interne ou externe)", ""),
      (542, "Projet d'appui du reboisement (si externe)", 0, 1, 3, 1, NULL, 520, NULL, "Projet d'appui du reboisement (si externe)", ""),
      (543, "Pare feux (km)", 0, 1, 3, 1, NULL, 520, NULL, "Pare feux (km)", ""),
      (544, "Mat??riels de lutte active", 0, 1, 3, 0, NULL, 520, NULL, "Mat??riels de lutte active", ""),
      (545, "Existence de structure de lutte (oui/non)", 0, 1, 3, 0, NULL, 520, NULL, "Existence de structure de lutte (oui/non)", ""),
      (546, "Surface br??l??e (ha)", 0, 1, 3, 0, NULL, 520, NULL, "Surface br??l??e (ha)", ""),
      (547, "Shapefile surface de reboisement br??l??e", 0, 1, 3, 0, NULL, 520, NULL, "Shapefile surface de reboisement br??l??e", ""),
      (548, "Lutte active ou passive", 0, 1, 3, 0, NULL, 520, NULL, "Lutte active ou passive", ""),
      (549, "Date d'intervention", 0, 1, 3, 0, NULL, 520, NULL, "Date d'intervention", ""),
      (550, "Responsable de lutte contre les feux", 0, 1, 3, 0, NULL, 520, NULL, "Responsable de lutte contre les feux", ""),
      (551, "Regarnissage (oui/non)", 0, 1, 3, 0, NULL, 520, NULL, "Regarnissage (oui/non)", ""),
      (552, "Date de regarnissage", 0, 1, 3, 0, NULL, 520, NULL, "Date de regarnissage", ""),
      (553, "Nettoyage (oui/non)", 0, 1, 3, 0, NULL, 520, NULL, "Nettoyage (oui/non)", ""),
      (554, "Date de nettoyage", 0, 1, 3, 0, NULL, 520, NULL, "Date de nettoyage", ""),
      (555, "Elagage (oui/non)", 0, 1, 3, 0, NULL, 520, NULL, "Elagage (oui/non)", ""),
      (556, "Date d'elagage", 0, 1, 3, 0, NULL, 520, NULL, "Date d'elagage", ""),
      (557, "B??n??ficiaires des interventions", 0, 1, 3, 0, NULL, 520, NULL, "B??n??ficiaires des interventions", ""),
      (558, "Eclaicie 1 (oui/non)", 0, 1, 3, 0, NULL, 520, NULL, "Eclaicie 1 (oui/non)", ""),
      (559, "Date eclaircie 1", 0, 1, 3, 0, NULL, 520, NULL, "Date eclaircie 1", ""),
      (560, "Eclarcie 2 (oui/non)", 0, 1, 3, 0, NULL, 520, NULL, "Eclarcie 2 (oui/non)", ""),
      (561, "Date eclaircie 2", 0, 1, 3, 0, NULL, 520, NULL, "Date eclaircie 2", ""),
      (562, "Coupe rase (oui/non)", 0, 1, 3, 0, NULL, 520, NULL, "Coupe rase (oui/non)", ""),
      (563, "Date coupe rase", 0, 1, 3, 0, NULL, 520, NULL, "Date coupe rase", ""),
      (564, "Observations reboisement", 0, 1, 3, 0, NULL, 520, NULL, "Observations reboisement", ""),
      (565, "Source de donn??es reboisement", 0, 1, 3, 1, NULL, 520, NULL, "Source de donn??es reboisement", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 539 WHERE id = 64`);
    sql.push(`UPDATE indicateur set id_question = 530 WHERE id = 65`);

    // Recherche
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (66, "Nombre de recherches effectu??es", "", 24, 0, 0, 1),
      (67, "Nombre de r??sultats de recherches disponibles", "", 24, 0, 0, 1),
      (68, "Nombre de r??sultats de recherches appliqu??s", "", 24, 0, 0, 1),
      (69, "Nombre de produits de recherche diffus??s, vulgaris??s, promus", "", 24, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (566, "Sujet de recherche effectu??", 1, 1, 3, 1, NULL, NULL, NULL, "Sujet de recherche effectu??", ""),
      (567, "Objectif de la recherche (??tude de fili??re, ...)", 0, 1, 3, 0, NULL, 566, NULL, "Objectif de la recherche (??tude de fili??re, ...)", ""),
      (568, "Commune d'intervention de la recherche", 0, 1, 3, 1, NULL, 566, NULL, "Commune d'intervention de la recherche", ""),
      (569, "Date de commencement de la recherche", 0, 1, 3, 0, NULL, 566, NULL, "Date de commencement de la recherche", ""),
      (570, "Date de fin de la recherche", 0, 1, 3, 0, NULL, 566, NULL, "Date de fin de la recherche", ""),
      (571, "Chercheurs (liste)", 0, 1, 3, 0, NULL, 566, NULL, "Chercheurs (liste)", ""),
      (572, "Institution des chercheurs", 0, 1, 3, 0, NULL, 566, NULL, "Institution des chercheurs", ""),
      (573, "Date d'??dition du rapport de recherche", 0, 1, 3, 0, NULL, 566, NULL, "Date d'??dition du rapport de recherche", ""),
      (574, "R??sultats de la recherche", 0, 1, 3, 0, NULL, 566, NULL, "R??sultats de la recherche", ""),
      (575, "R??sultats disponibles (oui/non)", 0, 1, 3, 1, 67, 566, NULL, "R??sultats disponibles (oui/non)", ""),
      (576, "R??sultats appliqu??s (oui/non)", 0, 1, 3, 1, 68, 566, NULL, "R??sultats appliqu??s (oui/non)", ""),
      (577, "Produits de recherche diffus??s, vulgaris??s, promus (oui/non)", 0, 1, 3, 1, 69, 566, NULL, "Produits de recherche diffus??s, vulgaris??s, promus (oui/non)", ""),
      (578, "Source de financement de la recherche (interne ou externe)", 0, 1, 3, 1, NULL, 566, NULL, "Source de financement de la recherche (interne ou externe)", ""),
      (579, "Projet d'appui de la recherche (si externe)", 0, 1, 3, 1, NULL, 566, NULL, "Projet d'appui de la recherche (si externe)", ""),
      (580, "Co??ts des activit??s de recherche (Ariary)", 0, 1, 3, 0, NULL, 566, NULL, "Co??ts des activit??s de recherche (Ariary)", ""),
      (581, "Observations recherche", 0, 1, 3, 0, NULL, 566, NULL, "Observations recherche", ""),
      (582, "Source de donn??es recherche", 0, 1, 3, 1, NULL, 566, NULL, "Source de donn??es recherche", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 566 WHERE id = 66`);
    sql.push(`UPDATE indicateur set id_question = 575 WHERE id = 67`);
    sql.push(`UPDATE indicateur set id_question = 576 WHERE id = 68`);
    sql.push(`UPDATE indicateur set id_question = 577 WHERE id = 69`);

    // RSE
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (70, "Nombre de projets d??velopp??s dans le cadre de RSE", "", 25, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (583, "Intitul?? du projet d??velopp?? dans le cadre de RSE (Responsabilit?? Soci??tale des Entreprises)", 1, 1, 3, 1, NULL, NULL, NULL, "Intitul?? du projet d??velopp?? dans le cadre de RSE (Responsabilit?? Soci??tale des Entreprises)", ""),
      (584, "Objectifs du projet RSE", 0, 1, 3, 1, NULL, 583, NULL, "Objectifs du projet RSE", ""),
      (585, "Date de r??alisation RSE", 0, 1, 3, 0, NULL, 583, NULL, "Date de r??alisation RSE", ""),
      (586, "Commune d'intervention pour RSE", 0, 1, 3, 0, NULL, 583, NULL, "Commune d'intervention pour RSE", ""),
      (587, "Types d'intervention (??ducation environnementale, reboisement/restauration, ???)", 0, 1, 3, 0, NULL, 583, NULL, "Types d'intervention (??ducation environnementale, reboisement/restauration, ???)", ""),
      (588, "Supports aff??rents produits (liste)", 0, 1, 3, 0, NULL, 583, NULL, "Supports aff??rents produits (liste)", ""),
      (589, "Parties prenantes pour RSE (liste)", 0, 1, 3, 0, NULL, 583, NULL, "Parties prenantes pour RSE (liste)", ""),
      (590, "Nombre de m??nages b??n??ficiaires de la RSE", 0, 1, 3, 0, NULL, 583, NULL, "Nombre de m??nages b??n??ficiaires de la RSE", ""),
      (591, "Nombre d'autres b??n??ficiaires de la (groupement, ??cole, ???)", 0, 1, 3, 0, NULL, 583, NULL, "Nombre d'autres b??n??ficiaires de la (groupement, ??cole, ???)", ""),
      (592, "Existence de suivi des projets RSE (oui/non)", 0, 1, 3, 0, NULL, 583, NULL, "Existence de suivi des projets RSE (oui/non)", ""),
      (593, "P??riodicit?? de suivi RSE (nombre par an)", 0, 1, 3, 0, NULL, 583, NULL, "P??riodicit?? de suivi RSE (nombre par an)", ""),
      (594, "Observations RSE", 0, 1, 3, 0, NULL, 583, NULL, "Observations RSE", ""),
      (595, "Source de donn??es RSE", 0, 1, 3, 1, NULL, 583, NULL, "Source de donn??es RSE", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 583 WHERE id = 70`);

    // RH
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (71, "Nombre de personnel en fonction ", "", 26, 0, 0, 1),
      (72, "Nombre de personnel ", "", 26, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (596, "Intitul?? du poste", 1, 1, 3, 1, NULL, NULL, NULL, "Intitul?? du poste", ""),
      (597, "Justificatif d'assignation (D??cisions, Note de service, arr??t??s, d??crets avec num??ro)", 0, 1, 3, 1, NULL, 596, NULL, "Justificatif d'assignation (D??cisions, Note de service, arr??t??s, d??crets avec num??ro)", ""),
      (598, "Poste occup?? ou vaccant", 0, 1, 3, 1, 71, 596, NULL, "Poste occup?? ou vaccant", ""),
      (599, "Type du poste (administratif, technique)", 0, 1, 3, 1, 72, 596, NULL, "Type du poste (administratif, technique)", ""),
      (600, "Statut du personnel (ECD, ELD, EFA, fonctionnaire)", 0, 1, 3, 0, 71, 596, NULL, "Statut du personnel (ECD, ELD, EFA, fonctionnaire)", ""),
      (601, "Commune d'affectation", 0, 1, 3, 0, NULL, 596, NULL, "Commune d'affectation", ""),
      (602, "District d'affectation", 0, 1, 3, 0, NULL, 596, NULL, "District d'affectation", ""),
      (603, "R??gion d'affectation", 0, 1, 3, 0, NULL, 596, NULL, "R??gion d'affectation", ""),
      (605, "Ann??e d'affectation", 0, 1, 3, 0, NULL, 596, NULL, "Ann??e d'affectation", ""),
      (606, "Date de recrutement/ann??e", 0, 1, 3, 0, NULL, 596, NULL, "Date de recrutement/ann??e", ""),
      (607, "Date estim??e de retraite/ann??e", 0, 1, 3, 0, NULL, 596, NULL, "Date estim??e de retraite/ann??e", ""),
      (608, "Personne b??n??ficiant de formation (oui, non)", 0, 1, 3, 0, NULL, 596, NULL, "Personne b??n??ficiant de formation (oui, non)", ""),
      (609, "Sujet de formation", 0, 1, 3, 0, NULL, 596, NULL, "Sujet de formation", ""),
      (610, "Formation appliqu??e/utilis??e (oui/non)", 0, 1, 3, 0, NULL, 596, NULL, "Formation appliqu??e/utilis??e (oui/non)", ""),
      (611, "Besoins en formation pour le poste", 0, 1, 3, 0, NULL, 596, NULL, "Besoins en formation pour le poste ", ""),
      (612, "Observations ressources humaines", 0, 1, 3, 0, NULL, 596, NULL, "Observations ressources humaines", ""),
      (613, "Source de donn??es ressources humaines", 0, 1, 3, 1, NULL, 596, NULL, "Source de donn??es ressources humaines", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 596 WHERE id = 71`);
    sql.push(`UPDATE indicateur set id_question = 596 WHERE id = 72`);

    // TG
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (73, "Superficie de TG ", "", 27, 1, 0, 0),
      (74, "Nombre de TG suivi", "", 27, 0, 0, 1),
      (75, "Nombre de TG ??valu??", "", 27, 0, 0, 1),
      (76, "Nombre de m??nages b??n??ficiaires de TG", "", 27, 1, 0, 0),
      (77, "Nombre de COBA form??es", "", 27, 0, 0, 1),
      (78, "Nombre d'association (COBA/VOI) soutenue", "", 27, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (614, "DREDD/DIREDD", 1, 1, 3, 1, NULL, NULL, NULL, "DREDD/DIREDD", ""),
      (615, "Site du TG", 0, 1, 3, 0, NULL, 614, NULL, "Site du TG", ""),
      (616, "Fokontany d'implatation du TG", 0, 1, 3, 0, NULL, 614, NULL, "Fokontany d'implatation du TG", ""),
      (617, "Commune d'implatation du TG", 0, 1, 3, 1, NULL, 614, NULL, "Commune d'implatation du TG", ""),
      (618, "Type de for??ts (Primaire, Secondaire, Littorale, Fourr??, Mangrove, Satrana, Raphia, Tapia, Domaniale, Reboisement, Zone de p??ches, etc.)", 0, 1, 3, 1, NULL, 614, NULL, "Type de for??ts (Primaire, Secondaire, Littorale, Fourr??, Mangrove, Satrana, Raphia, Tapia, Domaniale, Reboisement, Zone de p??ches, etc.)", ""),
      (619, "Surface contrat 1 (ha)", 0, 1, 3, 1, NULL, 614, NULL, "Surface contrat 1 (ha)", ""),
      (620, "Type de TG (GCF, GELOSE)", 0, 1, 3, 1, NULL, 614, NULL, "Type de TG (GCF, GELOSE)", ""),
      (621, "Vocation/Objectifs (Conservation, Valorisation, Ecotourisme, Droit d'usage (CDU), Restauration, Production, Reserve, R??habilitation, Enrichissement, Reboisement, Exploitation, Production durable, Zone de culture, Plantes fourrag??res, Production charbon de bois, Utilisation culturelle, etc.)", 0, 1, 3, 1, NULL, 614, NULL, "Vocation/Objectifs (Conservation, Valorisation, Ecotourisme, Droit d'usage (CDU), Restauration, Production, Reserve, R??habilitation, Enrichissement, Reboisement, Exploitation, Production durable, Zone de culture, Plantes fourrag??res, Production charbon de bois, Utilisation culturelle, etc.)", ""),
      (622, "Surface contrat 2 (ha)", 0, 1, 3, 1, NULL, 614, NULL, "Surface contrat 2 (ha)", ""),
      (623, "Date 1er contrat", 0, 1, 3, 1, NULL, 614, NULL, "Date 1er contrat", ""),
      (624, "Date Evaluation 1er contrat", 0, 1, 3, 1, NULL, 614, NULL, "Date Evaluation 1er contrat", ""),
      (625, "Date D??liberation", 0, 1, 3, 1, NULL, 614, NULL, "Date D??liberation", ""),
      (626, "Date 2??me contrat", 0, 1, 3, 1, NULL, 614, NULL, "Date 2??me contrat", ""),
      (627, "Ressources concern??es dans le site de TG", 0, 1, 3, 0, NULL, 614, NULL, "Ressources concern??es dans le site de TG", ""),
      (628, "Nouvellement cr???? ou renouvel??", 0, 1, 3, 1, 73, 614, NULL, "Nouvellement cr???? ou renouvel??", ""),
      (629, "Nom de la COBA/VOI", 0, 1, 3, 1, NULL, 614, NULL, "Nom de la COBA/VOI", ""),
      (630, "Date de cr??ation de la COBA/VOI", 0, 1, 3, 0, NULL, 614, NULL, "Date de cr??ation de la COBA/VOI", ""),
      (631, "Nombre des membres de COBA/VOI", 0, 1, 3, 0, NULL, 614, NULL, "Nombre des membres de COBA/VOI", ""),
      (632, "COBA/VOI structur??e (oui/non)", 0, 1, 3, 0, NULL, 614, NULL, "COBA/VOI structur??e (oui/non)", ""),
      (633, "COBA/VOI form??e (oui/non)", 0, 1, 3, 1, 77, 614, NULL, "COBA/VOI form??e (oui/non)", ""),
      (634, "COBA/VOI op??rationnelle (oui/non)", 0, 1, 3, 0, NULL, 614, NULL, "COBA/VOI op??rationnelle (oui/non)", ""),
      (635, "Nombre de m??nages b??n??ficiaires du TG", 0, 1, 3, 1, NULL, 614, NULL, "Nombre de m??nages b??n??ficiaires du TG", ""),
      (636, "COBA/VOI appuy??e/soutenue (oui/non)", 0, 1, 3, 1, 78, 614, NULL, "COBA/VOI appuy??e/soutenue (oui/non)", ""),
      (637, "Type d'appui pour TG (dotation mat??riels, formation, AGR???)", 0, 1, 3, 0, NULL, 614, NULL, "Type d'appui pour TG (dotation mat??riels, formation, AGR???)", ""),
      (638, "Organisme d'appui du TG", 0, 1, 3, 1, NULL, 614, NULL, "Organisme d'appui du TG", ""),
      (639, "Projet d'appui du TG", 0, 1, 3, 1, NULL, 614, NULL, "Projet d'appui du TG", ""),
      (640, "TG suivi (oui/non)", 0, 1, 3, 1, 74, 614, NULL, "TG suivi (oui/non)", ""),
      (641, "Objetcif du suivi de TG", 0, 1, 3, 1, NULL, 614, NULL, "Objetcif du suivi de TG", ""),
      (642, "Date de r??alisation du suivi de TG", 0, 1, 3, 0, NULL, 614, NULL, "Date de r??alisation du suivi de TG", ""),
      (643, "Equipe de r??alisation du suivi de TG", 0, 1, 3, 0, NULL, 614, NULL, "Equipe de r??alisation du suivi de TG", ""),
      (644, "Rapport de suivi de TG (oui/non)", 0, 1, 3, 0, NULL, 614, NULL, "Rapport de suivi de TG (oui/non)", ""),
      (645, "Date d'??dition rapport de suivi TG", 0, 1, 3, 0, NULL, 614, NULL, "Date d'??dition rapport de suivi TG", ""),
      (646, "TG ??valu?? (oui/non)", 0, 1, 3, 0, 75, 614, NULL, "TG ??valu?? (oui/non)", ""),
      (647, "Objectif de l'??valuation de TG", 0, 1, 3, 1, NULL, 614, NULL, "Objectif de l'??valuation de TG", ""),
      (648, "Date de r??alisation de l'??valuation de TG", 0, 1, 3, 0, NULL, 614, NULL, "Date de r??alisation de l'??valuation de TG", ""),
      (649, "Equipe de r??alisation de l'??valuation de TG", 0, 1, 3, 0, NULL, 614, NULL, "Equipe de r??alisation de l'??valuation de TG", ""),
      (650, "Rapport d'??valuation de TG (oui/non)", 0, 1, 3, 0, NULL, 614, NULL, "Rapport d'??valuation de TG (oui/non)", ""),
      (651, "Date d'??dition rapport ??valuation TG", 0, 1, 3, 0, NULL, 614, NULL, "Date d'??dition rapport ??valuation TG", ""),
      (652, "Shapefile TG", 0, 1, 3, 0, NULL, 614, NULL, "Shapefile TG", ""),
      (653, "Observations TG", 0, 1, 3, 0, NULL, 614, NULL, "Observations TG", ""),
      (654, "Source de donn??es TG", 0, 1, 3, 1, NULL, 614, NULL, "Source de donn??es TG", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 619 WHERE id = 73`);
    sql.push(`UPDATE indicateur set id_question = 640 WHERE id = 74`);
    sql.push(`UPDATE indicateur set id_question = 646 WHERE id = 75`);
    sql.push(`UPDATE indicateur set id_question = 635 WHERE id = 76`);
    sql.push(`UPDATE indicateur set id_question = 633 WHERE id = 77`);
    sql.push(`UPDATE indicateur set id_question = 636 WHERE id = 78`);

    // transition ??cologique
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (79, "Superficie de terre d??grad??e g??r??e durablement", "", 28, 1, 0, 0),
      (80, "Superficie des dunes stabilis??es", "", 28, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (655, "Commune d'intervention pour la transition ??cologique et r??silience", 1, 1, 3, 1, NULL, NULL, NULL, "Commune d'intervention pour la transition ??cologique et r??silience", ""),
      (656, "Ann??e d'intervention des activit??s pour la transition ??cologique et r??silience", 0, 1, 3, 1, NULL, 655, NULL, "Ann??e d'intervention des activit??s pour la transition ??cologique et r??silience", ""),
      (657, "Cat??gorie/Zone d'intervention (Agroforesterie, Bassin versant, Dune, For??t de Tapia, Littoral, Mangrove, Recif corallien)", 0, 1, 3, 1, NULL, 655, NULL, "Cat??gorie/Zone d'intervention (Agroforesterie, Bassin versant, Dune, For??t de Tapia, Littoral, Mangrove, Recif corallien)", ""),
      (658, "Terre d??grad??e avec des interventions de d??fense ou de protection (oui/non)", 0, 1, 3, 1, NULL, 655, NULL, "Terre d??grad??e avec des interventions de d??fense ou de protection (oui/non)", ""),
      (659, "Existence de protection anti??rosive (oui/non)", 0, 1, 3, 1, NULL, 655, NULL, "Existence de protection anti??rosive (oui/non)", ""),
      (660, "Autres protections (?? pr??ciser)", 0, 1, 3, 1, NULL, 655, NULL, "Autres protections (?? pr??ciser)", ""),
      (661, "Superficie de DRS (ha)", 0, 1, 3, 1, NULL, 655, NULL, "Superficie de DRS (ha)", ""),
      (662, "Shapefile de la DRS", 0, 1, 3, 1, NULL, 655, NULL, "Shapefile de la DRS", ""),
      (663, "Fixation de dunes (oui/non)", 0, 1, 3, 1, NULL, 655, NULL, "Fixation de dunes (oui/non)", ""),
      (664, "Superficie de dune stabilis??e (ha)", 0, 1, 3, 1, NULL, 655, NULL, "Superficie de dune stabilis??e (ha)", ""),
      (665, "Shapefile de la dune stabilis??e", 0, 1, 3, 1, NULL, 655, NULL, "Shapefile de la dune stabilis??e", ""),
      (666, "Type de la d??fense et restauration des sols adopt?? (m??canique, biologique, mixte)", 0, 1, 3, 0, NULL, 655, NULL, "Type de la d??fense et restauration des sols adopt?? (m??canique, biologique, mixte)", ""),
      (667, "Nombre de m??nage pratiquant la DRS", 0, 1, 3, 0, NULL, 655, NULL, "Nombre de m??nage pratiquant la DRS", ""),
      (668, "Comit?? form?? sur la DRS (oui/non)", 0, 1, 3, 0, NULL, 655, NULL, "Comit?? form?? sur la DRS (oui/non)", ""),
      (669, "Si oui, ann??e de cr??ation du comit??", 0, 1, 3, 0, NULL, 655, NULL, "Si oui, ann??e de cr??ation du comit??", ""),
      (670, "Comit?? sur DRS op??rationnel (oui/non)", 0, 1, 3, 0, NULL, 655, NULL, "Comit?? sur DRS op??rationnel (oui/non)", ""),
      (671, "Suivi des interventions DRS (oui/non)", 0, 1, 3, 0, NULL, 655, NULL, "Suivi des interventions DRS (oui/non)", ""),
      (672, "P??riodicit?? de suivi DRS (nombre/an)", 0, 1, 3, 0, NULL, 655, NULL, "P??riodicit?? de suivi DRS (nombre/an)", ""),
      (673, "Observations transition ??cologique", 0, 1, 3, 0, NULL, 655, NULL, "Observations transition ??cologique", ""),
      (674, "Source de donn??es transition ??cologique", 0, 1, 3, 1, NULL, 655, NULL, "Source de donn??es transition ??cologique", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 661 WHERE id = 79`);
    sql.push(`UPDATE indicateur set id_question = 664 WHERE id = 80`);

    // DD
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (81, "Nombre de politiques sectorielles align??es au DD ", "", 29, 0, 0, 1),
      (82, "Nombre de promoteur ayant un label de DD ", "", 29, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (675, "Intitul?? de la SNICDD", 1, 1, 3, 1, NULL, NULL, NULL, "Intitul?? de la SNICDD", ""),
      (676, "Date d'??laboration de la SNICDD", 0, 1, 3, 0, NULL, 675, NULL, "Date d'??laboration de la SNICDD", ""),
      (677, "Parties prenantes dans l'??laboration", 0, 1, 3, 0, NULL, 675, NULL, "Parties prenantes dans l'??laboration", ""),
      (678, "SNICDD op??rationnelle (oui/non)", 0, 1, 3, 0, NULL, 675, NULL, "SNICDD op??rationnelle (oui/non)", ""),
      (679, "Intitul?? de politique sectorielle align??e au DD", 0, 1, 3, 1, NULL, 675, NULL, "Intitul?? de politique sectorielle align??e au DD", ""),
      (680, "Objectif de politique sectorielle align??e au DD", 0, 1, 3, 0, NULL, 675, NULL, "Objectif de politique sectorielle align??e au DD", ""),
      (681, "Date d'adoption de politique sectorielle align??e au DD", 0, 1, 3, 0, NULL, 675, NULL, "Date d'adoption de politique sectorielle align??e au DD", ""),
      (682, "Politique sectorielle align??e au DD op??rationnelle (oui/non)", 0, 1, 3, 0, NULL, 675, NULL, "Politique sectorielle align??e au DD op??rationnelle (oui/non)", ""),
      (683, "Intitul?? de politique de d??veloppement et de planification territoriale align??e au DD (PRD, PCD, SAC)", 0, 1, 3, 1, NULL, 675, NULL, "Intitul?? de politique de d??veloppement et de planification territoriale align??e au DD (PRD, PCD, SAC)", ""),
      (684, "Objectif de politique de d??veloppement et de planification territoriale align??e au DD (PRD, PCD, SAC)", 0, 1, 3, 0, NULL, 675, NULL, "Objectif de politique de d??veloppement et de planification territoriale align??e au DD (PRD, PCD, SAC)", ""),
      (685, "Date d'adoption de politique de d??veloppement et de planification territoriale align??e au DD (PRD, PCD, SAC)", 0, 1, 3, 0, NULL, 675, NULL, "Date d'adoption de politique de d??veloppement et de planification territoriale align??e au DD (PRD, PCD, SAC)", ""),
      (686, "Politique de d??veloppement et de planification territoriale align??e au DD (PRD, PCD, SAC) op??rationnelle (oui/non)", 0, 1, 3, 0, 81, 675, NULL, "Politique de d??veloppement et de planification territoriale align??e au DD (PRD, PCD, SAC) op??rationnelle (oui/non)", ""),
      (687, "Nom de promoteur ayant un label de DD", 0, 1, 3, 1, 82, 675, NULL, "Nom de promoteur ayant un label de DD", ""),
      (688, "Date d'obtention du label", 0, 1, 3, 0, NULL, 675, NULL, "Date d'obtention du label", ""),
      (689, "Commune d'obtention du label", 0, 1, 3, 1, NULL, 675, NULL, "Commune d'obtention du label", ""),
      (690, "Label toujours valide (oui/non)", 0, 1, 3, 0, NULL, 675, NULL, "Label toujours valide (oui/non)", ""),
      (691, "Intitul?? du projet/programme en DD d??velopp??", 0, 1, 3, 1, NULL, 675, NULL, "Intitul?? du projet/programme en DD d??velopp??", ""),
      (692, "Ann??e de d??but projet/programme en DD", 0, 1, 3, 0, NULL, 675, NULL, "Ann??e de d??but projet/programme en DD", ""),
      (693, "Ann??e de fin projet/programme en DD", 0, 1, 3, 0, NULL, 675, NULL, "Ann??e de fin projet/programme en DD", ""),
      (694, "Initiateur du projet/programme en DD", 0, 1, 3, 0, NULL, 675, NULL, "Initiateur du projet/programme en DD", ""),
      (695, "Intitul?? du financement dans le cadre du DD", 0, 1, 3, 0, NULL, 675, NULL, "Intitul?? du financement dans le cadre du DD", ""),
      (696, "Source de financement (interne ou externe)", 0, 1, 3, 0, NULL, 675, NULL, "Source de financement (interne ou externe)", ""),
      (697, "Date d'accord de financement", 0, 1, 3, 0, NULL, 675, NULL, "Date d'accord de financement", ""),
      (698, "Montant du financement (Ariary)", 0, 1, 3, 1, NULL, 675, NULL, "Montant du financement (Ariary)", ""),
      (699, "Observations DD", 0, 1, 3, 0, NULL, 675, NULL, "Observations DD", ""),
      (700, "Source de donn??es DD", 0, 1, 3, 1, NULL, 675, NULL, "Source de donn??es DD", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 686 WHERE id = 81`);
    sql.push(`UPDATE indicateur set id_question = 687 WHERE id = 82`);

    // PSE
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (83, "Nombre d'activit??s PSE d??velopp??es", "", 30, 0, 0, 1),
      (84, "Nombre de m??nages b??n??ficiaires des activit??s de PSE", "", 30, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (701, "Type de Services Environnementaux (r??gulation, production, ???)", 1, 1, 3, 0, NULL, NULL, NULL, "Type de Services Environnementaux (r??gulation, production, ???)", ""),
      (702, "Fournisseur du SE (projets, Etat, communaut??, ???)", 0, 1, 3, 0, NULL, 701, NULL, "Fournisseur du SE (projets, Etat, communaut??, ???)", ""),
      (703, "Commune d'oimplantation du PSE", 0, 1, 3, 1, NULL, 701, NULL, "Commune d'oimplantation du PSE", ""),
      (704, "Intitul?? de l'activit?? de PSE d??velopp??e", 0, 1, 3, 1, NULL, 701, NULL, "Intitul?? de l'activit?? de PSE d??velopp??e", ""),
      (705, "Activit??s de PSE appuy??es (oui/non)", 0, 1, 3, 0, NULL, 701, NULL, "Activit??s de PSE appuy??es (oui/non)", ""),
      (706, "Type d'appui venant du PSE (dotation mat??riels, formation, AGR???)", 0, 1, 3, 0, NULL, 701, NULL, "Type d'appui venant du PSE (dotation mat??riels, formation, AGR???)", ""),
      (707, "Source de financement du PSE (interne ou externe)", 0, 1, 3, 1, NULL, 701, NULL, "Source de financement du PSE (interne ou externe)", ""),
      (708, "Projet d'appui du PSE (si externe)", 0, 1, 3, 1, NULL, 701, NULL, "Projet d'appui du PSE (si externe)", ""),
      (709, "Nombre de m??nages b??n??ficiaires du PSE", 0, 1, 3, 1, NULL, 701, NULL, "Nombre de m??nages b??n??ficiaires du PSE", ""),
      (710, "Micro-projets financ??s (oui/non)", 0, 1, 3, 0, NULL, 701, NULL, "Micro-projets financ??s (oui/non)", ""),
      (711, "Lequel/lesquels?", 0, 1, 3, 0, NULL, 701, NULL, "Lequel/lesquels?", ""),
      (712, "Micro projets alternatifs r??alis??s (liste)", 0, 1, 3, 0, NULL, 701, NULL, "Micro projets alternatifs r??alis??s (liste)", ""),
      (713, "Micro-projets sont suivis (oui/non)", 0, 1, 3, 0, NULL, 701, NULL, "Micro-projets sont suivis (oui/non)", ""),
      (714, "Fili??res de la biodiversit?? dot??es de m??canismes de partage ??quitable de b??n??fices (liste)", 0, 1, 3, 0, NULL, 701, NULL, "Fili??res de la biodiversit?? dot??es de m??canismes de partage ??quitable de b??n??fices (liste)", ""),
      (715, "Projets alternatifs aux pressions mis en ??uvre dans les zones d'intervention (liste)", 0, 1, 3, 0, NULL, 701, NULL, "Projets alternatifs aux pressions mis en ??uvre dans les zones d'intervention (liste)", ""),
      (716, "Structures intercommunales appuy??es (liste)", 0, 1, 3, 0, NULL, 701, NULL, "Structures intercommunales appuy??es (liste)", ""),
      (717, "Etudes de fili??res en relation avec les PSE r??alis??es (liste)", 0, 1, 3, 0, NULL, 701, NULL, "Etudes de fili??res en relation avec les PSE r??alis??es (liste)", ""),
      (718, "Valeur des services ecosyst??miques fournis (culturelle, ??conimique, ???)", 0, 1, 3, 0, NULL, 701, NULL, "Valeur des services ecosyst??miques fournis (culturelle, ??conimique, ???)", ""),
      (719, "Observations PSE", 0, 1, 3, 0, NULL, 701, NULL, "Observations PSE", ""),
      (720, "Source de donn??es PSE", 0, 1, 3, 1, NULL, 701, NULL, "Source de donn??es PSE", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 704 WHERE id = 83`);
    sql.push(`UPDATE indicateur set id_question = 709 WHERE id = 84`);

    // Corruption
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (85, "Nombre de dol??ances sur la corruption re??ues", "", 31, 0, 0, 1),
      (86, "Nombre de dol??ances sur la corruption trait??es", "", 31, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (721, "Type de dol??ances (corruption, manquement au code de d??ontologie et ethique environnementale)", 1, 1, 3, 1, 82, NULL, NULL, "Type de dol??ances (corruption, manquement au code de d??ontologie et ethique environnementale)", ""),
      (722, "Dol??ances trait??es (oui/non)", 0, 1, 3, 1, 86, 721, NULL, "Dol??ances trait??es (oui/non)", ""),
      (723, "Commune de r??ception de la dol??ance", 0, 1, 3, 1, NULL, 721, NULL, "Commune de r??ception de la dol??ance", ""),
      (724, "Type de corruption (actif, passif)", 0, 1, 3, 0, NULL, 721, NULL, "Type de corruption (actif, passif)", ""),
      (725, "Transmission des cas de corruption au Conseil de disipline (oui/non)", 0, 1, 3, 0, NULL, 721, NULL, "Transmission des cas de corruption au Conseil de disipline (oui/non)", ""),
      (726, "Sanction par le Conseil de discipline", 0, 1, 3, 0, NULL, 721, NULL, "Sanction par le Conseil de discipline", ""),
      (727, "Transmission ?? la juridication comp??tente des affaires de corruption (oui/non)", 0, 1, 3, 0, NULL, 721, NULL, "Transmission ?? la juridication comp??tente des affaires de corruption (oui/non)", ""),
      (728, "Nombre de personnes condamn??es pour corruption", 0, 1, 3, 0, NULL, 721, NULL, "Nombre de personnes condamn??es pour corruption", ""),
      (729, "Nombre de prevention dans le cadre de la lutte anti corruption", 0, 1, 3, 0, NULL, 721, NULL, "Nombre de prevention dans le cadre de la lutte anti corruption", ""),
      (730, "Nombre d'infraction de blanchiment de capitaux retenu par le SAMIFIN", 0, 1, 3, 0, NULL, 721, NULL, "Nombre d'infraction de blanchiment de capitaux retenu par le SAMIFIN", ""),
      (731, "M??diatisation des poursuites judiciaires en mati??re de trafic de ressources naturelles (oui/non)", 0, 1, 3, 0, NULL, 721, NULL, "M??diatisation des poursuites judiciaires en mati??re de trafic de ressources naturelles (oui/non)", ""),
      (732, "Nombre d'intervention du BIANCO ", 0, 1, 3, 0, NULL, 721, NULL, "Nombre d'intervention du BIANCO ", ""),
      (733, "Observations corruption", 0, 1, 3, 0, NULL, 721, NULL, "Observations corruption", ""),
      (734, "Source de donn??es corruption", 0, 1, 3, 1, NULL, 721, NULL, "Source de donn??es corruption", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 721 WHERE id = 85`);
    sql.push(`UPDATE indicateur set id_question = 721 WHERE id = 86`);

    // Run sql
    sql.forEach((line) => {
      const temp = database.exec(line); //(line, [], database)
    });
  }

  getDatabase() {
    return new sqlite3.Database(
      path.join(app.getPath("userData"), this.dbPath),
      (err) => {
        if (err) {
          // console.log('Could not connect to database', err)
          log.error("Could not connect to database", err);
          log.error(
            "path : " + path.join(app.getPath("userData"), this.dbPath)
          );
        } else {
          // console.log('Connected to database')
          log.info("Connected to database");
        }
      }
    );
  }

  runDB(sql, params = [], database) {
    return new Promise((resolve, reject) => {
      database.run(sql, params, function (err) {
        if (err) {
          log.error("Error running sql " + sql);
          log.error(err);
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  getDB(sql, params = [], database) {
    return new Promise((resolve, reject) => {
      database.get(sql, params, (err, result) => {
        if (err) {
          log.error("Error running sql: " + sql);
          log.error(err);
          reject(err);
        } else {
          log.info("database:");
          log.info(result);

          resolve(result);
        }
      });
    });
  }

  allDB(sql, params = [], database) {
    return new Promise((resolve, reject) => {
      database.all(sql, params, (err, rows) => {
        if (err) {
          log.error("Error running sql: " + sql);
          log.error(err);
          reject(err);
        } else {
          // log.info("database: allDB");
          // log.info(sql);
          // log.info(params);
          // log.info(rows);

          resolve(rows);
        }
      });
    });
  }

  run(sql, params = []) {
    let database = this.getDatabase();
    const resp = this.runDB(sql, params, database);
    database.close;
    return resp;
  }

  get(sql, params = []) {
    let database = this.getDatabase();
    const resp = this.getDB(sql, params, database);
    database.close;
    return resp;
  }

  all(sql, params = []) {
    let database = this.getDatabase();
    const resp = this.allDB(sql, params, database);
    database.close;
    return resp;
  }

  execute(sql, params = []) {
    let database;
    try {
      database = this.getDatabase();
      const resp = database.exec(sql, (error) => {
        log.info("error execute :");
        log.info(error);
        log.info("--------------------------");
      });
      return resp;
    } catch (error) {
      log.info("error execute :");
      log.info(error);
      log.info("--------------------------");
    } finally {
      database.close;
    }
  }
}

module.exports = BaseDao;
