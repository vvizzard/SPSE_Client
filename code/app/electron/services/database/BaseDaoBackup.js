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
        (3,'Aires protégées (AP)','Cantonnement'),
        (4,'Biodiversité','Cantonnement'),
        (5,'Cadre national et international (juridique, politique, stratégique)','Centrale'),
        (6,'Changement Climatique et REDD+ (région)','Cantonnement'),
        (7, 'Changement Climatique et REDD+ (centrale)', 'Centrale'),
        (8,'Contrôles environnementaux','Cantonnement'),
        (9, 'Contrôles forêstiers', 'Cantonnement'),
        (10,'Partenariat','Centrale'),
        (11,'Economie verte','Cantonnement'),
        (12,'Environnement (pollution, évaluation environnementale, gouvernance)','Centrale'),
        (13,'Feux ','Cantonnement'),
        (14,'Finances','Centrale'),
        (15,'Informations générales','Centrale'),
        (16,'Informations, education, communication (IEC)','Tous'),
        (17,'Logistique (Infrastructure)','Tous'),
        (18, 'Logistique (Matériel roulant)', 'Tous'),
        (19, 'Logistique (Matériel informatique)', 'Tous'),
        (20, 'Logistique (Matériel mobilier)', 'Tous'),
        (21,'Outils (guide, manuel)','Centrale'),
        (22,'Planification, programmation, suivi-evaluation','Centrale'),
        (23,'Reboisement et gestion des terres','Cantonnement'),
        (24,'Recherche et développement','Centrale'),
        (25,'Responsabilité Sociétale des Entreprises (RSE : reboisements, éducation environnementale, ...)','Centrale'),
        (26,'Ressources humaines','Tous'),
        (27,'Transfert de gestion','Centrale'),
        (28, 'Pépinière', 'Cantonnement'),
        (29,'Developpement durable (economie, sociale, environnement, culture)','Centrale'),
        (30,'Paiement des services environnementaux (PSE)','Centrale'),
        (31,'Corruption','Tous')`);

    // Actes administratifs
    /*(1, "Quantité de produit ayant un permis de coupe", "", 1, 1, 0, 0),
    //(2, "Quantité de produit ayant un autorisatin de coupe", "", 1, 1, 0, 0),
    //(3, "Quantité de produit ayant un permis d'exploitation", "", 1, 1, 0, 0),*/
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (1, "Quantité de produit déclaré", "", 1, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (1, "Commune d'intervention pour les actes", 1, 1, 3, 1, NULL, NULL, NULL, "Commune d'intervention pour les actes", ""),
      (2, "Type d'actes administratrifs (permis de coupe, autorisation de coupe, permis d'exploitation, convention de collecte PFNL)", 0, 1, 3, 1, NULL, 1, NULL, "Type d'actes administratrifs (permis de coupe, autorisation de coupe, permis d'exploitation, convention de collecte PFNL)", ""),
      (3, "Référence de l'acte administratif", 0, 1, 3, 1, NULL, 1, NULL, "Référence de l'acte administratif", ""),
      (4, "Types de produits inscrits dans l'acte administratif (Anacarde (kg), Baie rose (kg), Bois COS (m³), Bois de chauffe (stère), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))", 0, 1, 3, 1, 1, 1, NULL, "Types de produits inscrits dans l'acte administratif (Anacarde (kg), Baie rose (kg), Bois COS (m³), Bois de chauffe (stère), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))", ""),
      (5, "Espèces concernées par l'acte administratif", 0, 1, 3, 1, NULL, 1, NULL, "Espèces concernées par l'acte administratif", ""),
      (6, "Quantité totale des produits inscrits dans l'acte administratif", 0, 1, 3, 1, NULL, 1, NULL, "Quantité totale des produits inscrits dans l'acte administratif", ""),
      (7, "Quantité des produits exportés inscrits dans l'acte administratif", 0, 1, 3, 1, NULL, 1, NULL, "Quantité des produits exportés inscrits dans l'acte administratif", ""),
      (8, "Destination des produits inscrits dans l'acte administratif (autoconsommation/marché local/marché national/exportation)", 0, 1, 3, 1, NULL, 1, NULL, "Destination des produits inscrits dans l'acte administratif (autoconsommation/marché local/marché national/exportation)", ""),
      (9, "Existence d'autorisation de transport octroyée (oui/non)", 0, 1, 3, 1, NULL, 1, NULL, "Existence d'autorisation de transport octroyée (oui/non)", ""),
      (10, "Référence d'autorisation de transport", 0, 1, 3, 1, NULL, 1, NULL, "Référence d'autorisation de transport", ""),
      (11, "Existence de laissez-passer délivré (oui/non)", 0, 1, 3, 1, NULL, 1, NULL, "Existence de laissez-passer délivré (oui/non)", ""),
      (12, "Référence de laissez-passer", 0, 1, 3, 1, NULL, 1, NULL, "Référence de laissez-passer", ""),
      (13, "Nom de l'opérateur", 0, 1, 3, 0, NULL, 1, NULL, "Nom de l'opérateur", ""),
      (14, "Exportateur agréé (oui/non)", 0, 1, 3, 0, NULL, 1, NULL, "Exportateur agréé (oui/non)", ""),
      (15, "Valeur (annuelle) des produits à l'exportation (Ariary)", 0, 1, 3, 0, NULL, 1, NULL, "Valeur (annuelle) des produits à l'exportation (Ariary)", ""),
      (16, "Acte de conformité/de refus d'importation des produits avec référence", 0, 1, 3, 0, NULL, 1, NULL, "Acte de conformité/de refus d'importation des produits avec référence", ""),
      (17, "Observations actes administratifs exploitation", 0, 1, 3, 0, NULL, 1, NULL, "Observations actes administratifs exploitation", ""),
      (18, "Source de données actes administratifs exploitation", 0, 1, 3, 1, NULL, 1, NULL, "Source de données actes administratifs exploitation", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 6 WHERE id = 1`);

    // Acte administratif (recherche)
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (2, "Nombre d'autorisation de recherche délivrée", "", 2, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (19, "Autorisation de recherche délivrée (oui/non)", 1, 1, 3, 1, 2, NULL, NULL, "Autorisation de recherche délivrée (oui/non)", ""),
      (20, "Référence d'autorisation de recherche", 0, 1, 3, 1, NULL, 19, NULL, "Référence d'autorisation de recherche", ""),
      (21, "Produits associés (faune ou flore)", 0, 1, 3, 1, NULL, 19, NULL, "Produits associés (faune ou flore)", ""),
      (22, "Espèces mises en jeu", 0, 1, 3, 0, NULL, 19, NULL, "Espèces mises en jeu", ""),
      (23, "Quotas de prélèvement", 0, 1, 3, 0, NULL, 19, NULL, "Quotas de prélèvement", ""),
      (24, "Observations actes administratifs recherche", 0, 1, 3, 0, NULL, 19, NULL, "Observations actes administratifs recherche", ""),
      (25, "Source de données actes administratifs recherche", 0, 1, 3, 1, NULL, 19, NULL, "Source de données actes administratifs recherche", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 19 WHERE id = 2`);

    //Aires protégées
    // Superficie des Aires protégées terrestres
    // Superficie des Aires protégées marines
    // Nombre AP ayant un gestionnaire
    // Efficacité de gestion
    // Nombre des aires protégées marines
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (5, "Superficie des Aires protégées", "", 3, 1, 0, 0),
      (6, "Nombre des aires protégées gérées", "", 3, 0, 0, 1),
      (7, "Nombre de ménages bénéficiant des activités de conservations/développement (AGR)", "", 3, 1, 0, 0),
      (8, "Nombre d'activités réalisées dans les PAG", "", 3, 1, 0, 0),
      (10, "Superficie restaurée", "", 3, 1, 0, 0)`
    );
    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (60, "Nom de l'AP", 1, 1, 3, 1, 9, NULL, NULL, "Nom de l'AP", ""),
      (61, "Catégorie de l'AP (I, II, III, IV, V, VI, Autre)", 0, 1, 3, 1, NULL, 60, NULL, "Catégorie de l'AP (I, II, III, IV, V, VI, Autre)", ""),
      (62, "Statut temporaire ou définitif", 0, 1, 3, 0, NULL, 60, NULL, "Statut temporaire ou définitif", ""),
      (63, "Décret si définitif", 0, 1, 3, 0, NULL, 60, NULL, "Décret si définitif", ""),
      (64, "Shapefile de l'AP", 0, 1, 3, 1, NULL, 60, NULL, "Shapefile de l'AP", ""),
      (65, "Type : terrestre ou marine", 0, 1, 3, 1, 5, 60, NULL, "Type : terrestre ou marine", ""),
      (66, "Présence de zones humides (oui/non)", 0, 1, 3, 1, NULL, 60, NULL, "Présence de zones humides (oui/non)", ""),
      (67, "Superficie zones humides (ha)", 0, 1, 3, 1, NULL, 60, NULL, "Superficie zones humides (ha)", ""),
      (68, "Nom du gestionnaire", 0, 1, 3, 1, 6, 60, NULL, "Nom du gestionnaire", ""),
      (69, "Nombre de ménages bénéficiant des activités de conservations/développement (AGR)", 0, 1, 3, 1, NULL, 60, NULL, "Nombre de ménages bénéficiant des activités de conservations/développement (AGR)", ""),
      (70, "Existence de PAG élaboré (oui/non)", 0, 1, 3, 1, NULL, 60, NULL, "Existence de PAG élaboré (oui/non)", ""),
      (71, "Nombre d'activités dans le PAG", 0, 1, 3, 1, NULL, 60, NULL, "Nombre d'activités dans le PAG", ""),
      (72, "Nombre d'activités réalisées dans le PAG", 0, 1, 3, 1, NULL, 60, NULL, "Nombre d'activités réalisées dans le PAG", ""),
      (73, "Existence de PGES élaboré (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "Existence de PGES élaboré (oui/non)", ""),
      (74, "Existence de EIE réalisé (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "Existence de EIE réalisé (oui/non)", ""),
      (75, "Existence de permis environnemental délivré (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "Existence de permis environnemental délivré (oui/non)", ""),
      (76, "AP redélimitée (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP redélimitée (oui/non)", ""),
      (77, "Superficie de l'AP (ha)", 0, 1, 3, 1, NULL, 60, NULL, "Superficie de l'AP (ha)", ""),
      (78, "Superficie restaurée dans l'AP (ha)", 0, 1, 3, 1, NULL, 60, NULL, "Superficie restaurée dans l'AP (ha)", ""),
      (79, "Contrat de délégation de gestion signé (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "Contrat de délégation de gestion signé (oui/non)", ""),
      (80, "AP disposant de structures opérationnelles de gestion (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP disposant de structures opérationnelles de gestion (oui/non)", ""),
      (81, "AP dont la création et la gestion sont appuyées (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP dont la création et la gestion sont appuyées (oui/non)", ""),
      (82, "Type d'appui pour l'AP (dotation matériels, formation, AGR, …)", 0, 1, 3, 0, NULL, 60, NULL, "Type d'appui pour l'AP (dotation matériels, formation, AGR, …)", ""),
      (83, "Source de financement de l'AP (interne ou externe)", 0, 1, 3, 1, NULL, 60, NULL, "Source de financement de l'AP (interne ou externe)", ""),
      (84, "Projet d'appui de l'AP (si externe)", 0, 1, 3, 1, NULL, 60, NULL, "Projet d'appui de l'AP (si externe)", ""),
      (85, "AP dotée d'un système de gestion administrative et financière (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP dotée d'un système de gestion administrative et financière (oui/non)", ""),
      (86, "AP dotée d'un système de suivi écologique opérationnel (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP dotée d'un système de suivi écologique opérationnel (oui/non)", ""),
      (87, "AP disposant d'un résultat de suivi écologique (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP disposant d'un résultat de suivi écologique (oui/non)", ""),
      (88, "AP dotée de système de gestion des feux (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP dotée de système de gestion des feux (oui/non)", ""),
      (89, "AP dotée d'un système de surveillance et de contrôle opérationnel (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP dotée d'un système de surveillance et de contrôle opérationnel (oui/non)", ""),
      (90, "AP avec maintenance/entretien des infrastructures de conservation assurés (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP avec maintenance/entretien des infrastructures de conservation assurés (oui/non)", ""),
      (91, "AP dotée d'infrastructures écotouristiques (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP dotée d'infrastructures écotouristiques (oui/non)", ""),
      (92, "AP avec maintenance et entretien des infrastructures écotouristiques et de service assurés (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP avec maintenance et entretien des infrastructures écotouristiques et de service assurés (oui/non)", ""),
      (93, "AP faisant objet d'un zonage matérialisé (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP faisant objet d'un zonage matérialisé (oui/non)", ""),
      (94, "AP mettant en œuvre dans leurs ZP des programmes spécifiques d'éducation environnementale (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP mettant en œuvre dans leurs ZP des programmes spécifiques d'éducation environnementale (oui/non)", ""),
      (95, "AP faisant objet de restauration d’habitats (oui/non)", 0, 1, 3, 0, NULL, 60, NULL, "AP faisant objet de restauration d’habitats (oui/non)", ""),
      (96, "Indice d'efficacité globale de gestion de l'AP", 0, 1, 3, 1, NULL, 60, NULL, "Indice d'efficacité globale de gestion de l'AP", ""),
      (97, "Liste des menaces et pressions recensées", 0, 1, 3, 0, NULL, 60, NULL, "Liste des menaces et pressions recensées", ""),
      (98, "Taux de réduction des menaces au niveau de l'AP (%)", 0, 1, 3, 0, NULL, 60, NULL, "Taux de réduction des menaces au niveau de l'AP (%)", ""),
      (99, "Taux de déforestation annuelle (%)", 0, 1, 3, 0, NULL, 60, NULL, "Taux de déforestation annuelle (%)", ""),
      (100, "Nom de sites hors AP disposant de plan d'aménagement et de gestion écotouristique opérationnel (liste)", 0, 1, 3, 0, NULL, 60, NULL, "Nom de sites hors AP disposant de plan d'aménagement et de gestion écotouristique opérationnel (liste)", ""),
      (101, "Observations AP", 0, 1, 3, 0, NULL, 60, NULL, "Observations AP", ""),
      (102, "Source de données AP", 0, 1, 3, 1, NULL, 60, NULL, "Source de données AP", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 77 WHERE id = 5`);
    sql.push(`UPDATE indicateur set id_question = 68 WHERE id = 6`);
    sql.push(`UPDATE indicateur set id_question = 69 WHERE id = 7`);
    sql.push(`UPDATE indicateur set id_question = 72 WHERE id = 8`);
    sql.push(`UPDATE indicateur set id_question = 78 WHERE id = 10`);

    //Biodiversité

    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (11, "Nombre d'espèces objet de trafic illicite", "", 4, 0, 0, 1),
      (12, "Quantité saisie ", "", 4, 1, 0, 0)`
    );
    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (103, "Espèce inventoriée", 1, 1, 3, 1, 12, NULL, NULL, "Espèce inentoriée", ""),
      (104, "Nom vernaculaire", 0, 1, 3, 1, NULL, 103, NULL, "Nom vernaculaire", ""),
      (105, "Commune d'intervention pour l'inventaire", 0, 1, 3, 1, NULL, 103, NULL, "Commune d'intervention pour l'inventaire", ""),
      (106, "Longitude (degré décimal) : X", 0, 1, 3, 1, NULL, 103, NULL, "Longitude (degré décimal) : X", ""),
      (107, "Latitude (degré décimal) : Y", 0, 1, 3, 1, NULL, 103, NULL, "Latitude (degré décimal) : Y", ""),
      (108, "Shapefile correspondant biodiversité", 0, 1, 3, 0, NULL, 103, NULL, "Shapefile correspondant biodiversité", ""),
      (109, "Statut UICN", 0, 1, 3, 0, NULL, 103, NULL, "Statut UICN", ""),
      (110, "Endémique (oui/non)", 0, 1, 3, 0, NULL, 103, NULL, "Endémique (oui/non)", ""),
      (111, "Ressource phare (oui/non)", 0, 1, 3, 0, NULL, 103, NULL, "Ressource phare (oui/non)", ""),
      (112, "Ressource menacée (oui/non)", 0, 1, 3, 0, NULL, 103, NULL, "Ressource menacée (oui/non)", ""),
      (113, "Cible de conservation (oui/non)", 0, 1, 3, 0, NULL, 103, NULL, "Cible de conservation (oui/non)", ""),
      (114, "Nom de l'AP de provenance de la ressource", 0, 1, 3, 0, NULL, 103, NULL, "Nom de l'AP de provenance de la ressource", ""),
      (115, "Liste des menaces et pressions recensées", 0, 1, 3, 0, NULL, 103, NULL, "Liste des menaces et pressions recensées", ""),
      (116, "Liste PFL associés", 0, 1, 3, 0, NULL, 103, NULL, "Liste PFL associés", ""),
      (117, "PFL inscrit dans CITES (oui/non)", 0, 1, 3, 0, NULL, 103, NULL, "PFL inscrit dans CITES (oui/non)", ""),
      (118, "Liste PFNL associés", 0, 1, 3, 0, NULL, 103, NULL, "Liste PFNL associés", ""),
      (119, "PFNL inscrit dans CITES (oui/non)", 0, 1, 3, 0, NULL, 103, NULL, "PFNL inscrit dans CITES (oui/non)", ""),
      (120, "Existence de filière concernant la ressource/biodiversité (oui/non)", 0, 1, 3, 0, NULL, 103, NULL, "Existence de filière concernant la ressource/biodiversité (oui/non)", ""),
      (121, "Appui financier et/ou technique de la filière (oui/non)", 0, 1, 3, 0, NULL, 103, NULL, "Appui financier et/ou technique de la filière (oui/non)", ""),
      (122, "Source de financement de l'inventaire de biodiversité (interne ou externe)", 0, 1, 3, 1, NULL, 103, NULL, "Source de financement de l'inventaire de biodiversité (interne ou externe)", ""),
      (123, "Projet d'appui pour l'inventaire de biodiversité (si externe)", 0, 1, 3, 1, NULL, 103, NULL, "Projet d'appui pour l'inventaire de biodiversité (si externe)", ""),
      (124, "Espèce objet de trafic illicite (oui/non)", 0, 1, 3, 1, NULL, 103, NULL, "Espèce objet de trafic illicite (oui/non)", ""),
      (125, "Date de constat", 0, 1, 3, 0, NULL, 103, NULL, "Date de constat", ""),
      (126, "Quantité saisie", 0, 1, 3, 1, NULL, 103, NULL, "Quantité saisie", ""),
      (127, "Unité de mesures des effets saisis", 0, 1, 3, 0, NULL, 103, NULL, "Unité de mesures des effets saisis", ""),
      (128, "Dossier de traffic traité (oui/non)", 0, 1, 3, 0, NULL, 103, NULL, "Dossier de traffic traité (oui/non)", ""),
      (129, "Référence du dossier", 0, 1, 3, 0, NULL, 103, NULL, "Référence du dossier", ""),
      (130, "Images de la biodiversité", 0, 1, 3, 0, NULL, 103, NULL, "Images de la biodiversité", ""),
      (131, "Observations biodiversité", 0, 1, 3, 0, NULL, 103, NULL, "Observations biodiversité", ""),
      (132, "Source de données biodiversité", 0, 1, 3, 1, NULL, 103, NULL, "Source de données biodiversité", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 103 WHERE id = 11`);
    sql.push(`UPDATE indicateur set id_question = 126 WHERE id = 12`);

    //Cadre national et international

    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (13, "Nombre total de textes", "", 5, 0, 0, 1),
      (14, "Nombre de textes mis à jour", "", 5, 0, 0, 1),
      (15, "Nombre de texte", "", 5, 0, 0, 1),
      (16, "Nombre de textes adoptés", "", 5, 0, 0, 1)`
    );
    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (133, "Intitulé du cadre", 1, 1, 3, 1, NULL, NULL, NULL, "Intitulé du cadre", ""),
      (134, "Type (Convention, Loi, Décret, Arrêté, Circulaire)", 0, 1, 3, 1, 15, 133, NULL, "Type (Convention, Loi, Décret, Arrêté, Circulaire)", ""),
      (135, "Cadre legislatif ou technique", 0, 1, 3, 1, NULL, 133, NULL, "Cadre legislatif ou technique", ""),
      (136, "Thématique", 0, 1, 3, 1, NULL, 133, NULL, "Thématique", ""),
      (137, "Objectifs du cadre", 0, 1, 3, 1, NULL, 133, NULL, "Objectifs du cadre", ""),
      (138, "Date de promulgation", 0, 1, 3, 1, NULL, 133, NULL, "Date de promulgation", ""),
      (139, "Date de validation", 0, 1, 3, 1, NULL, 133, NULL, "Date de validation", ""),
      (140, "Secteur concerné par le cadre", 0, 1, 3, 1, NULL, 133, NULL, "Secteur concerné par le cadre", ""),
      (141, "Légiferer (oui/non)", 0, 1, 3, 1, NULL, 133, NULL, "Légiferer (oui/non)", ""),
      (142, "Nouveau (oui/non)", 0, 1, 3, 1, NULL, 133, NULL, "Nouveau (oui/non)", ""),
      (143, "Mis à jour (oui/non)", 0, 1, 3, 1, 14, 133, NULL, "Mis à jour (oui/non)", ""),
      (144, "Ratifié (oui/non)", 0, 1, 3, 1, NULL, 133, NULL, "Ratifié (oui/non)", ""),
      (145, "Adopté (oui/non)", 0, 1, 3, 1, 16, 133, NULL, "Adopté (oui/non)", ""),
      (146, "Cadre mis en œuvre (oui/non)", 0, 1, 3, 1, NULL, 133, NULL, "Cadre mis en œuvre (oui/non)", ""),
      (147, "Intégrant la cohérence intersectorielle sur la gestion environnementale et climatique (oui/non)", 0, 1, 3, 1, NULL, 133, NULL, "Intégrant la cohérence intersectorielle sur la gestion environnementale et climatique (oui/non)", ""),
      (148, "Textes d'application (liste)", 0, 1, 3, 1, NULL, 133, NULL, "Textes d'application (liste)", ""),
      (149, "Observations cadre", 0, 1, 3, 0, NULL, 133, NULL, "Observations cadre", ""),
      (150, "Source de données cadre", 0, 1, 3, 1, NULL, 133, NULL, "Source de données cadre", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 133 WHERE id = 13`);
    sql.push(`UPDATE indicateur set id_question = 133 WHERE id = 14`);
    sql.push(`UPDATE indicateur set id_question = 133 WHERE id = 15`);
    sql.push(`UPDATE indicateur set id_question = 133 WHERE id = 16`);

    // CC et REDD+
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (18, "Nombre de victime touchées par les catastrophes naturelles", "", 6, 1, 0, 0)`
    );
    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (151, "Nature des catastrophes naturelles", 1, 1, 3, 1, NULL, NULL, NULL, "Nature des catastrophes naturelles", ""),
      (167, "Date de la catastrophe naturelle", 0, 1, 3, 1, NULL, 151, NULL, "Date de la catastrophe naturelle", ""),
      (168, "Nombre de victimes corporelles dues aux catastrophes naturelles", 0, 1, 3, 1, NULL, 151, NULL, "Nombre de victimes corporelles dues aux catastrophes naturelles", ""),
      (169, "Nombre de personnes déplacées pour cause d’aléas climatiques", 0, 1, 3, 1, NULL, 151, NULL, "Nombre de personnes déplacées pour cause d’aléas climatiques", ""),
      (170, "Matériels endommagés dus aux catastrophes naturelles", 0, 1, 3, 1, NULL, 151, NULL, "Matériels endommagés dus aux catastrophes naturelles", ""),
      (171, "Ampleur des dommages matériels dus aux catastrophes naturelles (faible, moyen, fort)", 0, 1, 3, 1, NULL, 151, NULL, "Ampleur des dommages matériels dus aux catastrophes naturelles (faible, moyen, fort)", ""),
      (172, "Liste de zones enclavées suite aux aléas climatiques", 0, 1, 3, 1, NULL, 151, NULL, "Liste de zones enclavées suite aux aléas climatiques", ""),
      (173, "Observations CC et REDD+", 0, 1, 3, 1, NULL, 151, NULL, "Observations CC et REDD+", ""),
      (174, "Source de données CC et REDD+", 0, 1, 3, 1, NULL, 151, NULL, "Source de données CC et REDD+", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 168 WHERE id = 18`);

    // CC et REDD+ (centrale)
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (87, "Nombre de ménages bénéficiaires d'action de lutte contre le changement climatique", "", 7, 1, 0, 0),
      (88, "Surface de forêts gérées dans le cadre du CC et REDD+", "", 7, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (735, "Nom des plans de mise en œuvre de la Politique Nationale de Lutte contre le Changement Climatique mise en place", 1, 1, 3, 1, NULL, NULL, NULL, "Nom des plans de mise en œuvre de la Politique Nationale de Lutte contre le Changement Climatique mise en place", ""),
      (736, "Nom de projet d'adaptation et résilience au changement climatique et REDD+", 0, 1, 3, 1, NULL, 735, NULL, "Nom de projet d'adaptation et résilience au changement climatique et REDD+", ""),
      (737, "Plan et projet mis en œuvre (oui/non)", 0, 1, 3, 1, NULL, 735, NULL, "Plan et projet mis en œuvre (oui/non)", ""),
      (738, "Activités sectorielles ou projets intégrant le climat et le changement climatique (liste)", 0, 1, 3, 1, NULL, 735, NULL, "Activités sectorielles ou projets intégrant le climat et le changement climatique (liste)", ""),
      (739, "Stations climatologiques participant à la veille climatique et agrométéorologique (liste)", 0, 1, 3, 1, NULL, 735, NULL, "Stations climatologiques participant à la veille climatique et agrométéorologique (liste)", ""),
      (740, "Action de lutte contre le changement climatique intégrée dans la promotion d'une économie résiliente (liste)", 0, 1, 3, 1, NULL, 735, NULL, "Action de lutte contre le changement climatique intégrée dans la promotion d'une économie résiliente (liste)", ""),
      (741, "Commune d'intervention pour la lutte contre CC", 0, 1, 3, 1, NULL, 735, NULL, "Commune d'intervention pour la lutte contre CC", ""),
      (742, "Nombre de ménages bénéficiaires pour la lutte contre CC", 0, 1, 3, 1, NULL, 735, NULL, "Nombre de ménages bénéficiaires pour la lutte contre CC", ""),
      (743, "Nombre de femmes bénéficiaires pour la lutte contre CC", 0, 1, 3, 1, NULL, 735, NULL, "Nombre de femmes bénéficiaires pour la lutte contre CC", ""),
      (744, "Nombre de jeunes bénéficiaires pour la lutte contre CC", 0, 1, 3, 1, NULL, 735, NULL, "Nombre de jeunes bénéficiaires pour la lutte contre CC", ""),
      (745, "Source de financement pour la lutte contre CC (interne ou externe)", 0, 1, 3, 1, NULL, 735, NULL, "Source de financement pour la lutte contre CC (interne ou externe)", ""),
      (746, "Projet d'appui pour la lutte contre CC (si externe)", 0, 1, 3, 1, NULL, 735, NULL, "Projet d'appui pour la lutte contre CC (si externe)", ""),
      (747, "Surface de forêts gérées dans le cadre du CC et REDD+ (ha)", 0, 1, 3, 1, NULL, 735, NULL, "Surface de forêts gérées dans le cadre du CC et REDD+ (ha)", ""),
      (748, "Shapefile correspondant CC et REDD+", 0, 1, 3, 1, NULL, 735, NULL, "Shapefile correspondant CC et REDD+", ""),
      (749, "Taux d'emission de CO2 (%)", 0, 1, 3, 1, NULL, 735, NULL, "Taux d'emission de CO2 (%)", ""),
      (750, "Observations CC, REDD+", 0, 1, 3, 0, NULL, 735, NULL, "Observations CC, REDD+", ""),
      (751, "Source de données CC, REDD+", 0, 1, 3, 1, NULL, 735, NULL, "Source de données CC, REDD+", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 742 WHERE id = 87`);
    sql.push(`UPDATE indicateur set id_question = 747 WHERE id = 88`);

    //Controles environnementaux
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (19, "Nombre de contrôles environnementaux effectués", "", 8, 0, 0, 1),
      (20, "Nombre d'infractions environnementales constatées", "", 8, 1, 0, 0),
      (21, "Nombre de dossiers d'infractions environnementales traités", "", 8, 1, 0, 0),
      (22, "Nombre de plaintes environnementales reçues", "", 8, 1, 0, 0),
      (23, "Nombre de plaintes environnementales traitées (par secteur)", "", 8, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (175, "Intitulé de la mission de contrôle environnemental", 1, 1, 3, 1, NULL, NULL, NULL, "Intitulé de la mission de contrôle environnemental", ""),
      (176, "Date de la mission de contrôle environnemental", 0, 1, 3, 0, NULL, 175, NULL, "Date de la mission de contrôle environnemental", ""),
      (177, "Mission de contrôle environnemental effectuée ou réalisée (oui/non)", 0, 1, 3, 1, NULL, 175, NULL, "Mission de contrôle environnemental effectuée ou réalisée (oui/non)", ""),
      (178, "Commune de réalisation du contrôle environnemental", 0, 1, 3, 1, NULL, 175, NULL, "Commune de réalisation du contrôle environnemental", ""),
      (179, "Nombre d'infraction environnementale", 0, 1, 3, 1, NULL, 175, NULL, "Nombre d'infraction environnementale", ""),
      (180, "Nature de l'infraction environnementale", 0, 1, 3, 0, NULL, 175, NULL, "Nature de l'infraction environnementale", ""),
      (181, "Motif de PV d'infraction environnementale établi (constat)", 0, 1, 3, 0, NULL, 175, NULL, "Motif de PV d'infraction environnementale établi (constat)", ""),
      (182, "Référence de dossiers d'infractions environnementales", 0, 1, 3, 1, NULL, 175, NULL, "Référence de dossiers d'infractions environnementales", ""),
      (183, "Nombre de dossier d'infractions environnementales traité", 0, 1, 3, 1, NULL, 175, NULL, "Nombre de dossier d'infractions environnementales traité", ""),
      (184, "Existence de dispositifs de contrôle environnemental de proximité (oui/non)", 0, 1, 3, 0, NULL, 175, NULL, "Existence de dispositifs de contrôle environnemental de proximité (oui/non)", ""),
      (185, "Dispositifs de contrôle redynamisés (oui/non)", 0, 1, 3, 0, NULL, 175, NULL, "Dispositifs de contrôle redynamisés (oui/non)", ""),
      (186, "Nombre de plaintes environnementales reçues", 0, 1, 3, 1, NULL, 175, NULL, "Nombre de plaintes environnementales reçues", ""),
      (187, "Intitulé de plaintes environnementales déposées avec référence", 0, 1, 3, 0, NULL, 175, NULL, "Intitulé de plaintes environnementales déposées avec référence", ""),
      (188, "Date de déposition de la plainte", 0, 1, 3, 0, NULL, 175, NULL, "Date de déposition de la plainte", ""),
      (189, "Nombre de plaintes environnementales traitées", 0, 1, 3, 1, NULL, 175, NULL, "Nombre de plaintes environnementales traitées", ""),
      (190, "Secteur concerné (Agriculture, Industrie, Service)", 0, 1, 3, 1, 23, 175, NULL, "Secteur concerné (Agriculture, Industrie, Service)", ""),
      (191, "Date de début de traitement", 0, 1, 3, 0, NULL, 175, NULL, "Date de début de traitement", ""),
      (192, "Nombre de plaintes environnementales résolues", 0, 1, 3, 1, NULL, 175, NULL, "Nombre de plaintes environnementales résolues", ""),
      (193, "Date de résolution des plaintes", 0, 1, 3, 0, NULL, 175, NULL, "Date de résolution des plaintes", ""),
      (194, "Mesures correctives et recommandations", 0, 0, 3, 1, NULL, 175, NULL, "Mesures correctives et recommandations", ""),
      (195, "Observations contrôles environnementaux", 0, 0, 3, 1, NULL, 175, NULL, "Observations contrôles environnementaux", ""),
      (196, "Source de données contrôles environnementaux", 0, 1, 3, 1, NULL, 175, NULL, "Source de données contrôles environnementaux", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 175 WHERE id = 19`);
    sql.push(`UPDATE indicateur set id_question = 179 WHERE id = 20`);
    sql.push(`UPDATE indicateur set id_question = 183 WHERE id = 21`);
    sql.push(`UPDATE indicateur set id_question = 186 WHERE id = 22`);
    sql.push(`UPDATE indicateur set id_question = 189 WHERE id = 23`);

    // Controle forestier
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (24, "Nombre de contrôles forestiers effectués", "", 9, 0, 0, 1),
      (25, "Nombre d'infractions forestières constatées", "", 9, 1, 0, 0),
      (26, "Nombre de dossiers d'infractions forestières traités", "", 9, 1, 0, 0),
      (27, "Nombre d'infractions forestiers déférées", "", 9, 1, 0, 0),
      (28, "Nombre de cas de transaction avant jugement", "", 9, 1, 0, 0),
      (29, "Quantité de produits saisis (par type de produit)", "", 9, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (197, "Intitulé de la mission de contrôle forestier", 1, 1, 3, 1, NULL, NULL, NULL, "Intitulé de la mission de contrôle forestier", ""),
      (198, "Date de la mission de contrôle forestier", 0, 1, 3, 0, NULL, 197, NULL, "Date de la mission de contrôle forestier", ""),
      (199, "Mission de contrôle forestier effectuée ou réalisée (oui/non)", 0, 1, 3, 1, NULL, 197, NULL, "Mission de contrôle forestier effectuée ou réalisée (oui/non)", ""),
      (200, "Commune de réalisation du contrôle forestier", 0, 1, 3, 0, NULL, 197, NULL, "Commune de réalisation du contrôle forestier", ""),
      (201, "Nombre d'infraction forestière", 0, 1, 3, 1, NULL, 197, NULL, "Nombre d'infraction forestière", ""),
      (202, "Motif du PV d'infraction forestière (constat)", 0, 1, 3, 0, NULL, 197, NULL, "Motif du PV d'infraction forestière (constat)", ""),
      (203, "Intitulé du PV de saisie avec référence", 0, 1, 3, 1, NULL, 197, NULL, "Intitulé du PV de saisie avec référence", ""),
      (204, "Type de produit saisi (PFL, PFNL)", 0, 1, 3, 0, 29, 197, NULL, "Type de produit saisi (PFL, PFNL)", ""),
      (205, "Nature du produit saisi (brut, fini)", 0, 1, 3, 0, NULL, 197, NULL, "Nature du produit saisi (brut, fini)", ""),
      (206, "Espèce du produit saisi", 0, 1, 3, 0, NULL, 197, NULL, "Espèce du produit saisi", ""),
      (207, "Date de saisi du produit", 0, 1, 3, 0, NULL, 197, NULL, "Date de saisi du produit", ""),
      (208, "Designation du produit saisi", 0, 1, 3, 27, NULL, 197, NULL, "Designation du produit saisi", ""),
      (209, "Quantité de produit saisi", 0, 1, 3, 1, NULL, 197, NULL, "Quantité de produit saisi", ""),
      (210, "Date de sequestre", 0, 1, 3, 0, NULL, 197, NULL, "Date de sequestre", ""),
      (211, "Localisation des produits sequestrés (localité)", 0, 1, 3, 0, NULL, 197, NULL, "Localisation des produits sequestrés (localité)", ""),
      (212, "Référence conclusions emis par les représentants ministériels vers le parquet", 0, 1, 3, 0, NULL, 197, NULL, "Référence conclusions emis par les représentants ministériels vers le parquet", ""),
      (213, "Nombre infraction déférée", 0, 1, 3, 1, NULL, 197, NULL, "Nombre infraction déférée", ""),
      (214, "Intitulé du dossier transmis au parquet avec référence", 0, 1, 3, 1, NULL, 197, NULL, "Intitulé du dossier transmis au parquet avec référence", ""),
      (215, "Nombre de transaction avant jugement", 0, 1, 3, 1, NULL, 197, NULL, "Nombre de transaction avant jugement", ""),
      (216, "Nature de l'infraction verbalisée", 0, 1, 3, 0, NULL, 197, NULL, "Nature de l'infraction verbalisée", ""),
      (217, "Référence de dossiers d'infractions forestières", 0, 1, 3, 1, NULL, 197, NULL, "Référence de dossiers d'infractions forestières", ""),
      (218, "Nombre de dossier d'infractions forestières traité", 0, 1, 3, 1, NULL, 197, NULL, "Nombre de dossier d'infractions forestières traité", ""),
      (219, "Mesures correctives et recommandations", 0, 1, 3, 0, NULL, 197, NULL, "Mesures correctives et recommandations", ""),
      (220, "Existence de dispositifs de contrôle forestier de proximité (oui/non)", 0, 1, 3, 0, NULL, 197, NULL, "Existence de dispositifs de contrôle forestier de proximité (oui/non)", ""),
      (221, "En cas défrichement, surface defrichée (ha)", 0, 1, 3, 0, NULL, 197, NULL, "En cas défrichement, surface defrichée (ha)", ""),
      (222, "Dispositifs de contrôle redynamisés (oui/non)", 0, 1, 3, 0, NULL, 197, NULL, "Dispositifs de contrôle redynamisés (oui/non)", ""),
      (223, "Observations contrôles forestiers", 0, 1, 3, 0, NULL, 197, NULL, "Observations contrôles forestiers", ""),
      (224, "Source de données contrôles forestiers", 0, 1, 3, 1, NULL, 197, NULL, "Source de données contrôles forestiers", "")`
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
      (30, "Nombre de conventions de partenariat développées et signées", "", 10, 0, 0, 1),
      (31, "Nombre de projets issus des partenariats", "", 10, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (225, "Nom de la Convention de partenariat élaborée", 1, 1, 3, 1, NULL, NULL, NULL, "Nom de la Convention de partenariat élaborée", ""),
      (226, "Type de partenariat (PPP, international, …)", 0, 1, 3, 0, NULL, 225, NULL, "Type de partenariat (PPP, international, …)", ""),
      (227, "Convention de partenariat signée (oui/non)", 0, 1, 3, 1, NULL, 225, NULL, "Convention de partenariat signée (oui/non)", ""),
      (228, "Objet de la convention de partenariat", 0, 1, 3, 1, NULL, 225, NULL, "Objet de la convention de partenariat", ""),
      (229, "Il s'agit de projet (oui/non)", 0, 1, 3, 1, 31, 225, NULL, "Il s'agit de projet (oui/non)", ""),
      (230, "si oui, quel/quels projet(s) ?", 0, 1, 3, 1, NULL, 225, NULL, "si oui, quel/quels projet(s) ?", ""),
      (231, "Date d'élaboration de la convention de partenariat", 0, 1, 3, 0, NULL, 225, NULL, "Date d'élaboration de la convention de partenariat", ""),
      (232, "Date de signature de la convention de partenariat", 0, 1, 3, 0, NULL, 225, NULL, "Date de signature de la convention de partenariat", ""),
      (233, "Entités signataires", 0, 1, 3, 0, NULL, 225, NULL, "Entités signataires", ""),
      (234, "Durée de la convention de partenariat", 0, 1, 3, 0, NULL, 225, NULL, "Durée de la convention de partenariat", ""),
      (235, "Cibles de la convention de partenariat", 0, 1, 3, 0, NULL, 225, NULL, "Cibles de la convention de partenariat", ""),
      (236, "Nombre de ménages bénéficiaires dans le cadre du partenariat", 0, 1, 3, 0, NULL, 225, NULL, "Nombre de ménages bénéficiaires dans le cadre du partenariat", ""),
      (237, "Observations partenariat", 0, 1, 3, 0, NULL, 225, NULL, "Observations partenariat", ""),
      (238, "Source de données partenariat", 0, 1, 3, 1, NULL, 225, NULL, "Source de données partenariat", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 225 WHERE id = 30`);
    sql.push(`UPDATE indicateur set id_question = 229 WHERE id = 31`);

    // Economie verte
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (32, "Nombre de certifications vertes promues par chaîne de valeurs liées aux ressources naturelles", "", 11, 0, 0, 1),
      (33, "Nombre d'emplois verts décents créés", "", 11, 1, 0, 0),
      (34, "Nombre d'alternative écologique promue", "", 11, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (239, "Commune d'implantation de l'économie verte", 1, 1, 3, 1, NULL, NULL, NULL, "Commune d'implantation de l'économie verte", ""),
      (240, "Chaîne de valeur verte promue", 0, 1, 3, 1, 32, 239, NULL, "Chaîne de valeur verte promue", ""),
      (241, "Ressource naturelle mise en jeu dans la chaîne de valeur", 0, 1, 3, 0, NULL, 239, NULL, "Ressource naturelle mise en jeu dans la chaîne de valeur", ""),
      (242, "Existence de certifications vertes promues par chaîne de valeur liée aux ressources naturelles (oui/non)", 0, 1, 3, 1, 32, 239, NULL, "Existence de certifications vertes promues par chaîne de valeur liée aux ressources naturelles (oui/non)", ""),
      (243, "Superficie (ha) des ressources gérées en vue de l’exploitation durable", 0, 1, 3, 0, NULL, 239, NULL, "Superficie (ha) des ressources gérées en vue de l’exploitation durable", ""),
      (244, "Nature du produit (PFNL ou PFL)", 0, 1, 3, 0, NULL, 239, NULL, "Nature du produit (PFNL ou PFL)", ""),
      (245, "Quantité produit brut", 0, 1, 3, 0, NULL, 239, NULL, "Quantité produit brut", ""),
      (246, "Unité produit brut", 0, 1, 3, 0, NULL, 239, NULL, "Unité produit brut", ""),
      (247, "Quantité produit brut vendu", 0, 1, 3, 0, NULL, 239, NULL, "Quantité produit brut vendu", ""),
      (248, "Unité produit brut vendu", 0, 1, 3, 0, NULL, 239, NULL, "Unité produit brut vendu", ""),
      (249, "Prix unitaire de vente de produit brut (Ariary)", 0, 1, 3, 0, NULL, 239, NULL, "Prix unitaire de vente de produit brut (Ariary)", ""),
      (250, "Quantité produit transformé", 0, 1, 3, 0, NULL, 239, NULL, "Quantité produit transformé", ""),
      (251, "Unité produit transformé", 0, 1, 3, 0, NULL, 239, NULL, "Unité produit transformé", ""),
      (252, "Quantité produit transformé vendu", 0, 1, 3, 0, NULL, 239, NULL, "Quantité produit transformé vendu", ""),
      (253, "Unité produit transformé vendu", 0, 1, 3, 0, NULL, 239, NULL, "Unité produit transformé vendu", ""),
      (254, "Prix unitaire de vente de produit transformé (Ariary)", 0, 1, 3, 0, NULL, 239, NULL, "Prix unitaire de vente de produit transformé (Ariary)", ""),
      (255, "Destination des produits (vente locale, exportation, …)", 0, 1, 3, 0, NULL, 239, NULL, "Destination des produits (vente locale, exportation, …)", ""),
      (256, "Nombre de ménages bénéficiaires de la chaîne de valeur", 0, 1, 3, 0, NULL, 239, NULL, "Nombre de ménages bénéficiaires de la chaîne de valeur", ""),
      (257, "Nombre de femmes bénéficiaires de la chaîne de valeur", 0, 1, 3, 0, NULL, 239, NULL, "Nombre de femmes bénéficiaires de la chaîne de valeur", ""),
      (258, "Nombre de jeune bénéficiaires de la chaîne de valeur (15 à 24 ans)", 0, 1, 3, 0, NULL, 239, NULL, "Nombre de jeune bénéficiaires de la chaîne de valeur (15 à 24 ans)", ""),
      (259, "Nombre total de personnes impliquées directement dans la chaîne de valeur", 0, 1, 3, 0, NULL, 239, NULL, "Nombre total de personnes impliquées directement dans la chaîne de valeur", ""),
      (260, "Existence de suivis écologiques (oui/non)", 0, 1, 3, 0, NULL, 239, NULL, "Existence de suivis écologiques (oui/non)", ""),
      (261, "Chaîne de valeur appuyée financièrement et/ou techniquement (oui/non)", 0, 1, 3, 0, NULL, 239, NULL, "Chaîne de valeur appuyée financièrement et/ou techniquement (oui/non)", ""),
      (262, "Organisme d'appui de la chaîne de valeur", 0, 1, 3, 1, NULL, 239, NULL, "Organisme d'appui de la chaîne de valeur", ""),
      (263, "Projet d'appui de la chaîne de valeur", 0, 1, 3, 1, NULL, 239, NULL, "Projet d'appui de la chaîne de valeur", ""),
      (264, "Nombre d'emplois verts décents créés", 0, 1, 3, 1, NULL, 239, NULL, "Nombre d'emplois verts décents créés", ""),
      (265, "Nombre total d'empoyés recrutés par les emplois verts créés", 0, 1, 3, 0, NULL, 239, NULL, "Nombre total d'empoyés recrutés par les emplois verts créés", ""),
      (266, "Nombre de femme employées dans les emplois verts", 0, 1, 3, 0, NULL, 239, NULL, "Nombre de femme employées dans les emplois verts", ""),
      (267, "Types d'alternatives développées (charbon vert, résidus de culture, gaz butane, ethanol, énergie solaire, biogaz, sac écologique, autres)", 0, 1, 3, 1, NULL, 239, NULL, "Types d'alternatives développées (charbon vert, résidus de culture, gaz butane, ethanol, énergie solaire, biogaz, sac écologique, autres)", ""),
      (268, "Quantité produite par type d'alternative", 0, 1, 3, 0, NULL, 239, NULL, "Quantité produite par type d'alternative (liste)", ""),
      (269, "Alternative promue (oui/non)", 0, 1, 3, 1, 34, 239, NULL, "Alternative promue (oui/non)", ""),
      (270, "Nombre total de ménage adoptant les alternatives", 0, 1, 3, 0, NULL, 239, NULL, "Nombre total de ménage adoptant les alternatives", ""),
      (271, "Prix unitaire des alternatives (Ariary)", 0, 1, 3, 0, NULL, 239, NULL, "Prix unitaire des alternatives (Ariary)", ""),
      (272, "Observations économie verte", 0, 1, 3, 0, NULL, 239, NULL, "Observations économie verte", ""),
      (273, "Source de données économie verte", 0, 1, 3, 0, NULL, 239, NULL, "Source de données économie verte", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 242 WHERE id = 32`);
    sql.push(`UPDATE indicateur set id_question = 264 WHERE id = 33`);
    sql.push(`UPDATE indicateur set id_question = 269 WHERE id = 34`);

    // Environnement (pollution, évaluation environnemental,...)
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (35, "Nombre de mise en conformité, permis et/ou autorisation environnementale (PREE), permis environnementaux délivrés", "", 12, 0, 0, 1),
      (36, "Nombre d'infrastructures de gestion de déchets créées", "", 12, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (274, "Nom de l'infrastructure de gestion de pollution mis en place", 1, 1, 3, 1, NULL, NULL, NULL, "Nom de l'infrastructure de gestion de pollution mis en place", ""),
      (275, "Objet de l'infrastructure de gestion de pollution mis en place (centre de tri, centre de traitement des déchets)", 0, 1, 3, 1, NULL, 274, NULL, "Objet de l'infrastructure de gestion de pollution mis en place (centre de tri, centre de traitement des déchets)", ""),
      (276, "Type de déchets traités (solides, médicaux, éléctroniques, liquides…)", 0, 1, 3, 1, NULL, 274, NULL, "Type de déchets traités (solides, médicaux, éléctroniques, liquides…)", ""),
      (277, "Commune d'implantantion de l'infrastructure de gestion de pollution", 0, 1, 3, 1, NULL, 274, NULL, "Commune d'implantantion de l'infrastructure de gestion de pollution", ""),
      (278, "Date de création de l'infrastructure", 0, 1, 3, 0, NULL, 274, NULL, "Date de création de l'infrastructure", ""),
      (279, "Infrastucture de gestion de pollution opérationnelle (oui/non)", 0, 1, 3, 0, NULL, 274, NULL, "Infrastucture de gestion de pollution opérationnelle (oui/non)", ""),
      (280, "Déchets valorisés par an (kg)", 0, 1, 3, 0, NULL, 274, NULL, "Déchets valorisés par an (kg)", ""),
      (281, "Disponibilité de kit d'analyse et de contrôle de pollution (oui/non)", 0, 1, 3, 0, NULL, 274, NULL, "Disponibilité de kit d'analyse et de contrôle de pollution (oui/non)", ""),
      (282, "Existence des observatoires de pollution (oui/non)", 0, 1, 3, 0, NULL, 274, NULL, "Existence des observatoires de pollution (oui/non)", ""),
      (283, "Observatoire opérationnel (oui/non)", 0, 1, 3, 0, NULL, 274, NULL, "Observatoire opérationnel (oui/non)", ""),
      (284, "Disponibilité de décharges d'ordures (oui/non)", 0, 1, 3, 0, NULL, 274, NULL, "Disponibilité de décharges d'ordures (oui/non)", ""),
      (285, "Emplacement de la décharge (localité)", 0, 1, 3, 0, NULL, 274, NULL, "Emplacement de la décharge (localité)", ""),
      (286, "Decharge d'ordures opérationnelle (oui/non)", 0, 1, 3, 1, NULL, 274, NULL, "Decharge d'ordures opérationnelle (oui/non)", ""),
      (287, "Existence de laboratoires nationaux et de centres de recherches renforcés techniquement et matériellement pour le traitement de déchets (oui/non)", 0, 1, 3, 0, NULL, 274, NULL, "Existence de laboratoires nationaux et de centres de recherches renforcés techniquement et matériellement pour le traitement de déchets (oui/non)", ""),
      (288, "si oui, lequel/lesquels?", 0, 1, 3, 0, NULL, 274, NULL, "si oui, lequel/lesquels?", ""),
      (289, "Nom du projet d'investissement souhaitant s'implanté", 0, 1, 3, 1, NULL, 274, NULL, "Nom du projet d'investissement souhaitant s'implanté", ""),
      (290, "Secteur d'activité (Agriculture, Industriel, Service)", 0, 1, 3, 0, NULL, 274, NULL, "Secteur d'activité (Agriculture, Industriel, Service)", ""),
      (291, "Existence de permis environnementaux délivrés (oui/non)", 0, 1, 3, 0, 32, 274, NULL, "Existence de permis environnementaux délivrés (oui/non)", ""),
      (292, "Projet d'investissement conforme au Décret MECIE (oui/non)", 0, 1, 3, 0, NULL, 274, NULL, "Projet d'investissement conforme au Décret MECIE (oui/non)", ""),
      (293, "Date de quittance", 0, 1, 3, 0, NULL, 274, NULL, "Date de quittance", ""),
      (294, "Projet d'investissement ayant un Programme d'Engagement Environnemental (PREE) (oui/non)", 0, 1, 3, 0, NULL, 274, NULL, "Projet d'investissement ayant un Programme d'Engagement Environnemental (PREE) (oui/non)", ""),
      (295, "Existence de suivi environnemental mené sur la mise en œuvre de cahiers des charges environnementales (oui/non)", 0, 1, 3, 0, NULL, 274, NULL, "Existence de suivi environnemental mené sur la mise en œuvre de cahiers des charges environnementales (oui/non)", ""),
      (296, "Activités relatives à l'éducation environnementale réalisées (liste)", 0, 1, 3, 0, NULL, 274, NULL, "Activités relatives à l'éducation environnementale réalisées (liste)", ""),
      (297, "Nombre des agents assermentés en tant qu'OPJ pour les contrôles et inspections environnementales", 0, 1, 3, 0, NULL, 274, NULL, "Nombre des agents assermentés en tant qu'OPJ pour les contrôles et inspections environnementales", ""),
      (298, "Observations environnement", 0, 1, 3, 1, NULL, 274, NULL, "Observations environnement", ""),
      (299, "Source de données environnement", 0, 1, 3, 1, NULL, 274, NULL, "Source de données environnement", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 291 WHERE id = 35`);
    sql.push(`UPDATE indicateur set id_question = 274 WHERE id = 36`);

    // Feux
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (37, "Surfaces brûlées (par type)", "", 13, 1, 0, 0),
      (38, "Longueur totale de pare-feu", "", 13, 1, 0, 0),
      (39, "Nombre de structures opérationnelles de gestion des feux", "", 13, 0, 0, 1),
      (40, "Nombre de structure de gestion des feux", "", 13, 0, 0, 1),
      (41, "Nombre de système d'alerte de feux", "", 13, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (300, "Commune de localisation de point de feux et surfaces brûlées suivant les points GPS des activités de patrouilles et de contrôle", 1, 1, 3, 1, NULL, NULL, NULL, "Commune de localisation de point de feux et surfaces brûlées suivant les points GPS des activités de patrouilles et de contrôle", ""),
      (301, "Longitude point de feux (degré décimal) : X", 0, 1, 3, 1, NULL, 300, NULL, "Longitude point de feux (degré décimal) : X", ""),
      (302, "Latitude point de feux (degré décimal) : Y", 0, 1, 3, 1, NULL, 300, NULL, "Latitude point de feux (degré décimal) : Y", ""),
      (303, "Date de cas de feux", 0, 1, 3, 0, NULL, 300, NULL, "Date de cas de feux", ""),
      (304, "Shapefile des points de feux", 0, 1, 3, 1, NULL, 300, NULL, "Shapefile des points de feux", ""),
      (305, "Superficie des zones brulées suivant les points GPS des activités de patrouilles et de contrôle sur terrain (ha)", 0, 1, 3, 1, NULL, 300, NULL, "Superficie des zones brulées suivant les points GPS des activités de patrouilles et de contrôle sur terrain (ha)", ""),
      (306, "Type : Forêt ou hors forêt", 0, 1, 3, 1, 37, 300, NULL, "Type : Forêt ou hors forêt", ""),
      (307, "Shapefile des surfaces brûlées", 0, 1, 3, 1, NULL, 300, NULL, "Shapefile des surfaces brûlées", ""),
      (308, "Date de zones brûlées", 0, 1, 3, 0, NULL, 300, NULL, "Date de zones brûlées", ""),
      (309, "Existence de dispositifs de détection et suivi des feux (oui/non)", 0, 1, 3, 1, 38, 300, NULL, "Existence de dispositifs de détection et suivi des feux (oui/non)", ""),
      (310, "Emplacement de dispositifs de détection et suivi des feux (localité)", 0, 1, 3, 0, NULL, 300, NULL, "Emplacement de dispositifs de détection et suivi des feux (localité)", ""),
      (311, "Type de dispositif de détection et suivi des feux (créé/renforcé)", 0, 1, 3, 0, NULL, 300, NULL, "Type de dispositif de détection et suivi des feux (créé/renforcé)", ""),
      (312, "Dispositif de détection et suivi des feux opérationnel (oui/non)", 0, 1, 3, 1, NULL, 300, NULL, "Dispositif de détection et suivi des feux opérationnel (oui/non)", ""),
      (313, "Existence de comités/structures de lutte contre les feux (oui/non)", 0, 1, 3, 1, 40, 300, NULL, "Existence de comités/structures de lutte contre les feux (oui/non)", ""),
      (314, "Emplacement de comités/structures de lutte contre les feux (localité)", 0, 1, 3, 0, NULL, 300, NULL, "Emplacement de comités/structures de lutte contre les feux (localité)", ""),
      (315, "Type de comité/structure de lutte contre les feux (créé/renforcé)", 0, 1, 3, 1, NULL, 300, NULL, "Type de comité/structure de lutte contre les feux (créé/renforcé)", ""),
      (316, "Comité/structure de lutte contre les feux formé (oui/non)", 0, 1, 3, 1, NULL, 300, NULL, "Comité/structure de lutte contre les feux formé (oui/non)", ""),
      (317, "Comité/structure de lutte contre les feux opérationnel (oui/non)", 0, 1, 3, 1, 96, 300, NULL, "Comité/structure de lutte contre les feux opérationnel (oui/non)", ""),
      (318, "Emplacement du pare-feu (localité)", 0, 1, 3, 0, NULL, 300, NULL, "Emplacement du pare-feu (localité)", ""),
      (319, "Longitude pare-feu (degré décimal) : X", 0, 1, 3, 1, NULL, 300, NULL, "Longitude pare-feu (degré décimal) : X", ""),
      (320, "Latitude pare-feu (degré décimal) : Y", 0, 1, 3, 1, NULL, 300, NULL, "Latitude pare-feu (degré décimal) : Y", ""),
      (321, "Longueur de pare-feu établi (km)", 0, 1, 3, 1, NULL, 300, NULL, "Longueur de pare-feu établi (km)", ""),
      (322, "Shapefile des pare-feux", 0, 1, 3, 1, NULL, 300, NULL, "Shapefile des pare-feux", ""),
      (323, "Nature du pare-feu (nouvellement mis en place, entretenu)", 0, 1, 3, 0, NULL, 300, NULL, "Nature du pare-feu (nouvellement mis en place, entretenu)", ""),
      (324, "Référence PV d'infraction (constatation de feux)", 0, 1, 3, 1, NULL, 300, NULL, "Référence PV d'infraction (constatation de feux)", ""),
      (325, "Observations feux", 0, 1, 3, 0, NULL, 300, NULL, "Observations feux", ""),
      (326, "Source de données feux", 0, 1, 3, 1, NULL, 300, NULL, "Source de données feux", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 305 WHERE id = 37`);
    sql.push(`UPDATE indicateur set id_question = 321 WHERE id = 38`);
    sql.push(`UPDATE indicateur set id_question = 317 WHERE id = 39`);
    sql.push(`UPDATE indicateur set id_question = 313 WHERE id = 40`);
    sql.push(`UPDATE indicateur set id_question = 309 WHERE id = 41`);

    // Finance
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (42, "Recettes perçues (par thématiques d'intérêts)", "", 14, 1, 0, 0),
      (43, "Montant du fond public", "", 14, 1, 0, 0),
      (44, "Montant du financement extérieur ou privé", "", 14, 1, 0, 0),
      (45, "Montant des dons", "", 14, 1, 0, 0),
      (46, "Montant de prêts budgétaires", "", 14, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (327, "Thématiques d'interêt du ministère en charge des forêts et de l'environnement", 1, 1, 3, 1, 39, NULL, NULL, "Thématiques d'interêt du ministère en charge des forêts et de l'environnement", ""),
      (328, "Activités à réaliser", 0, 1, 3, 0, NULL, 327, NULL, "Activités à réaliser", ""),
      (329, "Acteurs dans la réalisatoin des activités", 0, 1, 3, 0, NULL, 327, NULL, "Acteurs dans la réalisatoin des activités", ""),
      (330, "Budget prévu pour la réalisation des activités pour le secteur environnement (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Budget prévu pour la réalisation des activités pour le secteur environnement (Ariary)", ""),
      (331, "Budget de fonctionnement (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Budget de fonctionnement (Ariary)", ""),
      (332, "Montant du fond public (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Montant du fond public (Ariary)", ""),
      (333, "Montant du financement extérieur ou privé (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Montant du financement extérieur ou privé (Ariary)", ""),
      (334, "PIP/CDMT/ budgets programmes établis (liste)", 0, 1, 3, 0, NULL, 327, NULL, "PIP/CDMT/ budgets programmes établis (liste)", ""),
      (335, "Programmes/projets relatifs à la protection de l'environnement et la gestion des ressources naturelles/de la biodiversité ayant obtenus des financements extérieurs (liste)", 0, 1, 3, 0, NULL, 327, NULL, "Programmes/projets relatifs à la protection de l'environnement et la gestion des ressources naturelles/de la biodiversité ayant obtenus des financements extérieurs (liste)", ""),
      (336, "Mecanismes de perennisation financière mise en place et opérationnel (liste)", 0, 1, 3, 0, NULL, 327, NULL, "Mecanismes de perennisation financière mise en place et opérationnel (liste)", ""),
      (337, "Actions environnementales dans les programmes d'investissement régional/communal (liste)", 0, 1, 3, 0, NULL, 327, NULL, "Actions environnementales dans les programmes d'investissement régional/communal (liste)", ""),
      (338, "Montant alloué pour action environnementale dans les programmes d'investissement régional/communal (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Montant alloué par action environnementale dans les programmes d'investissement régional/communal (Ariary)", ""),
      (339, "Montant des dons  (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Montant des dons  (Ariary)", ""),
      (340, "Montant de prêts budgétaires (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Montant de prêts budgétaires (Ariary)", ""),
      (341, "Montant engagé pour la réalisation des activités (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Montant engagé pour la réalisation des activités (Ariary)", ""),
      (342, "Montant décaissé pour la réalisation des activités (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Montant décaissé pour la réalisation des activités (Ariary)", ""),
      (343, "Origine de recette (exploitation des PFL, collecte des PFNL, vente des produits saisis, exportation des PFL,exportation des PFNL, visites touristique dans les aires protégées)", 0, 1, 3, 1, NULL, 327, NULL, "Origine de recette (exploitation des PFL, collecte des PFNL, vente des produits saisis, exportation des PFL,exportation des PFNL, visites touristique dans les aires protégées)", ""),
      (344, "Recette perçue (Ariary)", 0, 1, 3, 1, NULL, 327, NULL, "Recette perçue (Ariary)", ""),
      (345, "Observations finances", 0, 1, 3, 0, NULL, 327, NULL, "Observations finances", ""),
      (346, "Source de données finances", 0, 1, 3, 1, NULL, 327, NULL, "Source de données finances", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 344 WHERE id = 42`);
    sql.push(`UPDATE indicateur set id_question = 332 WHERE id = 43`);
    sql.push(`UPDATE indicateur set id_question = 333 WHERE id = 44`);
    sql.push(`UPDATE indicateur set id_question = 339 WHERE id = 45`);
    sql.push(`UPDATE indicateur set id_question = 340 WHERE id = 46`);

    // Information génerals
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (47, "Nombre de Districts", "", 15, 0, 0, 1),
      (48, "Nombre de communes", "", 15, 1, 0, 0),
      (49, "Nombre de population", "", 15, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (347, "Intitulé du Districts", 1, 1, 3, 1, NULL, NULL, NULL, "Intitulé du Districts", ""),
      (348, "Liste Communes", 0, 1, 3, 0, NULL, 347, NULL, "Liste Communes", ""),
      (349, "Nombre de communes", 0, 1, 3, 1, 48, 347, NULL, "Nombre de communes", ""),
      (350, "Nombre de population", 0, 1, 3, 1, 49, 347, NULL, "Nombre de population", ""),
      (351, "Nombre homme", 0, 1, 3, 1, NULL, 347, NULL, "Nombre homme", ""),
      (352, "Nombre femme", 0, 1, 3, 1, NULL, 347, NULL, "Nombre femme", ""),
      (353, "Nombre enfant", 0, 1, 3, 1, NULL, 347, NULL, "Nombre enfant", ""),
      (354, "Nombre de ménage", 0, 1, 3, 1, NULL, 347, NULL, "Nombre de ménage", ""),
      (355, "Association oeuvrant dans la gestion de l'environnement et des ressources naturelles (liste)", 0, 1, 3, 1, NULL, 347, NULL, "Association oeuvrant dans la gestion de l'environnement et des ressources naturelles (liste)", ""),
      (356, "Nombre total de membre des associations", 0, 1, 3, 1, NULL, 347, NULL, "Nombre total de membre des associations", ""),
      (357, "Nombre de projets en cours", 0, 1, 3, 1, NULL, 347, NULL, "Nombre de projets en cours", ""),
      (358, "Observations info générales", 0, 1, 3, 0, NULL, 347, NULL, "Observations info générales", ""),
      (359, "Source de données info générales", 0, 1, 3, 1, NULL, 347, NULL, "Source de données info générales", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 347 WHERE id = 47`);
    sql.push(`UPDATE indicateur set id_question = 349 WHERE id = 48`);
    sql.push(`UPDATE indicateur set id_question = 350 WHERE id = 49`);

    //IEC
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (50, "Nombre d'IEC effectuées ", "", 16, 0, 0, 1),
      (51, "Nombre de participants formés", "", 16, 1, 0, 0),
      (52, "Nombre d'agents de l'admnistration formés", "", 16, 1, 0, 0),
      (53, "Nombre de séance de formation", "", 16, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (400, "Thématique de l'IEC", 1, 1, 3, 1, NULL, NULL, NULL, "Thématique de l'IEC", ""),
      (401, "Intitulé de l'IEC", 0, 1, 3, 1, NULL, 400, NULL, "Intitulé de l'IEC", ""),
      (402, "Nature de l'IEC (formation, sensibilisation)", 0, 1, 3, 1, 53, 400, NULL, "Nature de l'IEC (formation, sensibilisation)", ""),
      (403, "Support produit (designation)", 0, 1, 3, 0, NULL, 400, NULL, "Support produit (designation)", ""),
      (404, "Date de début et de fin de l'IEC", 0, 1, 3, 0, NULL, 400, NULL, "Date de début et de fin de l'IEC", ""),
      (405, "Initiateur de l'IEC", 0, 1, 3, 0, NULL, 400, NULL, "Initiateur de l'IEC", ""),
      (406, "Projet d'appui de l'IEC", 0, 1, 3, 1, NULL, 400, NULL, "Projet d'appui de l'IEC", ""),
      (407, "Nombre de séance", 0, 1, 3, 1, NULL, 400, NULL, "Nombre de séance", ""),
      (408, "Nombre total de participants", 0, 1, 3, 1, NULL, 400, NULL, "Nombre total de participants", ""),
      (409, "Nombre de participants - de 14 ans", 0, 1, 3, 1, NULL, 400, NULL, "Nombre de participants - de 14 ans", ""),
      (410, "Nombre de participants de 15 à 24 ans", 0, 1, 3, 1, NULL, 400, NULL, "Nombre de participants de 15 à 24 ans", ""),
      (411, "Nombre de participants 25 ans et +", 0, 1, 3, 1, NULL, 400, NULL, "Nombre de participants 25 ans et +", ""),
      (412, "Nombre de représentant d'une OSC ayant participé", 0, 1, 3, 1, NULL, 400, NULL, "Nombre de représentant d'une OSC ayant participé", ""),
      (413, "Nombre de représentant de structures locales ayant participé", 0, 1, 3, 1, NULL, 400, NULL, "Nombre de représentant de structures locales ayant participé", ""),
      (414, "Nombre d'agents de l'administration ayant participé", 0, 1, 3, 1, NULL, 400, NULL, "Nombre d'agents de l'administration ayant participé", ""),
      (415, "Cible (élève, population locale, VOI, …)", 0, 1, 3, 0, NULL, 400, NULL, "Cible (élève, population locale, VOI, …)", ""),
      (416, "Niveau d'intervention (District, Commune, Fokontany)", 0, 1, 3, 0, NULL, 400, NULL, "Niveau d'intervention (District, Commune, Fokontany)", ""),
      (417, "Nom de la Commune bénéficiant de l'IEC", 0, 1, 3, 1, NULL, 400, NULL, "Nom de la Commune bénéficiant de l'IEC", ""),
      (418, "Nom de la localité bénéficiant de l'IEC", 0, 1, 3, 0, NULL, 400, NULL, "Nom de la localité bénéficiant de l'IEC", ""),
      (419, "IEC média classique (radio, télévision, journaux)", 0, 1, 3, 1, NULL, 400, NULL, "IEC média classique (radio, télévision, journaux)", ""),
      (420, "IEC nouveau média (réseaux sociaux, à préciser)", 0, 1, 3, 1, NULL, 400, NULL, "IEC nouveau média (réseaux sociaux, à préciser)", ""),
      (421, "Observations IEC", 0, 1, 3, 0, NULL, 400, NULL, "Observations IEC", ""),
      (422, "Source de données IEC", 0, 1, 3, 1, NULL, 400, NULL, "Source de données IEC", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 401 WHERE id = 50`);
    sql.push(`UPDATE indicateur set id_question = 408 WHERE id = 51`);
    sql.push(`UPDATE indicateur set id_question = 414 WHERE id = 52`);
    sql.push(`UPDATE indicateur set id_question = 407 WHERE id = 53`);

    // Logistique infrastructure
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (54, "Nombre d'infrastructures fonctionnelles", "", 17, 0, 0, 1),
      (55, "Nombre d'infrastructures construites ou réhabilitées", "", 17, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (423, "Type d'infrastructure (bâtiment, route, barrage, école, …)", 1, 1, 3, 1, NULL, NULL, NULL, "Type d'infrastructure (bâtiment, route, barrage, école, …)", ""),
      (424, "Destination (administrative, logement, garage, …)", 0, 1, 3, 1, NULL, 423, NULL, "Destination (administrative, logement, garage, …)", ""),
      (425, "Commune d'implantation de l'infrastructure", 0, 1, 3, 1, NULL, 423, NULL, "Commune d'implantation de l'infrastructure", ""),
      (426, "Emplacement de l'infrastructure (localité)", 0, 1, 3, 0, NULL, 423, NULL, "Emplacement de l'infrastructure (localité)", ""),
      (427, "Secteur impliqué (éducation, santé, travaux publics, ...)", 0, 1, 3, 1, NULL, 423, NULL, "Secteur impliqué (éducation, santé, travaux publics, ...)", ""),
      (428, "Nouvellement construite ou réhabilitée ou existante", 0, 1, 3, 1, 55, 423, NULL, "Nouvellement construite ou réhabilitée ou existante", ""),
      (429, "Date d'opérationnalisation/utilisation/réhabilitation de l'infrastructure", 0, 1, 3, 0, NULL, 423, NULL, "Date d'opérationnalisation/utilisation/réhabilitation de l'infrastructure", ""),
      (430, "Infrastructure actuellement opérationnelle (oui/non)", 0, 1, 3, 1, 54, 423, NULL, "Infrastructure actuellement opérationnelle (oui/non)", ""),
      (431, "Etat actuel de l'infrastructure (mauvais, moyen, bon)", 0, 1, 3, 0, NULL, 423, NULL, "Etat actuel de l'infrastructure (mauvais, moyen, bon)", ""),
      (432, "Niveau de localisation infrastructures opérationnelles (Direction centrale, Direction régionale, cantonnement, triage)", 0, 1, 3, 1, NULL, 423, NULL, "Niveau de localisation infrastructures opérationnelles (Direction centrale, Direction régionale, cantonnement, triage)", ""),
      (433, "STD ou CTD", 0, 1, 3, 1, 55, 423, NULL, "STD ou CTD", ""),
      (434, "Personnes/services utilisant le(s) infrastructure(s) (STD, préciser si CTD)", 0, 1, 3, 1, NULL, 423, NULL, "Personnes/services utilisant le(s) infrastructure(s) (STD, préciser si CTD)", ""),
      (435, "Budget pour la construction/réhabilitation de l'infrastructure (Ariary)", 0, 1, 3, 0, NULL, 423, NULL, "Budget pour la construction/réhabilitation de l'infrastructure (Ariary)", ""),
      (436, "Budget pour l'entretien de l'infrastructure (Ariary)", 0, 1, 3, 0, NULL, 423, NULL, "Budget pour l'entretien de l'infrastructure (Ariary)", ""),
      (437, "Source de financement de l'infrastructure (interne ou externe)", 0, 1, 3, 1, NULL, 423, NULL, "Source de financement de l'infrastructure (interne ou externe)", ""),
      (438, "Projet d'appui de l'infrastructure (si externe)", 0, 1, 3, 1, NULL, 423, NULL, "Projet d'appui de l'infrastructure (si externe)", ""),
      (439, "Images infrastructure", 0, 1, 3, 1, NULL, 423, NULL, "Images infrastructure", ""),
      (440, "Observations infrastructure", 0, 1, 3, 0, NULL, 423, NULL, "Observations infrastructure", ""),
      (441, "Source de données infrastructure", 0, 1, 3, 1, NULL, 423, NULL, "Source de données infrastructure", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 430 WHERE id = 54`);
    sql.push(`UPDATE indicateur set id_question = 428 WHERE id = 55`);

    // Logistique (Matériel roulant)
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (56, "Nombre de matériel roulant ", "", 18, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (442, "Désignation du matériel roulant", 1, 1, 3, 1, 56, NULL, NULL, "Désignation du matériel roulant", ""),
      (443, "Marque du matériel roulant", 0, 1, 3, 0, NULL, 442, NULL, "Marque du matériel roulant", ""),
      (444, "Commune d'emplacement du matériel roulant", 0, 1, 3, 1, NULL, 442, NULL, "Commune d'emplacement du matériel roulant", ""),
      (445, "Date d'acquisition/utilisation du matériel roulant", 0, 1, 3, 1, NULL, 442, NULL, "Date d'acquisition/utilisation du matériel roulant", ""),
      (446, "Matériel roulant actuellement opérationnel (oui/non)", 0, 1, 3, 1, NULL, 442, NULL, "Matériel roulant actuellement opérationnel (oui/non)", ""),
      (447, "Etat actuel du matériel roulant (mauvais, moyen, bon)", 0, 1, 3, 1, 56, 442, NULL, "Etat actuel du matériel roulant (mauvais, moyen, bon)", ""),
      (448, "Niveau de localisation de matériel roulant en état de marche (Direction centrale, Direction régionale, cantonnement, triage)", 0, 1, 3, 1, NULL, 442, NULL, "Niveau de localisation de matériel roulant en état de marche (Direction centrale, Direction régionale, cantonnement, triage)", ""),
      (449, "Personnes/services utilisant le(s) matériel(s) roulant(s)", 0, 1, 3, 1, NULL, 442, NULL, "Personnes/services utilisant le(s) matériel(s) roulant(s)", ""),
      (450, "Budget pour l'acquisition du matériel roulant (Ariary)", 0, 1, 3, 0, NULL, 442, NULL, "Budget pour l'acquisition du matériel roulant (Ariary)", ""),
      (451, "Budget pour l'entretien du matériel roulant (Ariary)", 0, 1, 3, 0, NULL, 442, NULL, "Budget pour l'entretien du matériel roulant (Ariary)", ""),
      (452, "Source de financement du matériel roulant (interne ou externe)", 0, 1, 3, 1, NULL, 442, NULL, "Source de financement du matériel roulant (interne ou externe)", ""),
      (453, "Projet d'appui du matériel roulant (si externe)", 0, 1, 3, 1, NULL, 442, NULL, "Projet d'appui du matériel roulant (si externe)", ""),
      (454, "Images matériel roulant", 0, 1, 3, 1, NULL, 442, NULL, "Images matériel roulant", ""),
      (455, "Observations matériel roulant", 0, 1, 3, 0, NULL, 442, NULL, "Observations matériel roulant", ""),
      (456, "Source de données matériel roulant", 0, 1, 3, 1, NULL, 442, NULL, "Source de données matériel roulant", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 442 WHERE id = 56`);

    //  Logistique (matériel informatique)
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (57, "Nombre de matériel informatique ", "", 19, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (457, "Désignation du matériel informatique", 1, 1, 3, 1, 57, NULL, NULL, "Désignation du matériel informatique", ""),
      (458, "Marque du matériel informatique", 0, 1, 3, 0, NULL, 457, NULL, "Marque du matériel informatique", ""),
      (459, "Commune d'emplacement du matériel informatique", 0, 1, 3, 1, NULL, 457, NULL, "Commune d'emplacement du matériel informatique", ""),
      (460, "Date d'acquisition/utilisation du matériel informatique", 0, 1, 3, 1, NULL, 457, NULL, "Date d'acquiqition/utilisation du matériel informatique", ""),
      (461, "Matériel informatique actuellement opérationnel (oui/non)", 0, 1, 3, 1, NULL, 457, NULL, "Matériel informatique actuellement opérationnel (oui/non)", ""),
      (462, "Etat actuel du matériel informatique (mauvais, moyen, bon)", 0, 1, 3, 1, 57, 457, NULL, "Etat actuel du matériel informatique (mauvais, moyen, bon)", ""),
      (463, "A condamner ou à réparer", 0, 1, 3, 1, NULL, 457, NULL, "A condamner ou à réparer", ""),
      (464, "Niveau de localisation de matériels informatiques en état de marche (Direction centrale, Direction régionale, cantonnement, triage)", 0, 1, 3, 1, NULL, 457, NULL, "Niveau de localisation de matériels informatiques en état de marche (Direction centrale, Direction régionale, cantonnement, triage)", ""),
      (465, "Personnes/services utilisant le(s) matériel(s) informatique(s)", 0, 1, 3, 1, NULL, 457, NULL, "Personnes/services utilisant le(s) matériel(s) informatique(s)", ""),
      (466, "Budget pour l'acquisition du matériel informatique (Ariary)", 0, 1, 3, 0, NULL, 457, NULL, "Budget pour l'acquisition du matériel informatique (Ariary)", ""),
      (467, "Budget pour l'entretien du matériel informatique (Ariary)", 0, 1, 3, 0, NULL, 457, NULL, "Budget pour l'entretien du matériel informatique (Ariary)", ""),
      (468, "Source de financement du matériel informatique (interne ou externe)", 0, 1, 3, 1, NULL, 457, NULL, "Source de financement du matériel informatique (interne ou externe)", ""),
      (469, "Projet d'appui du matériel informatique (si externe)", 0, 1, 3, 1, NULL, 457, NULL, "Projet d'appui du matériel informatique (si externe)", ""),
      (470, "Images matériel informatique", 0, 1, 3, 1, NULL, 457, NULL, "Images matériel informatique", ""),
      (471, "Observations matériel informatique", 0, 1, 3, 0, NULL, 457, NULL, "Observations matériel informatique", ""),
      (472, "Source de données matériel informatique", 0, 1, 3, 1, NULL, 457, NULL, "Source de données matériel informatique", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 457 WHERE id = 57`);

    // Logistique (matériel immobilier)
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (58, "Nombre de matériel immobilier ", "", 20, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (473, "Désignation du matériel immobilier", 1, 1, 3, 1, 58, NULL, NULL, "Désignation du matériel immobilier", ""),
      (474, "Commune d'emplacement du matériel immobilier", 0, 1, 3, 1, NULL, 473, NULL, "Commune d'emplacement du matériel immobilier", ""),
      (475, "Date d'acquisition/utilisation du matériel immobilier", 0, 1, 3, 1, NULL, 473, NULL, "Date d'acquiqition/utilisation du matériel immobilier", ""),
      (476, "Matériel immobilier actuellement opérationnel (oui/non)", 0, 1, 3, 1, NULL, 473, NULL, "Matériel immobilier actuellement opérationnel (oui/non)", ""),
      (477, "Etat actuel du matériel immobilier (mauvais, moyen, bon)", 0, 1, 3, 1, 58, 473, NULL, "Etat actuel du matériel immobilier (mauvais, moyen, bon)", ""),
      (478, "Niveau de localisation de matériels immobiliers en état de marche (Direction centrale, Direction régionale, cantonnement, triage)", 0, 1, 3, 1, NULL, 473, NULL, "Niveau de localisation de matériels immobiliers en état de marche (Direction centrale, Direction régionale, cantonnement, triage)", ""),
      (479, "Personnes/services utilisant le(s) matériel(s) immobilier(s)", 0, 1, 3, 1, NULL, 473, NULL, "Personnes/services utilisant le(s) matériel(s) immobilier(s)", ""),
      (480, "Budget pour l'acquisition du matériel immobilier (Ariary)", 0, 1, 3, 0, NULL, 473, NULL, "Budget pour l'acquisition du matériel immobilier (Ariary)", ""),
      (481, "Budget pour l'entretien du matériel immobilier (Ariary)", 0, 1, 3, 0, NULL, 473, NULL, "Budget pour l'entretien du matériel immobilier (Ariary)", ""),
      (482, "Source de financement du matériel immobilier (interne ou externe)", 0, 1, 3, 1, NULL, 473, NULL, "Source de financement du matériel immobilier (interne ou externe)", ""),
      (483, "Projet d'appui du matériel immobilier (si externe)", 0, 1, 3, 1, NULL, 473, NULL, "Projet d'appui du matériel immobilier (si externe)", ""),
      (484, "Images matériel immobilier", 0, 1, 3, 1, NULL, 473, NULL, "Images matériel immobilier", ""),
      (485, "Observations matériel immobilier", 0, 1, 3, 0, NULL, 473, NULL, "Observations matériel immobilier", ""),
      (486, "Source de données matériel immobilier", 0, 1, 3, 1, NULL, 473, NULL, "Source de données matériel immobilier", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 473 WHERE id = 58`);

    // Outil
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (59, "Nombre de guides produits", "", 21, 0, 0, 1),
      (60, "Outils disponible et utilisé", "", 21, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (487, "Outil ou guide", 1, 1, 3, 1, 59, NULL, NULL, "Outil ou guide", ""),
      (488, "Titre de l'outil ou du guide", 0, 1, 3, 1, NULL, 487, NULL, "Titre de l'outil ou du guide", ""),
      (489, "Objet de l'outil ou du guide", 0, 1, 3, 1, NULL, 487, NULL, "Objet de l'outil ou du guide", ""),
      (490, "Nature de l'outil", 0, 1, 3, 1, NULL, 487, NULL, "Nature de l'outil", ""),
      (491, "Thématique de l'outil ou du guide", 0, 1, 3, 1, NULL, 487, NULL, "Thématique de l'outil ou du guide", ""),
      (492, "Commune d'application de l'outil ou du guide", 0, 1, 3, 1, NULL, 487, NULL, "Commune d'application de l'outil ou du guide", ""),
      (493, "Outil ou guide opérationnel (oui/non)", 0, 1, 3, 1, NULL, 487, NULL, "Outil ou guide opérationnel (oui/non)", ""),
      (494, "Utilisateur de l'outil ou du guide", 0, 1, 3, 1, NULL, 487, NULL, "Utilisateur de l'outil ou du guide", ""),
      (495, "Nombre d'outil ou de guide produit", 0, 1, 3, 1, NULL, 487, NULL, "Nombre d'outil ou de guide produit", ""),
      (496, "Nombre d'outil ou de guide distribué et utilisé", 0, 1, 3, 1, NULL, 487, NULL, "Nombre d'outil ou de guide distribué et utilisé", ""),
      (497, "Budget pour la création de l'outil ou du guide (Ariary)", 0, 1, 3, 0, NULL, 487, NULL, "Budget pour la création de l'outil ou du guide (Ariary)", ""),
      (498, "Source de financement de l'outil ou du guide (interne ou externe)", 0, 1, 3, 1, NULL, 487, NULL, "Source de financement de l'outil ou du guide (interne ou externe)", ""),
      (499, "Projet d'appui de l'outil ou du guide (si externe)", 0, 1, 3, 1, NULL, 487, NULL, "Projet d'appui de l'outil ou du guide (si externe)", ""),
      (500, "Images (outils et guides)", 0, 1, 3, 1, NULL, 487, NULL, "Images (outils et guides)", ""),
      (501, "Observations outils", 0, 1, 3, 0, NULL, 487, NULL, "Observations outils", ""),
      (502, "Source de données outils", 0, 1, 3, 1, NULL, 487, NULL, "Source de données outils", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 487 WHERE id = 59`);
    sql.push(`UPDATE indicateur set id_question = 496 WHERE id = 60`);

    // Plannification programmation evaluation
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (61, "Nombre de programmes qui ont fait l'objet de planification", "", 22, 0, 0, 1),
      (62, "Nombre de programmes qui ont fait l'objet de suivi", "", 22, 0, 0, 1),
      (63, "Nombre de programmes qui ont fait l'objet d'évaluation", "", 22, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (503, "Programme ou projet", 1, 1, 3, 1, NULL, NULL, NULL, "Programme ou projet", ""),
      (504, "Intitulé du programme ou projet", 0, 1, 3, 1, NULL, 503, NULL, "Intitulé du programme ou projet", ""),
      (505, "Commune d'intervention du programme ou projet", 0, 1, 3, 1, NULL, 503, NULL, "Commune d'intervention du programme ou projet", ""),
      (506, "Date de commencement du programme ou projet", 0, 1, 3, 1, NULL, 503, NULL, "Date de commencement du programme ou projet", ""),
      (507, "Date de clôture du programme ou projet", 0, 1, 3, 1, NULL, 503, NULL, "Date de clôture du programme ou projet", ""),
      (508, "Programme ou projet ayant été l'objet de planifiaction (oui/non)", 0, 1, 3, 1, 61, 503, NULL, "Programme ou projet ayant été l'objet de planifiaction (oui/non)", ""),
      (509, "Programme ou projet ayant été l'objet de suivi (oui/non)", 0, 1, 3, 1, 62, 503, NULL, "Programme ou projet ayant été l'objet de suivi (oui/non)", ""),
      (510, "Programme ou projet ayant été l'objet d'évaluation (oui/non)", 0, 1, 3, 1, 63, 503, NULL, "Programme ou projet ayant été l'objet d'évaluation (oui/non)", ""),
      (511, "Identifiant du projet", 0, 1, 3, 1, NULL, 503, NULL, "Identifiant du projet", ""),
      (512, "Source de financement du programme ou projet", 0, 1, 3, 1, NULL, 503, NULL, "Source de financement du programme ou projet", ""),
      (513, "Budget attribué aux activités de planification (Ariary)", 0, 1, 3, 1, NULL, 503, NULL, "Budget attribué aux activités de planification (Ariary)", ""),
      (514, "Budget attribué aux activités de suivi (Ariary)", 0, 1, 3, 1, NULL, 503, NULL, "Budget attribué aux activités de suivi (Ariary)", ""),
      (515, "Budget attribué aux activités d'évaluation (Ariary)", 0, 1, 3, 1, NULL, 503, NULL, "Budget attribué aux activités d'évaluation (Ariary)", ""),
      (516, "Existence de base de données (oui/non)", 0, 1, 3, 1, NULL, 503, NULL, "Existence de base de données (oui/non)", ""),
      (517, "Si oui, existence de mise à jour (oui/non)", 0, 1, 3, 1, NULL, 503, NULL, "Si oui, existence de mise à jour (oui/non)", ""),
      (518, "Observations PPSE", 0, 1, 3, 0, NULL, 503, NULL, "Observations PPSE", ""),
      (519, "Source de données PPSE", 0, 1, 3, 1, NULL, 503, NULL, "Source de données PPSE", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 508 WHERE id = 61`);
    sql.push(`UPDATE indicateur set id_question = 509 WHERE id = 62`);
    sql.push(`UPDATE indicateur set id_question = 510 WHERE id = 63`);

    // reboisement
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (64, "Superficie reboisée ", "", 23, 1, 0, 0),
      (65, "Superficie restaurée", "", 23, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (520, "Insitution", 1, 1, 3, 0, NULL, NULL, NULL, "Insitution", ""),
      (521, "DREDD/CIREDD", 0, 1, 3, 0, NULL, 520, NULL, "DREDD/CIREDD", ""),
      (522, "Commune d'intervention pour le reboisement", 0, 1, 3, 1, NULL, 520, NULL, "Commune d'intervention pour le reboisement", ""),
      (523, "Fokontany d'intervention pour le reboisement", 0, 1, 3, 0, NULL, 520, NULL, "Fokontany d'intervention pour le reboisement", ""),
      (524, "Site/Localité", 0, 1, 3, 0, NULL, 520, NULL, "Site/Localité", ""),
      (525, "Situation juridique (terrain domanial, privé)", 0, 1, 3, 1, NULL, 520, NULL, "Situation juridique (terrain domanial, privé)", ""),
      (526, "Longitude surface reboisée (en degré décimal) : X", 0, 1, 3, 1, NULL, 520, NULL, "Longitude surface reboisée (en degré décimal) : X", ""),
      (527, "Latitude surface reboisée (en degré décimal) : Y", 0, 1, 3, 1, NULL, 520, NULL, "Latitude surface reboisée (en degré décimal) : Y", ""),
      (528, "Entité ou personne responsable du reboisement", 0, 1, 3, 1, NULL, 520, NULL, "Entité ou personne responsable du reboisement", ""),
      (529, "Objectif de reboisement (restauration, energétique, bois d'œuvre, …)", 0, 1, 3, 1, NULL, 520, NULL, "Objectif de reboisement (restauration, energétique, bois d'œuvre, …)", ""),
      (530, "Superficie restaurée si restauration (ha)", 0, 1, 3, 0, NULL, 520, NULL, "Superficie restaurée si restauration (ha)", ""),
      (531, "Ecosystème (mangrove, zone humide, forêt humide, forêt sèche, …)", 0, 1, 3, 1, 64, 520, NULL, "Ecosystème (mangrove, zone humide, forêt humide, forêt sèche, …)", ""),
      (532, "Surface totale prévue (ha)", 0, 1, 3, 0, NULL, 520, NULL, "Surface totale prévue (ha)", ""),
      (533, "Nombre de plants mis en terre", 0, 1, 3, 1, NULL, 520, NULL, "Nombre de plants mis en terre", ""),
      (534, "Espèce des plants", 0, 1, 3, 1, NULL, 520, NULL, "Espèce des plants", ""),
      (535, "Autochtone ou exotique", 0, 1, 3, 1, NULL, 520, NULL, "Autochtone ou exotique", ""),
      (536, "Croissance rapide (oui/non)", 0, 1, 3, 1, NULL, 520, NULL, "Croissance rapide (oui/non)", ""),
      (537, "Date de mise en terre", 0, 1, 3, 1, NULL, 520, NULL, "Date de mise en terre", ""),
      (538, "Source de plants", 0, 1, 3, 1, NULL, 520, NULL, "Source de plants", ""),
      (539, "Superficie reboisée (ha)", 0, 1, 3, 1, NULL, 520, NULL, "Superficie reboisée (ha)", ""),
      (540, "Shapefile surface reboisée", 0, 1, 3, 1, NULL, 520, NULL, "Shapefile surface reboisée", ""),
      (541, "Source de financement du reboisement (interne ou externe)", 0, 1, 3, 1, NULL, 520, NULL, "Source de financement du reboisement (interne ou externe)", ""),
      (542, "Projet d'appui du reboisement (si externe)", 0, 1, 3, 1, NULL, 520, NULL, "Projet d'appui du reboisement (si externe)", ""),
      (543, "Pare feux (km)", 0, 1, 3, 1, NULL, 520, NULL, "Pare feux (km)", ""),
      (544, "Matériels de lutte active", 0, 1, 3, 0, NULL, 520, NULL, "Matériels de lutte active", ""),
      (545, "Existence de structure de lutte (oui/non)", 0, 1, 3, 0, NULL, 520, NULL, "Existence de structure de lutte (oui/non)", ""),
      (546, "Surface brûlée (ha)", 0, 1, 3, 0, NULL, 520, NULL, "Surface brûlée (ha)", ""),
      (547, "Shapefile surface de reboisement brûlée", 0, 1, 3, 0, NULL, 520, NULL, "Shapefile surface de reboisement brûlée", ""),
      (548, "Lutte active ou passive", 0, 1, 3, 0, NULL, 520, NULL, "Lutte active ou passive", ""),
      (549, "Date d'intervention", 0, 1, 3, 0, NULL, 520, NULL, "Date d'intervention", ""),
      (550, "Responsable de lutte contre les feux", 0, 1, 3, 0, NULL, 520, NULL, "Responsable de lutte contre les feux", ""),
      (551, "Regarnissage (oui/non)", 0, 1, 3, 0, NULL, 520, NULL, "Regarnissage (oui/non)", ""),
      (552, "Date de regarnissage", 0, 1, 3, 0, NULL, 520, NULL, "Date de regarnissage", ""),
      (553, "Nettoyage (oui/non)", 0, 1, 3, 0, NULL, 520, NULL, "Nettoyage (oui/non)", ""),
      (554, "Date de nettoyage", 0, 1, 3, 0, NULL, 520, NULL, "Date de nettoyage", ""),
      (555, "Elagage (oui/non)", 0, 1, 3, 0, NULL, 520, NULL, "Elagage (oui/non)", ""),
      (556, "Date d'elagage", 0, 1, 3, 0, NULL, 520, NULL, "Date d'elagage", ""),
      (557, "Bénéficiaires des interventions", 0, 1, 3, 0, NULL, 520, NULL, "Bénéficiaires des interventions", ""),
      (558, "Eclaicie 1 (oui/non)", 0, 1, 3, 0, NULL, 520, NULL, "Eclaicie 1 (oui/non)", ""),
      (559, "Date eclaircie 1", 0, 1, 3, 0, NULL, 520, NULL, "Date eclaircie 1", ""),
      (560, "Eclarcie 2 (oui/non)", 0, 1, 3, 0, NULL, 520, NULL, "Eclarcie 2 (oui/non)", ""),
      (561, "Date eclaircie 2", 0, 1, 3, 0, NULL, 520, NULL, "Date eclaircie 2", ""),
      (562, "Coupe rase (oui/non)", 0, 1, 3, 0, NULL, 520, NULL, "Coupe rase (oui/non)", ""),
      (563, "Date coupe rase", 0, 1, 3, 0, NULL, 520, NULL, "Date coupe rase", ""),
      (564, "Observations reboisement", 0, 1, 3, 0, NULL, 520, NULL, "Observations reboisement", ""),
      (565, "Source de données reboisement", 0, 1, 3, 1, NULL, 520, NULL, "Source de données reboisement", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 539 WHERE id = 64`);
    sql.push(`UPDATE indicateur set id_question = 530 WHERE id = 65`);

    // Recherche
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (66, "Nombre de recherches effectuées", "", 24, 0, 0, 1),
      (67, "Nombre de résultats de recherches disponibles", "", 24, 0, 0, 1),
      (68, "Nombre de résultats de recherches appliqués", "", 24, 0, 0, 1),
      (69, "Nombre de produits de recherche diffusés, vulgarisés, promus", "", 24, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (566, "Sujet de recherche effectué", 1, 1, 3, 1, NULL, NULL, NULL, "Sujet de recherche effectué", ""),
      (567, "Objectif de la recherche (étude de filière, ...)", 0, 1, 3, 0, NULL, 566, NULL, "Objectif de la recherche (étude de filière, ...)", ""),
      (568, "Commune d'intervention de la recherche", 0, 1, 3, 1, NULL, 566, NULL, "Commune d'intervention de la recherche", ""),
      (569, "Date de commencement de la recherche", 0, 1, 3, 0, NULL, 566, NULL, "Date de commencement de la recherche", ""),
      (570, "Date de fin de la recherche", 0, 1, 3, 0, NULL, 566, NULL, "Date de fin de la recherche", ""),
      (571, "Chercheurs (liste)", 0, 1, 3, 0, NULL, 566, NULL, "Chercheurs (liste)", ""),
      (572, "Institution des chercheurs", 0, 1, 3, 0, NULL, 566, NULL, "Institution des chercheurs", ""),
      (573, "Date d'édition du rapport de recherche", 0, 1, 3, 0, NULL, 566, NULL, "Date d'édition du rapport de recherche", ""),
      (574, "Résultats de la recherche", 0, 1, 3, 0, NULL, 566, NULL, "Résultats de la recherche", ""),
      (575, "Résultats disponibles (oui/non)", 0, 1, 3, 1, 67, 566, NULL, "Résultats disponibles (oui/non)", ""),
      (576, "Résultats appliqués (oui/non)", 0, 1, 3, 1, 68, 566, NULL, "Résultats appliqués (oui/non)", ""),
      (577, "Produits de recherche diffusés, vulgarisés, promus (oui/non)", 0, 1, 3, 1, 69, 566, NULL, "Produits de recherche diffusés, vulgarisés, promus (oui/non)", ""),
      (578, "Source de financement de la recherche (interne ou externe)", 0, 1, 3, 1, NULL, 566, NULL, "Source de financement de la recherche (interne ou externe)", ""),
      (579, "Projet d'appui de la recherche (si externe)", 0, 1, 3, 1, NULL, 566, NULL, "Projet d'appui de la recherche (si externe)", ""),
      (580, "Coûts des activités de recherche (Ariary)", 0, 1, 3, 0, NULL, 566, NULL, "Coûts des activités de recherche (Ariary)", ""),
      (581, "Observations recherche", 0, 1, 3, 0, NULL, 566, NULL, "Observations recherche", ""),
      (582, "Source de données recherche", 0, 1, 3, 1, NULL, 566, NULL, "Source de données recherche", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 566 WHERE id = 66`);
    sql.push(`UPDATE indicateur set id_question = 575 WHERE id = 67`);
    sql.push(`UPDATE indicateur set id_question = 576 WHERE id = 68`);
    sql.push(`UPDATE indicateur set id_question = 577 WHERE id = 69`);

    // RSE
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (70, "Nombre de projets développés dans le cadre de RSE", "", 25, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (583, "Intitulé du projet développé dans le cadre de RSE (Responsabilité Sociétale des Entreprises)", 1, 1, 3, 1, NULL, NULL, NULL, "Intitulé du projet développé dans le cadre de RSE (Responsabilité Sociétale des Entreprises)", ""),
      (584, "Objectifs du projet RSE", 0, 1, 3, 1, NULL, 583, NULL, "Objectifs du projet RSE", ""),
      (585, "Date de réalisation RSE", 0, 1, 3, 0, NULL, 583, NULL, "Date de réalisation RSE", ""),
      (586, "Commune d'intervention pour RSE", 0, 1, 3, 0, NULL, 583, NULL, "Commune d'intervention pour RSE", ""),
      (587, "Types d'intervention (éducation environnementale, reboisement/restauration, …)", 0, 1, 3, 0, NULL, 583, NULL, "Types d'intervention (éducation environnementale, reboisement/restauration, …)", ""),
      (588, "Supports afférents produits (liste)", 0, 1, 3, 0, NULL, 583, NULL, "Supports afférents produits (liste)", ""),
      (589, "Parties prenantes pour RSE (liste)", 0, 1, 3, 0, NULL, 583, NULL, "Parties prenantes pour RSE (liste)", ""),
      (590, "Nombre de ménages bénéficiaires de la RSE", 0, 1, 3, 0, NULL, 583, NULL, "Nombre de ménages bénéficiaires de la RSE", ""),
      (591, "Nombre d'autres bénéficiaires de la (groupement, école, …)", 0, 1, 3, 0, NULL, 583, NULL, "Nombre d'autres bénéficiaires de la (groupement, école, …)", ""),
      (592, "Existence de suivi des projets RSE (oui/non)", 0, 1, 3, 0, NULL, 583, NULL, "Existence de suivi des projets RSE (oui/non)", ""),
      (593, "Périodicité de suivi RSE (nombre par an)", 0, 1, 3, 0, NULL, 583, NULL, "Périodicité de suivi RSE (nombre par an)", ""),
      (594, "Observations RSE", 0, 1, 3, 0, NULL, 583, NULL, "Observations RSE", ""),
      (595, "Source de données RSE", 0, 1, 3, 1, NULL, 583, NULL, "Source de données RSE", "")`
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
      (596, "Intitulé du poste", 1, 1, 3, 1, NULL, NULL, NULL, "Intitulé du poste", ""),
      (597, "Justificatif d'assignation (Décisions, Note de service, arrêtés, décrets avec numéro)", 0, 1, 3, 1, NULL, 596, NULL, "Justificatif d'assignation (Décisions, Note de service, arrêtés, décrets avec numéro)", ""),
      (598, "Poste occupé ou vaccant", 0, 1, 3, 1, 71, 596, NULL, "Poste occupé ou vaccant", ""),
      (599, "Type du poste (administratif, technique)", 0, 1, 3, 1, 72, 596, NULL, "Type du poste (administratif, technique)", ""),
      (600, "Statut du personnel (ECD, ELD, EFA, fonctionnaire)", 0, 1, 3, 0, 71, 596, NULL, "Statut du personnel (ECD, ELD, EFA, fonctionnaire)", ""),
      (601, "Commune d'affectation", 0, 1, 3, 0, NULL, 596, NULL, "Commune d'affectation", ""),
      (602, "District d'affectation", 0, 1, 3, 0, NULL, 596, NULL, "District d'affectation", ""),
      (603, "Région d'affectation", 0, 1, 3, 0, NULL, 596, NULL, "Région d'affectation", ""),
      (605, "Année d'affectation", 0, 1, 3, 0, NULL, 596, NULL, "Année d'affectation", ""),
      (606, "Date de recrutement/année", 0, 1, 3, 0, NULL, 596, NULL, "Date de recrutement/année", ""),
      (607, "Date estimée de retraite/année", 0, 1, 3, 0, NULL, 596, NULL, "Date estimée de retraite/année", ""),
      (608, "Personne bénéficiant de formation (oui, non)", 0, 1, 3, 0, NULL, 596, NULL, "Personne bénéficiant de formation (oui, non)", ""),
      (609, "Sujet de formation", 0, 1, 3, 0, NULL, 596, NULL, "Sujet de formation", ""),
      (610, "Formation appliquée/utilisée (oui/non)", 0, 1, 3, 0, NULL, 596, NULL, "Formation appliquée/utilisée (oui/non)", ""),
      (611, "Besoins en formation pour le poste", 0, 1, 3, 0, NULL, 596, NULL, "Besoins en formation pour le poste ", ""),
      (612, "Observations ressources humaines", 0, 1, 3, 0, NULL, 596, NULL, "Observations ressources humaines", ""),
      (613, "Source de données ressources humaines", 0, 1, 3, 1, NULL, 596, NULL, "Source de données ressources humaines", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 596 WHERE id = 71`);
    sql.push(`UPDATE indicateur set id_question = 596 WHERE id = 72`);

    // TG
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (73, "Superficie de TG ", "", 27, 1, 0, 0),
      (74, "Nombre de TG suivi", "", 27, 0, 0, 1),
      (75, "Nombre de TG évalué", "", 27, 0, 0, 1),
      (76, "Nombre de ménages bénéficiaires de TG", "", 27, 1, 0, 0),
      (77, "Nombre de COBA formées", "", 27, 0, 0, 1),
      (78, "Nombre d'association (COBA/VOI) soutenue", "", 27, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (614, "DREDD/DIREDD", 1, 1, 3, 1, NULL, NULL, NULL, "DREDD/DIREDD", ""),
      (615, "Site du TG", 0, 1, 3, 0, NULL, 614, NULL, "Site du TG", ""),
      (616, "Fokontany d'implatation du TG", 0, 1, 3, 0, NULL, 614, NULL, "Fokontany d'implatation du TG", ""),
      (617, "Commune d'implatation du TG", 0, 1, 3, 1, NULL, 614, NULL, "Commune d'implatation du TG", ""),
      (618, "Type de forêts (Primaire, Secondaire, Littorale, Fourré, Mangrove, Satrana, Raphia, Tapia, Domaniale, Reboisement, Zone de pêches, etc.)", 0, 1, 3, 1, NULL, 614, NULL, "Type de forêts (Primaire, Secondaire, Littorale, Fourré, Mangrove, Satrana, Raphia, Tapia, Domaniale, Reboisement, Zone de pêches, etc.)", ""),
      (619, "Surface contrat 1 (ha)", 0, 1, 3, 1, NULL, 614, NULL, "Surface contrat 1 (ha)", ""),
      (620, "Type de TG (GCF, GELOSE)", 0, 1, 3, 1, NULL, 614, NULL, "Type de TG (GCF, GELOSE)", ""),
      (621, "Vocation/Objectifs (Conservation, Valorisation, Ecotourisme, Droit d'usage (CDU), Restauration, Production, Reserve, Réhabilitation, Enrichissement, Reboisement, Exploitation, Production durable, Zone de culture, Plantes fourragères, Production charbon de bois, Utilisation culturelle, etc.)", 0, 1, 3, 1, NULL, 614, NULL, "Vocation/Objectifs (Conservation, Valorisation, Ecotourisme, Droit d'usage (CDU), Restauration, Production, Reserve, Réhabilitation, Enrichissement, Reboisement, Exploitation, Production durable, Zone de culture, Plantes fourragères, Production charbon de bois, Utilisation culturelle, etc.)", ""),
      (622, "Surface contrat 2 (ha)", 0, 1, 3, 1, NULL, 614, NULL, "Surface contrat 2 (ha)", ""),
      (623, "Date 1er contrat", 0, 1, 3, 1, NULL, 614, NULL, "Date 1er contrat", ""),
      (624, "Date Evaluation 1er contrat", 0, 1, 3, 1, NULL, 614, NULL, "Date Evaluation 1er contrat", ""),
      (625, "Date Déliberation", 0, 1, 3, 1, NULL, 614, NULL, "Date Déliberation", ""),
      (626, "Date 2ème contrat", 0, 1, 3, 1, NULL, 614, NULL, "Date 2ème contrat", ""),
      (627, "Ressources concernées dans le site de TG", 0, 1, 3, 0, NULL, 614, NULL, "Ressources concernées dans le site de TG", ""),
      (628, "Nouvellement créé ou renouvelé", 0, 1, 3, 1, 73, 614, NULL, "Nouvellement créé ou renouvelé", ""),
      (629, "Nom de la COBA/VOI", 0, 1, 3, 1, NULL, 614, NULL, "Nom de la COBA/VOI", ""),
      (630, "Date de création de la COBA/VOI", 0, 1, 3, 0, NULL, 614, NULL, "Date de création de la COBA/VOI", ""),
      (631, "Nombre des membres de COBA/VOI", 0, 1, 3, 0, NULL, 614, NULL, "Nombre des membres de COBA/VOI", ""),
      (632, "COBA/VOI structurée (oui/non)", 0, 1, 3, 0, NULL, 614, NULL, "COBA/VOI structurée (oui/non)", ""),
      (633, "COBA/VOI formée (oui/non)", 0, 1, 3, 1, 77, 614, NULL, "COBA/VOI formée (oui/non)", ""),
      (634, "COBA/VOI opérationnelle (oui/non)", 0, 1, 3, 0, NULL, 614, NULL, "COBA/VOI opérationnelle (oui/non)", ""),
      (635, "Nombre de ménages bénéficiaires du TG", 0, 1, 3, 1, NULL, 614, NULL, "Nombre de ménages bénéficiaires du TG", ""),
      (636, "COBA/VOI appuyée/soutenue (oui/non)", 0, 1, 3, 1, 78, 614, NULL, "COBA/VOI appuyée/soutenue (oui/non)", ""),
      (637, "Type d'appui pour TG (dotation matériels, formation, AGR…)", 0, 1, 3, 0, NULL, 614, NULL, "Type d'appui pour TG (dotation matériels, formation, AGR…)", ""),
      (638, "Organisme d'appui du TG", 0, 1, 3, 1, NULL, 614, NULL, "Organisme d'appui du TG", ""),
      (639, "Projet d'appui du TG", 0, 1, 3, 1, NULL, 614, NULL, "Projet d'appui du TG", ""),
      (640, "TG suivi (oui/non)", 0, 1, 3, 1, 74, 614, NULL, "TG suivi (oui/non)", ""),
      (641, "Objetcif du suivi de TG", 0, 1, 3, 1, NULL, 614, NULL, "Objetcif du suivi de TG", ""),
      (642, "Date de réalisation du suivi de TG", 0, 1, 3, 0, NULL, 614, NULL, "Date de réalisation du suivi de TG", ""),
      (643, "Equipe de réalisation du suivi de TG", 0, 1, 3, 0, NULL, 614, NULL, "Equipe de réalisation du suivi de TG", ""),
      (644, "Rapport de suivi de TG (oui/non)", 0, 1, 3, 0, NULL, 614, NULL, "Rapport de suivi de TG (oui/non)", ""),
      (645, "Date d'édition rapport de suivi TG", 0, 1, 3, 0, NULL, 614, NULL, "Date d'édition rapport de suivi TG", ""),
      (646, "TG évalué (oui/non)", 0, 1, 3, 0, 75, 614, NULL, "TG évalué (oui/non)", ""),
      (647, "Objectif de l'évaluation de TG", 0, 1, 3, 1, NULL, 614, NULL, "Objectif de l'évaluation de TG", ""),
      (648, "Date de réalisation de l'évaluation de TG", 0, 1, 3, 0, NULL, 614, NULL, "Date de réalisation de l'évaluation de TG", ""),
      (649, "Equipe de réalisation de l'évaluation de TG", 0, 1, 3, 0, NULL, 614, NULL, "Equipe de réalisation de l'évaluation de TG", ""),
      (650, "Rapport d'évaluation de TG (oui/non)", 0, 1, 3, 0, NULL, 614, NULL, "Rapport d'évaluation de TG (oui/non)", ""),
      (651, "Date d'édition rapport évaluation TG", 0, 1, 3, 0, NULL, 614, NULL, "Date d'édition rapport évaluation TG", ""),
      (652, "Shapefile TG", 0, 1, 3, 0, NULL, 614, NULL, "Shapefile TG", ""),
      (653, "Observations TG", 0, 1, 3, 0, NULL, 614, NULL, "Observations TG", ""),
      (654, "Source de données TG", 0, 1, 3, 1, NULL, 614, NULL, "Source de données TG", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 619 WHERE id = 73`);
    sql.push(`UPDATE indicateur set id_question = 640 WHERE id = 74`);
    sql.push(`UPDATE indicateur set id_question = 646 WHERE id = 75`);
    sql.push(`UPDATE indicateur set id_question = 635 WHERE id = 76`);
    sql.push(`UPDATE indicateur set id_question = 633 WHERE id = 77`);
    sql.push(`UPDATE indicateur set id_question = 636 WHERE id = 78`);

    // transition écologique
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (79, "Superficie de terre dégradée gérée durablement", "", 28, 1, 0, 0),
      (80, "Superficie des dunes stabilisées", "", 28, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (655, "Commune d'intervention pour la transition écologique et résilience", 1, 1, 3, 1, NULL, NULL, NULL, "Commune d'intervention pour la transition écologique et résilience", ""),
      (656, "Année d'intervention des activités pour la transition écologique et résilience", 0, 1, 3, 1, NULL, 655, NULL, "Année d'intervention des activités pour la transition écologique et résilience", ""),
      (657, "Catégorie/Zone d'intervention (Agroforesterie, Bassin versant, Dune, Forêt de Tapia, Littoral, Mangrove, Recif corallien)", 0, 1, 3, 1, NULL, 655, NULL, "Catégorie/Zone d'intervention (Agroforesterie, Bassin versant, Dune, Forêt de Tapia, Littoral, Mangrove, Recif corallien)", ""),
      (658, "Terre dégradée avec des interventions de défense ou de protection (oui/non)", 0, 1, 3, 1, NULL, 655, NULL, "Terre dégradée avec des interventions de défense ou de protection (oui/non)", ""),
      (659, "Existence de protection antiérosive (oui/non)", 0, 1, 3, 1, NULL, 655, NULL, "Existence de protection antiérosive (oui/non)", ""),
      (660, "Autres protections (à préciser)", 0, 1, 3, 1, NULL, 655, NULL, "Autres protections (à préciser)", ""),
      (661, "Superficie de DRS (ha)", 0, 1, 3, 1, NULL, 655, NULL, "Superficie de DRS (ha)", ""),
      (662, "Shapefile de la DRS", 0, 1, 3, 1, NULL, 655, NULL, "Shapefile de la DRS", ""),
      (663, "Fixation de dunes (oui/non)", 0, 1, 3, 1, NULL, 655, NULL, "Fixation de dunes (oui/non)", ""),
      (664, "Superficie de dune stabilisée (ha)", 0, 1, 3, 1, NULL, 655, NULL, "Superficie de dune stabilisée (ha)", ""),
      (665, "Shapefile de la dune stabilisée", 0, 1, 3, 1, NULL, 655, NULL, "Shapefile de la dune stabilisée", ""),
      (666, "Type de la défense et restauration des sols adopté (mécanique, biologique, mixte)", 0, 1, 3, 0, NULL, 655, NULL, "Type de la défense et restauration des sols adopté (mécanique, biologique, mixte)", ""),
      (667, "Nombre de ménage pratiquant la DRS", 0, 1, 3, 0, NULL, 655, NULL, "Nombre de ménage pratiquant la DRS", ""),
      (668, "Comité formé sur la DRS (oui/non)", 0, 1, 3, 0, NULL, 655, NULL, "Comité formé sur la DRS (oui/non)", ""),
      (669, "Si oui, année de création du comité", 0, 1, 3, 0, NULL, 655, NULL, "Si oui, année de création du comité", ""),
      (670, "Comité sur DRS opérationnel (oui/non)", 0, 1, 3, 0, NULL, 655, NULL, "Comité sur DRS opérationnel (oui/non)", ""),
      (671, "Suivi des interventions DRS (oui/non)", 0, 1, 3, 0, NULL, 655, NULL, "Suivi des interventions DRS (oui/non)", ""),
      (672, "Périodicité de suivi DRS (nombre/an)", 0, 1, 3, 0, NULL, 655, NULL, "Périodicité de suivi DRS (nombre/an)", ""),
      (673, "Observations transition écologique", 0, 1, 3, 0, NULL, 655, NULL, "Observations transition écologique", ""),
      (674, "Source de données transition écologique", 0, 1, 3, 1, NULL, 655, NULL, "Source de données transition écologique", "")`
    );

    sql.push(`UPDATE indicateur set id_question = 661 WHERE id = 79`);
    sql.push(`UPDATE indicateur set id_question = 664 WHERE id = 80`);

    // DD
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (81, "Nombre de politiques sectorielles alignées au DD ", "", 29, 0, 0, 1),
      (82, "Nombre de promoteur ayant un label de DD ", "", 29, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (675, "Intitulé de la SNICDD", 1, 1, 3, 1, NULL, NULL, NULL, "Intitulé de la SNICDD", ""),
      (676, "Date d'élaboration de la SNICDD", 0, 1, 3, 0, NULL, 675, NULL, "Date d'élaboration de la SNICDD", ""),
      (677, "Parties prenantes dans l'élaboration", 0, 1, 3, 0, NULL, 675, NULL, "Parties prenantes dans l'élaboration", ""),
      (678, "SNICDD opérationnelle (oui/non)", 0, 1, 3, 0, NULL, 675, NULL, "SNICDD opérationnelle (oui/non)", ""),
      (679, "Intitulé de politique sectorielle alignée au DD", 0, 1, 3, 1, NULL, 675, NULL, "Intitulé de politique sectorielle alignée au DD", ""),
      (680, "Objectif de politique sectorielle alignée au DD", 0, 1, 3, 0, NULL, 675, NULL, "Objectif de politique sectorielle alignée au DD", ""),
      (681, "Date d'adoption de politique sectorielle alignée au DD", 0, 1, 3, 0, NULL, 675, NULL, "Date d'adoption de politique sectorielle alignée au DD", ""),
      (682, "Politique sectorielle alignée au DD opérationnelle (oui/non)", 0, 1, 3, 0, NULL, 675, NULL, "Politique sectorielle alignée au DD opérationnelle (oui/non)", ""),
      (683, "Intitulé de politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC)", 0, 1, 3, 1, NULL, 675, NULL, "Intitulé de politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC)", ""),
      (684, "Objectif de politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC)", 0, 1, 3, 0, NULL, 675, NULL, "Objectif de politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC)", ""),
      (685, "Date d'adoption de politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC)", 0, 1, 3, 0, NULL, 675, NULL, "Date d'adoption de politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC)", ""),
      (686, "Politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC) opérationnelle (oui/non)", 0, 1, 3, 0, 81, 675, NULL, "Politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC) opérationnelle (oui/non)", ""),
      (687, "Nom de promoteur ayant un label de DD", 0, 1, 3, 1, 82, 675, NULL, "Nom de promoteur ayant un label de DD", ""),
      (688, "Date d'obtention du label", 0, 1, 3, 0, NULL, 675, NULL, "Date d'obtention du label", ""),
      (689, "Commune d'obtention du label", 0, 1, 3, 1, NULL, 675, NULL, "Commune d'obtention du label", ""),
      (690, "Label toujours valide (oui/non)", 0, 1, 3, 0, NULL, 675, NULL, "Label toujours valide (oui/non)", ""),
      (691, "Intitulé du projet/programme en DD développé", 0, 1, 3, 1, NULL, 675, NULL, "Intitulé du projet/programme en DD développé", ""),
      (692, "Année de début projet/programme en DD", 0, 1, 3, 0, NULL, 675, NULL, "Année de début projet/programme en DD", ""),
      (693, "Année de fin projet/programme en DD", 0, 1, 3, 0, NULL, 675, NULL, "Année de fin projet/programme en DD", ""),
      (694, "Initiateur du projet/programme en DD", 0, 1, 3, 0, NULL, 675, NULL, "Initiateur du projet/programme en DD", ""),
      (695, "Intitulé du financement dans le cadre du DD", 0, 1, 3, 0, NULL, 675, NULL, "Intitulé du financement dans le cadre du DD", ""),
      (696, "Source de financement (interne ou externe)", 0, 1, 3, 0, NULL, 675, NULL, "Source de financement (interne ou externe)", ""),
      (697, "Date d'accord de financement", 0, 1, 3, 0, NULL, 675, NULL, "Date d'accord de financement", ""),
      (698, "Montant du financement (Ariary)", 0, 1, 3, 1, NULL, 675, NULL, "Montant du financement (Ariary)", ""),
      (699, "Observations DD", 0, 1, 3, 0, NULL, 675, NULL, "Observations DD", ""),
      (700, "Source de données DD", 0, 1, 3, 1, NULL, 675, NULL, "Source de données DD", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 686 WHERE id = 81`);
    sql.push(`UPDATE indicateur set id_question = 687 WHERE id = 82`);

    // PSE
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (83, "Nombre d'activités PSE développées", "", 30, 0, 0, 1),
      (84, "Nombre de ménages bénéficiaires des activités de PSE", "", 30, 1, 0, 0)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (701, "Type de Services Environnementaux (régulation, production, …)", 1, 1, 3, 0, NULL, NULL, NULL, "Type de Services Environnementaux (régulation, production, …)", ""),
      (702, "Fournisseur du SE (projets, Etat, communauté, …)", 0, 1, 3, 0, NULL, 701, NULL, "Fournisseur du SE (projets, Etat, communauté, …)", ""),
      (703, "Commune d'oimplantation du PSE", 0, 1, 3, 1, NULL, 701, NULL, "Commune d'oimplantation du PSE", ""),
      (704, "Intitulé de l'activité de PSE développée", 0, 1, 3, 1, NULL, 701, NULL, "Intitulé de l'activité de PSE développée", ""),
      (705, "Activités de PSE appuyées (oui/non)", 0, 1, 3, 0, NULL, 701, NULL, "Activités de PSE appuyées (oui/non)", ""),
      (706, "Type d'appui venant du PSE (dotation matériels, formation, AGR…)", 0, 1, 3, 0, NULL, 701, NULL, "Type d'appui venant du PSE (dotation matériels, formation, AGR…)", ""),
      (707, "Source de financement du PSE (interne ou externe)", 0, 1, 3, 1, NULL, 701, NULL, "Source de financement du PSE (interne ou externe)", ""),
      (708, "Projet d'appui du PSE (si externe)", 0, 1, 3, 1, NULL, 701, NULL, "Projet d'appui du PSE (si externe)", ""),
      (709, "Nombre de ménages bénéficiaires du PSE", 0, 1, 3, 1, NULL, 701, NULL, "Nombre de ménages bénéficiaires du PSE", ""),
      (710, "Micro-projets financés (oui/non)", 0, 1, 3, 0, NULL, 701, NULL, "Micro-projets financés (oui/non)", ""),
      (711, "Lequel/lesquels?", 0, 1, 3, 0, NULL, 701, NULL, "Lequel/lesquels?", ""),
      (712, "Micro projets alternatifs réalisés (liste)", 0, 1, 3, 0, NULL, 701, NULL, "Micro projets alternatifs réalisés (liste)", ""),
      (713, "Micro-projets sont suivis (oui/non)", 0, 1, 3, 0, NULL, 701, NULL, "Micro-projets sont suivis (oui/non)", ""),
      (714, "Filières de la biodiversité dotées de mécanismes de partage équitable de bénéfices (liste)", 0, 1, 3, 0, NULL, 701, NULL, "Filières de la biodiversité dotées de mécanismes de partage équitable de bénéfices (liste)", ""),
      (715, "Projets alternatifs aux pressions mis en œuvre dans les zones d'intervention (liste)", 0, 1, 3, 0, NULL, 701, NULL, "Projets alternatifs aux pressions mis en œuvre dans les zones d'intervention (liste)", ""),
      (716, "Structures intercommunales appuyées (liste)", 0, 1, 3, 0, NULL, 701, NULL, "Structures intercommunales appuyées (liste)", ""),
      (717, "Etudes de filières en relation avec les PSE réalisées (liste)", 0, 1, 3, 0, NULL, 701, NULL, "Etudes de filières en relation avec les PSE réalisées (liste)", ""),
      (718, "Valeur des services ecosystémiques fournis (culturelle, éconimique, …)", 0, 1, 3, 0, NULL, 701, NULL, "Valeur des services ecosystémiques fournis (culturelle, éconimique, …)", ""),
      (719, "Observations PSE", 0, 1, 3, 0, NULL, 701, NULL, "Observations PSE", ""),
      (720, "Source de données PSE", 0, 1, 3, 1, NULL, 701, NULL, "Source de données PSE", "")`
    );
    sql.push(`UPDATE indicateur set id_question = 704 WHERE id = 83`);
    sql.push(`UPDATE indicateur set id_question = 709 WHERE id = 84`);

    // Corruption
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (85, "Nombre de doléances sur la corruption reçues", "", 31, 0, 0, 1),
      (86, "Nombre de doléances sur la corruption traitées", "", 31, 0, 0, 1)`
    );

    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
      (721, "Type de doléances (corruption, manquement au code de déontologie et ethique environnementale)", 1, 1, 3, 1, 82, NULL, NULL, "Type de doléances (corruption, manquement au code de déontologie et ethique environnementale)", ""),
      (722, "Doléances traitées (oui/non)", 0, 1, 3, 1, 86, 721, NULL, "Doléances traitées (oui/non)", ""),
      (723, "Commune de réception de la doléance", 0, 1, 3, 1, NULL, 721, NULL, "Commune de réception de la doléance", ""),
      (724, "Type de corruption (actif, passif)", 0, 1, 3, 0, NULL, 721, NULL, "Type de corruption (actif, passif)", ""),
      (725, "Transmission des cas de corruption au Conseil de disipline (oui/non)", 0, 1, 3, 0, NULL, 721, NULL, "Transmission des cas de corruption au Conseil de disipline (oui/non)", ""),
      (726, "Sanction par le Conseil de discipline", 0, 1, 3, 0, NULL, 721, NULL, "Sanction par le Conseil de discipline", ""),
      (727, "Transmission à la juridication compétente des affaires de corruption (oui/non)", 0, 1, 3, 0, NULL, 721, NULL, "Transmission à la juridication compétente des affaires de corruption (oui/non)", ""),
      (728, "Nombre de personnes condamnées pour corruption", 0, 1, 3, 0, NULL, 721, NULL, "Nombre de personnes condamnées pour corruption", ""),
      (729, "Nombre de prevention dans le cadre de la lutte anti corruption", 0, 1, 3, 0, NULL, 721, NULL, "Nombre de prevention dans le cadre de la lutte anti corruption", ""),
      (730, "Nombre d'infraction de blanchiment de capitaux retenu par le SAMIFIN", 0, 1, 3, 0, NULL, 721, NULL, "Nombre d'infraction de blanchiment de capitaux retenu par le SAMIFIN", ""),
      (731, "Médiatisation des poursuites judiciaires en matière de trafic de ressources naturelles (oui/non)", 0, 1, 3, 0, NULL, 721, NULL, "Médiatisation des poursuites judiciaires en matière de trafic de ressources naturelles (oui/non)", ""),
      (732, "Nombre d'intervention du BIANCO ", 0, 1, 3, 0, NULL, 721, NULL, "Nombre d'intervention du BIANCO ", ""),
      (733, "Observations corruption", 0, 1, 3, 0, NULL, 721, NULL, "Observations corruption", ""),
      (734, "Source de données corruption", 0, 1, 3, 1, NULL, 721, NULL, "Source de données corruption", "")`
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
