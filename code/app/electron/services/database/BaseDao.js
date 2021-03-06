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
            "id"INTEGER NOT NULL UNIQUE,
            "label"TEXT NOT NULL,
            "rank"INTEGER NOT NULL DEFAULT 1,
            PRIMARY KEY("id")
        )`);
    sql.push(`CREATE TABLE IF NOT EXISTS "region" (
            "id"INTEGER NOT NULL UNIQUE,
            "label"TEXT NOT NULL,
            "comment"INTEGER,
            "province_id"INTEGER NOT NULL,
            FOREIGN KEY("province_id") REFERENCES "province"("id"),
            PRIMARY KEY("id")
        )`);
    sql.push(`CREATE TABLE IF NOT EXISTS "district" (
            "id"INTEGER NOT NULL UNIQUE,
            "label"TEXT NOT NULL,
            "comment"INTEGER,
            "region_id"INTEGER NOT NULL,
            FOREIGN KEY("region_id") REFERENCES "region"("id"),
            PRIMARY KEY("id")
        )`);
    sql.push(`CREATE TABLE IF NOT EXISTS "user" (
            "id"INTEGER NOT NULL UNIQUE,
            "nom"TEXT NOT NULL,
            "email"TEXT NOT NULL,
            "tel"TEXT NOT NULL,
            "pw"TEXT NOT NULL,
            "category_id"INTEGER,
            "validate"INTEGER NOT NULL DEFAULT 0,
            "district_id"INTEGER,
            FOREIGN KEY("district_id") REFERENCES "district"("id"),
            FOREIGN KEY("category_id") REFERENCES "category"("id"),
            PRIMARY KEY("id")
        )`);
    sql.push(`CREATE TABLE IF NOT EXISTS "thematique" (
            "id"INTEGER NOT NULL UNIQUE,
            "label"TEXT NOT NULL,
            "comment"TEXT,
            PRIMARY KEY("id")
        )`);
    sql.push(`CREATE TABLE "indicateur" (
            "id"INTEGER NOT NULL UNIQUE,
            "label"TEXT NOT NULL,
            "comment"INTEGER,
            "thematique_id"INTEGER NOT NULL,
            "sum"INTEGER NOT NULL DEFAULT 0,
            "moy"INTEGER NOT NULL DEFAULT 0,
            "count"INTEGER NOT NULL DEFAULT 0,
            "id_question"INTEGER,
            FOREIGN KEY("thematique_id") REFERENCES "thematique"("id"),
            FOREIGN KEY("id_question") REFERENCES "question"("id"),
            PRIMARY KEY("id")
        )`);
    sql.push(`CREATE TABLE IF NOT EXISTS "province" (
            "id"INTEGER NOT NULL UNIQUE,
            "label"TEXT NOT NULL,
            "comment"TEXT,
            PRIMARY KEY("id")
        )`);
    sql.push(`CREATE TABLE IF NOT EXISTS "reponse" (
            "id" INTEGER NOT NULL UNIQUE,
            "question_id" INTEGER NOT NULL,
            "user_id" INTEGER NOT NULL,
            "date" TEXT NOT NULL,
            "link_gps" TEXT,
            "link_photo" TEXT,
            "reponse" REAL NOT NULL,
            "comment" TEXT,
            "line_id" TEXT,
            FOREIGN KEY("user_id") REFERENCES "user"("id"),
            FOREIGN KEY("question_id") REFERENCES "question"("id"),
            PRIMARY KEY("id")
        )`);
    sql.push(`CREATE TABLE IF NOT EXISTS "reponse_non_valide" (
            "id" INTEGER NOT NULL UNIQUE,
            "question_id" INTEGER NOT NULL,
            "user_id" INTEGER NOT NULL,
            "date" TEXT NOT NULL,
            "link_gps" TEXT,
            "link_photo" TEXT,
            "reponse" REAL NOT NULL,
            "comment" TEXT,
            "line_id" TEXT,
            FOREIGN KEY("user_id") REFERENCES "user"("id"),
            FOREIGN KEY("question_id") REFERENCES "question"("id"),
            PRIMARY KEY("id")
        )`);
    sql.push(`CREATE TABLE "question" (
            "id"INTEGER NOT NULL UNIQUE,
            "question"TEXT,
            "is_principale"INTEGER NOT NULL DEFAULT 0,
            "field_type"INTEGER NOT NULL DEFAULT 1,
            "level"NUMERIC NOT NULL DEFAULT 1,
            "obligatoire"INTEGER NOT NULL DEFAULT 1,
            "indicateur_id"INTEGER,
            "question_mere_id"INTEGER,
            "objectif"TEXT,
            "label"REAL NOT NULL,
            "unite"TEXT,
            FOREIGN KEY("indicateur_id") REFERENCES "indicateur"("id"),
            PRIMARY KEY("id")
        )`);
    sql.push(`CREATE TABLE IF NOT EXISTS "pta" (
          "id"INTEGER NOT NULL UNIQUE,
          "indicateur_id"INTEGER,
          "district_id"INTEGER,
          "user_id"INTEGER,
          "valeur" REAL,
          "date" TEXT,
          "file" TEXT,
          FOREIGN KEY("indicateur_id") REFERENCES "indicateur"("id"),
          FOREIGN KEY("district_id") REFERENCES "district"("id"),
          FOREIGN KEY("user_id") REFERENCES "user"("id"),
          PRIMARY KEY("id")
      )`);

    // Add default values
    sql.push(`INSERT INTO "category" ("id","label","rank") VALUES 
            (1,'cantonnement',1),
            (0,'RPSE (Centrale)',0),
            (2,'RPSE',1),
            (3,'DREDD',2),
            (5,'D-CENTRAL',4),
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
    ( 23,"MENABE", NULL, 6),
    ( 24,"", NULL, 6)`);

    sql.push(`INSERT INTO "district" ("id","label","comment","region_id") VALUES 
    (0, "MADAGASCAR ", NULL, 24),
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
    (1,"Actes administratifs exploitation","Tous"),
    (2,"Actes administratifs recherche","Tous"),
    (3,"Aires prot??g??es (AP)","Tous"),
    (4,"Biodiversit??","Tous"),
    (5,"Cadre national et international (juridique, technique/strat??gique, institutionnel)","Tous"),
    (6,"Changement Climatique et REDD+ (Centrale)","Centrale"),
    (7,"Changement Climatique et REDD+ (Region)","Tous"),
    (8,"Contr??les environnementaux","Tous"),
    (9,"Contr??les forestiers","Tous"),
    (10,"Corruption","Tous"),
    (11,"D??veloppement durable (??conomie, sociale, environnement, culture)","Tous"),
    (12,"Economie verte","Tous"),
    (13,"Environnement (pollution, ??valuation environnementale, gouvernance)","Tous"),
    (14,"Feux??","Tous"),
    (15,"Informations, ??ducation, communication (IEC)","Tous"),
    (16,"Logistique (Infrastructure)","Tous"),
    (17,"Logistique (Mat??riel de transport)","Tous"),
    (18,"Logistique (Mat??riel informatique)","Tous"),
    (19,"Logistique (Mat??riel mobilier)","Tous"),
    (20,"Logistique (Mat??riel technique)","Tous"),
    (21,"Mobilisation de fonds","Tous"),
    (22,"Outils (guide, manuel)","Tous"),
    (23,"Paiement des services environnementaux (PSE)","Tous"),
    (24,"Partenariat","Tous"),
    (25,"P??pini??re","Tous"),
    (26,"Planification, programmation, suivi-??valuation et SI","Tous"),
    (27,"Reboisement et gestion des terres","Tous"),
    (28,"Recette","Tous"),
    (29,"Recherche et d??veloppement","Tous"),
    (30,"Responsabilit?? Soci??tale des Entreprises (RSE : reboisements, ??ducation environnementale, ...)","Tous"),
    (31,"Ressources humaines","Tous"),
    (32,"Transfert de gestion","Tous")`);

    // Set values to indicateur
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (1,"Quantit?? de produit d??clar??","",1,1,0,0),
      (2,"Nombre d'autorisation de recherche d??livr??e","",2,0,0,1),
      (3,"Superficie des Aires prot??g??es","",3,1,0,0),
      (4,"Nombre AP ayant un gestionnaire","",3,0,0,1),
      (5,"Nombre de m??nages b??n??ficiant des activit??s de conservations/d??veloppement (AGR)","",3,1,0,0),
      (6,"Nombre d'activit??s r??alis??es dans les PAG","",3,1,0,0),
      (7,"Superficie Aire prot??g??e restaur??e","",3,1,0,0),
      (8,"Esp??ces objet de trafic illicite","",4,0,0,1),
      (9,"Nombre de textes ??labor??s","",5,0,0,1),
      (10,"Nombre de textes mis ?? jour","",5,0,0,1),
      (11,"Nombre de conventions ratifi??es","",5,0,0,1),
      (12,"Nombre de textes adopt??s","",5,0,0,1),
      (13,"Nombre de cadres valid??s","",5,0,0,1),
      (14,"Nombre d'infrastructures touch??es par les catastrophes naturelles","",7,0,0,1),
      (15,"Co??t estimatif des r??parations (Ariary)","",7,1,0,0),
      (16,"Nombre de m??nages b??n??ficiaires d'action de lutte contre le changement climatique","",6,1,0,0),
      (17,"Superficie de puit de carbone g??r?? durablement","",6,1,0,0),
      (18,"Contr??les environnementaux effectu??s","",8,0,0,1),
      (19,"Nombre d'infractions environnementales constat??es","",8,1,0,0),
      (20,"Nombre de dossiers d'infractions environnementales trait??s","",8,1,0,0),
      (21,"Nombre de plaintes environnementales re??ues","",8,1,0,0),
      (22,"Nombre de plaintes environnementales trait??es","",8,1,0,0),
      (23,"Nombre de contr??les forestiers effectu??s","",9,0,0,1),
      (24,"Nombre d'infractions foresti??res constat??es","",9,1,0,0),
      (25,"Nombre de dossiers d'infractions foresti??res trait??s","",9,1,0,0),
      (26,"Nombre d'infractions forestiers d??f??r??es","",9,1,0,0),
      (27,"Nombre de cas de transaction avant jugement","",9,1,0,0),
      (28,"Quantit?? de produits saisis","",9,1,0,0),
      (29,"Nombre de dol??ances sur la corruption re??ues","",10,0,0,1),
      (30,"Dol??ances sur la corruption trait??es","",10,0,0,1),
      (31,"Politiques sectorielles align??es au DD","",11,0,0,1),
      (32,"Nombre de promoteur ayant un label de DD","",11,1,0,0),
      (33,"Certifications vertes promues par cha??ne de valeurs li??es aux ressources naturelles","",12,0,0,1),
      (34,"Nombre d'emplois verts d??cents cr????s","",12,1,0,0),
      (35,"Promotion d'alternative ??cologique","",12,0,0,1),
      (36,"Mise en conformit??, permis et/ou autorisation environnementale (PREE), permis environnementaux d??livr??s","",13,0,0,1),
      (37,"Nombre d'infrastructures de gestion de d??chets cr????es","",13,0,0,1),
      (38,"Surfaces br??l??es","",14,1,0,0),
      (39,"Longueur totale de pare-feu","",14,1,0,0),
      (40,"Structures op??rationnelles de gestion des feux","",14,0,0,1),
      (41,"Structures de gestion des feux","",14,0,0,1),
      (42,"Syst??me d'alerte de feux","",14,0,0,1),
      (43,"Nombre d'IEC effectu??es","",15,0,0,1),
      (44,"Nombre de participants form??s","",15,1,0,0),
      (45,"Nombre d'agents de l'administration form??s","",15,1,0,0),
      (46,"Nombre de s??ance de formation","",15,1,0,0),
      (47,"Nombre d'infrastructures","",16,0,0,1),
      (48,"Nombre d'infrastructures","",16,0,0,1),
      (49,"Nombre de mat??riel de transport","",17,0,0,1),
      (50,"Nombre de mat??riel informatique","",18,1,0,0),
      (51,"Nombre de mat??riel technique","",20,1,0,0),
      (52,"Nombre de mat??riel mobilier","",19,1,0,0),
      (53,"Montant du fond public mobilis??","",21,1,0,0),
      (54,"Montant du financement ext??rieur ou priv?? mobilis??","",21,1,0,0),
      (55,"Montant des dons mobilis??s","",21,1,0,0),
      (56,"Montant de pr??ts mobilis??s","",21,1,0,0),
      (57,"Nombre d'outils disponibles et utilis??s","",22,1,0,0),
      (58,"Nombre d'activit??s PSE d??velopp??es","",23,0,0,1),
      (59,"Nombre de m??nages b??n??ficiaires des activit??s de PSE","",23,1,0,0),
      (60,"Nombre de conventions de partenariat d??velopp??es et sign??es","",24,0,0,1),
      (61,"Projets issus des partenariats","",24,0,0,1),
      (62,"Nombre de plants produits","",25,1,0,0),
      (63,"Projets qui ont fait l'objet de planification","",26,0,0,1),
      (64,"Projets qui ont fait l'objet de suivi","",26,0,0,1),
      (65,"Projets qui ont fait l'objet d'??valuation","",26,0,0,1),
      (66,"Nombre de programmation ??ffectu??e","",26,1,0,0),
      (67,"Base de donn??es mise en place","",26,0,0,1),
      (68,"Syst??me d'information op??rationnel","",26,0,0,1),
      (69,"Superficie rebois??e","",27,1,0,0),
      (70,"Superficie restaur??e","",27,1,0,0),
      (71,"Superficie des dunes stabilis??es","",27,1,0,0),
      (72,"Nombre de plants mis en terre","",27,1,0,0),
      (73,"Recettes per??ues (Ar)","",28,1,0,0),
      (74,"Nombre de recherches effectu??es","",29,0,0,1),
      (75,"R??sultats de recherches disponibles","",29,0,0,1),
      (76,"R??sultats de recherches appliqu??s","",29,0,0,1),
      (77,"Produits de recherche diffus??s, vulgaris??s, promus","",29,0,0,1),
      (78,"Nombre de projets d??velopp??s dans le cadre de RSE","",30,0,0,1),
      (79,"Nombre de poste","",31,0,0,1),
      (80,"Nombre de personnel","",31,0,0,1),
      (81,"Superficie de TG nouvellement cr????","",32,1,0,0),
      (82,"Superficie de TG renouvel??","",32,1,0,0),
      (83,"TG suivi","",32,0,0,1),
      (84,"TG ??valu??","",32,0,0,1),
      (85,"Nombre de m??nages b??n??ficiaires de TG","",32,1,0,0),
      (87,"Association (COBA/VOI) soutenue","",32,0,0,1)`
    );

    // Set values to question
    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
        (1,"Source de donn??es actes administratifs exploitation",1,1,3,1,NULL,NULL,NULL,"Source de donn??es actes administratifs exploitation",""),
        (2,"Commune d'intervention pour les actes (<<Toutes>> si niveau national)",0,1,3,1,NULL,1,NULL,"Commune d'intervention pour les actes (<<Toutes>> si niveau national)",""),
        (3,"Type d'actes administratrifs (permis de coupe, autorisation de coupe, permis d'exploitation, convention de collecte PFNL, autorisation d'exportation)",0,1,3,1,NULL,1,NULL,"Type d'actes administratrifs (permis de coupe, autorisation de coupe, permis d'exploitation, convention de collecte PFNL, autorisation d'exportation)",""),
        (4,"R??f??rence de l'acte administratif",0,1,3,1,NULL,1,NULL,"R??f??rence de l'acte administratif",""),
        (5,"Types de produits inscrits dans l'acte administratif (Anacarde (kg), Baie rose (kg), Bois COS (m??), Bois de chauffe (st??re), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",0,1,3,1,1,1,NULL,"Types de produits inscrits dans l'acte administratif (Anacarde (kg), Baie rose (kg), Bois COS (m??), Bois de chauffe (st??re), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",""),
        (6,"Esp??ces concern??es par l'acte administratif",0,1,3,1,NULL,1,NULL,"Esp??ces concern??es par l'acte administratif",""),
        (7,"Quantit?? totale des produits inscrits dans l'acte administratif",0,1,3,1,NULL,1,NULL,"Quantit?? totale des produits inscrits dans l'acte administratif",""),
        (8,"Quantit?? des produits export??s inscrits dans l'acte administratif",0,1,3,1,NULL,1,NULL,"Quantit?? des produits export??s inscrits dans l'acte administratif",""),
        (9,"Destination des produits inscrits dans l'acte administratif (autoconsommation/march?? local/march?? national/exportation)",0,1,3,1,NULL,1,NULL,"Destination des produits inscrits dans l'acte administratif (autoconsommation/march?? local/march?? national/exportation)",""),
        (10,"Existence d'autorisation de transport octroy??e (oui/non)",0,1,3,1,NULL,1,NULL,"Existence d'autorisation de transport octroy??e (oui/non)",""),
        (11,"R??f??rence d'autorisation de transport",0,1,3,0,NULL,1,NULL,"R??f??rence d'autorisation de transport",""),
        (12,"Existence de laissez-passer d??livr?? (oui/non)",0,1,3,1,NULL,1,NULL,"Existence de laissez-passer d??livr?? (oui/non)",""),
        (13,"R??f??rence de laissez-passer",0,1,3,0,NULL,1,NULL,"R??f??rence de laissez-passer",""),
        (14,"Nom de l'op??rateur",0,1,3,0,NULL,1,NULL,"Nom de l'op??rateur",""),
        (15,"Exportateur agr???? (oui/non)",0,1,3,0,NULL,1,NULL,"Exportateur agr???? (oui/non)",""),
        (16,"Valeur des produits ?? l'exportation (Ariary)",0,1,3,0,NULL,1,NULL,"Valeur des produits ?? l'exportation (Ariary)",""),
        (17,"Observations actes administratifs exploitation",0,1,3,0,NULL,1,NULL,"Observations actes administratifs exploitation",""),
        (800,"Fichiers (exploitation) (.zip ?? importer)",0,1,3,0,NULL,1,NULL,"Fichiers (exploitation) (.zip ?? importer)",""),
                                                              
                                                              
                                                              
                                                              
        (19,"Source de donn??es actes administratifs recherche",1,1,3,1,NULL,NULL,NULL,"Source de donn??es actes administratifs recherche",""),
        (20,"Autorisation de recherche d??livr??e (oui/non)",0,1,3,1,2,19,NULL,"Autorisation de recherche d??livr??e (oui/non)",""),
        (21,"R??f??rence d'autorisation de recherche",0,1,3,0,NULL,19,NULL,"R??f??rence d'autorisation de recherche",""),
        (22,"Produits associ??s (faune ou flore)",0,1,3,1,NULL,19,NULL,"Produits associ??s (faune ou flore)",""),
        (23,"Esp??ces mises en jeu",0,1,3,0,NULL,19,NULL,"Esp??ces mises en jeu",""),
        (24,"Quotas de pr??l??vement",0,1,3,0,NULL,19,NULL,"Quotas de pr??l??vement",""),
        (25,"Observations actes administratifs recherche",0,1,3,0,NULL,19,NULL,"Observations actes administratifs recherche",""),
        (801,"Fichiers (recherche) (.zip ?? importer)",0,1,3,0,NULL,19,NULL,"Fichiers (recherche) (.zip ?? importer)",""),
                                                              
                                                              
                                                              
        (26,"Source de donn??es AP",1,1,3,1,NULL,NULL,NULL,"Source de donn??es AP",""),
        (27,"Nom de l'AP",0,1,3,1,NULL,26,NULL,"Nom de l'AP",""),
        (28,"Cat??gorie de l'AP (I, II, III, IV, V, VI, Autre)",0,1,3,1,NULL,26,NULL,"Cat??gorie de l'AP (I, II, III, IV, V, VI, Autre)",""),
        (29,"Statut temporaire ou d??finitif",0,1,3,1,NULL,26,NULL,"Statut temporaire ou d??finitif",""),
        (30,"D??cret si d??finitif",0,1,3,0,NULL,26,NULL,"D??cret si d??finitif",""),
        (31,"Geojson de l'AP",0,1,3,0,NULL,26,NULL,"Geojson de l'AP",""),
        (32,"Type : terrestre ou marine",0,1,3,1,3,26,NULL,"Type : terrestre ou marine",""),
        (33,"Pr??sence de zones humides (oui/non)",0,1,3,1,NULL,26,NULL,"Pr??sence de zones humides (oui/non)",""),
        (34,"Superficie zones humides (ha)",0,1,3,1,NULL,26,NULL,"Superficie zones humides (ha)",""),
        (35,"Existence de gestionnaire (oui/non)",0,1,3,1,NULL,26,NULL,"Existence de gestionnaire (oui/non)",""),
        (36,"Nom du gestionnaire",0,1,3,0,NULL,26,NULL,"Nom du gestionnaire",""),
        (37,"Nombre de m??nages b??n??ficiant des activit??s de conservations/d??veloppement (AGR)",0,1,3,1,NULL,26,NULL,"Nombre de m??nages b??n??ficiant des activit??s de conservations/d??veloppement (AGR)",""),
        (38,"Existence de PAG ??labor?? (oui/non)",0,1,3,1,NULL,26,NULL,"Existence de PAG ??labor?? (oui/non)",""),
        (39,"Nombre d'activit??s dans le PAG",0,1,3,1,NULL,26,NULL,"Nombre d'activit??s dans le PAG",""),
        (40,"Nombre d'activit??s r??alis??es dans le PAG",0,1,3,1,NULL,26,NULL,"Nombre d'activit??s r??alis??es dans le PAG",""),
        (41,"Existence de PGES ??labor?? (oui/non)",0,1,3,0,NULL,26,NULL,"Existence de PGES ??labor?? (oui/non)",""),
        (42,"Existence de EIE r??alis?? (oui/non)",0,1,3,0,NULL,26,NULL,"Existence de EIE r??alis?? (oui/non)",""),
        (43,"Existence de permis environnemental d??livr?? (oui/non)",0,1,3,0,NULL,26,NULL,"Existence de permis environnemental d??livr?? (oui/non)",""),
        (44,"AP red??limit??e (oui/non)",0,1,3,0,NULL,26,NULL,"AP red??limit??e (oui/non)",""),
        (45,"Superficie de l'AP (ha)",0,1,3,1,NULL,26,NULL,"Superficie de l'AP (ha)",""),
        (46,"Superficie restaur??e dans l'AP (ha)",0,1,3,1,NULL,26,NULL,"Superficie restaur??e dans l'AP (ha)",""),
        (47,"Contrat de d??l??gation de gestion sign?? (oui/non)",0,1,3,0,NULL,26,NULL,"Contrat de d??l??gation de gestion sign?? (oui/non)",""),
        (48,"AP disposant de structures op??rationnelles de gestion (oui/non)",0,1,3,0,4,26,NULL,"AP disposant de structures op??rationnelles de gestion (oui/non)",""),
        (49,"AP dont la cr??ation et la gestion sont appuy??es (oui/non)",0,1,3,0,NULL,26,NULL,"AP dont la cr??ation et la gestion sont appuy??es (oui/non)",""),
        (50,"Type d'appui pour l'AP (dotation mat??riels, formation, AGR, ???)",0,1,3,0,NULL,26,NULL,"Type d'appui pour l'AP (dotation mat??riels, formation, AGR, ???)",""),
        (51,"Source de financement de l'AP (interne ou externe)",0,1,3,1,NULL,26,NULL,"Source de financement de l'AP (interne ou externe)",""),
        (52,"Projet d'appui de l'AP (si externe)",0,1,3,0,NULL,26,NULL,"Projet d'appui de l'AP (si externe)",""),
        (53,"Identifiant du projet d'appui de l'AP",0,1,3,0,NULL,26,NULL,"Identifiant du projet d'appui de l'AP",""),
        (54,"AP dot??e d'un syst??me de gestion administrative et financi??re (oui/non)",0,1,3,0,NULL,26,NULL,"AP dot??e d'un syst??me de gestion administrative et financi??re (oui/non)",""),
        (55,"AP dot??e d'un syst??me de suivi ??cologique op??rationnel (oui/non)",0,1,3,0,NULL,26,NULL,"AP dot??e d'un syst??me de suivi ??cologique op??rationnel (oui/non)",""),
        (56,"AP disposant d'un r??sultat de suivi ??cologique (oui/non)",0,1,3,0,NULL,26,NULL,"AP disposant d'un r??sultat de suivi ??cologique (oui/non)",""),
        (57,"AP dot??e de syst??me de gestion des feux (oui/non)",0,1,3,0,NULL,26,NULL,"AP dot??e de syst??me de gestion des feux (oui/non)",""),
        (58,"AP dot??e d'un syst??me de surveillance et de contr??le op??rationnel (oui/non)",0,1,3,0,NULL,26,NULL,"AP dot??e d'un syst??me de surveillance et de contr??le op??rationnel (oui/non)",""),
        (59,"AP avec maintenance/entretien des infrastructures de conservation assur??s (oui/non)",0,1,3,0,NULL,26,NULL,"AP avec maintenance/entretien des infrastructures de conservation assur??s (oui/non)",""),
        (60,"AP dot??e d'infrastructures ??cotouristiques (oui/non)",0,1,3,0,NULL,26,NULL,"AP dot??e d'infrastructures ??cotouristiques (oui/non)",""),
        (61,"AP avec maintenance et entretien des infrastructures ??cotouristiques et de service assur??s (oui/non)",0,1,3,0,NULL,26,NULL,"AP avec maintenance et entretien des infrastructures ??cotouristiques et de service assur??s (oui/non)",""),
        (62,"AP faisant objet d'un zonage mat??rialis?? (oui/non)",0,1,3,0,NULL,26,NULL,"AP faisant objet d'un zonage mat??rialis?? (oui/non)",""),
        (63,"AP mettant en ??uvre dans leurs ZP des programmes sp??cifiques d'??ducation environnementale (oui/non)",0,1,3,0,NULL,26,NULL,"AP mettant en ??uvre dans leurs ZP des programmes sp??cifiques d'??ducation environnementale (oui/non)",""),
        (64,"AP faisant objet de restauration d???habitats (oui/non)",0,1,3,0,NULL,26,NULL,"AP faisant objet de restauration d???habitats (oui/non)",""),
        (65,"Indice d'efficacit?? globale de gestion de l'AP",0,1,3,1,NULL,26,NULL,"Indice d'efficacit?? globale de gestion de l'AP",""),
        (66,"Liste des menaces et pressions recens??es",0,1,3,0,NULL,26,NULL,"Liste des menaces et pressions recens??es",""),
        (67,"Taux de r??duction des menaces au niveau de l'AP (%)",0,1,3,0,NULL,26,NULL,"Taux de r??duction des menaces au niveau de l'AP (%)",""),
        (68,"Taux de d??forestation annuelle (%)",0,1,3,0,NULL,26,NULL,"Taux de d??forestation annuelle (%)",""),
        (69,"Nom de sites hors AP disposant de plan d'am??nagement et de gestion ??cotouristique op??rationnel (liste)",0,1,3,0,NULL,26,NULL,"Nom de sites hors AP disposant de plan d'am??nagement et de gestion ??cotouristique op??rationnel (liste)",""),
        (70,"Observations AP",0,1,3,0,NULL,26,NULL,"Observations AP",""),
        (802,"Fichiers (ap) (.zip ?? importer)",0,1,3,0,NULL,26,NULL,"Fichiers (ap) (.zip ?? importer)",""),
                                                              
                                                              
        (71,"Source de donn??es biodiversit??",1,1,3,1,NULL,NULL,NULL,"Source de donn??es biodiversit??",""),
        (72,"Esp??ce inventori??e",0,1,3,1,NULL,71,NULL,"Esp??ce inventori??e",""),
        (73,"Nom vernaculaire",0,1,3,1,NULL,71,NULL,"Nom vernaculaire",""),
        (74,"Commune d'intervention pour l'inventaire",0,1,3,1,NULL,71,NULL,"Commune d'intervention pour l'inventaire",""),
        (75,"Longitude (degr?? d??cimal) : X",0,1,3,1,NULL,71,NULL,"Longitude (degr?? d??cimal) : X",""),
        (76,"Latitude (degr?? d??cimal) : Y",0,1,3,1,NULL,71,NULL,"Latitude (degr?? d??cimal) : Y",""),
        (77,"Geojson correspondant biodiversit??",0,1,3,0,NULL,71,NULL,"Geojson correspondant biodiversit??",""),
        (78,"Statut UICN",0,1,3,0,NULL,71,NULL,"Statut UICN",""),
        (79,"End??mique (oui/non)",0,1,3,0,NULL,71,NULL,"End??mique (oui/non)",""),
        (80,"Ressource phare (oui/non)",0,1,3,0,NULL,71,NULL,"Ressource phare (oui/non)",""),
        (81,"Ressource menac??e (oui/non)",0,1,3,0,NULL,71,NULL,"Ressource menac??e (oui/non)",""),
        (82,"Cible de conservation (oui/non)",0,1,3,0,NULL,71,NULL,"Cible de conservation (oui/non)",""),
        (83,"Nom de l'AP de provenance de la ressource",0,1,3,0,NULL,71,NULL,"Nom de l'AP de provenance de la ressource",""),
        (84,"Liste des menaces et pressions recens??es",0,1,3,0,NULL,71,NULL,"Liste des menaces et pressions recens??es",""),
        (85,"Liste PFL associ??s",0,1,3,0,NULL,71,NULL,"Liste PFL associ??s",""),
        (86,"PFL inscrit dans CITES (oui/non)",0,1,3,0,NULL,71,NULL,"PFL inscrit dans CITES (oui/non)",""),
        (87,"Liste PFNL associ??s",0,1,3,0,NULL,71,NULL,"Liste PFNL associ??s",""),
        (88,"PFNL inscrit dans CITES (oui/non)",0,1,3,0,NULL,71,NULL,"PFNL inscrit dans CITES (oui/non)",""),
        (89,"Existence de fili??re concernant la ressource/biodiversit?? (oui/non)",0,1,3,0,NULL,71,NULL,"Existence de fili??re concernant la ressource/biodiversit?? (oui/non)",""),
        (90,"Appui financier et/ou technique de la fili??re (oui/non)",0,1,3,0,NULL,71,NULL,"Appui financier et/ou technique de la fili??re (oui/non)",""),
        (91,"Source de financement de l'inventaire de biodiversit?? (interne ou externe)",0,1,3,1,NULL,71,NULL,"Source de financement de l'inventaire de biodiversit?? (interne ou externe)",""),
        (92,"Projet d'appui pour l'inventaire de biodiversit?? (si externe)",0,1,3,0,NULL,71,NULL,"Projet d'appui pour l'inventaire de biodiversit?? (si externe)",""),
        (93,"Identifiant du projet d'appui pour la biodiversit??",0,1,3,0,NULL,71,NULL,"Identifiant du projet d'appui pour la biodiversit??",""),
        (94,"Esp??ce objet de trafic illicite (oui/non)",0,1,3,1,8,71,NULL,"Esp??ce objet de trafic illicite (oui/non)",""),
        (95,"Date de constat",0,1,3,0,NULL,71,NULL,"Date de constat",""),
        (96,"Quantit?? saisie",0,1,3,0,NULL,71,NULL,"Quantit?? saisie",""),
        (97,"Unit?? de mesure des effets saisies",0,1,3,0,NULL,71,NULL,"Unit?? de mesure des effets saisies",""),
        (98,"Dossier de traffic trait?? (oui/non)",0,1,3,0,NULL,71,NULL,"Dossier de traffic trait?? (oui/non)",""),
        (99,"R??f??rence du dossier",0,1,3,0,NULL,71,NULL,"R??f??rence du dossier",""),
        (100,"Images de la biodiversit??",0,1,3,0,NULL,71,NULL,"Images de la biodiversit??",""),
        (101,"Observations biodiversit??",0,1,3,0,NULL,71,NULL,"Observations biodiversit??",""),
        (803,"Fichiers (biodiversit??) (.zip ?? importer)",0,1,3,0,NULL,71,NULL,"Fichiers (biodiversit??) (.zip ?? importer)",""),
                                                              
                                                              
                                                              
        (102,"Source de donn??es cadre",1,1,3,1,NULL,NULL,NULL,"Source de donn??es cadre",""),
        (103,"Intitul?? du cadre avec r??f??rence",0,1,3,1,NULL,102,NULL,"Intitul?? du cadre avec r??f??rence",""),
        (104,"Type (Convention, Loi, D??cret, Arr??t??, Circulaire, Strat??gie, Manuel de proc??dure)",0,1,3,1,NULL,102,NULL,"Type (Convention, Loi, D??cret, Arr??t??, Circulaire, Strat??gie, Manuel de proc??dure)",""),
        (105,"Cadre juridique ou technique ou r??glementaire",0,1,3,1,NULL,102,NULL,"Cadre juridique ou technique ou r??glementaire",""),
        (106,"Th??matique",0,1,3,1,NULL,102,NULL,"Th??matique",""),
        (107,"Objectifs du cadre",0,1,3,1,NULL,102,NULL,"Objectifs du cadre",""),
        (108,"Cadre valid?? (oui/non)",0,1,3,1,13,102,NULL,"Cadre valid?? (oui/non)",""),
        (109,"Date de validation",0,1,3,0,NULL,102,NULL,"Date de validation",""),
        (110,"Secteur concern?? par le cadre",0,1,3,1,NULL,102,NULL,"Secteur concern?? par le cadre",""),
        (111,"Nouveau (oui/non)",0,1,3,1,NULL,102,NULL,"Nouveau (oui/non)",""),
        (112,"Mis ?? jour (oui/non)",0,1,3,1,10,102,NULL,"Mis ?? jour (oui/non)",""),
        (113,"Ratifi?? (oui/non)",0,1,3,1,11,102,NULL,"Ratifi?? (oui/non)",""),
        (114,"Adopt?? (oui/non)",0,1,3,1,12,102,NULL,"Adopt?? (oui/non)",""),
        (115,"Date de promulgation",0,1,3,0,NULL,102,NULL,"Date de promulgation",""),
        (116,"Int??grant la coh??rence intersectorielle sur la gestion environnementale et climatique (oui/non)",0,1,3,0,NULL,102,NULL,"Int??grant la coh??rence intersectorielle sur la gestion environnementale et climatique (oui/non)",""),
        (117,"Textes d'application (liste)",0,1,3,0,NULL,102,NULL,"Textes d'application (liste)",""),
        (118,"Identifiant du projet d'appui pour le cadre",0,1,3,0,NULL,102,NULL,"Identifiant du projet d'appui pour le cadre",""),
        (119,"Fichiers (cadre) (.zip ?? importer)",0,1,3,0,NULL,102,NULL,"Fichiers (cadre) (.zip ?? importer)",""),
        (120,"Observations cadre",0,1,3,0,NULL,102,NULL,"Observations cadre",""),
                                                              
                                                              
                                                              
        (121,"Source de donn??es CC et REDD+",1,1,3,1,NULL,NULL,NULL,"Source de donn??es CC et REDD+",""),
        (122,"Nature des catastrophes naturelles",0,1,3,1,NULL,120,NULL,"Nature des catastrophes naturelles",""),
        (123,"Date de la catastrophe naturelle",0,1,3,0,NULL,120,NULL,"Date de la catastrophe naturelle",""),
        (124,"Type d'infrastructures touch??es par les catastrophes naturelles (b??timent, p??pini??re, for??ts)",0,1,3,1,14,120,NULL,"Type d'infrastructures touch??es par les catastrophes naturelles (b??timent, p??pini??re, for??ts)",""),
        (125,"Co??t estimatif des r??parations (Ariary)",0,1,3,1,NULL,120,NULL,"Co??t estimatif des r??parations (Ariary)",""),
        (126,"Ampleur des dommages mat??riels dus aux catastrophes naturelles (faible, moyen, fort)",0,1,3,0,NULL,120,NULL,"Ampleur des dommages mat??riels dus aux catastrophes naturelles (faible, moyen, fort)",""),
        (127,"Identifiant du projet d'appui pour la lutte contre le CC et REDD+",0,1,3,0,NULL,120,NULL,"Identifiant du projet d'appui pour la lutte contre le CC et REDD+",""),
        (128,"Observations CC et REDD+",0,1,3,0,NULL,120,NULL,"Observations CC et REDD+",""),
        (805,"Fichiers (CC et REDD+) (.zip ?? importer)",0,1,3,0,NULL,121,NULL,"Fichiers (CC et REDD+) (.zip ?? importer)",""),
                                                              
                                                              
        (129,"Source de donn??es CC et REDD+ (centrale)",1,1,3,1,NULL,NULL,NULL,"Source de donn??es CC et REDD+ (centrale)",""),
        (130,"Nom de projet d'adaptation, att??nuation et r??silience au changement climatique et REDD+",0,1,3,0,NULL,129,NULL,"Nom de projet d'adaptation, att??nuation et r??silience au changement climatique et REDD+",""),
        (131,"Plan et projet mis en ??uvre (oui/non)",0,1,3,0,NULL,129,NULL,"Plan et projet mis en ??uvre (oui/non)",""),
        (132,"Activit??s sectorielles ou projets int??grant le climat et le changement climatique (liste)",0,1,3,0,NULL,129,NULL,"Activit??s sectorielles ou projets int??grant le climat et le changement climatique (liste)",""),
        (133,"Stations climatologiques participant ?? la veille climatique et agrom??t??orologique (liste)",0,1,3,0,NULL,129,NULL,"Stations climatologiques participant ?? la veille climatique et agrom??t??orologique (liste)",""),
        (134,"Action de lutte contre le changement climatique int??gr??e dans la promotion d'une ??conomie r??siliente (liste)",0,1,3,0,NULL,129,NULL,"Action de lutte contre le changement climatique int??gr??e dans la promotion d'une ??conomie r??siliente (liste)",""),
        (135,"Commune d'intervention pour la lutte contre CC (<<Toutes>> si niveau national)",0,1,3,1,NULL,129,NULL,"Commune d'intervention pour la lutte contre CC (<<Toutes>> si niveau national)",""),
        (136,"Nombre de m??nages b??n??ficiaires pour la lutte contre CC",0,1,3,1,NULL,129,NULL,"Nombre de m??nages b??n??ficiaires pour la lutte contre CC",""),
        (137,"Nombre d'hommes b??n??ficiaires pour la lutte contre CC",0,1,3,0,NULL,129,NULL,"Nombre d'hommes b??n??ficiaires pour la lutte contre CC",""),
        (138,"Nombre de femmes b??n??ficiaires pour la lutte contre CC",0,1,3,0,NULL,129,NULL,"Nombre de femmes b??n??ficiaires pour la lutte contre CC",""),
        (139,"Nombre de femmes chef de m??nage b??n??ficiaires pour la lutte contre CC",0,1,3,0,NULL,129,NULL,"Nombre de femmes chef de m??nage b??n??ficiaires pour la lutte contre CC",""),
        (140,"Nombre de jeunes b??n??ficiaires pour la lutte contre CC",0,1,3,0,NULL,129,NULL,"Nombre de jeunes b??n??ficiaires pour la lutte contre CC",""),
        (141,"Source de financement pour la lutte contre CC (interne ou externe)",0,1,3,1,NULL,129,NULL,"Source de financement pour la lutte contre CC (interne ou externe)",""),
        (142,"Projet d'appui pour la lutte contre CC (si externe)",0,1,3,0,NULL,129,NULL,"Projet d'appui pour la lutte contre CC (si externe)",""),
        (143,"Identifiant du projet d'appui pour la lutte contre le CC et REDD+ (centrale)",0,1,3,0,NULL,129,NULL,"Identifiant du projet d'appui pour la lutte contre le CC et REDD+ (centrale)",""),
        (144,"Surface de for??ts g??r??es dans le cadre du CC et REDD+ (ha)",0,1,3,1,NULL,129,NULL,"Surface de for??ts g??r??es dans le cadre du CC et REDD+ (ha)",""),
        (145,"Geojson correspondant CC et REDD+",0,1,3,0,NULL,129,NULL,"Geojson correspondant CC et REDD+",""),
        (146,"Taux d'emission de CO2 (%)",0,1,3,0,NULL,129,NULL,"Taux d'emission de CO2 (%)",""),
        (147,"Observations CC et REDD+ (centrale)",0,1,3,0,NULL,129,NULL,"Observations CC et REDD+ (centrale)",""),
        (806,"Fichiers (CC, REDD+) (.zip ?? importer)",0,1,3,0,NULL,129,NULL,"Fichiers (CC, REDD+) (.zip ?? importer)",""),
                                                              
                                                              
        (148,"Source de donn??es contr??les environnementaux",1,1,3,1,NULL,NULL,NULL,"Source de donn??es contr??les environnementaux",""),
        (149,"Intitul?? de la mission de contr??le environnemental",0,1,3,1,NULL,148,NULL,"Intitul?? de la mission de contr??le environnemental",""),
        (150,"Date de la mission de contr??le environnemental",0,1,3,0,17,148,NULL,"Date de la mission de contr??le environnemental",""),
        (151,"Mission de contr??le environnemental effectu??e ou r??alis??e (oui/non)",0,1,3,1,18,148,NULL,"Mission de contr??le environnemental effectu??e ou r??alis??e (oui/non)",""),
        (152,"Commune de r??alisation du contr??le environnemental",0,1,3,1,NULL,148,NULL,"Commune de r??alisation du contr??le environnemental",""),
        (153,"Nombre d'infraction environnementale",0,1,3,1,NULL,148,NULL,"Nombre d'infraction environnementale",""),
        (154,"Nature de l'infraction environnementale",0,1,3,0,NULL,148,NULL,"Nature de l'infraction environnementale",""),
        (155,"Motif de PV d'infraction environnementale ??tabli (constat)",0,1,3,0,NULL,148,NULL,"Motif de PV d'infraction environnementale ??tabli (constat)",""),
        (156,"R??f??rence de dossiers d'infractions environnementales",0,1,3,1,NULL,148,NULL,"R??f??rence de dossiers d'infractions environnementales",""),
        (157,"Nombre de dossier d'infractions environnementales trait??",0,1,3,1,NULL,148,NULL,"Nombre de dossier d'infractions environnementales trait??",""),
        (158,"Existence de dispositifs de contr??le environnemental de proximit?? (oui/non)",0,1,3,0,NULL,148,NULL,"Existence de dispositifs de contr??le environnemental de proximit?? (oui/non)",""),
        (159,"Dispositifs de contr??le redynamis??s (oui/non)",0,1,3,0,NULL,148,NULL,"Dispositifs de contr??le redynamis??s (oui/non)",""),
        (160,"Nombre de plaintes environnementales re??ues",0,1,3,1,NULL,148,NULL,"Nombre de plaintes environnementales re??ues",""),
        (161,"Intitul?? de plaintes environnementales d??pos??es avec r??f??rence (liste)",0,1,3,0,NULL,148,NULL,"Intitul?? de plaintes environnementales d??pos??es avec r??f??rence (liste)",""),
        (162,"Date de d??position des plainte",0,1,3,0,NULL,148,NULL,"Date de d??position des plainte",""),
        (163,"Nombre de plaintes environnementales trait??es",0,1,3,1,NULL,148,NULL,"Nombre de plaintes environnementales trait??es",""),
        (164,"Secteur concern?? (Agriculture, Industrie, Service)",0,1,3,1,22,148,NULL,"Secteur concern?? (Agriculture, Industrie, Service)",""),
        (165,"Date de d??but de traitement",0,1,3,0,NULL,148,NULL,"Date de d??but de traitement",""),
        (166,"Nombre de plaintes environnementales r??solues",0,1,3,1,NULL,148,NULL,"Nombre de plaintes environnementales r??solues",""),
        (167,"Date de r??solution des plaintes",0,1,3,0,NULL,148,NULL,"Date de r??solution des plaintes",""),
        (168,"Mesures correctives et recommandations",0,1,3,0,NULL,148,NULL,"Mesures correctives et recommandations",""),
        (169,"Identifiant du projet d'appui pour les contr??les environnementaux",0,1,3,0,NULL,148,NULL,"Identifiant du projet d'appui pour les contr??les environnementaux",""),
        (170,"Observations contr??les environnementaux",0,1,3,0,NULL,148,NULL,"Observations contr??les environnementaux",""),
        (807,"Fichiers (contr??le environnementaux) (.zip ?? importer)",0,1,3,0,NULL,148,NULL,"Fichiers (contr??le environnementaux) (.zip ?? importer)",""),
                                                              
                                                              
                                                              
        (171,"Source de donn??es contr??les forestiers",1,1,3,1,NULL,NULL,NULL,"Source de donn??es contr??les forestiers",""),
        (172,"Intitul?? de la mission de contr??le forestier",0,1,3,1,NULL,171,NULL,"Intitul?? de la mission de contr??le forestier",""),
        (173,"Date de la mission de contr??le forestier",0,1,3,0,NULL,171,NULL,"Date de la mission de contr??le forestier",""),
        (174,"Mission de contr??le forestier effectu??e ou r??alis??e (oui/non)",0,1,3,1,23,171,NULL,"Mission de contr??le forestier effectu??e ou r??alis??e (oui/non)",""),
        (175,"Commune de r??alisation du contr??le forestier",0,1,3,0,NULL,171,NULL,"Commune de r??alisation du contr??le forestier",""),
        (176,"Nombre d'infraction foresti??re",0,1,3,1,NULL,171,NULL,"Nombre d'infraction foresti??re",""),
        (177,"Motif du PV d'infraction foresti??re (constat)",0,1,3,0,NULL,171,NULL,"Motif du PV d'infraction foresti??re (constat)",""),
        (178,"Intitul?? du PV de saisie avec r??f??rence",0,1,3,0,NULL,171,NULL,"Intitul?? du PV de saisie avec r??f??rence",""),
        (179,"Type de produit saisi (PFL, PFNL)",0,1,3,0,NULL,171,NULL,"Type de produit saisi (PFL, PFNL)",""),
        (180,"Nature du produit saisi (brut, fini)",0,1,3,0,NULL,171,NULL,"Nature du produit saisi (brut, fini)",""),
        (181,"Esp??ce du produit saisi",0,1,3,0,NULL,171,NULL,"Esp??ce du produit saisi",""),
        (182,"Date de saisi du produit",0,1,3,0,27,171,NULL,"Date de saisi du produit",""),
        (183,"Designation du produit saisi (Anacarde (kg), Baie rose (kg), Bois COS (m??), Bois de chauffe (st??re), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",0,1,3,1,NULL,171,NULL,"Designation du produit saisi (Anacarde (kg), Baie rose (kg), Bois COS (m??), Bois de chauffe (st??re), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",""),
        (184,"Quantit?? de produit saisi",0,1,3,1,NULL,171,NULL,"Quantit?? de produit saisi",""),
        (185,"Date de sequestre",0,1,3,0,NULL,171,NULL,"Date de sequestre",""),
        (186,"Localisation des produits sequestr??s (localit??)",0,1,3,0,NULL,171,NULL,"Localisation des produits sequestr??s (localit??)",""),
        (187,"R??f??rence conclusions emis par les repr??sentants minist??riels vers le parquet",0,1,3,0,NULL,171,NULL,"R??f??rence conclusions emis par les repr??sentants minist??riels vers le parquet",""),
        (188,"Nombre infraction d??f??r??e",0,1,3,1,NULL,171,NULL,"Nombre infraction d??f??r??e",""),
        (189,"Intitul?? du dossier transmis au parquet avec r??f??rence (liste)",0,1,3,1,NULL,171,NULL,"Intitul?? du dossier transmis au parquet avec r??f??rence (liste)",""),
        (190,"Nombre de transaction avant jugement",0,1,3,1,NULL,171,NULL,"Nombre de transaction avant jugement",""),
        (191,"Nature de l'infraction verbalis??e",0,1,3,0,NULL,171,NULL,"Nature de l'infraction verbalis??e",""),
        (192,"R??f??rence de dossiers d'infractions foresti??res",0,1,3,1,NULL,171,NULL,"R??f??rence de dossiers d'infractions foresti??res",""),
        (193,"Nombre de dossier d'infractions foresti??res trait??",0,1,3,1,NULL,171,NULL,"Nombre de dossier d'infractions foresti??res trait??",""),
        (194,"Mesures correctives et recommandations",0,1,3,0,NULL,171,NULL,"Mesures correctives et recommandations",""),
        (195,"Existence de dispositifs de contr??le forestier de proximit?? (oui/non)",0,1,3,0,NULL,171,NULL,"Existence de dispositifs de contr??le forestier de proximit?? (oui/non)",""),
        (196,"En cas d??frichement, surface defrich??e (ha)",0,1,3,0,NULL,171,NULL,"En cas d??frichement, surface defrich??e (ha)",""),
        (197,"Dispositifs de contr??le redynamis??s (oui/non)",0,1,3,0,NULL,171,NULL,"Dispositifs de contr??le redynamis??s (oui/non)",""),
        (198,"Identifiant du projet d'appui pour les contr??les forestiers",0,1,3,0,NULL,171,NULL,"Identifiant du projet d'appui pour les contr??les forestiers",""),
        (199,"Observations contr??les forestiers",0,1,3,0,NULL,171,NULL,"Observations contr??les forestiers",""),
        (808,"Fichiers (contr??le forestier) (.zip ?? importer)",0,1,3,0,NULL,171,NULL,"Fichiers (contr??le forestier) (.zip ?? importer)",""),
                                                              
                                                              
                                                              
        (200,"Source de donn??es partenariat",1,1,3,1,NULL,NULL,NULL,"Source de donn??es partenariat",""),
        (201,"Nom de la Convention de partenariat ??labor??e",0,1,3,1,NULL,200,NULL,"Nom de la Convention de partenariat ??labor??e",""),
        (202,"Type de partenariat (PPP, international, ???)",0,1,3,0,NULL,200,NULL,"Type de partenariat (PPP, international, ???)",""),
        (203,"Convention de partenariat sign??e (oui/non)",0,1,3,1,NULL,200,NULL,"Convention de partenariat sign??e (oui/non)",""),
        (204,"Objet de la convention de partenariat",0,1,3,1,NULL,200,NULL,"Objet de la convention de partenariat",""),
        (205,"Il s'agit de projet (oui/non)",0,1,3,1,61,200,NULL,"Il s'agit de projet (oui/non)",""),
        (206,"si oui, quel/quels projet(s) ?",0,1,3,0,NULL,200,NULL,"si oui, quel/quels projet(s) ?",""),
        (207,"Date d'??laboration de la convention de partenariat",0,1,3,0,NULL,200,NULL,"Date d'??laboration de la convention de partenariat",""),
        (208,"Date de signature de la convention de partenariat",0,1,3,0,NULL,200,NULL,"Date de signature de la convention de partenariat",""),
        (209,"Entit??s signataires",0,1,3,0,NULL,200,NULL,"Entit??s signataires",""),
        (210,"Dur??e de la convention de partenariat",0,1,3,0,NULL,200,NULL,"Dur??e de la convention de partenariat",""),
        (211,"Cibles de la convention de partenariat",0,1,3,0,NULL,200,NULL,"Cibles de la convention de partenariat",""),
        (212,"Nombre de m??nages b??n??ficiaires dans le cadre du partenariat",0,1,3,0,NULL,200,NULL,"Nombre de m??nages b??n??ficiaires dans le cadre du partenariat",""),
        (213,"Identifiant du projet d'appui pour le partenariat",0,1,3,0,NULL,200,NULL,"Identifiant du projet d'appui pour le partenariat",""),
        (214,"Fichiers (partenariat) (.zip ?? importer)",0,1,3,0,NULL,200,NULL,"Fichiers (partenariat) (.zip ?? importer)",""),
        (215,"Observations partenariat",0,1,3,0,NULL,200,NULL,"Observations partenariat",""),
                                                              
                                                              
                                                              
        (216,"Source de donn??es ??conomie verte",1,1,3,1,NULL,NULL,NULL,"Source de donn??es ??conomie verte",""),
        (217,"Commune d'implantation de l'??conomie verte",0,1,3,1,NULL,216,NULL,"Commune d'implantation de l'??conomie verte",""),
        (218,"Cha??ne de valeur verte promue",0,1,3,1,NULL,216,NULL,"Cha??ne de valeur verte promue",""),
        (219,"Ressource naturelle mise en jeu dans la cha??ne de valeur",0,1,3,0,NULL,216,NULL,"Ressource naturelle mise en jeu dans la cha??ne de valeur",""),
        (220,"Existence de certifications vertes promues par cha??ne de valeur li??e aux ressources naturelles (oui/non)",0,1,3,1,33,216,NULL,"Existence de certifications vertes promues par cha??ne de valeur li??e aux ressources naturelles (oui/non)",""),
        (221,"Superficie (ha) des ressources g??r??es en vue de l???exploitation durable",0,1,3,0,NULL,216,NULL,"Superficie (ha) des ressources g??r??es en vue de l???exploitation durable",""),
        (222,"Nature du produit (PFNL ou PFL)",0,1,3,0,NULL,216,NULL,"Nature du produit (PFNL ou PFL)",""),
        (223,"Designation du produit brut (Anacarde (kg), Baie rose (kg), Bois COS (m??), Bois de chauffe (st??re), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",0,1,3,0,NULL,216,NULL,"Designation du produit brut (Anacarde (kg), Baie rose (kg), Bois COS (m??), Bois de chauffe (st??re), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",""),
        (224,"Quantit?? produit brut",0,1,3,0,NULL,216,NULL,"Quantit?? produit brut",""),
        (225,"Quantit?? produit brut vendu",0,1,3,0,NULL,216,NULL,"Quantit?? produit brut vendu",""),
        (226,"Prix unitaire de vente de produit brut (Ariary)",0,1,3,0,NULL,216,NULL,"Prix unitaire de vente de produit brut (Ariary)",""),
        (227,"D??signation du produit transform??",0,1,3,0,NULL,216,NULL,"D??signation du produit transform??",""),
        (228,"Unit?? de prosuit transform??",0,1,3,0,NULL,216,NULL,"Unit?? de prosuit transform??",""),
        (229,"Quantit?? produit transform??",0,1,3,0,NULL,216,NULL,"Quantit?? produit transform??",""),
        (230,"Quantit?? produit transform?? vendu",0,1,3,0,NULL,216,NULL,"Quantit?? produit transform?? vendu",""),
        (231,"Prix unitaire de vente de produit transform?? (Ariary)",0,1,3,0,NULL,216,NULL,"Prix unitaire de vente de produit transform?? (Ariary)",""),
        (232,"Destination des produits (vente locale, exportation, ???)",0,1,3,0,NULL,216,NULL,"Destination des produits (vente locale, exportation, ???)",""),
        (233,"Nombre de m??nages b??n??ficiaires??de la cha??ne de valeur",0,1,3,0,NULL,216,NULL,"Nombre de m??nages b??n??ficiaires??de la cha??ne de valeur",""),
        (234,"Nombre de femmes b??n??ficiaires de la cha??ne de valeur",0,1,3,0,NULL,216,NULL,"Nombre de femmes b??n??ficiaires de la cha??ne de valeur",""),
        (235,"Nombre de jeune b??n??ficiaires de la cha??ne de valeur (15 ?? 24 ans)",0,1,3,0,NULL,216,NULL,"Nombre de jeune b??n??ficiaires de la cha??ne de valeur (15 ?? 24 ans)",""),
        (236,"Nombre total de personnes impliqu??es??directement dans la cha??ne de valeur",0,1,3,0,NULL,216,NULL,"Nombre total de personnes impliqu??es??directement dans la cha??ne de valeur",""),
        (237,"Existence de suivis ??cologiques (oui/non)",0,1,3,0,NULL,216,NULL,"Existence de suivis ??cologiques (oui/non)",""),
        (238,"Cha??ne de valeur appuy??e financi??rement et/ou techniquement (oui/non)",0,1,3,0,NULL,216,NULL,"Cha??ne de valeur appuy??e financi??rement et/ou techniquement (oui/non)",""),
        (239,"Organisme d'appui de la cha??ne de valeur",0,1,3,1,NULL,216,NULL,"Organisme d'appui de la cha??ne de valeur",""),
        (240,"Projet d'appui de la cha??ne de valeur",0,1,3,0,NULL,216,NULL,"Projet d'appui de la cha??ne de valeur",""),
        (241,"Identifiant du projet d'appui de la cha??ne de valeur",0,1,3,0,NULL,216,NULL,"Identifiant du projet d'appui de la cha??ne de valeur",""),
        (242,"Nombre d'emplois verts d??cents cr????s",0,1,3,1,NULL,216,NULL,"Nombre d'emplois verts d??cents cr????s",""),
        (243,"Nombre total d'empoy??s recrut??s par les emplois verts cr????s",0,1,3,0,NULL,216,NULL,"Nombre total d'empoy??s recrut??s par les emplois verts cr????s",""),
        (244,"Nombre de femme employ??es dans les emplois verts",0,1,3,0,NULL,216,NULL,"Nombre de femme employ??es dans les emplois verts",""),
        (245,"Types d'alternatives d??velopp??es (charbon vert, r??sidus de culture, gaz butane, ethanol, ??nergie solaire, biogaz, sac ??cologique, autres)",0,1,3,1,NULL,216,NULL,"Types d'alternatives d??velopp??es (charbon vert, r??sidus de culture, gaz butane, ethanol, ??nergie solaire, biogaz, sac ??cologique, autres)",""),
        (246,"Quantit?? produite par type d'alternative (liste)",0,1,3,0,NULL,216,NULL,"Quantit?? produite par type d'alternative (liste)",""),
        (247,"Alternative promue (oui/non)",0,1,3,1,35,216,NULL,"Alternative promue (oui/non)",""),
        (248,"Nombre total de m??nage adoptant les alternatives",0,1,3,0,NULL,216,NULL,"Nombre total de m??nage adoptant les alternatives",""),
        (249,"Prix unitaire des alternatives (Ariary)",0,1,3,0,NULL,216,NULL,"Prix unitaire des alternatives (Ariary)",""),
        (250,"Observations ??conomie verte",0,1,3,0,NULL,216,NULL,"Observations ??conomie verte",""),
        (810,"Fichiers (??conomie verte) (.zip ?? importer)",0,1,3,0,NULL,216,NULL,"Fichiers (??conomie verte) (.zip ?? importer)",""),
                                                              
                                                              
        (251,"Source de donn??es environnement",1,1,3,1,NULL,NULL,NULL,"Source de donn??es environnement",""),
        (252,"Nom de l'infrastructure de gestion de pollution mis en place",0,1,3,1,NULL,251,NULL,"Nom de l'infrastructure de gestion de pollution mis en place",""),
        (253,"Objet de l'infrastructure de gestion de pollution mis en place (centre de tri, centre de traitement des d??chets)",0,1,3,1,NULL,251,NULL,"Objet de l'infrastructure de gestion de pollution mis en place (centre de tri, centre de traitement des d??chets)",""),
        (254,"Type de d??chets trait??s (solides, m??dicaux, ??l??ctroniques, liquides???)",0,1,3,1,NULL,251,NULL,"Type de d??chets trait??s (solides, m??dicaux, ??l??ctroniques, liquides???)",""),
        (255,"Commune d'implantantion de l'infrastructure de gestion de pollution",0,1,3,1,NULL,251,NULL,"Commune d'implantantion de l'infrastructure de gestion de pollution",""),
        (256,"Date de cr??ation de l'infrastructure",0,1,3,0,NULL,251,NULL,"Date de cr??ation de l'infrastructure",""),
        (257,"Infrastucture de gestion de pollution op??rationnelle (oui/non)",0,1,3,0,NULL,251,NULL,"Infrastucture de gestion de pollution op??rationnelle (oui/non)",""),
        (258,"D??chets valoris??s par an (kg)",0,1,3,0,NULL,251,NULL,"D??chets valoris??s par an (kg)",""),
        (259,"Disponibilit?? de kit d'analyse et de contr??le de pollution (oui/non)",0,1,3,0,NULL,251,NULL,"Disponibilit?? de kit d'analyse et de contr??le de pollution (oui/non)",""),
        (260,"Existence des observatoires de pollution (oui/non)",0,1,3,0,NULL,251,NULL,"Existence des observatoires de pollution (oui/non)",""),
        (261,"Observatoire op??rationnel (oui/non)",0,1,3,0,NULL,251,NULL,"Observatoire op??rationnel (oui/non)",""),
        (262,"Disponibilit?? de d??charges d'ordures (oui/non)",0,1,3,0,NULL,251,NULL,"Disponibilit?? de d??charges d'ordures (oui/non)",""),
        (263,"Emplacement de la d??charge (localit??)",0,1,3,0,NULL,251,NULL,"Emplacement de la d??charge (localit??)",""),
        (264,"Decharge d'ordures op??rationnelle (oui/non)",0,1,3,1,NULL,251,NULL,"Decharge d'ordures op??rationnelle (oui/non)",""),
        (265,"Existence de laboratoires nationaux et de centres de recherches renforc??s techniquement et mat??riellement pour le traitement de d??chets (oui/non)",0,1,3,0,NULL,251,NULL,"Existence de laboratoires nationaux et de centres de recherches renforc??s techniquement et mat??riellement pour le traitement de d??chets (oui/non)",""),
        (266,"si oui, lequel/lesquels?",0,1,3,0,NULL,251,NULL,"si oui, lequel/lesquels?",""),
        (267,"Nom du projet d'investissement souhaitant s'implant??",0,1,3,1,NULL,251,NULL,"Nom du projet d'investissement souhaitant s'implant??",""),
        (268,"Secteur d'activit?? (Agriculture, Industriel, Service)",0,1,3,0,NULL,251,NULL,"Secteur d'activit?? (Agriculture, Industriel, Service)",""),
        (269,"Existence de permis environnementaux d??livr??s (oui/non)",0,1,3,1,36,251,NULL,"Existence de permis environnementaux d??livr??s (oui/non)",""),
        (270,"Projet d'investissement conforme au D??cret MECIE (oui/non)",0,1,3,0,NULL,251,NULL,"Projet d'investissement conforme au D??cret MECIE (oui/non)",""),
        (271,"Date de quittance",0,1,3,0,NULL,251,NULL,"Date de quittance",""),
        (272,"Projet d'investissement ayant un Programme d'Engagement Environnemental (PREE) (oui/non)",0,1,3,1,NULL,251,NULL,"Projet d'investissement ayant un Programme d'Engagement Environnemental (PREE) (oui/non)",""),
        (273,"Existence de suivi environnemental men?? sur la mise en ??uvre de cahiers des charges environnementales (oui/non)",0,1,3,0,NULL,251,NULL,"Existence de suivi environnemental men?? sur la mise en ??uvre de cahiers des charges environnementales (oui/non)",""),
        (274,"Activit??s relatives ?? l'??ducation environnementale r??alis??es (liste)",0,1,3,0,NULL,251,NULL,"Activit??s relatives ?? l'??ducation environnementale r??alis??es (liste)",""),
        (275,"Nombre des agents asserment??s en tant qu'OPJ pour les contr??les et inspections environnementales",0,1,3,0,NULL,251,NULL,"Nombre des agents asserment??s en tant qu'OPJ pour les contr??les et inspections environnementales",""),
        (276,"Identifiant du projet d'appui pour l'environnement",0,1,3,0,NULL,251,NULL,"Identifiant du projet d'appui pour l'environnement",""),
        (277,"Observations environnement",0,1,3,0,NULL,251,NULL,"Observations environnement",""),
        (811,"Fichiers (environnement) (.zip ?? importer)",0,1,3,0,NULL,251,NULL,"Fichiers (environnement) (.zip ?? importer)",""),
                                                              
                                                              
                                                              
        (278,"Source de donn??es feux",1,1,3,1,NULL,NULL,NULL,"Source de donn??es feux",""),
        (279,"Commune de localisation de point de feux et surfaces br??l??es suivant les points GPS des activit??s de patrouilles et de contr??le",0,1,3,1,NULL,278,NULL,"Commune de localisation de point de feux et surfaces br??l??es suivant les points GPS des activit??s de patrouilles et de contr??le",""),
        (280,"Longitude point de feux (degr?? d??cimal) : X",0,1,3,1,NULL,278,NULL,"Longitude point de feux (degr?? d??cimal) : X",""),
        (281,"Latitude point de feux (degr?? d??cimal) : Y",0,1,3,1,NULL,278,NULL,"Latitude point de feux (degr?? d??cimal) : Y",""),
        (282,"Date de cas de feux",0,1,3,0,NULL,278,NULL,"Date de cas de feux",""),
        (283,"Geojson des points de feux",0,1,3,0,NULL,278,NULL,"Geojson des points de feux",""),
        (284,"Superficie des zones brul??es suivant les points GPS des activit??s de patrouilles et de contr??le sur terrain (ha)",0,1,3,1,NULL,278,NULL,"Superficie des zones brul??es suivant les points GPS des activit??s de patrouilles et de contr??le sur terrain (ha)",""),
        (285,"Type : For??t ou hors for??t",0,1,3,1,NULL,278,NULL,"Type : For??t ou hors for??t",""),
        (286,"Geojson des surfaces br??l??es",0,1,3,0,NULL,278,NULL,"Geojson des surfaces br??l??es",""),
        (287,"Date de zones br??l??es",0,1,3,0,NULL,278,NULL,"Date de zones br??l??es",""),
        (288,"Existence de dispositifs de d??tection et suivi des feux (oui/non)",0,1,3,1,42,278,NULL,"Existence de dispositifs de d??tection et suivi des feux (oui/non)",""),
        (289,"Emplacement de dispositifs de d??tection et suivi des feux (localit??)",0,1,3,0,NULL,278,NULL,"Emplacement de dispositifs de d??tection et suivi des feux (localit??)",""),
        (290,"Type de dispositif de d??tection et suivi des feux (cr????/renforc??)",0,1,3,0,NULL,278,NULL,"Type de dispositif de d??tection et suivi des feux (cr????/renforc??)",""),
        (291,"Dispositif de d??tection et suivi des feux op??rationnel (oui/non)",0,1,3,1,NULL,278,NULL,"Dispositif de d??tection et suivi des feux op??rationnel (oui/non)",""),
        (292,"Existence de comit??s/structures de lutte contre les feux (oui/non)",0,1,3,1,40,278,NULL,"Existence de comit??s/structures de lutte contre les feux (oui/non)",""),
        (293,"Emplacement de comit??s/structures de lutte contre les feux (localit??)",0,1,3,0,NULL,278,NULL,"Emplacement de comit??s/structures de lutte contre les feux (localit??)",""),
        (294,"Type de comit??/structure de lutte contre les feux (cr????/renforc??)",0,1,3,1,NULL,278,NULL,"Type de comit??/structure de lutte contre les feux (cr????/renforc??)",""),
        (295,"Comit??/structure de lutte contre les feux form?? (oui/non)",0,1,3,1,NULL,278,NULL,"Comit??/structure de lutte contre les feux form?? (oui/non)",""),
        (296,"Comit??/structure de lutte contre les feux op??rationnel (oui/non)",0,1,3,1,41,278,NULL,"Comit??/structure de lutte contre les feux op??rationnel (oui/non)",""),
        (297,"Emplacement du pare-feu (localit??)",0,1,3,0,NULL,278,NULL,"Emplacement du pare-feu (localit??)",""),
        (298,"Longitude pare-feu (degr?? d??cimal) : X",0,1,3,0,NULL,278,NULL,"Longitude pare-feu (degr?? d??cimal) : X",""),
        (299,"Latitude pare-feu (degr?? d??cimal) : Y",0,1,3,0,NULL,278,NULL,"Latitude pare-feu (degr?? d??cimal) : Y",""),
        (300,"Longueur de pare-feu ??tabli (km)",0,1,3,1,NULL,278,NULL,"Longueur de pare-feu ??tabli (km)",""),
        (301,"Geojson des pare-feux",0,1,3,0,NULL,278,NULL,"Geojson des pare-feux",""),
        (302,"Nature du pare-feu (nouvellement mis en place, entretenu)",0,1,3,0,NULL,278,NULL,"Nature du pare-feu (nouvellement mis en place, entretenu)",""),
        (303,"R??f??rence PV d'infraction (constatation de feux)",0,1,3,1,NULL,278,NULL,"R??f??rence PV d'infraction (constatation de feux)",""),
        (304,"Identifiant du projet d'appui de lutte contre les feux",0,1,3,0,NULL,278,NULL,"Identifiant du projet d'appui de lutte contre les feux",""),
        (305,"Observations feux",0,1,3,0,NULL,278,NULL,"Observations feux",""),
        (812,"Fichiers (feux) (.zip ?? importer)",0,1,3,0,NULL,278,NULL,"Fichiers (feux) (.zip ?? importer)",""),
                                                              
        (306,"Source de donn??es recette",1,1,3,1,46,NULL,NULL,"Source de donn??es recette",""),
        (307,"Origine de recette (Nature de cession/Autorisation de chasse/Caution carnet (facture)/Article et produits en bois, r??sine de pin, produits artisanaux/Raphia nature brut/Autorisation collecte/D??tention animaux/Export collecte CITES/Export collecte non CITES/Export huile essentielle, produit en plante aromatique/Collecte peaux crocodiles/Mobilier divers en bois/Transaction avant jugement/Location g??rance)",0,1,3,1,NULL,306,NULL,"Origine de recette (Nature de cession/Autorisation de chasse/Caution carnet (facture)/Article et produits en bois, r??sine de pin, produits artisanaux/Raphia nature brut/Autorisation collecte/D??tention animaux/Export collecte CITES/Export collecte non CITES/Export huile essentielle, produit en plante aromatique/Collecte peaux crocodiles/Mobilier divers en bois/Transaction avant jugement/Location g??rance)",""),
        (308,"Esp??ce concern??e",0,1,3,1,NULL,306,NULL,"Esp??ce concern??e",""),
        (309,"CITES (oui/non/autre)",0,1,3,1,NULL,306,NULL,"CITES (oui/non/autre)",""),
        (310,"Recette per??ue (Ariary)",0,1,3,1,NULL,306,NULL,"Recette per??ue (Ariary)",""),
        (311,"Fichiers correspondant aux recettes (.zip ?? importer)",0,1,3,0,NULL,306,NULL,"Fichiers correspondant aux recettes (.zip ?? importer)",""),
        (312,"Observations recette",0,1,3,0,NULL,306,NULL,"Observations recette",""),
        
                                                              
                                                              
                                                              
                                                              
                                                              
                                                              
        (313,"Source de donn??es mobilisation de fonds",1,1,3,1,46,NULL,NULL,"Source de donn??es mobilisation de fonds",""),
        (314,"Source de fonds mobilis??s (interne/externe)",0,1,3,1,NULL,313,NULL,"Source de fonds mobilis??s (interne/externe)",""),
        (315,"Type de fonds mobilis??s (RPI, Priv??, Projet, autre)",0,1,3,1,NULL,313,NULL,"Type de fonds mobilis??s (RPI, Priv??, Projet, autre)",""),
        (316,"Montant du fond public (Ariary)",0,1,3,1,NULL,313,NULL,"Montant du fond public (Ariary)",""),
        (317,"Montant engag?? du fond public (Ariary)",0,1,3,1,NULL,313,NULL,"Montant engag?? du fond public (Ariary)",""),
        (318,"Montant d??caiss?? du fond public (Ariary)",0,1,3,1,NULL,313,NULL,"Montant d??caiss?? du fond public (Ariary)",""),
        (319,"Taux d'egagement moyen du fond public (%)",0,1,3,0,NULL,313,NULL,"Taux d'egagement moyen du fond public (%)",""),
        (320,"Montant du financement ext??rieur ou priv?? (Ariary)",0,1,3,1,NULL,313,NULL,"Montant du financement ext??rieur ou priv?? (Ariary)",""),
        (321,"Montant engag?? du financement ext??rieur ou priv?? (Ariary)",0,1,3,1,NULL,313,NULL,"Montant engag?? du financement ext??rieur ou priv?? (Ariary)",""),
        (322,"Montant d??caiss?? du financement ext??rieur ou priv?? (Ariary)",0,1,3,1,NULL,313,NULL,"Montant d??caiss?? du financement ext??rieur ou priv?? (Ariary)",""),
        (323,"Taux d'egagement moyen du financement ext??rieur ou priv?? (%)",0,1,3,0,NULL,313,NULL,"Taux d'egagement moyen du financement ext??rieur ou priv?? (%)",""),
        (324,"Source du financement externe (mentionner : bailleur/projet)",0,1,3,1,NULL,313,NULL,"Source du financement externe (mentionner : bailleur/projet)",""),
        (325,"Identifiant du projet de financement",0,1,3,0,NULL,313,NULL,"Identifiant du projet de financement",""),
        (326,"Montant allou?? pour action environnementale dans les programmes d'investissement directions techniques MEDD et autres (Ariary)",0,1,3,1,NULL,313,NULL,"Montant allou?? pour action environnementale dans les programmes d'investissement directions techniques MEDD et autres (Ariary)",""),
        (327,"Montant allou?? pour action environnementale dans les programmes d'investissement r??gionaux (Ariary)",0,1,3,1,NULL,313,NULL,"Montant allou?? pour action environnementale dans les programmes d'investissement r??gionaux (Ariary)",""),
        (328,"Montant allou?? pour action environnementale dans les programmes d'investissement communaux (Ariary)",0,1,3,1,NULL,313,NULL,"Montant allou?? pour action environnementale dans les programmes d'investissement communaux (Ariary)",""),
        (329,"Montant allou?? pour action environnementale dans les programmes d'investissement des Fokontany (Ariary)",0,1,3,1,NULL,313,NULL,"Montant allou?? pour action environnementale dans les programmes d'investissement des Fokontany (Ariary)",""),
        (330,"Montant des dons (Ariary)",0,1,3,1,NULL,313,NULL,"Montant des dons (Ariary)",""),
        (331,"Montant de pr??ts (Ariary)",0,1,3,1,NULL,313,NULL,"Montant de pr??ts (Ariary)",""),
        (332,"Observations mobilisation de fonds",0,1,3,0,NULL,313,NULL,"Observations mobilisation de fonds",""),
        (813,"Fichiers (mobilisation de fond) (.zip ?? importer)",0,1,3,0,NULL,313,NULL,"Fichiers (mobilisation de fond) (.zip ?? importer)",""),
                                                              
                                                              
                                                              
                                                              
                                                              
        (333,"Source de donn??es IEC",1,1,3,1,48,NULL,NULL,"Source de donn??es IEC",""),
        (334,"Th??matique de l'IEC",0,1,3,1,NULL,333,NULL,"Th??matique de l'IEC",""),
        (335,"Intitul?? de l'IEC",0,1,3,1,NULL,333,NULL,"Intitul?? de l'IEC",""),
        (336,"Nature de l'IEC (formation professionnelle, formation acad??mique, sensibilisation)",0,1,3,1,NULL,333,NULL,"Nature de l'IEC (formation professionnelle, formation acad??mique, sensibilisation)",""),
        (337,"D??signation des supports produits",0,1,3,0,NULL,333,NULL,"D??signation des supports produits",""),
        (338,"Date de d??but et de fin de l'IEC",0,1,3,0,NULL,333,NULL,"Date de d??but et de fin de l'IEC",""),
        (339,"Initiateur de l'IEC",0,1,3,0,NULL,333,NULL,"Initiateur de l'IEC",""),
        (340,"Projet d'appui de l'IEC",0,1,3,0,NULL,333,NULL,"Projet d'appui de l'IEC",""),
        (341,"Identifiant du projet d'appui pour l'IEC",0,1,3,0,NULL,333,NULL,"Identifiant du projet d'appui pour l'IEC",""),
        (342,"Nombre de s??ance",0,1,3,1,NULL,333,NULL,"Nombre de s??ance",""),
        (343,"Nombre total de participants",0,1,3,1,NULL,333,NULL,"Nombre total de participants",""),
        (344,"Nombre de participants - de 14 ans",0,1,3,1,NULL,333,NULL,"Nombre de participants - de 14 ans",""),
        (345,"Nombre de participants de 15 ?? 24 ans",0,1,3,1,NULL,333,NULL,"Nombre de participants de 15 ?? 24 ans",""),
        (346,"Nombre de participants 25 ans et +",0,1,3,1,NULL,333,NULL,"Nombre de participants 25 ans et +",""),
        (347,"Nombre de repr??sentant d'une OSC (Organisation de la Soci??t?? Civile) ayant particip??",0,1,3,1,NULL,333,NULL,"Nombre de repr??sentant d'une OSC (Organisation de la Soci??t?? Civile) ayant particip??",""),
        (348,"Nombre de repr??sentant de structures locales ayant particip??",0,1,3,1,NULL,333,NULL,"Nombre de repr??sentant de structures locales ayant particip??",""),
        (349,"Nombre d'agents de l'administration ayant particip??",0,1,3,1,NULL,333,NULL,"Nombre d'agents de l'administration ayant particip??",""),
        (350,"Cible (??tudiant, population locale, VOI, ???)",0,1,3,0,NULL,333,NULL,"Cible (??tudiant, population locale, VOI, ???)",""),
        (351,"Niveau d'intervention (District, Commune, Fokontany)",0,1,3,0,NULL,333,NULL,"Niveau d'intervention (District, Commune, Fokontany)",""),
        (352,"Nom de la Commune b??n??ficiant de l'IEC",0,1,3,1,NULL,333,NULL,"Nom de la Commune b??n??ficiant de l'IEC",""),
        (353,"Nom de la localit?? b??n??ficiant de l'IEC",0,1,3,0,NULL,333,NULL,"Nom de la localit?? b??n??ficiant de l'IEC",""),
        (354,"IEC m??dia classique (radio, t??l??vision, journaux)",0,1,3,0,NULL,333,NULL,"IEC m??dia classique (radio, t??l??vision, journaux)",""),
        (355,"IEC nouveau m??dia (r??seaux sociaux, ?? pr??ciser)",0,1,3,0,NULL,333,NULL,"IEC nouveau m??dia (r??seaux sociaux, ?? pr??ciser)",""),
        (356,"Co??t de r??alisation de l'IEC (Ariary)",0,1,3,0,NULL,333,NULL,"Co??t de r??alisation de l'IEC (Ariary)",""),
        (357,"Fichiers (IEC) (.zip ?? ilmporter)",0,1,3,0,NULL,333,NULL,"Fichiers (IEC) (.zip ?? ilmporter)",""),
        (358,"Observations IEC",0,1,3,0,NULL,333,NULL,"Observations IEC",""),
                                                              
        (359,"Source de donn??es infrastructure",1,1,3,1,NULL,NULL,NULL,"Source de donn??es infrastructure",""),
        (360,"Type d'infrastructure (b??timent, route, barrage, ??cole, autre)",0,1,3,1,NULL,359,NULL,"Type d'infrastructure (b??timent, route, barrage, ??cole, autre)",""),
        (361,"Destination (administrative, logement, garage, autre)",0,1,3,1,NULL,359,NULL,"Destination (administrative, logement, garage, autre)",""),
        (362,"Commune d'implantation de l'infrastructure",0,1,3,1,NULL,359,NULL,"Commune d'implantation de l'infrastructure",""),
        (363,"Emplacement de l'infrastructure (localit??)",0,1,3,0,NULL,359,NULL,"Emplacement de l'infrastructure (localit??)",""),
        (364,"Secteur impliqu?? (??ducation, sant??, travaux publics, ...)",0,1,3,1,NULL,359,NULL,"Secteur impliqu?? (??ducation, sant??, travaux publics, ...)",""),
        (365,"Nouvellement construite ou r??habilit??e ou existante",0,1,3,1,48,359,NULL,"Nouvellement construite ou r??habilit??e ou existante",""),
        (366,"Date d'op??rationnalisation/utilisation/r??habilitation de l'infrastructure",0,1,3,1,NULL,359,NULL,"Date d'op??rationnalisation/utilisation/r??habilitation de l'infrastructure",""),
        (367,"Infrastructure actuellement op??rationnelle (oui/non)",0,1,3,1,NULL,359,NULL,"Infrastructure actuellement op??rationnelle (oui/non)",""),
        (368,"Etat actuel de l'infrastructure (mauvais, moyen, bon)",0,1,3,1,NULL,359,NULL,"Etat actuel de l'infrastructure (mauvais, moyen, bon)",""),
        (369,"Infrastructure ?? condamner ou ?? r??parer",0,1,3,0,NULL,359,NULL,"Infrastructure ?? condamner ou ?? r??parer",""),
        (370,"Niveau de localisation infrastructures op??rationnelles (Direction centrale, Direction r??gionale, cantonnement, triage)",0,1,3,1,NULL,359,NULL,"Niveau de localisation infrastructures op??rationnelles (Direction centrale, Direction r??gionale, cantonnement, triage)",""),
        (371,"STD ou CTD",0,1,3,1,NULL,359,NULL,"STD ou CTD",""),
        (372,"Personnes/services utilisant le(s) infrastructure(s) (STD, pr??ciser si CTD)",0,1,3,1,NULL,359,NULL,"Personnes/services utilisant le(s) infrastructure(s) (STD, pr??ciser si CTD)",""),
        (373,"Budget pour la construction/r??habilitation de l'infrastructure (Ariary)",0,1,3,0,NULL,359,NULL,"Budget pour la construction/r??habilitation de l'infrastructure (Ariary)",""),
        (374,"Budget annuel pour l'entretien de l'infrastructure (Ariary)",0,1,3,0,NULL,359,NULL,"Budget annuel pour l'entretien de l'infrastructure (Ariary)",""),
        (375,"Source de financement de l'infrastructure (interne ou externe)",0,1,3,1,NULL,359,NULL,"Source de financement de l'infrastructure (interne ou externe)",""),
        (376,"Projet d'appui de l'infrastructure (si externe)",0,1,3,0,NULL,359,NULL,"Projet d'appui de l'infrastructure (si externe)",""),
        (377,"Identifiant du projet d'appui pour l'infrastructure",0,1,3,0,NULL,359,NULL,"Identifiant du projet d'appui pour l'infrastructure",""),
        (378,"Fichiers/images (infrastructure) (.zip ?? importer)",0,1,3,0,NULL,359,NULL,"Fichiers/images (infrastructure) (.zip ?? importer)",""),
        (379,"Observations infrastructure",0,1,3,0,NULL,359,NULL,"Observations infrastructure",""),
                                                              
                                                              
        (380,"Source de donn??es mat??riel de transport",1,1,3,1,NULL,NULL,NULL,"Source de donn??es mat??riel de transport",""),
        (381,"D??signation du mat??riel de transport",0,1,3,1,NULL,380,NULL,"D??signation du mat??riel de transport",""),
        (382,"Marque du mat??riel de transport",0,1,3,0,NULL,380,NULL,"Marque du mat??riel de transport",""),
        (383,"Commune d'emplacement du mat??riel de transport",0,1,3,1,NULL,380,NULL,"Commune d'emplacement du mat??riel de transport",""),
        (384,"Date d'acquisition/utilisation du mat??riel de transport",0,1,3,1,NULL,380,NULL,"Date d'acquisition/utilisation du mat??riel de transport",""),
        (385,"Mat??riel de transport actuellement op??rationnel (oui/non)",0,1,3,1,54,380,NULL,"Mat??riel de transport actuellement op??rationnel (oui/non)",""),
        (386,"Etat actuel du mat??riel de transport (mauvais, moyen, bon)",0,1,3,1,NULL,380,NULL,"Etat actuel du mat??riel de transport (mauvais, moyen, bon)",""),
        (387,"Mat??riel de transport ?? condamner ou ?? r??parer",0,1,3,0,NULL,380,NULL,"Mat??riel de transport ?? condamner ou ?? r??parer",""),
        (388,"Niveau de localisation de mat??riel de transport en ??tat de marche (Direction centrale, Direction r??gionale, cantonnement, triage)",0,1,3,1,NULL,380,NULL,"Niveau de localisation de mat??riel de transport en ??tat de marche (Direction centrale, Direction r??gionale, cantonnement, triage)",""),
        (389,"Personnes/services utilisant le(s) mat??riel(s) de transport(s)",0,1,3,1,NULL,380,NULL,"Personnes/services utilisant le(s) mat??riel(s) de transport(s)",""),
        (390,"Budget pour l'acquisition du mat??riel de transport (Ariary)",0,1,3,0,NULL,380,NULL,"Budget pour l'acquisition du mat??riel de transport (Ariary)",""),
        (391,"Budget annuel pour l'entretien du mat??riel de transport (Ariary)",0,1,3,0,NULL,380,NULL,"Budget annuel pour l'entretien du mat??riel de transport (Ariary)",""),
        (392,"Source de financement du mat??riel de transport (interne ou externe)",0,1,3,1,NULL,380,NULL,"Source de financement du mat??riel de transport (interne ou externe)",""),
        (393,"Projet d'appui du mat??riel de transport (si externe)",0,1,3,0,NULL,380,NULL,"Projet d'appui du mat??riel de transport (si externe)",""),
        (394,"Identifiant du projet d'appui pour le mat??riel de transport",0,1,3,0,NULL,380,NULL,"Identifiant du projet d'appui pour le mat??riel de transport",""),
        (395,"Fichiers/images (mat??riel de transport) (.zip ?? importer)",0,1,3,0,NULL,380,NULL,"Fichiers/images (mat??riel de transport) (.zip ?? importer)",""),
        (396,"Observations mat??riel de transport",0,1,3,0,NULL,380,NULL,"Observations mat??riel de transport",""),
                                                              
                                                              
        (397,"Source de donn??es mat??riel informatique",1,1,3,1,NULL,NULL,NULL,"Source de donn??es mat??riel informatique",""),
        (398,"D??signation du mat??riel informatique",0,1,3,1,NULL,397,NULL,"D??signation du mat??riel informatique",""),
        (399,"Marque du mat??riel informatique",0,1,3,0,NULL,397,NULL,"Marque du mat??riel informatique",""),
        (400,"Commune d'emplacement du mat??riel informatique",0,1,3,1,NULL,397,NULL,"Commune d'emplacement du mat??riel informatique",""),
        (401,"Date d'acquiqition/utilisation du mat??riel informatique",0,1,3,1,NULL,397,NULL,"Date d'acquiqition/utilisation du mat??riel informatique",""),
        (402,"Mat??riel informatique actuellement op??rationnel (oui/non)",0,1,3,1,55,397,NULL,"Mat??riel informatique actuellement op??rationnel (oui/non)",""),
        (403,"Etat actuel du mat??riel informatique (mauvais, moyen, bon)",0,1,3,1,NULL,397,NULL,"Etat actuel du mat??riel informatique (mauvais, moyen, bon)",""),
        (404,"Mat??riel informatique ?? condamner ou ?? r??parer",0,1,3,0,NULL,397,NULL,"Mat??riel informatique ?? condamner ou ?? r??parer",""),
        (405,"Niveau de localisation de mat??riels informatiques en ??tat de marche (Direction centrale, Direction r??gionale, cantonnement, triage)",0,1,3,1,NULL,397,NULL,"Niveau de localisation de mat??riels informatiques en ??tat de marche (Direction centrale, Direction r??gionale, cantonnement, triage)",""),
        (406,"Personnes/services utilisant le(s) mat??riel(s) informatique(s)",0,1,3,1,NULL,397,NULL,"Personnes/services utilisant le(s) mat??riel(s) informatique(s)",""),
        (407,"Budget pour l'acquisition du mat??riel informatique (Ariary)",0,1,3,0,NULL,397,NULL,"Budget pour l'acquisition du mat??riel informatique (Ariary)",""),
        (408,"Budget annuel pour l'entretien du mat??riel informatique (Ariary)",0,1,3,0,NULL,397,NULL,"Budget annuel pour l'entretien du mat??riel informatique (Ariary)",""),
        (409,"Source de financement du mat??riel informatique (interne ou externe)",0,1,3,1,NULL,397,NULL,"Source de financement du mat??riel informatique (interne ou externe)",""),
        (410,"Projet d'appui du mat??riel informatique (si externe)",0,1,3,0,NULL,397,NULL,"Projet d'appui du mat??riel informatique (si externe)",""),
        (411,"Identifiant du projet d'appui pour le mat??riel informatique",0,1,3,0,NULL,397,NULL,"Identifiant du projet d'appui pour le mat??riel informatique",""),
        (412,"Images mat??riel informatique",0,1,3,0,NULL,397,NULL,"Images mat??riel informatique",""),
        (413,"Observations mat??riel informatique",0,1,3,0,NULL,397,NULL,"Observations mat??riel informatique",""),
        (814,"Fichiers (mat??riel informatique) (.zip ?? importer)",0,1,3,0,NULL,397,NULL,"Fichiers (mat??riel informatique) (.zip ?? importer)",""),
                                                              
        (414,"Source de donn??es mat??riel technique",1,1,3,1,NULL,NULL,NULL,"Source de donn??es mat??riel technique",""),
        (415,"D??signation du mat??riel technique",0,1,3,1,NULL,414,NULL,"D??signation du mat??riel technique",""),
        (416,"Marque du mat??riel technique",0,1,3,0,NULL,414,NULL,"Marque du mat??riel technique",""),
        (417,"Commune d'emplacement du mat??riel technique",0,1,3,1,NULL,414,NULL,"Commune d'emplacement du mat??riel technique",""),
        (418,"Date d'acquiqition/utilisation du mat??riel technique",0,1,3,1,NULL,414,NULL,"Date d'acquiqition/utilisation du mat??riel technique",""),
        (419,"Mat??riel technique actuellement op??rationnel (oui/non)",0,1,3,1,55,414,NULL,"Mat??riel technique actuellement op??rationnel (oui/non)",""),
        (420,"Etat actuel du mat??riel technique (mauvais, moyen, bon)",0,1,3,1,NULL,414,NULL,"Etat actuel du mat??riel technique (mauvais, moyen, bon)",""),
        (421,"Mat??riel technique ?? condamner ou ?? r??parer",0,1,3,0,NULL,414,NULL,"Mat??riel technique ?? condamner ou ?? r??parer",""),
        (422,"Niveau de localisation de mat??riels techniques en ??tat de marche (Direction centrale, Direction r??gionale, cantonnement, triage)",0,1,3,1,NULL,414,NULL,"Niveau de localisation de mat??riels techniques en ??tat de marche (Direction centrale, Direction r??gionale, cantonnement, triage)",""),
        (423,"Personnes/services utilisant le(s) mat??riel(s) technique(s)",0,1,3,1,NULL,414,NULL,"Personnes/services utilisant le(s) mat??riel(s) technique(s)",""),
        (424,"Budget pour l'acquisition du mat??riel technique (Ariary)",0,1,3,0,NULL,414,NULL,"Budget pour l'acquisition du mat??riel technique (Ariary)",""),
        (425,"Budget annuel pour l'entretien du mat??riel technique (Ariary)",0,1,3,0,NULL,414,NULL,"Budget annuel pour l'entretien du mat??riel technique (Ariary)",""),
        (426,"Source de financement du mat??riel technique (interne ou externe)",0,1,3,1,NULL,414,NULL,"Source de financement du mat??riel technique (interne ou externe)",""),
        (427,"Projet d'appui du mat??riel technique (si externe)",0,1,3,0,NULL,414,NULL,"Projet d'appui du mat??riel technique (si externe)",""),
        (428,"Identifiant du projet d'appui pour le mat??riel technique",0,1,3,0,NULL,414,NULL,"Identifiant du projet d'appui pour le mat??riel technique",""),
        (429,"Images mat??riel technique",0,1,3,0,NULL,414,NULL,"Images mat??riel technique",""),
        (430,"Observations mat??riel technique",0,1,3,0,NULL,414,NULL,"Observations mat??riel technique",""),
        (815,"Fichiers (mat??riel technique) (.zip ?? importer)",0,1,3,0,NULL,414,NULL,"Fichiers (mat??riel technique) (.zip ?? importer)",""),
                                                              
                                                              
        (431,"Source de donn??es mat??riel mobilier",1,1,3,1,NULL,NULL,NULL,"Source de donn??es mat??riel mobilier",""),
        (432,"D??signation du mat??riel mobilier",0,1,3,1,NULL,431,NULL,"D??signation du mat??riel mobilier",""),
        (433,"Date d'acquiqition/utilisation du mat??riel mobilier",0,1,3,1,NULL,431,NULL,"Date d'acquiqition/utilisation du mat??riel mobilier",""),
        (434,"Commune d'emplacement du mat??riel mobilier",0,1,3,1,NULL,431,NULL,"Commune d'emplacement du mat??riel mobilier",""),
        (435,"Mat??riel mobilier actuellement utilisable (oui/non)",0,1,3,1,56,431,NULL,"Mat??riel mobilier actuellement utilisable (oui/non)",""),
        (436,"Etat actuel du mat??riel mobilier (mauvais, moyen, bon)",0,1,3,1,NULL,431,NULL,"Etat actuel du mat??riel mobilier (mauvais, moyen, bon)",""),
        (437,"Mat??riel mobilier ?? condamner ou ?? r??parer",0,1,3,0,NULL,431,NULL,"Mat??riel mobilier ?? condamner ou ?? r??parer",""),
        (438,"Niveau de localisation de mat??riels mobiliers utilisables (Direction centrale, Direction r??gionale, cantonnement, triage)",0,1,3,1,NULL,431,NULL,"Niveau de localisation de mat??riels mobiliers utilisables (Direction centrale, Direction r??gionale, cantonnement, triage)",""),
        (439,"Personnes/services utilisant le(s) mat??riel(s) mobilier(s)",0,1,3,1,NULL,431,NULL,"Personnes/services utilisant le(s) mat??riel(s) mobilier(s)",""),
        (440,"Budget pour l'acquisition du mat??riel mobilier (Ariary)",0,1,3,0,NULL,431,NULL,"Budget pour l'acquisition du mat??riel mobilier (Ariary)",""),
        (441,"Budget annuel pour l'entretien du mat??riel mobilier (Ariary)",0,1,3,0,NULL,431,NULL,"Budget annuel pour l'entretien du mat??riel mobilier (Ariary)",""),
        (442,"Source de financement du mat??riel mobilier (interne ou externe)",0,1,3,1,NULL,431,NULL,"Source de financement du mat??riel mobilier (interne ou externe)",""),
        (443,"Projet d'appui du mat??riel mobilier (si externe)",0,1,3,0,NULL,431,NULL,"Projet d'appui du mat??riel mobilier (si externe)",""),
        (444,"Identifiant du projet d'appui pour le mat??riel mobilier",0,1,3,0,NULL,431,NULL,"Identifiant du projet d'appui pour le mat??riel mobilier",""),
        (445,"Images mat??riel mobilier",0,1,3,0,NULL,431,NULL,"Images mat??riel mobilier",""),
        (446,"Observations mat??riel mobilier",0,1,3,0,NULL,431,NULL,"Observations mat??riel mobilier",""),
        (816,"Fichiers (mat??riel mobilier) (.zip ?? importer)",0,1,3,0,NULL,431,NULL,"Fichiers (mat??riel mobilier) (.zip ?? importer)",""),
                                                              
                                                              
        (447,"Source de donn??es outils",1,1,3,1,57,NULL,NULL,"Source de donn??es outils",""),
        (448,"Th??matique de l'outil",0,1,3,1,NULL,447,NULL,"Th??matique de l'outil",""),
        (449,"Titre de l'outil",0,1,3,1,NULL,447,NULL,"Titre de l'outil",""),
        (450,"Type de l'outil",0,1,3,1,NULL,447,NULL,"Type de l'outil",""),
        (451,"Commune d'application de l'outil (<<Toutes>> si niveau national)",0,1,3,1,NULL,447,NULL,"Commune d'application de l'outil (<<Toutes>> si niveau national)",""),
        (452,"Outil op??rationnel (oui/non)",0,1,3,1,NULL,447,NULL,"Outil op??rationnel (oui/non)",""),
        (453,"Utilisateurs de l'outil",0,1,3,1,NULL,447,NULL,"Utilisateurs de l'outil",""),
        (454,"Nombre d'outil  produit",0,1,3,1,NULL,447,NULL,"Nombre d'outil  produit",""),
        (455,"Nombre d'outil distribu?? et utilis??",0,1,3,1,NULL,447,NULL,"Nombre d'outil distribu?? et utilis??",""),
        (456,"Budget pour la cr??ation de l'outil (Ariary)",0,1,3,0,NULL,447,NULL,"Budget pour la cr??ation de l'outil (Ariary)",""),
        (457,"Source de financement de l'outil (interne ou externe)",0,1,3,1,NULL,447,NULL,"Source de financement de l'outil (interne ou externe)",""),
        (458,"Projet d'appui de l'outil (si externe)",0,1,3,0,NULL,447,NULL,"Projet d'appui de l'outil (si externe)",""),
        (459,"Identifiant du projet d'appui pour l'outil",0,1,3,0,NULL,447,NULL,"Identifiant du projet d'appui pour l'outil",""),
        (460,"Fichiers (outils) (.zip ?? importer)",0,1,3,0,NULL,447,NULL,"Fichiers (outils) (.zip ?? importer)",""),
        (461,"Observations outils",0,1,3,0,NULL,447,NULL,"Observations outils",""),
                                                              
                                                              
                                                              
        (462,"Source de donn??es PPSE",1,1,3,1,NULL,NULL,NULL,"Source de donn??es PPSE",""),
        (463,"Intitul?? du projet",0,1,3,1,NULL,462,NULL,"Intitul?? du projet",""),
        (464,"Commune d'intervention du projet (<<Toutes>> si niveau national)",0,1,3,1,NULL,462,NULL,"Commune d'intervention du projet (<<Toutes>> si niveau national)",""),
        (465,"Date de commencement du projet",0,1,3,1,NULL,462,NULL,"Date de commencement du projet",""),
        (466,"Date de cl??ture du projet",0,1,3,0,NULL,462,NULL,"Date de cl??ture du projet",""),
        (467,"Projet ayant ??t?? l'objet de planifiaction (oui/non)",0,1,3,1,63,462,NULL,"Projet ayant ??t?? l'objet de planifiaction (oui/non)",""),
        (468,"Projet ayant ??t?? l'objet de suivi (oui/non)",0,1,3,1,64,462,NULL,"Projet ayant ??t?? l'objet de suivi (oui/non)",""),
        (469,"Projet ayant ??t?? l'objet d'??valuation (oui/non)",0,1,3,1,65,462,NULL,"Projet ayant ??t?? l'objet d'??valuation (oui/non)",""),
        (470,"Identifiant du projet",0,1,3,0,NULL,462,NULL,"Identifiant du projet",""),
        (471,"Source de financement du projet",0,1,3,1,NULL,462,NULL,"Source de financement du projet",""),
        (472,"Budget attribu?? aux activit??s de planification (Ariary)",0,1,3,1,NULL,462,NULL,"Budget attribu?? aux activit??s de planification (Ariary)",""),
        (473,"Budget attribu?? aux activit??s de suivi (Ariary)",0,1,3,1,NULL,462,NULL,"Budget attribu?? aux activit??s de suivi (Ariary)",""),
        (474,"Budget attribu?? aux activit??s d'??valuation (Ariary)",0,1,3,1,NULL,462,NULL,"Budget attribu?? aux activit??s d'??valuation (Ariary)",""),
        (475,"Nombre de programmation effectu??e",0,1,3,1,NULL,462,NULL,"Nombre de programmation effectu??e",""),
        (476,"Existence de base de donn??es (oui/non)",0,1,3,1,67,462,NULL,"Existence de base de donn??es (oui/non)",""),
        (477,"Si oui, existence de mise ?? jour (oui/non)",0,1,3,0,NULL,462,NULL,"Si oui, existence de mise ?? jour (oui/non)",""),
        (478,"Existence de syst??me d'information op??rationnel (oui/non)",0,1,3,1,68,462,NULL,"Existence de syst??me d'information op??rationnel (oui/non)",""),
        (479,"Th??matique du SI",0,1,3,0,NULL,462,NULL,"Th??matique du SI",""),
        (480,"Observations PPSE",0,1,3,0,NULL,462,NULL,"Observations PPSE",""),
        (817,"Fichiers (PPSE) (.zip ?? importer)",0,1,3,0,NULL,462,NULL,"Fichiers (PPSE) (.zip ?? importer)",""),
                                                              
                                                              
                                                              
        (481,"Source de donn??es reboisement et gestion des terres",1,1,3,1,NULL,NULL,NULL,"Source de donn??es reboisement et gestion des terres",""),
        (482,"Ann??e d'intervention des activit??s pour la gestion des terres",0,1,3,0,NULL,481,NULL,"Ann??e d'intervention des activit??s pour la gestion des terres",""),
        (483,"Cat??gorie/Zone d'intervention (Agroforesterie, Bassin versant, Dune, For??t de Tapia, Littoral, Mangrove, Recif corallien)",0,1,3,0,NULL,481,NULL,"Cat??gorie/Zone d'intervention (Agroforesterie, Bassin versant, Dune, For??t de Tapia, Littoral, Mangrove, Recif corallien)",""),
        (484,"Existence de protection anti??rosive (oui/non)",0,1,3,0,NULL,481,NULL,"Existence de protection anti??rosive (oui/non)",""),
        (485,"Autres protections (?? pr??ciser)",0,1,3,0,NULL,481,NULL,"Autres protections (?? pr??ciser)",""),
        (486,"Superficie de DRS (ha)",0,1,3,1,NULL,481,NULL,"Superficie de DRS (ha)",""),
        (487,"Geojson de la DRS",0,1,3,0,NULL,481,NULL,"Geojson de la DRS",""),
        (488,"Fixation de dunes (oui/non)",0,1,3,1,NULL,481,NULL,"Fixation de dunes (oui/non)",""),
        (489,"Superficie de dune stabilis??e (ha)",0,1,3,1,NULL,481,NULL,"Superficie de dune stabilis??e (ha)",""),
        (490,"Geojson de la dune stabilis??e",0,1,3,0,NULL,481,NULL,"Geojson de la dune stabilis??e",""),
        (491,"Type de la d??fense et restauration des sols adopt?? (m??canique, biologique, mixte)",0,1,3,0,NULL,481,NULL,"Type de la d??fense et restauration des sols adopt?? (m??canique, biologique, mixte)",""),
        (492,"Nombre de m??nage pratiquant la DRS",0,1,3,0,65,481,NULL,"Nombre de m??nage pratiquant la DRS",""),
        (493,"Comit?? form?? sur la DRS (oui/non)",0,1,3,0,NULL,481,NULL,"Comit?? form?? sur la DRS (oui/non)",""),
        (494,"Si oui, ann??e de cr??ation du comit??",0,1,3,0,NULL,481,NULL,"Si oui, ann??e de cr??ation du comit??",""),
        (495,"Comit?? sur DRS op??rationnel (oui/non)",0,1,3,0,NULL,481,NULL,"Comit?? sur DRS op??rationnel (oui/non)",""),
        (496,"Suivi des interventions DRS (oui/non)",0,1,3,0,NULL,481,NULL,"Suivi des interventions DRS (oui/non)",""),
        (497,"P??riodicit?? de suivi DRS (nombre/an)",0,1,3,0,NULL,481,NULL,"P??riodicit?? de suivi DRS (nombre/an)",""),
        (498,"Insitution (Nom de l'entit?? ou personne responsable du reboisement)",0,1,3,1,NULL,481,NULL,"Insitution (Nom de l'entit?? ou personne responsable du reboisement)",""),
        (499,"DREDD/CIREDD",0,1,3,0,NULL,481,NULL,"DREDD/CIREDD",""),
        (500,"Commune d'intervention pour le reboisement",0,1,3,1,NULL,481,NULL,"Commune d'intervention pour le reboisement",""),
        (501,"Fokontany d'intervention pour le reboisement",0,1,3,0,NULL,481,NULL,"Fokontany d'intervention pour le reboisement",""),
        (502,"Site/Localit??",0,1,3,0,NULL,481,NULL,"Site/Localit??",""),
        (503,"Situation juridique (terrain domanial, priv??)",0,1,3,1,NULL,481,NULL,"Situation juridique (terrain domanial, priv??)",""),
        (504,"Longitude surface rebois??e (en degr?? d??cimal) : X",0,1,3,1,NULL,481,NULL,"Longitude surface rebois??e (en degr?? d??cimal) : X",""),
        (505,"Latitude surface rebois??e (en degr?? d??cimal) : Y",0,1,3,1,NULL,481,NULL,"Latitude surface rebois??e (en degr?? d??cimal) : Y",""),
        (506,"Objectif de reboisement (restauration, energ??tique, bois d'??uvre, ???)",0,1,3,1,NULL,481,NULL,"Objectif de reboisement (restauration, energ??tique, bois d'??uvre, ???)",""),
        (507,"Superficie restaur??e si restauration (ha)",0,1,3,1,NULL,481,NULL,"Superficie restaur??e si restauration (ha)",""),
        (508,"Ecosyst??me (mangrove, zone humide, for??t humide, for??t s??che, reboisement, ???)",0,1,3,1,69,481,NULL,"Ecosyst??me (mangrove, zone humide, for??t humide, for??t s??che, reboisement, ???)",""),
        (509,"Surface totale pr??vue (ha)",0,1,3,0,NULL,481,NULL,"Surface totale pr??vue (ha)",""),
        (510,"Nombre de plants mis en terre",0,1,3,1,NULL,481,NULL,"Nombre de plants mis en terre",""),
        (511,"Esp??ce des plants",0,1,3,1,NULL,481,NULL,"Esp??ce des plants",""),
        (512,"Autochtone ou exotique ou mixte",0,1,3,1,NULL,481,NULL,"Autochtone ou exotique ou mixte",""),
        (513,"Croissance rapide (oui/non/les deux)",0,1,3,1,NULL,481,NULL,"Croissance rapide (oui/non/les deux)",""),
        (514,"Date de mise en terre",0,1,3,1,NULL,481,NULL,"Date de mise en terre",""),
        (515,"Source de plants",0,1,3,1,NULL,481,NULL,"Source de plants",""),
        (516,"Superficie rebois??e (ha)",0,1,3,1,NULL,481,NULL,"Superficie rebois??e (ha)",""),
        (517,"Geojson surface rebois??e",0,1,3,0,NULL,481,NULL,"Geojson surface rebois??e",""),
        (518,"Source de financement du reboisement (interne ou externe)",0,1,3,1,NULL,481,NULL,"Source de financement du reboisement (interne ou externe)",""),
        (519,"Projet d'appui du reboisement (si externe)",0,1,3,0,NULL,481,NULL,"Projet d'appui du reboisement (si externe)",""),
        (520,"Identifiant du projet d'appui pour le reboisement et la gestion des terres",0,1,3,0,NULL,481,NULL,"Identifiant du projet d'appui pour le reboisement et la gestion des terres",""),
        (521,"Longueur de pare-feux (km)",0,1,3,1,NULL,481,NULL,"Longueur de pare-feux (km)",""),
        (522,"Mat??riels de lutte active",0,1,3,0,NULL,481,NULL,"Mat??riels de lutte active",""),
        (523,"Existence de structure de lutte (oui/non)",0,1,3,0,NULL,481,NULL,"Existence de structure de lutte (oui/non)",""),
        (524,"Surface br??l??e (ha)",0,1,3,0,NULL,481,NULL,"Surface br??l??e (ha)",""),
        (525,"Geojson surface de reboisement br??l??e",0,1,3,0,NULL,481,NULL,"Geojson surface de reboisement br??l??e",""),
        (526,"Lutte active ou pr??ventive",0,1,3,0,NULL,481,NULL,"Lutte active ou pr??ventive",""),
        (527,"Date d'intervention",0,1,3,0,NULL,481,NULL,"Date d'intervention",""),
        (528,"Responsable de lutte contre les feux",0,1,3,0,NULL,481,NULL,"Responsable de lutte contre les feux",""),
        (529,"Regarnissage (oui/non)",0,1,3,0,NULL,481,NULL,"Regarnissage (oui/non)",""),
        (530,"Date de regarnissage",0,1,3,0,NULL,481,NULL,"Date de regarnissage",""),
        (531,"Nettoyage (oui/non)",0,1,3,0,NULL,481,NULL,"Nettoyage (oui/non)",""),
        (532,"Date de nettoyage",0,1,3,0,NULL,481,NULL,"Date de nettoyage",""),
        (533,"Elagage (oui/non)",0,1,3,0,NULL,481,NULL,"Elagage (oui/non)",""),
        (534,"Date d'elagage",0,1,3,0,NULL,481,NULL,"Date d'elagage",""),
        (535,"B??n??ficiaires des interventions",0,1,3,0,NULL,481,NULL,"B??n??ficiaires des interventions",""),
        (536,"Eclaircie 1 (oui/non)",0,1,3,0,NULL,481,NULL,"Eclaircie 1 (oui/non)",""),
        (537,"Date eclaircie 1",0,1,3,0,NULL,481,NULL,"Date eclaircie 1",""),
        (538,"Eclaircie 2 (oui/non)",0,1,3,0,NULL,481,NULL,"Eclaircie 2 (oui/non)",""),
        (539,"Date eclaircie 2",0,1,3,0,NULL,481,NULL,"Date eclaircie 2",""),
        (540,"Coupe rase (oui/non)",0,1,3,0,NULL,481,NULL,"Coupe rase (oui/non)",""),
        (541,"Date coupe rase",0,1,3,0,NULL,481,NULL,"Date coupe rase",""),
        (542,"Observations reboisement et gestion des terres",0,1,3,0,NULL,481,NULL,"Observations reboisement et gestion des terres",""),
        (818,"Fichiers (reboisement) (.zip ?? importer)",0,1,3,0,NULL,481,NULL,"Fichiers (reboisement) (.zip ?? importer)",""),
                                                              
                                                              
                                                              
        (543,"Source de donn??es recherche",1,1,3,1,NULL,NULL,NULL,"Source de donn??es recherche",""),
        (544,"Sujet de recherche effectu??",0,1,3,1,NULL,543,NULL,"Sujet de recherche effectu??",""),
        (545,"Objectif de la recherche (??tude de fili??re, ...)",0,1,3,0,NULL,543,NULL,"Objectif de la recherche (??tude de fili??re, ...)",""),
        (546,"Commune d'intervention de la recherche (<<Toutes>> si niveau national)",0,1,3,1,NULL,543,NULL,"Commune d'intervention de la recherche (<<Toutes>> si niveau national)",""),
        (547,"Date de commencement de la recherche",0,1,3,0,NULL,543,NULL,"Date de commencement de la recherche",""),
        (548,"Date de fin de la recherche",0,1,3,0,NULL,543,NULL,"Date de fin de la recherche",""),
        (549,"Chercheurs (liste)",0,1,3,0,NULL,543,NULL,"Chercheurs (liste)",""),
        (550,"Institution des chercheurs",0,1,3,0,NULL,543,NULL,"Institution des chercheurs",""),
        (551,"Date d'??dition du rapport de recherche",0,1,3,0,NULL,543,NULL,"Date d'??dition du rapport de recherche",""),
        (552,"R??sultats de la recherche",0,1,3,0,NULL,543,NULL,"R??sultats de la recherche",""),
        (553,"R??sultats de recherche disponibles (oui/non)",0,1,3,1,75,543,NULL,"R??sultats de recherche disponibles (oui/non)",""),
        (554,"R??sultats de recherche appliqu??s (oui/non)",0,1,3,1,76,543,NULL,"R??sultats de recherche appliqu??s (oui/non)",""),
        (555,"Produits de recherche diffus??s, vulgaris??s, promus (oui/non)",0,1,3,1,77,543,NULL,"Produits de recherche diffus??s, vulgaris??s, promus (oui/non)",""),
        (556,"Source de financement de la recherche (interne ou externe)",0,1,3,1,NULL,543,NULL,"Source de financement de la recherche (interne ou externe)",""),
        (557,"Projet d'appui de la recherche (si externe)",0,1,3,0,NULL,543,NULL,"Projet d'appui de la recherche (si externe)",""),
        (558,"Identifiant du projet d'appui pour la recherche",0,1,3,0,NULL,543,NULL,"Identifiant du projet d'appui pour la recherche",""),
        (559,"Co??ts des activit??s de recherche (Ariary)",0,1,3,0,NULL,543,NULL,"Co??ts des activit??s de recherche (Ariary)",""),
        (560,"Observations recherche",0,1,3,0,NULL,543,NULL,"Observations recherche",""),
        (819,"Fichiers (recherches) (.zip ?? importer)",0,1,3,0,NULL,543,NULL,"Fichiers (recherches) (.zip ?? importer)",""),
                                                              
                                                              
                                                              
        (561,"Source de donn??es RSE",1,1,3,1,NULL,NULL,NULL,"Source de donn??es RSE",""),
        (562,"Intitul?? du projet d??velopp?? dans le cadre de RSE (Responsabilit?? Soci??tale des Entreprises)",0,1,3,1,NULL,561,NULL,"Intitul?? du projet d??velopp?? dans le cadre de RSE (Responsabilit?? Soci??tale des Entreprises)",""),
        (563,"Objectifs du projet RSE",0,1,3,1,NULL,561,NULL,"Objectifs du projet RSE",""),
        (564,"Date de d??but et fin de la RSE",0,1,3,0,NULL,561,NULL,"Date de d??but et fin de la RSE",""),
        (565,"Commune d'intervention pour RSE",0,1,3,0,NULL,561,NULL,"Commune d'intervention pour RSE",""),
        (566,"Fokontany d'intervention pour RSE",0,1,3,0,NULL,561,NULL,"Fokontany d'intervention pour RSE",""),
        (567,"Types d'intervention (??ducation environnementale, reboisement/restauration, ???)",0,1,3,0,NULL,561,NULL,"Types d'intervention (??ducation environnementale, reboisement/restauration, ???)",""),
        (568,"Supports aff??rents produits (liste)",0,1,3,0,NULL,561,NULL,"Supports aff??rents produits (liste)",""),
        (569,"Parties prenantes pour RSE (liste)",0,1,3,0,NULL,561,NULL,"Parties prenantes pour RSE (liste)",""),
        (570,"Nombre de m??nages b??n??ficiaires de la RSE",0,1,3,0,NULL,561,NULL,"Nombre de m??nages b??n??ficiaires de la RSE",""),
        (571,"Nombre d'autres b??n??ficiaires de la RSE (groupement, ??cole, ???)",0,1,3,0,NULL,561,NULL,"Nombre d'autres b??n??ficiaires de la RSE (groupement, ??cole, ???)",""),
        (572,"Existence de suivi des projets RSE (oui/non)",0,1,3,0,NULL,561,NULL,"Existence de suivi des projets RSE (oui/non)",""),
        (573,"P??riodicit?? de suivi RSE (nombre par an)",0,1,3,0,NULL,561,NULL,"P??riodicit?? de suivi RSE (nombre par an)",""),
        (574,"Identifiant du projet d'appui pour la RSE",0,1,3,0,NULL,561,NULL,"Identifiant du projet d'appui pour la RSE",""),
        (575,"Co??t de r??alisation de la RSE (Arirary)",0,1,3,0,NULL,561,NULL,"Co??t de r??alisation de la RSE (Arirary)",""),
        (576,"Observations RSE",0,1,3,0,NULL,561,NULL,"Observations RSE",""),
        (820,"Fichiers (RSE) (.zip ?? importer)",0,1,3,0,NULL,561,NULL,"Fichiers (RSE) (.zip ?? importer)",""),
                                                              
        (577,"Source de donn??es ressources humaines",1,1,3,1,NULL,NULL,NULL,"Source de donn??es ressources humaines",""),
        (578,"Intitul?? du poste",0,1,3,1,NULL,577,NULL,"Intitul?? du poste",""),
        (579,"Justificatif d'assignation (D??cisions, Note de service, arr??t??s, d??crets avec num??ro)",0,1,3,1,NULL,577,NULL,"Justificatif d'assignation (D??cisions, Note de service, arr??t??s, d??crets avec num??ro)",""),
        (580,"Poste occup?? ou vaccant",0,1,3,1,NULL,577,NULL,"Poste occup?? ou vaccant",""),
        (581,"Type du poste (administratif, technique)",0,1,3,1,80,577,NULL,"Type du poste (administratif, technique)",""),
        (582,"Statut du personnel (ECD, ELD, EFA, fonctionnaire)",0,1,3,1,79,577,NULL,"Statut du personnel (ECD, ELD, EFA, fonctionnaire)",""),
        (583,"Commune d'affectation (<<Toutes>> si niveau national)",0,1,3,0,NULL,577,NULL,"Commune d'affectation (<<Toutes>> si niveau national)",""),
        (584,"Ann??e d'affectation",0,1,3,0,NULL,577,NULL,"Ann??e d'affectation",""),
        (585,"Date de recrutement/ann??e",0,1,3,0,NULL,577,NULL,"Date de recrutement/ann??e",""),
        (586,"Date estim??e de retraite/ann??e",0,1,3,0,NULL,577,NULL,"Date estim??e de retraite/ann??e",""),
        (587,"Personne b??n??ficiant de formation (oui, non)",0,1,3,0,NULL,577,NULL,"Personne b??n??ficiant de formation (oui, non)",""),
        (588,"Sujet de formation",0,1,3,0,NULL,577,NULL,"Sujet de formation",""),
        (589,"Formation appliqu??e/utilis??e (oui/non)",0,1,3,0,NULL,577,NULL,"Formation appliqu??e/utilis??e (oui/non)",""),
        (590,"Besoins en formation pour le poste ",0,1,3,0,NULL,577,NULL,"Besoins en formation pour le poste ",""),
        (591,"Observations ressources humaines",0,1,3,0,NULL,577,NULL,"Observations ressources humaines",""),
        (821,"Fichiers (RH) (.zip ?? importer)",0,1,3,0,NULL,577,NULL,"Fichiers (RH) (.zip ?? importer)",""),
                                                              
                                                              
                                                              
        (592,"Source de donn??es TG",1,1,3,1,NULL,NULL,NULL,"Source de donn??es TG",""),
        (593,"TG nouvellement cr???? ou renouvel??",0,1,3,1,NULL,592,NULL,"TG nouvellement cr???? ou renouvel??",""),
        (594,"Nom de la COBA/VOI",0,1,3,1,NULL,592,NULL,"Nom de la COBA/VOI",""),
        (595,"Fokontany d'implatation du TG",0,1,3,0,NULL,592,NULL,"Fokontany d'implatation du TG",""),
        (596,"Commune d'implatation du TG",0,1,3,1,NULL,592,NULL,"Commune d'implatation du TG",""),
        (597,"Type de for??ts (Primaire, Secondaire, Littorale, Fourr??, Mangrove, Satrana, Raphia, Tapia, Domaniale, Reboisement, Zone de p??ches, etc.)",0,1,3,1,NULL,592,NULL,"Type de for??ts (Primaire, Secondaire, Littorale, Fourr??, Mangrove, Satrana, Raphia, Tapia, Domaniale, Reboisement, Zone de p??ches, etc.)",""),
        (598,"Surface contrat 1 (ha)",0,1,3,1,NULL,592,NULL,"Surface contrat 1 (ha)",""),
        (599,"Type de TG (GCF, GELOSE)",0,1,3,1,NULL,592,NULL,"Type de TG (GCF, GELOSE)",""),
        (600,"Vocation/Objectifs (Conservation, Valorisation, Ecotourisme, Droit d'usage (CDU), Restauration, Production, Reserve, R??habilitation, Enrichissement, Reboisement, Exploitation, Production durable, Zone de culture, Plantes fourrag??res, Production charbon de bois, Utilisation culturelle, etc.)",0,1,3,1,NULL,592,NULL,"Vocation/Objectifs (Conservation, Valorisation, Ecotourisme, Droit d'usage (CDU), Restauration, Production, Reserve, R??habilitation, Enrichissement, Reboisement, Exploitation, Production durable, Zone de culture, Plantes fourrag??res, Production charbon de bois, Utilisation culturelle, etc.)",""),
        (601,"Surface contrat 2 (ha)",0,1,3,1,NULL,592,NULL,"Surface contrat 2 (ha)",""),
        (602,"Date 1er contrat",0,1,3,1,NULL,592,NULL,"Date 1er contrat",""),
        (603,"Date Evaluation 1er contrat",0,1,3,0,NULL,592,NULL,"Date Evaluation 1er contrat",""),
        (604,"Date D??liberation",0,1,3,0,NULL,592,NULL,"Date D??liberation",""),
        (605,"Date 2??me contrat",0,1,3,0,NULL,592,NULL,"Date 2??me contrat",""),
        (606,"Ressources concern??es dans le site de TG",0,1,3,0,NULL,592,NULL,"Ressources concern??es dans le site de TG",""),
        (607,"Nombre des membres de COBA/VOI",0,1,3,0,NULL,592,NULL,"Nombre des membres de COBA/VOI",""),
        (608,"COBA/VOI op??rationnelle (oui/non)",0,1,3,1,NULL,592,NULL,"COBA/VOI op??rationnelle (oui/non)",""),
        (609,"Nombre de m??nages b??n??ficiaires du TG",0,1,3,1,NULL,592,NULL,"Nombre de m??nages b??n??ficiaires du TG",""),
        (610,"COBA/VOI appuy??e/soutenue (oui/non)",0,1,3,1,87,592,NULL,"COBA/VOI appuy??e/soutenue (oui/non)",""),
        (611,"Type d'appui pour TG (dotation mat??riels, formation, AGR???)",0,1,3,0,NULL,592,NULL,"Type d'appui pour TG (dotation mat??riels, formation, AGR???)",""),
        (612,"Organisme d'appui du TG",0,1,3,1,NULL,592,NULL,"Organisme d'appui du TG",""),
        (613,"Projet d'appui du TG",0,1,3,0,NULL,592,NULL,"Projet d'appui du TG",""),
        (614,"Identifiant du projet d'appui du TG",0,1,3,0,NULL,592,NULL,"Identifiant du projet d'appui du TG",""),
        (615,"Existence de suivi du TG (oui/non)",0,1,3,1,83,592,NULL,"Existence de suivi du TG (oui/non)",""),
        (616,"Objetcif du suivi de TG",0,1,3,0,NULL,592,NULL,"Objetcif du suivi de TG",""),
        (617,"Date de r??alisation du suivi de TG",0,1,3,0,NULL,592,NULL,"Date de r??alisation du suivi de TG",""),
        (618,"Equipe de r??alisation du suivi de TG",0,1,3,0,NULL,592,NULL,"Equipe de r??alisation du suivi de TG",""),
        (619,"Rapport de suivi de TG (oui/non)",0,1,3,0,NULL,592,NULL,"Rapport de suivi de TG (oui/non)",""),
        (620,"Date d'??dition rapport de suivi TG",0,1,3,0,NULL,592,NULL,"Date d'??dition rapport de suivi TG",""),
        (621,"Existence d'??valuation du TG (oui/non)",0,1,3,1,84,592,NULL,"Existence d'??valuation du TG (oui/non)",""),
        (622,"Objectif de l'??valuation de TG",0,1,3,0,NULL,592,NULL,"Objectif de l'??valuation de TG",""),
        (623,"Date de r??alisation de l'??valuation de TG",0,1,3,0,NULL,592,NULL,"Date de r??alisation de l'??valuation de TG",""),
        (624,"Equipe de r??alisation de l'??valuation de TG",0,1,3,0,NULL,592,NULL,"Equipe de r??alisation de l'??valuation de TG",""),
        (625,"Rapport d'??valuation de TG (oui/non)",0,1,3,0,NULL,592,NULL,"Rapport d'??valuation de TG (oui/non)",""),
        (626,"Date d'??dition rapport ??valuation TG",0,1,3,0,NULL,592,NULL,"Date d'??dition rapport ??valuation TG",""),
        (627,"Geojson TG",0,1,3,0,NULL,592,NULL,"Geojson TG",""),
        (628,"Observations TG",0,1,3,0,NULL,592,NULL,"Observations TG",""),
        (822,"Fichiers (TG) (.zip ?? importer)",0,1,3,0,NULL,592,NULL,"Fichiers (TG) (.zip ?? importer)",""),
                                                              
                                                              
                                                              
        (629,"Source de donn??es p??pini??re",1,1,3,1,NULL,NULL,NULL,"Source de donn??es p??pini??re",""),
        (630,"Date de cr??ation de la p??pini??re",0,1,3,1,NULL,629,NULL,"Date de cr??ation de la p??pini??re",""),
        (631,"P??pini??re fonctionnelle (oui/non)",0,1,3,1,NULL,629,NULL,"P??pini??re fonctionnelle (oui/non)",""),
        (632,"Commune d'implantation de la p??pini??re",0,1,3,1,NULL,629,NULL,"Commune d'implantation de la p??pini??re",""),
        (633,"Longitude p??pini??re (en degr?? d??cimal) : X",0,1,3,1,NULL,629,NULL,"Longitude p??pini??re (en degr?? d??cimal) : X",""),
        (634,"Latitude p??pini??re (en degr?? d??cimal) : Y",0,1,3,1,NULL,629,NULL,"Latitude p??pini??re (en degr?? d??cimal) : Y",""),
        (635,"Type de p??pini??re (villageoise, individuelle, institutionnelle, ???)",0,1,3,0,NULL,629,NULL,"Type de p??pini??re (villageoise, individuelle, institutionnelle, ???)",""),
        (636,"P??pini??re priv??e (oui/non)",0,1,3,0,NULL,629,NULL,"P??pini??re priv??e (oui/non)",""),
        (637,"Geojson localisation p??pini??re",0,1,3,0,NULL,629,NULL,"Geojson localisation p??pini??re",""),
        (638,"Source de financement de la p??pini??re (interne ou externe)",0,1,3,1,NULL,629,NULL,"Source de financement de la p??pini??re (interne ou externe)",""),
        (639,"Projet d'appui de la p??pini??re (si externe)",0,1,3,0,NULL,629,NULL,"Projet d'appui de la p??pini??re (si externe)",""),
        (640,"Identifiant du projet d'appui de la p??pini??re",0,1,3,0,NULL,629,NULL,"Identifiant du projet d'appui de la p??pini??re",""),
        (641,"Nom Propri??taire (Nom et pr??nom si personne physique ; Nom ou d??nomination si personne morale)",0,1,3,0,NULL,629,NULL,"Nom Propri??taire (Nom et pr??nom si personne physique ; Nom ou d??nomination si personne morale)",""),
        (642,"Genre du propri??taire (masculin, f??minin, autre)",0,1,3,0,NULL,629,NULL,"Genre du propri??taire (masculin, f??minin, autre)",""),
        (643,"Nombre total des employ??s",0,1,3,0,NULL,629,NULL,"Nombre total des employ??s",""),
        (644,"Nombre des femmes impliqu??es dans la production de plants",0,1,3,0,NULL,629,NULL,"Nombre des femmes impliqu??es dans la production de plants",""),
        (645,"Essences utilis??es en p??pini??re",0,1,3,0,NULL,629,NULL,"Essences utilis??es en p??pini??re",""),
        (646,"Capacite maximale de production (nombre)",0,1,3,0,NULL,629,NULL,"Capacite maximale de production (nombre)",""),
        (647,"Nombre de plants pr??ts ?? ??tre mis en terre produits",0,1,3,1,NULL,629,NULL,"Nombre de plants pr??ts ?? ??tre mis en terre produits",""),
        (648,"Observations p??pini??re",0,1,3,0,NULL,629,NULL,"Observations p??pini??re",""),
        (823,"Fichiers (p??pini??re) (.zip ?? importer)",0,1,3,0,NULL,629,NULL,"Fichiers (p??pini??re) (.zip ?? importer)",""),
                                                              
                                                              
                                                              
        (649,"Source de donn??es DD",1,1,3,1,NULL,NULL,NULL,"Source de donn??es DD",""),
        (650,"Intitul?? de la SNICDD",0,1,3,1,NULL,649,NULL,"Intitul?? de la SNICDD",""),
        (651,"Date d'??laboration de la SNICDD",0,1,3,0,NULL,649,NULL,"Date d'??laboration de la SNICDD",""),
        (652,"Parties prenantes dans l'??laboration",0,1,3,0,NULL,649,NULL,"Parties prenantes dans l'??laboration",""),
        (653,"SNICDD op??rationnelle (oui/non)",0,1,3,0,NULL,649,NULL,"SNICDD op??rationnelle (oui/non)",""),
        (654,"Intitul?? de politique sectorielle align??e au DD",0,1,3,1,NULL,649,NULL,"Intitul?? de politique sectorielle align??e au DD",""),
        (655,"Objectif de politique sectorielle align??e au DD",0,1,3,0,NULL,649,NULL,"Objectif de politique sectorielle align??e au DD",""),
        (656,"Date d'adoption de politique sectorielle align??e au DD",0,1,3,0,NULL,649,NULL,"Date d'adoption de politique sectorielle align??e au DD",""),
        (657,"Politique sectorielle align??e au DD op??rationnelle (oui/non)",0,1,3,1,31,649,NULL,"Politique sectorielle align??e au DD op??rationnelle (oui/non)",""),
        (658,"Intitul?? de politique de d??veloppement et de planification territoriale align??e au DD (PRD, PCD, SAC)",0,1,3,1,NULL,649,NULL,"Intitul?? de politique de d??veloppement et de planification territoriale align??e au DD (PRD, PCD, SAC)",""),
        (659,"Objectif de politique de d??veloppement et de planification territoriale align??e au DD (PRD, PCD, SAC)",0,1,3,0,NULL,649,NULL,"Objectif de politique de d??veloppement et de planification territoriale align??e au DD (PRD, PCD, SAC)",""),
        (660,"Date d'adoption de politique de d??veloppement et de planification territoriale align??e au DD (PRD, PCD, SAC)",0,1,3,0,NULL,649,NULL,"Date d'adoption de politique de d??veloppement et de planification territoriale align??e au DD (PRD, PCD, SAC)",""),
        (661,"Politique de d??veloppement et de planification territoriale align??e au DD (PRD, PCD, SAC) op??rationnelle (oui/non)",0,1,3,0,NULL,649,NULL,"Politique de d??veloppement et de planification territoriale align??e au DD (PRD, PCD, SAC) op??rationnelle (oui/non)",""),
        (662,"Nom de promoteur ayant un label de DD",0,1,3,1,NULL,649,NULL,"Nom de promoteur ayant un label de DD",""),
        (663,"Date d'obtention du label",0,1,3,0,NULL,649,NULL,"Date d'obtention du label",""),
        (664,"Commune d'obtention du label",0,1,3,1,NULL,649,NULL,"Commune d'obtention du label",""),
        (665,"Label toujours valide (oui/non)",0,1,3,0,NULL,649,NULL,"Label toujours valide (oui/non)",""),
        (666,"Intitul?? du projet/programme en DD d??velopp??",0,1,3,1,NULL,649,NULL,"Intitul?? du projet/programme en DD d??velopp??",""),
        (667,"Ann??e de d??but projet/programme en DD",0,1,3,0,NULL,649,NULL,"Ann??e de d??but projet/programme en DD",""),
        (668,"Ann??e de fin projet/programme en DD",0,1,3,0,NULL,649,NULL,"Ann??e de fin projet/programme en DD",""),
        (669,"Initiateur du projet/programme en DD",0,1,3,0,NULL,649,NULL,"Initiateur du projet/programme en DD",""),
        (670,"Intitul?? du financement dans le cadre du DD",0,1,3,0,NULL,649,NULL,"Intitul?? du financement dans le cadre du DD",""),
        (671,"Source de financement (interne ou externe)",0,1,3,0,NULL,649,NULL,"Source de financement (interne ou externe)",""),
        (672,"Date d'accord de financement",0,1,3,0,NULL,649,NULL,"Date d'accord de financement",""),
        (673,"Montant du financement (Ariary)",0,1,3,0,NULL,649,NULL,"Montant du financement (Ariary)",""),
        (674,"Identifiant du projet d'appui pour le DD",0,1,3,0,NULL,649,NULL,"Identifiant du projet d'appui pour le DD",""),
        (675,"Observations DD",0,1,3,0,NULL,649,NULL,"Observations DD",""),
        (824,"Fichiers (DD) (.zip ?? importer)",0,1,3,0,NULL,649,NULL,"Fichiers (DD) (.zip ?? importer)",""),
                                                              
                                                              
                                                              
        (676,"Source de donn??es PSE",1,1,3,1,NULL,NULL,NULL,"Source de donn??es PSE",""),
        (677,"Type de Services Environnementaux (r??gulation, production, ???)",0,1,3,1,NULL,676,NULL,"Type de Services Environnementaux (r??gulation, production, ???)",""),
        (678,"Fournisseur du SE (projets, Etat, communaut??, ???)",0,1,3,0,NULL,676,NULL,"Fournisseur du SE (projets, Etat, communaut??, ???)",""),
        (679,"Commune d'implantation du PSE",0,1,3,1,NULL,676,NULL,"Commune d'implantation du PSE",""),
        (680,"Intitul?? de l'activit?? de PSE d??velopp??e",0,1,3,1,NULL,676,NULL,"Intitul?? de l'activit?? de PSE d??velopp??e",""),
        (681,"Activit??s de PSE appuy??es (oui/non)",0,1,3,0,NULL,676,NULL,"Activit??s de PSE appuy??es (oui/non)",""),
        (682,"Type d'appui venant du PSE (dotation mat??riels, formation, AGR???)",0,1,3,0,NULL,676,NULL,"Type d'appui venant du PSE (dotation mat??riels, formation, AGR???)",""),
        (683,"Source de financement du PSE (interne ou externe)",0,1,3,1,NULL,676,NULL,"Source de financement du PSE (interne ou externe)",""),
        (684,"Projet d'appui du PSE (si externe)",0,1,3,0,NULL,676,NULL,"Projet d'appui du PSE (si externe)",""),
        (685,"Identifiant du projet d'appui pour le PSE",0,1,3,0,NULL,676,NULL,"Identifiant du projet d'appui pour le PSE",""),
        (686,"Nombre de m??nages b??n??ficiaires du PSE",0,1,3,1,NULL,676,NULL,"Nombre de m??nages b??n??ficiaires du PSE",""),
        (687,"Micro-projets financ??s (oui/non)",0,1,3,0,NULL,676,NULL,"Micro-projets financ??s (oui/non)",""),
        (688,"Lequel/lesquels?",0,1,3,0,NULL,676,NULL,"Lequel/lesquels?",""),
        (689,"Micro projets alternatifs r??alis??s (liste)",0,1,3,0,NULL,676,NULL,"Micro projets alternatifs r??alis??s (liste)",""),
        (690,"Micro-projets sont suivis (oui/non)",0,1,3,0,NULL,676,NULL,"Micro-projets sont suivis (oui/non)",""),
        (691,"Fili??res de la biodiversit?? dot??es de m??canismes de partage ??quitable de b??n??fices (liste)",0,1,3,0,NULL,676,NULL,"Fili??res de la biodiversit?? dot??es de m??canismes de partage ??quitable de b??n??fices (liste)",""),
        (692,"Projets alternatifs aux pressions mis en ??uvre dans les zones d'intervention (liste)",0,1,3,0,NULL,676,NULL,"Projets alternatifs aux pressions mis en ??uvre dans les zones d'intervention (liste)",""),
        (693,"Structures intercommunales appuy??es (liste)",0,1,3,0,NULL,676,NULL,"Structures intercommunales appuy??es (liste)",""),
        (694,"Etudes de fili??res en relation avec les PSE r??alis??es (liste)",0,1,3,0,NULL,676,NULL,"Etudes de fili??res en relation avec les PSE r??alis??es (liste)",""),
        (695,"Valeur des services ecosyst??miques fournis (culturelle, ??conimique, ???)",0,1,3,0,NULL,676,NULL,"Valeur des services ecosyst??miques fournis (culturelle, ??conimique, ???)",""),
        (696,"Observations PSE",0,1,3,0,NULL,676,NULL,"Observations PSE",""),
        (825,"Fichiers (PSE) (.zip ?? importer)",0,1,3,0,NULL,676,NULL,"Fichiers (PSE) (.zip ?? importer)",""),
                                                              
                                                              
                                                              
        (697,"Source de donn??es corruption",1,1,3,1,NULL,NULL,NULL,"Source de donn??es corruption",""),
        (698,"Type de dol??ances (corruption, manquement au code de d??ontologie et ethique environnementale)",0,1,3,1,NULL,697,NULL,"Type de dol??ances (corruption, manquement au code de d??ontologie et ethique environnementale)",""),
        (699,"Date de reception de dol??ance",0,1,3,0,NULL,697,NULL,"Date de reception de dol??ance",""),
        (700,"Dol??ances trait??es (oui/non)",0,1,3,1,30,697,NULL,"Dol??ances trait??es (oui/non)",""),
        (701,"Commune de r??ception de la dol??ance",0,1,3,1,NULL,697,NULL,"Commune de r??ception de la dol??ance",""),
        (702,"Type de corruption",0,1,3,0,NULL,697,NULL,"Type de corruption",""),
        (703,"Transmission des cas de corruption au Conseil de disipline (oui/non)",0,1,3,0,NULL,697,NULL,"Transmission des cas de corruption au Conseil de disipline (oui/non)",""),
        (704,"Sanction par le Conseil de discipline",0,1,3,0,NULL,697,NULL,"Sanction par le Conseil de discipline",""),
        (705,"Transmission ?? la juridication comp??tente des affaires de corruption (oui/non)",0,1,3,0,NULL,697,NULL,"Transmission ?? la juridication comp??tente des affaires de corruption (oui/non)",""),
        (706,"Nombre de personnes condamn??es pour corruption",0,1,3,0,NULL,697,NULL,"Nombre de personnes condamn??es pour corruption",""),
        (707,"Nombre d'infraction de blanchiment de capitaux retenu par le SAMIFIN",0,1,3,0,NULL,697,NULL,"Nombre d'infraction de blanchiment de capitaux retenu par le SAMIFIN",""),
        (708,"M??diatisation des poursuites judiciaires en mati??re de trafic de ressources naturelles (oui/non)",0,1,3,0,NULL,697,NULL,"M??diatisation des poursuites judiciaires en mati??re de trafic de ressources naturelles (oui/non)",""),
        (709,"Nombre d'intervention du BIANCO ",0,1,3,0,NULL,697,NULL,"Nombre d'intervention du BIANCO ",""),
        (710,"Identifiant du projet d'appui pour la lutte contre la corruption",0,1,3,0,NULL,697,NULL,"Identifiant du projet d'appui pour la lutte contre la corruption",""),
        (711,"Observations corruption",0,1,3,0,NULL,697,NULL,"Observations corruption",""),
        (826,"Fichiers (corruption) (.zip ?? importer)",0,1,3,0,NULL,697,NULL,"Fichiers (corruption) (.zip ?? importer)",""),
                                                              
                                                              
                                                              
        (712,"Source de donn??es info projets",1,1,3,1,NULL,NULL,NULL,"Source de donn??es info projets",""),
        (713,"Intitul?? du projet",0,1,3,1,NULL,712,NULL,"Intitul?? du projet",""),
        (714,"R??gion d'intervention",0,1,3,1,NULL,712,NULL,"R??gion d'intervention",""),
        (715,"Ann??e de d??but et ann??e de fin",0,1,3,1,NULL,712,NULL,"Ann??e de d??but et ann??e de fin",""),
        (716,"Th??matique touch??e",0,1,3,1,NULL,712,NULL,"Th??matique touch??e",""),
        (717,"Co??t total",0,1,3,1,NULL,712,NULL,"Co??t total",""),
        (718,"Objectif g??n??ral ",0,1,3,1,NULL,712,NULL,"Objectif g??n??ral ",""),
        (719,"Objectifs specifiques",0,1,3,1,NULL,712,NULL,"Objectifs specifiques",""),
        (720,"B??n??ficiaires",0,1,3,1,NULL,712,NULL,"B??n??ficiaires",""),
        (721,"R??sultats et effets attendus",0,1,3,1,NULL,712,NULL,"R??sultats et effets attendus",""),
        (722,"Activit??s principales",0,1,3,1,NULL,712,NULL,"Activit??s principales",""),
        (723,"Financement (Subvention, co-financement, Ressource Propre Interne, don, emprunt, ???)",0,1,3,1,NULL,712,NULL,"Financement (Subvention, co-financement, Ressource Propre Interne, don, emprunt, ???)",""),
        (724,"Code/Identifiant du projet",0,1,3,1,NULL,712,NULL,"Code/Identifiant du projet",""),
        (725,"Observations info projets",0,1,3,0,NULL,712,NULL,"Observations info projets",""),
        (827,"Fichiers (info projets) (.zip ?? importer)",0,1,3,0,NULL,712,NULL,"Fichiers (info projets) (.zip ?? importer)","")`
    );

    // Update values of indicateur to link with questions
    sql.push(`UPDATE indicateur set id_question = 7 WHERE id = 1`);
    sql.push(`UPDATE indicateur set id_question = 20 WHERE id = 2`);
    sql.push(`UPDATE indicateur set id_question = 45 WHERE id = 3`);
    sql.push(`UPDATE indicateur set id_question = 26 WHERE id = 4`);
    sql.push(`UPDATE indicateur set id_question = 37 WHERE id = 5`);
    sql.push(`UPDATE indicateur set id_question = 39 WHERE id = 6`);
    sql.push(`UPDATE indicateur set id_question = 46 WHERE id = 7`);
    sql.push(`UPDATE indicateur set id_question = 71 WHERE id = 8`);
    sql.push(`UPDATE indicateur set id_question = 102 WHERE id = 9`);
    sql.push(`UPDATE indicateur set id_question = 102 WHERE id = 10`);
    sql.push(`UPDATE indicateur set id_question = 102 WHERE id = 11`);
    sql.push(`UPDATE indicateur set id_question = 102 WHERE id = 12`);
    sql.push(`UPDATE indicateur set id_question = 102 WHERE id = 13`);
    sql.push(`UPDATE indicateur set id_question = 120 WHERE id = 14`);
    sql.push(`UPDATE indicateur set id_question = 125 WHERE id = 15`);
    sql.push(`UPDATE indicateur set id_question = 136 WHERE id = 16`);
    sql.push(`UPDATE indicateur set id_question = 144 WHERE id = 17`);
    sql.push(`UPDATE indicateur set id_question = 148 WHERE id = 18`);
    sql.push(`UPDATE indicateur set id_question = 153 WHERE id = 19`);
    sql.push(`UPDATE indicateur set id_question = 157 WHERE id = 20`);
    sql.push(`UPDATE indicateur set id_question = 160 WHERE id = 21`);
    sql.push(`UPDATE indicateur set id_question = 163 WHERE id = 22`);
    sql.push(`UPDATE indicateur set id_question = 171 WHERE id = 23`);
    sql.push(`UPDATE indicateur set id_question = 176 WHERE id = 24`);
    sql.push(`UPDATE indicateur set id_question = 193 WHERE id = 25`);
    sql.push(`UPDATE indicateur set id_question = 188 WHERE id = 26`);
    sql.push(`UPDATE indicateur set id_question = 190 WHERE id = 27`);
    sql.push(`UPDATE indicateur set id_question = 184 WHERE id = 28`);
    sql.push(`UPDATE indicateur set id_question = 697 WHERE id = 29`);
    sql.push(`UPDATE indicateur set id_question = 697 WHERE id = 30`);
    sql.push(`UPDATE indicateur set id_question = 649 WHERE id = 31`);
    sql.push(`UPDATE indicateur set id_question = 649 WHERE id = 32`);
    sql.push(`UPDATE indicateur set id_question = 220 WHERE id = 33`);
    sql.push(`UPDATE indicateur set id_question = 242 WHERE id = 34`);
    sql.push(`UPDATE indicateur set id_question = 220 WHERE id = 35`);
    sql.push(`UPDATE indicateur set id_question = 251 WHERE id = 36`);
    sql.push(`UPDATE indicateur set id_question = 251 WHERE id = 37`);
    sql.push(`UPDATE indicateur set id_question = 284 WHERE id = 38`);
    sql.push(`UPDATE indicateur set id_question = 300 WHERE id = 39`);
    sql.push(`UPDATE indicateur set id_question = 292 WHERE id = 40`);
    sql.push(`UPDATE indicateur set id_question = 296 WHERE id = 41`);
    sql.push(`UPDATE indicateur set id_question = 288 WHERE id = 42`);
    sql.push(`UPDATE indicateur set id_question = 342 WHERE id = 43`);
    sql.push(`UPDATE indicateur set id_question = 343 WHERE id = 44`);
    sql.push(`UPDATE indicateur set id_question = 349 WHERE id = 45`);
    sql.push(`UPDATE indicateur set id_question = 342 WHERE id = 46`);
    sql.push(`UPDATE indicateur set id_question = 359 WHERE id = 47`);
    sql.push(`UPDATE indicateur set id_question = 359 WHERE id = 48`);
    sql.push(`UPDATE indicateur set id_question = 380 WHERE id = 49`);
    sql.push(`UPDATE indicateur set id_question = 397 WHERE id = 50`);
    sql.push(`UPDATE indicateur set id_question = 414 WHERE id = 51`);
    sql.push(`UPDATE indicateur set id_question = 431 WHERE id = 52`);
    sql.push(`UPDATE indicateur set id_question = 316 WHERE id = 53`);
    sql.push(`UPDATE indicateur set id_question = 320 WHERE id = 54`);
    sql.push(`UPDATE indicateur set id_question = 330 WHERE id = 55`);
    sql.push(`UPDATE indicateur set id_question = 331 WHERE id = 56`);
    sql.push(`UPDATE indicateur set id_question = 455 WHERE id = 57`);
    sql.push(`UPDATE indicateur set id_question = 676 WHERE id = 58`);
    sql.push(`UPDATE indicateur set id_question = 686 WHERE id = 59`);
    sql.push(`UPDATE indicateur set id_question = 200 WHERE id = 60`);
    sql.push(`UPDATE indicateur set id_question = 200 WHERE id = 61`);
    sql.push(`UPDATE indicateur set id_question = 647 WHERE id = 62`);
    sql.push(`UPDATE indicateur set id_question = 462 WHERE id = 63`);
    sql.push(`UPDATE indicateur set id_question = 462 WHERE id = 64`);
    sql.push(`UPDATE indicateur set id_question = 462 WHERE id = 65`);
    sql.push(`UPDATE indicateur set id_question = 475 WHERE id = 66`);
    sql.push(`UPDATE indicateur set id_question = 462 WHERE id = 67`);
    sql.push(`UPDATE indicateur set id_question = 462 WHERE id = 68`);
    sql.push(`UPDATE indicateur set id_question = 516 WHERE id = 69`);
    sql.push(`UPDATE indicateur set id_question = 507 WHERE id = 70`);
    sql.push(`UPDATE indicateur set id_question = 489 WHERE id = 71`);
    sql.push(`UPDATE indicateur set id_question = 510 WHERE id = 72`);
    sql.push(`UPDATE indicateur set id_question = 310 WHERE id = 73`);
    sql.push(`UPDATE indicateur set id_question = 543 WHERE id = 74`);
    sql.push(`UPDATE indicateur set id_question = 543 WHERE id = 75`);
    sql.push(`UPDATE indicateur set id_question = 543 WHERE id = 76`);
    sql.push(`UPDATE indicateur set id_question = 543 WHERE id = 77`);
    sql.push(`UPDATE indicateur set id_question = 561 WHERE id = 78`);
    sql.push(`UPDATE indicateur set id_question = 578 WHERE id = 79`);
    sql.push(`UPDATE indicateur set id_question = 578 WHERE id = 80`);
    sql.push(`UPDATE indicateur set id_question = 598 WHERE id = 81`);
    sql.push(`UPDATE indicateur set id_question = 601 WHERE id = 82`);
    sql.push(`UPDATE indicateur set id_question = 592 WHERE id = 83`);
    sql.push(`UPDATE indicateur set id_question = 592 WHERE id = 84`);
    sql.push(`UPDATE indicateur set id_question = 609 WHERE id = 85`);
    sql.push(`UPDATE indicateur set id_question = 592 WHERE id = 87`);

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
