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
    (3,"Aires protégées (AP)","Tous"),
    (4,"Biodiversité","Tous"),
    (5,"Cadre national et international (juridique, technique/stratégique, institutionnel)","Tous"),
    (6,"Changement Climatique et REDD+ (Centrale)","Centrale"),
    (7,"Changement Climatique et REDD+ (Region)","Tous"),
    (8,"Contrôles environnementaux","Tous"),
    (9,"Contrôles forestiers","Tous"),
    (10,"Corruption","Tous"),
    (11,"Développement durable (économie, sociale, environnement, culture)","Tous"),
    (12,"Economie verte","Tous"),
    (13,"Environnement (pollution, évaluation environnementale, gouvernance)","Tous"),
    (14,"Feux ","Tous"),
    (15,"Informations, éducation, communication (IEC)","Tous"),
    (16,"Logistique (Infrastructure)","Tous"),
    (17,"Logistique (Matériel de transport)","Tous"),
    (18,"Logistique (Matériel informatique)","Tous"),
    (19,"Logistique (Matériel mobilier)","Tous"),
    (20,"Logistique (Matériel technique)","Tous"),
    (21,"Mobilisation de fonds","Tous"),
    (22,"Outils (guide, manuel)","Tous"),
    (23,"Paiement des services environnementaux (PSE)","Tous"),
    (24,"Partenariat","Tous"),
    (25,"Pépinière","Tous"),
    (26,"Planification, programmation, suivi-évaluation et SI","Tous"),
    (27,"Reboisement et gestion des terres","Tous"),
    (28,"Recette","Tous"),
    (29,"Recherche et développement","Tous"),
    (30,"Responsabilité Sociétale des Entreprises (RSE : reboisements, éducation environnementale, ...)","Tous"),
    (31,"Ressources humaines","Tous"),
    (32,"Transfert de gestion","Tous")`);

    // Set values to indicateur
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
      (1,"Quantité de produit déclaré","",1,1,0,0),
      (2,"Nombre d'autorisation de recherche délivrée","",2,0,0,1),
      (3,"Superficie des Aires protégées","",3,1,0,0),
      (4,"Nombre AP ayant un gestionnaire","",3,0,0,1),
      (5,"Nombre de ménages bénéficiant des activités de conservations/développement (AGR)","",3,1,0,0),
      (6,"Nombre d'activités réalisées dans les PAG","",3,1,0,0),
      (7,"Superficie Aire protégée restaurée","",3,1,0,0),
      (8,"Espèces objet de trafic illicite","",4,0,0,1),
      (9,"Nombre de textes élaborés","",5,0,0,1),
      (10,"Nombre de textes mis à jour","",5,0,0,1),
      (11,"Nombre de conventions ratifiées","",5,0,0,1),
      (12,"Nombre de textes adoptés","",5,0,0,1),
      (13,"Nombre de cadres validés","",5,0,0,1),
      (14,"Nombre d'infrastructures touchées par les catastrophes naturelles","",7,0,0,1),
      (15,"Coût estimatif des réparations (Ariary)","",7,1,0,0),
      (16,"Nombre de ménages bénéficiaires d'action de lutte contre le changement climatique","",6,1,0,0),
      (17,"Superficie de puit de carbone géré durablement","",6,1,0,0),
      (18,"Contrôles environnementaux effectués","",8,0,0,1),
      (19,"Nombre d'infractions environnementales constatées","",8,1,0,0),
      (20,"Nombre de dossiers d'infractions environnementales traités","",8,1,0,0),
      (21,"Nombre de plaintes environnementales reçues","",8,1,0,0),
      (22,"Nombre de plaintes environnementales traitées","",8,1,0,0),
      (23,"Nombre de contrôles forestiers effectués","",9,0,0,1),
      (24,"Nombre d'infractions forestières constatées","",9,1,0,0),
      (25,"Nombre de dossiers d'infractions forestières traités","",9,1,0,0),
      (26,"Nombre d'infractions forestiers déférées","",9,1,0,0),
      (27,"Nombre de cas de transaction avant jugement","",9,1,0,0),
      (28,"Quantité de produits saisis","",9,1,0,0),
      (29,"Nombre de doléances sur la corruption reçues","",10,0,0,1),
      (30,"Doléances sur la corruption traitées","",10,0,0,1),
      (31,"Politiques sectorielles alignées au DD","",11,0,0,1),
      (32,"Nombre de promoteur ayant un label de DD","",11,1,0,0),
      (33,"Certifications vertes promues par chaîne de valeurs liées aux ressources naturelles","",12,0,0,1),
      (34,"Nombre d'emplois verts décents créés","",12,1,0,0),
      (35,"Promotion d'alternative écologique","",12,0,0,1),
      (36,"Mise en conformité, permis et/ou autorisation environnementale (PREE), permis environnementaux délivrés","",13,0,0,1),
      (37,"Nombre d'infrastructures de gestion de déchets créées","",13,0,0,1),
      (38,"Surfaces brûlées","",14,1,0,0),
      (39,"Longueur totale de pare-feu","",14,1,0,0),
      (40,"Structures opérationnelles de gestion des feux","",14,0,0,1),
      (41,"Structures de gestion des feux","",14,0,0,1),
      (42,"Système d'alerte de feux","",14,0,0,1),
      (43,"Nombre d'IEC effectuées","",15,0,0,1),
      (44,"Nombre de participants formés","",15,1,0,0),
      (45,"Nombre d'agents de l'administration formés","",15,1,0,0),
      (46,"Nombre de séance de formation","",15,1,0,0),
      (47,"Nombre d'infrastructures","",16,0,0,1),
      (48,"Nombre d'infrastructures","",16,0,0,1),
      (49,"Nombre de matériel de transport","",17,0,0,1),
      (50,"Nombre de matériel informatique","",18,1,0,0),
      (51,"Nombre de matériel technique","",20,1,0,0),
      (52,"Nombre de matériel mobilier","",19,1,0,0),
      (53,"Montant du fond public mobilisé","",21,1,0,0),
      (54,"Montant du financement extérieur ou privé mobilisé","",21,1,0,0),
      (55,"Montant des dons mobilisés","",21,1,0,0),
      (56,"Montant de prêts mobilisés","",21,1,0,0),
      (57,"Nombre d'outils disponibles et utilisés","",22,1,0,0),
      (58,"Nombre d'activités PSE développées","",23,0,0,1),
      (59,"Nombre de ménages bénéficiaires des activités de PSE","",23,1,0,0),
      (60,"Nombre de conventions de partenariat développées et signées","",24,0,0,1),
      (61,"Projets issus des partenariats","",24,0,0,1),
      (62,"Nombre de plants produits","",25,1,0,0),
      (63,"Projets qui ont fait l'objet de planification","",26,0,0,1),
      (64,"Projets qui ont fait l'objet de suivi","",26,0,0,1),
      (65,"Projets qui ont fait l'objet d'évaluation","",26,0,0,1),
      (66,"Nombre de programmation éffectuée","",26,1,0,0),
      (67,"Base de données mise en place","",26,0,0,1),
      (68,"Système d'information opérationnel","",26,0,0,1),
      (69,"Superficie reboisée","",27,1,0,0),
      (70,"Superficie restaurée","",27,1,0,0),
      (71,"Superficie des dunes stabilisées","",27,1,0,0),
      (72,"Nombre de plants mis en terre","",27,1,0,0),
      (73,"Recettes perçues (Ar)","",28,1,0,0),
      (74,"Nombre de recherches effectuées","",29,0,0,1),
      (75,"Résultats de recherches disponibles","",29,0,0,1),
      (76,"Résultats de recherches appliqués","",29,0,0,1),
      (77,"Produits de recherche diffusés, vulgarisés, promus","",29,0,0,1),
      (78,"Nombre de projets développés dans le cadre de RSE","",30,0,0,1),
      (79,"Nombre de poste","",31,0,0,1),
      (80,"Nombre de personnel","",31,0,0,1),
      (81,"Superficie de TG nouvellement créé","",32,1,0,0),
      (82,"Superficie de TG renouvelé","",32,1,0,0),
      (83,"TG suivi","",32,0,0,1),
      (84,"TG évalué","",32,0,0,1),
      (85,"Nombre de ménages bénéficiaires de TG","",32,1,0,0),
      (87,"Association (COBA/VOI) soutenue","",32,0,0,1)`
    );

    // Set values to question
    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
        (1,"Source de données actes administratifs exploitation",1,1,3,1,NULL,NULL,NULL,"Source de données actes administratifs exploitation",""),
        (2,"Commune d'intervention pour les actes (<<Toutes>> si niveau national)",0,1,3,1,NULL,1,NULL,"Commune d'intervention pour les actes (<<Toutes>> si niveau national)",""),
        (3,"Type d'actes administratrifs (permis de coupe, autorisation de coupe, permis d'exploitation, convention de collecte PFNL, autorisation d'exportation)",0,1,3,1,NULL,1,NULL,"Type d'actes administratrifs (permis de coupe, autorisation de coupe, permis d'exploitation, convention de collecte PFNL, autorisation d'exportation)",""),
        (4,"Référence de l'acte administratif",0,1,3,1,NULL,1,NULL,"Référence de l'acte administratif",""),
        (5,"Types de produits inscrits dans l'acte administratif (Anacarde (kg), Baie rose (kg), Bois COS (m³), Bois de chauffe (stère), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",0,1,3,1,1,1,NULL,"Types de produits inscrits dans l'acte administratif (Anacarde (kg), Baie rose (kg), Bois COS (m³), Bois de chauffe (stère), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",""),
        (6,"Espèces concernées par l'acte administratif",0,1,3,1,NULL,1,NULL,"Espèces concernées par l'acte administratif",""),
        (7,"Quantité totale des produits inscrits dans l'acte administratif",0,1,3,1,NULL,1,NULL,"Quantité totale des produits inscrits dans l'acte administratif",""),
        (8,"Quantité des produits exportés inscrits dans l'acte administratif",0,1,3,1,NULL,1,NULL,"Quantité des produits exportés inscrits dans l'acte administratif",""),
        (9,"Destination des produits inscrits dans l'acte administratif (autoconsommation/marché local/marché national/exportation)",0,1,3,1,NULL,1,NULL,"Destination des produits inscrits dans l'acte administratif (autoconsommation/marché local/marché national/exportation)",""),
        (10,"Existence d'autorisation de transport octroyée (oui/non)",0,1,3,1,NULL,1,NULL,"Existence d'autorisation de transport octroyée (oui/non)",""),
        (11,"Référence d'autorisation de transport",0,1,3,0,NULL,1,NULL,"Référence d'autorisation de transport",""),
        (12,"Existence de laissez-passer délivré (oui/non)",0,1,3,1,NULL,1,NULL,"Existence de laissez-passer délivré (oui/non)",""),
        (13,"Référence de laissez-passer",0,1,3,0,NULL,1,NULL,"Référence de laissez-passer",""),
        (14,"Nom de l'opérateur",0,1,3,0,NULL,1,NULL,"Nom de l'opérateur",""),
        (15,"Exportateur agréé (oui/non)",0,1,3,0,NULL,1,NULL,"Exportateur agréé (oui/non)",""),
        (16,"Valeur des produits à l'exportation (Ariary)",0,1,3,0,NULL,1,NULL,"Valeur des produits à l'exportation (Ariary)",""),
        (17,"Observations actes administratifs exploitation",0,1,3,0,NULL,1,NULL,"Observations actes administratifs exploitation",""),
        (800,"Fichiers (exploitation) (.zip à importer)",0,1,3,0,NULL,1,NULL,"Fichiers (exploitation) (.zip à importer)",""),
                                                              
                                                              
                                                              
                                                              
        (19,"Source de données actes administratifs recherche",1,1,3,1,NULL,NULL,NULL,"Source de données actes administratifs recherche",""),
        (20,"Autorisation de recherche délivrée (oui/non)",0,1,3,1,2,19,NULL,"Autorisation de recherche délivrée (oui/non)",""),
        (21,"Référence d'autorisation de recherche",0,1,3,0,NULL,19,NULL,"Référence d'autorisation de recherche",""),
        (22,"Produits associés (faune ou flore)",0,1,3,1,NULL,19,NULL,"Produits associés (faune ou flore)",""),
        (23,"Espèces mises en jeu",0,1,3,0,NULL,19,NULL,"Espèces mises en jeu",""),
        (24,"Quotas de prélèvement",0,1,3,0,NULL,19,NULL,"Quotas de prélèvement",""),
        (25,"Observations actes administratifs recherche",0,1,3,0,NULL,19,NULL,"Observations actes administratifs recherche",""),
        (801,"Fichiers (recherche) (.zip à importer)",0,1,3,0,NULL,19,NULL,"Fichiers (recherche) (.zip à importer)",""),
                                                              
                                                              
                                                              
        (26,"Source de données AP",1,1,3,1,NULL,NULL,NULL,"Source de données AP",""),
        (27,"Nom de l'AP",0,1,3,1,NULL,26,NULL,"Nom de l'AP",""),
        (28,"Catégorie de l'AP (I, II, III, IV, V, VI, Autre)",0,1,3,1,NULL,26,NULL,"Catégorie de l'AP (I, II, III, IV, V, VI, Autre)",""),
        (29,"Statut temporaire ou définitif",0,1,3,1,NULL,26,NULL,"Statut temporaire ou définitif",""),
        (30,"Décret si définitif",0,1,3,0,NULL,26,NULL,"Décret si définitif",""),
        (31,"Geojson de l'AP",0,1,3,0,NULL,26,NULL,"Geojson de l'AP",""),
        (32,"Type : terrestre ou marine",0,1,3,1,3,26,NULL,"Type : terrestre ou marine",""),
        (33,"Présence de zones humides (oui/non)",0,1,3,1,NULL,26,NULL,"Présence de zones humides (oui/non)",""),
        (34,"Superficie zones humides (ha)",0,1,3,1,NULL,26,NULL,"Superficie zones humides (ha)",""),
        (35,"Existence de gestionnaire (oui/non)",0,1,3,1,NULL,26,NULL,"Existence de gestionnaire (oui/non)",""),
        (36,"Nom du gestionnaire",0,1,3,0,NULL,26,NULL,"Nom du gestionnaire",""),
        (37,"Nombre de ménages bénéficiant des activités de conservations/développement (AGR)",0,1,3,1,NULL,26,NULL,"Nombre de ménages bénéficiant des activités de conservations/développement (AGR)",""),
        (38,"Existence de PAG élaboré (oui/non)",0,1,3,1,NULL,26,NULL,"Existence de PAG élaboré (oui/non)",""),
        (39,"Nombre d'activités dans le PAG",0,1,3,1,NULL,26,NULL,"Nombre d'activités dans le PAG",""),
        (40,"Nombre d'activités réalisées dans le PAG",0,1,3,1,NULL,26,NULL,"Nombre d'activités réalisées dans le PAG",""),
        (41,"Existence de PGES élaboré (oui/non)",0,1,3,0,NULL,26,NULL,"Existence de PGES élaboré (oui/non)",""),
        (42,"Existence de EIE réalisé (oui/non)",0,1,3,0,NULL,26,NULL,"Existence de EIE réalisé (oui/non)",""),
        (43,"Existence de permis environnemental délivré (oui/non)",0,1,3,0,NULL,26,NULL,"Existence de permis environnemental délivré (oui/non)",""),
        (44,"AP redélimitée (oui/non)",0,1,3,0,NULL,26,NULL,"AP redélimitée (oui/non)",""),
        (45,"Superficie de l'AP (ha)",0,1,3,1,NULL,26,NULL,"Superficie de l'AP (ha)",""),
        (46,"Superficie restaurée dans l'AP (ha)",0,1,3,1,NULL,26,NULL,"Superficie restaurée dans l'AP (ha)",""),
        (47,"Contrat de délégation de gestion signé (oui/non)",0,1,3,0,NULL,26,NULL,"Contrat de délégation de gestion signé (oui/non)",""),
        (48,"AP disposant de structures opérationnelles de gestion (oui/non)",0,1,3,0,4,26,NULL,"AP disposant de structures opérationnelles de gestion (oui/non)",""),
        (49,"AP dont la création et la gestion sont appuyées (oui/non)",0,1,3,0,NULL,26,NULL,"AP dont la création et la gestion sont appuyées (oui/non)",""),
        (50,"Type d'appui pour l'AP (dotation matériels, formation, AGR, …)",0,1,3,0,NULL,26,NULL,"Type d'appui pour l'AP (dotation matériels, formation, AGR, …)",""),
        (51,"Source de financement de l'AP (interne ou externe)",0,1,3,1,NULL,26,NULL,"Source de financement de l'AP (interne ou externe)",""),
        (52,"Projet d'appui de l'AP (si externe)",0,1,3,0,NULL,26,NULL,"Projet d'appui de l'AP (si externe)",""),
        (53,"Identifiant du projet d'appui de l'AP",0,1,3,0,NULL,26,NULL,"Identifiant du projet d'appui de l'AP",""),
        (54,"AP dotée d'un système de gestion administrative et financière (oui/non)",0,1,3,0,NULL,26,NULL,"AP dotée d'un système de gestion administrative et financière (oui/non)",""),
        (55,"AP dotée d'un système de suivi écologique opérationnel (oui/non)",0,1,3,0,NULL,26,NULL,"AP dotée d'un système de suivi écologique opérationnel (oui/non)",""),
        (56,"AP disposant d'un résultat de suivi écologique (oui/non)",0,1,3,0,NULL,26,NULL,"AP disposant d'un résultat de suivi écologique (oui/non)",""),
        (57,"AP dotée de système de gestion des feux (oui/non)",0,1,3,0,NULL,26,NULL,"AP dotée de système de gestion des feux (oui/non)",""),
        (58,"AP dotée d'un système de surveillance et de contrôle opérationnel (oui/non)",0,1,3,0,NULL,26,NULL,"AP dotée d'un système de surveillance et de contrôle opérationnel (oui/non)",""),
        (59,"AP avec maintenance/entretien des infrastructures de conservation assurés (oui/non)",0,1,3,0,NULL,26,NULL,"AP avec maintenance/entretien des infrastructures de conservation assurés (oui/non)",""),
        (60,"AP dotée d'infrastructures écotouristiques (oui/non)",0,1,3,0,NULL,26,NULL,"AP dotée d'infrastructures écotouristiques (oui/non)",""),
        (61,"AP avec maintenance et entretien des infrastructures écotouristiques et de service assurés (oui/non)",0,1,3,0,NULL,26,NULL,"AP avec maintenance et entretien des infrastructures écotouristiques et de service assurés (oui/non)",""),
        (62,"AP faisant objet d'un zonage matérialisé (oui/non)",0,1,3,0,NULL,26,NULL,"AP faisant objet d'un zonage matérialisé (oui/non)",""),
        (63,"AP mettant en œuvre dans leurs ZP des programmes spécifiques d'éducation environnementale (oui/non)",0,1,3,0,NULL,26,NULL,"AP mettant en œuvre dans leurs ZP des programmes spécifiques d'éducation environnementale (oui/non)",""),
        (64,"AP faisant objet de restauration d’habitats (oui/non)",0,1,3,0,NULL,26,NULL,"AP faisant objet de restauration d’habitats (oui/non)",""),
        (65,"Indice d'efficacité globale de gestion de l'AP",0,1,3,1,NULL,26,NULL,"Indice d'efficacité globale de gestion de l'AP",""),
        (66,"Liste des menaces et pressions recensées",0,1,3,0,NULL,26,NULL,"Liste des menaces et pressions recensées",""),
        (67,"Taux de réduction des menaces au niveau de l'AP (%)",0,1,3,0,NULL,26,NULL,"Taux de réduction des menaces au niveau de l'AP (%)",""),
        (68,"Taux de déforestation annuelle (%)",0,1,3,0,NULL,26,NULL,"Taux de déforestation annuelle (%)",""),
        (69,"Nom de sites hors AP disposant de plan d'aménagement et de gestion écotouristique opérationnel (liste)",0,1,3,0,NULL,26,NULL,"Nom de sites hors AP disposant de plan d'aménagement et de gestion écotouristique opérationnel (liste)",""),
        (70,"Observations AP",0,1,3,0,NULL,26,NULL,"Observations AP",""),
        (802,"Fichiers (ap) (.zip à importer)",0,1,3,0,NULL,26,NULL,"Fichiers (ap) (.zip à importer)",""),
                                                              
                                                              
        (71,"Source de données biodiversité",1,1,3,1,NULL,NULL,NULL,"Source de données biodiversité",""),
        (72,"Espèce inventoriée",0,1,3,1,NULL,71,NULL,"Espèce inventoriée",""),
        (73,"Nom vernaculaire",0,1,3,1,NULL,71,NULL,"Nom vernaculaire",""),
        (74,"Commune d'intervention pour l'inventaire",0,1,3,1,NULL,71,NULL,"Commune d'intervention pour l'inventaire",""),
        (75,"Longitude (degré décimal) : X",0,1,3,1,NULL,71,NULL,"Longitude (degré décimal) : X",""),
        (76,"Latitude (degré décimal) : Y",0,1,3,1,NULL,71,NULL,"Latitude (degré décimal) : Y",""),
        (77,"Geojson correspondant biodiversité",0,1,3,0,NULL,71,NULL,"Geojson correspondant biodiversité",""),
        (78,"Statut UICN",0,1,3,0,NULL,71,NULL,"Statut UICN",""),
        (79,"Endémique (oui/non)",0,1,3,0,NULL,71,NULL,"Endémique (oui/non)",""),
        (80,"Ressource phare (oui/non)",0,1,3,0,NULL,71,NULL,"Ressource phare (oui/non)",""),
        (81,"Ressource menacée (oui/non)",0,1,3,0,NULL,71,NULL,"Ressource menacée (oui/non)",""),
        (82,"Cible de conservation (oui/non)",0,1,3,0,NULL,71,NULL,"Cible de conservation (oui/non)",""),
        (83,"Nom de l'AP de provenance de la ressource",0,1,3,0,NULL,71,NULL,"Nom de l'AP de provenance de la ressource",""),
        (84,"Liste des menaces et pressions recensées",0,1,3,0,NULL,71,NULL,"Liste des menaces et pressions recensées",""),
        (85,"Liste PFL associés",0,1,3,0,NULL,71,NULL,"Liste PFL associés",""),
        (86,"PFL inscrit dans CITES (oui/non)",0,1,3,0,NULL,71,NULL,"PFL inscrit dans CITES (oui/non)",""),
        (87,"Liste PFNL associés",0,1,3,0,NULL,71,NULL,"Liste PFNL associés",""),
        (88,"PFNL inscrit dans CITES (oui/non)",0,1,3,0,NULL,71,NULL,"PFNL inscrit dans CITES (oui/non)",""),
        (89,"Existence de filière concernant la ressource/biodiversité (oui/non)",0,1,3,0,NULL,71,NULL,"Existence de filière concernant la ressource/biodiversité (oui/non)",""),
        (90,"Appui financier et/ou technique de la filière (oui/non)",0,1,3,0,NULL,71,NULL,"Appui financier et/ou technique de la filière (oui/non)",""),
        (91,"Source de financement de l'inventaire de biodiversité (interne ou externe)",0,1,3,1,NULL,71,NULL,"Source de financement de l'inventaire de biodiversité (interne ou externe)",""),
        (92,"Projet d'appui pour l'inventaire de biodiversité (si externe)",0,1,3,0,NULL,71,NULL,"Projet d'appui pour l'inventaire de biodiversité (si externe)",""),
        (93,"Identifiant du projet d'appui pour la biodiversité",0,1,3,0,NULL,71,NULL,"Identifiant du projet d'appui pour la biodiversité",""),
        (94,"Espèce objet de trafic illicite (oui/non)",0,1,3,1,8,71,NULL,"Espèce objet de trafic illicite (oui/non)",""),
        (95,"Date de constat",0,1,3,0,NULL,71,NULL,"Date de constat",""),
        (96,"Quantité saisie",0,1,3,0,NULL,71,NULL,"Quantité saisie",""),
        (97,"Unité de mesure des effets saisies",0,1,3,0,NULL,71,NULL,"Unité de mesure des effets saisies",""),
        (98,"Dossier de traffic traité (oui/non)",0,1,3,0,NULL,71,NULL,"Dossier de traffic traité (oui/non)",""),
        (99,"Référence du dossier",0,1,3,0,NULL,71,NULL,"Référence du dossier",""),
        (100,"Images de la biodiversité",0,1,3,0,NULL,71,NULL,"Images de la biodiversité",""),
        (101,"Observations biodiversité",0,1,3,0,NULL,71,NULL,"Observations biodiversité",""),
        (803,"Fichiers (biodiversité) (.zip à importer)",0,1,3,0,NULL,71,NULL,"Fichiers (biodiversité) (.zip à importer)",""),
                                                              
                                                              
                                                              
        (102,"Source de données cadre",1,1,3,1,NULL,NULL,NULL,"Source de données cadre",""),
        (103,"Intitulé du cadre avec référence",0,1,3,1,NULL,102,NULL,"Intitulé du cadre avec référence",""),
        (104,"Type (Convention, Loi, Décret, Arrêté, Circulaire, Stratégie, Manuel de procédure)",0,1,3,1,NULL,102,NULL,"Type (Convention, Loi, Décret, Arrêté, Circulaire, Stratégie, Manuel de procédure)",""),
        (105,"Cadre juridique ou technique ou réglementaire",0,1,3,1,NULL,102,NULL,"Cadre juridique ou technique ou réglementaire",""),
        (106,"Thématique",0,1,3,1,NULL,102,NULL,"Thématique",""),
        (107,"Objectifs du cadre",0,1,3,1,NULL,102,NULL,"Objectifs du cadre",""),
        (108,"Cadre validé (oui/non)",0,1,3,1,13,102,NULL,"Cadre validé (oui/non)",""),
        (109,"Date de validation",0,1,3,0,NULL,102,NULL,"Date de validation",""),
        (110,"Secteur concerné par le cadre",0,1,3,1,NULL,102,NULL,"Secteur concerné par le cadre",""),
        (111,"Nouveau (oui/non)",0,1,3,1,NULL,102,NULL,"Nouveau (oui/non)",""),
        (112,"Mis à jour (oui/non)",0,1,3,1,10,102,NULL,"Mis à jour (oui/non)",""),
        (113,"Ratifié (oui/non)",0,1,3,1,11,102,NULL,"Ratifié (oui/non)",""),
        (114,"Adopté (oui/non)",0,1,3,1,12,102,NULL,"Adopté (oui/non)",""),
        (115,"Date de promulgation",0,1,3,0,NULL,102,NULL,"Date de promulgation",""),
        (116,"Intégrant la cohérence intersectorielle sur la gestion environnementale et climatique (oui/non)",0,1,3,0,NULL,102,NULL,"Intégrant la cohérence intersectorielle sur la gestion environnementale et climatique (oui/non)",""),
        (117,"Textes d'application (liste)",0,1,3,0,NULL,102,NULL,"Textes d'application (liste)",""),
        (118,"Identifiant du projet d'appui pour le cadre",0,1,3,0,NULL,102,NULL,"Identifiant du projet d'appui pour le cadre",""),
        (119,"Fichiers (cadre) (.zip à importer)",0,1,3,0,NULL,102,NULL,"Fichiers (cadre) (.zip à importer)",""),
        (120,"Observations cadre",0,1,3,0,NULL,102,NULL,"Observations cadre",""),
                                                              
                                                              
                                                              
        (121,"Source de données CC et REDD+",1,1,3,1,NULL,NULL,NULL,"Source de données CC et REDD+",""),
        (122,"Nature des catastrophes naturelles",0,1,3,1,NULL,120,NULL,"Nature des catastrophes naturelles",""),
        (123,"Date de la catastrophe naturelle",0,1,3,0,NULL,120,NULL,"Date de la catastrophe naturelle",""),
        (124,"Type d'infrastructures touchées par les catastrophes naturelles (bâtiment, pépinière, forêts)",0,1,3,1,14,120,NULL,"Type d'infrastructures touchées par les catastrophes naturelles (bâtiment, pépinière, forêts)",""),
        (125,"Coût estimatif des réparations (Ariary)",0,1,3,1,NULL,120,NULL,"Coût estimatif des réparations (Ariary)",""),
        (126,"Ampleur des dommages matériels dus aux catastrophes naturelles (faible, moyen, fort)",0,1,3,0,NULL,120,NULL,"Ampleur des dommages matériels dus aux catastrophes naturelles (faible, moyen, fort)",""),
        (127,"Identifiant du projet d'appui pour la lutte contre le CC et REDD+",0,1,3,0,NULL,120,NULL,"Identifiant du projet d'appui pour la lutte contre le CC et REDD+",""),
        (128,"Observations CC et REDD+",0,1,3,0,NULL,120,NULL,"Observations CC et REDD+",""),
        (805,"Fichiers (CC et REDD+) (.zip à importer)",0,1,3,0,NULL,121,NULL,"Fichiers (CC et REDD+) (.zip à importer)",""),
                                                              
                                                              
        (129,"Source de données CC et REDD+ (centrale)",1,1,3,1,NULL,NULL,NULL,"Source de données CC et REDD+ (centrale)",""),
        (130,"Nom de projet d'adaptation, atténuation et résilience au changement climatique et REDD+",0,1,3,0,NULL,129,NULL,"Nom de projet d'adaptation, atténuation et résilience au changement climatique et REDD+",""),
        (131,"Plan et projet mis en œuvre (oui/non)",0,1,3,0,NULL,129,NULL,"Plan et projet mis en œuvre (oui/non)",""),
        (132,"Activités sectorielles ou projets intégrant le climat et le changement climatique (liste)",0,1,3,0,NULL,129,NULL,"Activités sectorielles ou projets intégrant le climat et le changement climatique (liste)",""),
        (133,"Stations climatologiques participant à la veille climatique et agrométéorologique (liste)",0,1,3,0,NULL,129,NULL,"Stations climatologiques participant à la veille climatique et agrométéorologique (liste)",""),
        (134,"Action de lutte contre le changement climatique intégrée dans la promotion d'une économie résiliente (liste)",0,1,3,0,NULL,129,NULL,"Action de lutte contre le changement climatique intégrée dans la promotion d'une économie résiliente (liste)",""),
        (135,"Commune d'intervention pour la lutte contre CC (<<Toutes>> si niveau national)",0,1,3,1,NULL,129,NULL,"Commune d'intervention pour la lutte contre CC (<<Toutes>> si niveau national)",""),
        (136,"Nombre de ménages bénéficiaires pour la lutte contre CC",0,1,3,1,NULL,129,NULL,"Nombre de ménages bénéficiaires pour la lutte contre CC",""),
        (137,"Nombre d'hommes bénéficiaires pour la lutte contre CC",0,1,3,0,NULL,129,NULL,"Nombre d'hommes bénéficiaires pour la lutte contre CC",""),
        (138,"Nombre de femmes bénéficiaires pour la lutte contre CC",0,1,3,0,NULL,129,NULL,"Nombre de femmes bénéficiaires pour la lutte contre CC",""),
        (139,"Nombre de femmes chef de ménage bénéficiaires pour la lutte contre CC",0,1,3,0,NULL,129,NULL,"Nombre de femmes chef de ménage bénéficiaires pour la lutte contre CC",""),
        (140,"Nombre de jeunes bénéficiaires pour la lutte contre CC",0,1,3,0,NULL,129,NULL,"Nombre de jeunes bénéficiaires pour la lutte contre CC",""),
        (141,"Source de financement pour la lutte contre CC (interne ou externe)",0,1,3,1,NULL,129,NULL,"Source de financement pour la lutte contre CC (interne ou externe)",""),
        (142,"Projet d'appui pour la lutte contre CC (si externe)",0,1,3,0,NULL,129,NULL,"Projet d'appui pour la lutte contre CC (si externe)",""),
        (143,"Identifiant du projet d'appui pour la lutte contre le CC et REDD+ (centrale)",0,1,3,0,NULL,129,NULL,"Identifiant du projet d'appui pour la lutte contre le CC et REDD+ (centrale)",""),
        (144,"Surface de forêts gérées dans le cadre du CC et REDD+ (ha)",0,1,3,1,NULL,129,NULL,"Surface de forêts gérées dans le cadre du CC et REDD+ (ha)",""),
        (145,"Geojson correspondant CC et REDD+",0,1,3,0,NULL,129,NULL,"Geojson correspondant CC et REDD+",""),
        (146,"Taux d'emission de CO2 (%)",0,1,3,0,NULL,129,NULL,"Taux d'emission de CO2 (%)",""),
        (147,"Observations CC et REDD+ (centrale)",0,1,3,0,NULL,129,NULL,"Observations CC et REDD+ (centrale)",""),
        (806,"Fichiers (CC, REDD+) (.zip à importer)",0,1,3,0,NULL,129,NULL,"Fichiers (CC, REDD+) (.zip à importer)",""),
                                                              
                                                              
        (148,"Source de données contrôles environnementaux",1,1,3,1,NULL,NULL,NULL,"Source de données contrôles environnementaux",""),
        (149,"Intitulé de la mission de contrôle environnemental",0,1,3,1,NULL,148,NULL,"Intitulé de la mission de contrôle environnemental",""),
        (150,"Date de la mission de contrôle environnemental",0,1,3,0,17,148,NULL,"Date de la mission de contrôle environnemental",""),
        (151,"Mission de contrôle environnemental effectuée ou réalisée (oui/non)",0,1,3,1,18,148,NULL,"Mission de contrôle environnemental effectuée ou réalisée (oui/non)",""),
        (152,"Commune de réalisation du contrôle environnemental",0,1,3,1,NULL,148,NULL,"Commune de réalisation du contrôle environnemental",""),
        (153,"Nombre d'infraction environnementale",0,1,3,1,NULL,148,NULL,"Nombre d'infraction environnementale",""),
        (154,"Nature de l'infraction environnementale",0,1,3,0,NULL,148,NULL,"Nature de l'infraction environnementale",""),
        (155,"Motif de PV d'infraction environnementale établi (constat)",0,1,3,0,NULL,148,NULL,"Motif de PV d'infraction environnementale établi (constat)",""),
        (156,"Référence de dossiers d'infractions environnementales",0,1,3,1,NULL,148,NULL,"Référence de dossiers d'infractions environnementales",""),
        (157,"Nombre de dossier d'infractions environnementales traité",0,1,3,1,NULL,148,NULL,"Nombre de dossier d'infractions environnementales traité",""),
        (158,"Existence de dispositifs de contrôle environnemental de proximité (oui/non)",0,1,3,0,NULL,148,NULL,"Existence de dispositifs de contrôle environnemental de proximité (oui/non)",""),
        (159,"Dispositifs de contrôle redynamisés (oui/non)",0,1,3,0,NULL,148,NULL,"Dispositifs de contrôle redynamisés (oui/non)",""),
        (160,"Nombre de plaintes environnementales reçues",0,1,3,1,NULL,148,NULL,"Nombre de plaintes environnementales reçues",""),
        (161,"Intitulé de plaintes environnementales déposées avec référence (liste)",0,1,3,0,NULL,148,NULL,"Intitulé de plaintes environnementales déposées avec référence (liste)",""),
        (162,"Date de déposition des plainte",0,1,3,0,NULL,148,NULL,"Date de déposition des plainte",""),
        (163,"Nombre de plaintes environnementales traitées",0,1,3,1,NULL,148,NULL,"Nombre de plaintes environnementales traitées",""),
        (164,"Secteur concerné (Agriculture, Industrie, Service)",0,1,3,1,22,148,NULL,"Secteur concerné (Agriculture, Industrie, Service)",""),
        (165,"Date de début de traitement",0,1,3,0,NULL,148,NULL,"Date de début de traitement",""),
        (166,"Nombre de plaintes environnementales résolues",0,1,3,1,NULL,148,NULL,"Nombre de plaintes environnementales résolues",""),
        (167,"Date de résolution des plaintes",0,1,3,0,NULL,148,NULL,"Date de résolution des plaintes",""),
        (168,"Mesures correctives et recommandations",0,1,3,0,NULL,148,NULL,"Mesures correctives et recommandations",""),
        (169,"Identifiant du projet d'appui pour les contrôles environnementaux",0,1,3,0,NULL,148,NULL,"Identifiant du projet d'appui pour les contrôles environnementaux",""),
        (170,"Observations contrôles environnementaux",0,1,3,0,NULL,148,NULL,"Observations contrôles environnementaux",""),
        (807,"Fichiers (contrôle environnementaux) (.zip à importer)",0,1,3,0,NULL,148,NULL,"Fichiers (contrôle environnementaux) (.zip à importer)",""),
                                                              
                                                              
                                                              
        (171,"Source de données contrôles forestiers",1,1,3,1,NULL,NULL,NULL,"Source de données contrôles forestiers",""),
        (172,"Intitulé de la mission de contrôle forestier",0,1,3,1,NULL,171,NULL,"Intitulé de la mission de contrôle forestier",""),
        (173,"Date de la mission de contrôle forestier",0,1,3,0,NULL,171,NULL,"Date de la mission de contrôle forestier",""),
        (174,"Mission de contrôle forestier effectuée ou réalisée (oui/non)",0,1,3,1,23,171,NULL,"Mission de contrôle forestier effectuée ou réalisée (oui/non)",""),
        (175,"Commune de réalisation du contrôle forestier",0,1,3,0,NULL,171,NULL,"Commune de réalisation du contrôle forestier",""),
        (176,"Nombre d'infraction forestière",0,1,3,1,NULL,171,NULL,"Nombre d'infraction forestière",""),
        (177,"Motif du PV d'infraction forestière (constat)",0,1,3,0,NULL,171,NULL,"Motif du PV d'infraction forestière (constat)",""),
        (178,"Intitulé du PV de saisie avec référence",0,1,3,0,NULL,171,NULL,"Intitulé du PV de saisie avec référence",""),
        (179,"Type de produit saisi (PFL, PFNL)",0,1,3,0,NULL,171,NULL,"Type de produit saisi (PFL, PFNL)",""),
        (180,"Nature du produit saisi (brut, fini)",0,1,3,0,NULL,171,NULL,"Nature du produit saisi (brut, fini)",""),
        (181,"Espèce du produit saisi",0,1,3,0,NULL,171,NULL,"Espèce du produit saisi",""),
        (182,"Date de saisi du produit",0,1,3,0,27,171,NULL,"Date de saisi du produit",""),
        (183,"Designation du produit saisi (Anacarde (kg), Baie rose (kg), Bois COS (m³), Bois de chauffe (stère), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",0,1,3,1,NULL,171,NULL,"Designation du produit saisi (Anacarde (kg), Baie rose (kg), Bois COS (m³), Bois de chauffe (stère), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",""),
        (184,"Quantité de produit saisi",0,1,3,1,NULL,171,NULL,"Quantité de produit saisi",""),
        (185,"Date de sequestre",0,1,3,0,NULL,171,NULL,"Date de sequestre",""),
        (186,"Localisation des produits sequestrés (localité)",0,1,3,0,NULL,171,NULL,"Localisation des produits sequestrés (localité)",""),
        (187,"Référence conclusions emis par les représentants ministériels vers le parquet",0,1,3,0,NULL,171,NULL,"Référence conclusions emis par les représentants ministériels vers le parquet",""),
        (188,"Nombre infraction déférée",0,1,3,1,NULL,171,NULL,"Nombre infraction déférée",""),
        (189,"Intitulé du dossier transmis au parquet avec référence (liste)",0,1,3,1,NULL,171,NULL,"Intitulé du dossier transmis au parquet avec référence (liste)",""),
        (190,"Nombre de transaction avant jugement",0,1,3,1,NULL,171,NULL,"Nombre de transaction avant jugement",""),
        (191,"Nature de l'infraction verbalisée",0,1,3,0,NULL,171,NULL,"Nature de l'infraction verbalisée",""),
        (192,"Référence de dossiers d'infractions forestières",0,1,3,1,NULL,171,NULL,"Référence de dossiers d'infractions forestières",""),
        (193,"Nombre de dossier d'infractions forestières traité",0,1,3,1,NULL,171,NULL,"Nombre de dossier d'infractions forestières traité",""),
        (194,"Mesures correctives et recommandations",0,1,3,0,NULL,171,NULL,"Mesures correctives et recommandations",""),
        (195,"Existence de dispositifs de contrôle forestier de proximité (oui/non)",0,1,3,0,NULL,171,NULL,"Existence de dispositifs de contrôle forestier de proximité (oui/non)",""),
        (196,"En cas défrichement, surface defrichée (ha)",0,1,3,0,NULL,171,NULL,"En cas défrichement, surface defrichée (ha)",""),
        (197,"Dispositifs de contrôle redynamisés (oui/non)",0,1,3,0,NULL,171,NULL,"Dispositifs de contrôle redynamisés (oui/non)",""),
        (198,"Identifiant du projet d'appui pour les contrôles forestiers",0,1,3,0,NULL,171,NULL,"Identifiant du projet d'appui pour les contrôles forestiers",""),
        (199,"Observations contrôles forestiers",0,1,3,0,NULL,171,NULL,"Observations contrôles forestiers",""),
        (808,"Fichiers (contrôle forestier) (.zip à importer)",0,1,3,0,NULL,171,NULL,"Fichiers (contrôle forestier) (.zip à importer)",""),
                                                              
                                                              
                                                              
        (200,"Source de données partenariat",1,1,3,1,NULL,NULL,NULL,"Source de données partenariat",""),
        (201,"Nom de la Convention de partenariat élaborée",0,1,3,1,NULL,200,NULL,"Nom de la Convention de partenariat élaborée",""),
        (202,"Type de partenariat (PPP, international, …)",0,1,3,0,NULL,200,NULL,"Type de partenariat (PPP, international, …)",""),
        (203,"Convention de partenariat signée (oui/non)",0,1,3,1,NULL,200,NULL,"Convention de partenariat signée (oui/non)",""),
        (204,"Objet de la convention de partenariat",0,1,3,1,NULL,200,NULL,"Objet de la convention de partenariat",""),
        (205,"Il s'agit de projet (oui/non)",0,1,3,1,61,200,NULL,"Il s'agit de projet (oui/non)",""),
        (206,"si oui, quel/quels projet(s) ?",0,1,3,0,NULL,200,NULL,"si oui, quel/quels projet(s) ?",""),
        (207,"Date d'élaboration de la convention de partenariat",0,1,3,0,NULL,200,NULL,"Date d'élaboration de la convention de partenariat",""),
        (208,"Date de signature de la convention de partenariat",0,1,3,0,NULL,200,NULL,"Date de signature de la convention de partenariat",""),
        (209,"Entités signataires",0,1,3,0,NULL,200,NULL,"Entités signataires",""),
        (210,"Durée de la convention de partenariat",0,1,3,0,NULL,200,NULL,"Durée de la convention de partenariat",""),
        (211,"Cibles de la convention de partenariat",0,1,3,0,NULL,200,NULL,"Cibles de la convention de partenariat",""),
        (212,"Nombre de ménages bénéficiaires dans le cadre du partenariat",0,1,3,0,NULL,200,NULL,"Nombre de ménages bénéficiaires dans le cadre du partenariat",""),
        (213,"Identifiant du projet d'appui pour le partenariat",0,1,3,0,NULL,200,NULL,"Identifiant du projet d'appui pour le partenariat",""),
        (214,"Fichiers (partenariat) (.zip à importer)",0,1,3,0,NULL,200,NULL,"Fichiers (partenariat) (.zip à importer)",""),
        (215,"Observations partenariat",0,1,3,0,NULL,200,NULL,"Observations partenariat",""),
                                                              
                                                              
                                                              
        (216,"Source de données économie verte",1,1,3,1,NULL,NULL,NULL,"Source de données économie verte",""),
        (217,"Commune d'implantation de l'économie verte",0,1,3,1,NULL,216,NULL,"Commune d'implantation de l'économie verte",""),
        (218,"Chaîne de valeur verte promue",0,1,3,1,NULL,216,NULL,"Chaîne de valeur verte promue",""),
        (219,"Ressource naturelle mise en jeu dans la chaîne de valeur",0,1,3,0,NULL,216,NULL,"Ressource naturelle mise en jeu dans la chaîne de valeur",""),
        (220,"Existence de certifications vertes promues par chaîne de valeur liée aux ressources naturelles (oui/non)",0,1,3,1,33,216,NULL,"Existence de certifications vertes promues par chaîne de valeur liée aux ressources naturelles (oui/non)",""),
        (221,"Superficie (ha) des ressources gérées en vue de l’exploitation durable",0,1,3,0,NULL,216,NULL,"Superficie (ha) des ressources gérées en vue de l’exploitation durable",""),
        (222,"Nature du produit (PFNL ou PFL)",0,1,3,0,NULL,216,NULL,"Nature du produit (PFNL ou PFL)",""),
        (223,"Designation du produit brut (Anacarde (kg), Baie rose (kg), Bois COS (m³), Bois de chauffe (stère), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",0,1,3,0,NULL,216,NULL,"Designation du produit brut (Anacarde (kg), Baie rose (kg), Bois COS (m³), Bois de chauffe (stère), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",""),
        (224,"Quantité produit brut",0,1,3,0,NULL,216,NULL,"Quantité produit brut",""),
        (225,"Quantité produit brut vendu",0,1,3,0,NULL,216,NULL,"Quantité produit brut vendu",""),
        (226,"Prix unitaire de vente de produit brut (Ariary)",0,1,3,0,NULL,216,NULL,"Prix unitaire de vente de produit brut (Ariary)",""),
        (227,"Désignation du produit transformé",0,1,3,0,NULL,216,NULL,"Désignation du produit transformé",""),
        (228,"Unité de prosuit transformé",0,1,3,0,NULL,216,NULL,"Unité de prosuit transformé",""),
        (229,"Quantité produit transformé",0,1,3,0,NULL,216,NULL,"Quantité produit transformé",""),
        (230,"Quantité produit transformé vendu",0,1,3,0,NULL,216,NULL,"Quantité produit transformé vendu",""),
        (231,"Prix unitaire de vente de produit transformé (Ariary)",0,1,3,0,NULL,216,NULL,"Prix unitaire de vente de produit transformé (Ariary)",""),
        (232,"Destination des produits (vente locale, exportation, …)",0,1,3,0,NULL,216,NULL,"Destination des produits (vente locale, exportation, …)",""),
        (233,"Nombre de ménages bénéficiaires de la chaîne de valeur",0,1,3,0,NULL,216,NULL,"Nombre de ménages bénéficiaires de la chaîne de valeur",""),
        (234,"Nombre de femmes bénéficiaires de la chaîne de valeur",0,1,3,0,NULL,216,NULL,"Nombre de femmes bénéficiaires de la chaîne de valeur",""),
        (235,"Nombre de jeune bénéficiaires de la chaîne de valeur (15 à 24 ans)",0,1,3,0,NULL,216,NULL,"Nombre de jeune bénéficiaires de la chaîne de valeur (15 à 24 ans)",""),
        (236,"Nombre total de personnes impliquées directement dans la chaîne de valeur",0,1,3,0,NULL,216,NULL,"Nombre total de personnes impliquées directement dans la chaîne de valeur",""),
        (237,"Existence de suivis écologiques (oui/non)",0,1,3,0,NULL,216,NULL,"Existence de suivis écologiques (oui/non)",""),
        (238,"Chaîne de valeur appuyée financièrement et/ou techniquement (oui/non)",0,1,3,0,NULL,216,NULL,"Chaîne de valeur appuyée financièrement et/ou techniquement (oui/non)",""),
        (239,"Organisme d'appui de la chaîne de valeur",0,1,3,1,NULL,216,NULL,"Organisme d'appui de la chaîne de valeur",""),
        (240,"Projet d'appui de la chaîne de valeur",0,1,3,0,NULL,216,NULL,"Projet d'appui de la chaîne de valeur",""),
        (241,"Identifiant du projet d'appui de la chaîne de valeur",0,1,3,0,NULL,216,NULL,"Identifiant du projet d'appui de la chaîne de valeur",""),
        (242,"Nombre d'emplois verts décents créés",0,1,3,1,NULL,216,NULL,"Nombre d'emplois verts décents créés",""),
        (243,"Nombre total d'empoyés recrutés par les emplois verts créés",0,1,3,0,NULL,216,NULL,"Nombre total d'empoyés recrutés par les emplois verts créés",""),
        (244,"Nombre de femme employées dans les emplois verts",0,1,3,0,NULL,216,NULL,"Nombre de femme employées dans les emplois verts",""),
        (245,"Types d'alternatives développées (charbon vert, résidus de culture, gaz butane, ethanol, énergie solaire, biogaz, sac écologique, autres)",0,1,3,1,NULL,216,NULL,"Types d'alternatives développées (charbon vert, résidus de culture, gaz butane, ethanol, énergie solaire, biogaz, sac écologique, autres)",""),
        (246,"Quantité produite par type d'alternative (liste)",0,1,3,0,NULL,216,NULL,"Quantité produite par type d'alternative (liste)",""),
        (247,"Alternative promue (oui/non)",0,1,3,1,35,216,NULL,"Alternative promue (oui/non)",""),
        (248,"Nombre total de ménage adoptant les alternatives",0,1,3,0,NULL,216,NULL,"Nombre total de ménage adoptant les alternatives",""),
        (249,"Prix unitaire des alternatives (Ariary)",0,1,3,0,NULL,216,NULL,"Prix unitaire des alternatives (Ariary)",""),
        (250,"Observations économie verte",0,1,3,0,NULL,216,NULL,"Observations économie verte",""),
        (810,"Fichiers (économie verte) (.zip à importer)",0,1,3,0,NULL,216,NULL,"Fichiers (économie verte) (.zip à importer)",""),
                                                              
                                                              
        (251,"Source de données environnement",1,1,3,1,NULL,NULL,NULL,"Source de données environnement",""),
        (252,"Nom de l'infrastructure de gestion de pollution mis en place",0,1,3,1,NULL,251,NULL,"Nom de l'infrastructure de gestion de pollution mis en place",""),
        (253,"Objet de l'infrastructure de gestion de pollution mis en place (centre de tri, centre de traitement des déchets)",0,1,3,1,NULL,251,NULL,"Objet de l'infrastructure de gestion de pollution mis en place (centre de tri, centre de traitement des déchets)",""),
        (254,"Type de déchets traités (solides, médicaux, éléctroniques, liquides…)",0,1,3,1,NULL,251,NULL,"Type de déchets traités (solides, médicaux, éléctroniques, liquides…)",""),
        (255,"Commune d'implantantion de l'infrastructure de gestion de pollution",0,1,3,1,NULL,251,NULL,"Commune d'implantantion de l'infrastructure de gestion de pollution",""),
        (256,"Date de création de l'infrastructure",0,1,3,0,NULL,251,NULL,"Date de création de l'infrastructure",""),
        (257,"Infrastucture de gestion de pollution opérationnelle (oui/non)",0,1,3,0,NULL,251,NULL,"Infrastucture de gestion de pollution opérationnelle (oui/non)",""),
        (258,"Déchets valorisés par an (kg)",0,1,3,0,NULL,251,NULL,"Déchets valorisés par an (kg)",""),
        (259,"Disponibilité de kit d'analyse et de contrôle de pollution (oui/non)",0,1,3,0,NULL,251,NULL,"Disponibilité de kit d'analyse et de contrôle de pollution (oui/non)",""),
        (260,"Existence des observatoires de pollution (oui/non)",0,1,3,0,NULL,251,NULL,"Existence des observatoires de pollution (oui/non)",""),
        (261,"Observatoire opérationnel (oui/non)",0,1,3,0,NULL,251,NULL,"Observatoire opérationnel (oui/non)",""),
        (262,"Disponibilité de décharges d'ordures (oui/non)",0,1,3,0,NULL,251,NULL,"Disponibilité de décharges d'ordures (oui/non)",""),
        (263,"Emplacement de la décharge (localité)",0,1,3,0,NULL,251,NULL,"Emplacement de la décharge (localité)",""),
        (264,"Decharge d'ordures opérationnelle (oui/non)",0,1,3,1,NULL,251,NULL,"Decharge d'ordures opérationnelle (oui/non)",""),
        (265,"Existence de laboratoires nationaux et de centres de recherches renforcés techniquement et matériellement pour le traitement de déchets (oui/non)",0,1,3,0,NULL,251,NULL,"Existence de laboratoires nationaux et de centres de recherches renforcés techniquement et matériellement pour le traitement de déchets (oui/non)",""),
        (266,"si oui, lequel/lesquels?",0,1,3,0,NULL,251,NULL,"si oui, lequel/lesquels?",""),
        (267,"Nom du projet d'investissement souhaitant s'implanté",0,1,3,1,NULL,251,NULL,"Nom du projet d'investissement souhaitant s'implanté",""),
        (268,"Secteur d'activité (Agriculture, Industriel, Service)",0,1,3,0,NULL,251,NULL,"Secteur d'activité (Agriculture, Industriel, Service)",""),
        (269,"Existence de permis environnementaux délivrés (oui/non)",0,1,3,1,36,251,NULL,"Existence de permis environnementaux délivrés (oui/non)",""),
        (270,"Projet d'investissement conforme au Décret MECIE (oui/non)",0,1,3,0,NULL,251,NULL,"Projet d'investissement conforme au Décret MECIE (oui/non)",""),
        (271,"Date de quittance",0,1,3,0,NULL,251,NULL,"Date de quittance",""),
        (272,"Projet d'investissement ayant un Programme d'Engagement Environnemental (PREE) (oui/non)",0,1,3,1,NULL,251,NULL,"Projet d'investissement ayant un Programme d'Engagement Environnemental (PREE) (oui/non)",""),
        (273,"Existence de suivi environnemental mené sur la mise en œuvre de cahiers des charges environnementales (oui/non)",0,1,3,0,NULL,251,NULL,"Existence de suivi environnemental mené sur la mise en œuvre de cahiers des charges environnementales (oui/non)",""),
        (274,"Activités relatives à l'éducation environnementale réalisées (liste)",0,1,3,0,NULL,251,NULL,"Activités relatives à l'éducation environnementale réalisées (liste)",""),
        (275,"Nombre des agents assermentés en tant qu'OPJ pour les contrôles et inspections environnementales",0,1,3,0,NULL,251,NULL,"Nombre des agents assermentés en tant qu'OPJ pour les contrôles et inspections environnementales",""),
        (276,"Identifiant du projet d'appui pour l'environnement",0,1,3,0,NULL,251,NULL,"Identifiant du projet d'appui pour l'environnement",""),
        (277,"Observations environnement",0,1,3,0,NULL,251,NULL,"Observations environnement",""),
        (811,"Fichiers (environnement) (.zip à importer)",0,1,3,0,NULL,251,NULL,"Fichiers (environnement) (.zip à importer)",""),
                                                              
                                                              
                                                              
        (278,"Source de données feux",1,1,3,1,NULL,NULL,NULL,"Source de données feux",""),
        (279,"Commune de localisation de point de feux et surfaces brûlées suivant les points GPS des activités de patrouilles et de contrôle",0,1,3,1,NULL,278,NULL,"Commune de localisation de point de feux et surfaces brûlées suivant les points GPS des activités de patrouilles et de contrôle",""),
        (280,"Longitude point de feux (degré décimal) : X",0,1,3,1,NULL,278,NULL,"Longitude point de feux (degré décimal) : X",""),
        (281,"Latitude point de feux (degré décimal) : Y",0,1,3,1,NULL,278,NULL,"Latitude point de feux (degré décimal) : Y",""),
        (282,"Date de cas de feux",0,1,3,0,NULL,278,NULL,"Date de cas de feux",""),
        (283,"Geojson des points de feux",0,1,3,0,NULL,278,NULL,"Geojson des points de feux",""),
        (284,"Superficie des zones brulées suivant les points GPS des activités de patrouilles et de contrôle sur terrain (ha)",0,1,3,1,NULL,278,NULL,"Superficie des zones brulées suivant les points GPS des activités de patrouilles et de contrôle sur terrain (ha)",""),
        (285,"Type : Forêt ou hors forêt",0,1,3,1,NULL,278,NULL,"Type : Forêt ou hors forêt",""),
        (286,"Geojson des surfaces brûlées",0,1,3,0,NULL,278,NULL,"Geojson des surfaces brûlées",""),
        (287,"Date de zones brûlées",0,1,3,0,NULL,278,NULL,"Date de zones brûlées",""),
        (288,"Existence de dispositifs de détection et suivi des feux (oui/non)",0,1,3,1,42,278,NULL,"Existence de dispositifs de détection et suivi des feux (oui/non)",""),
        (289,"Emplacement de dispositifs de détection et suivi des feux (localité)",0,1,3,0,NULL,278,NULL,"Emplacement de dispositifs de détection et suivi des feux (localité)",""),
        (290,"Type de dispositif de détection et suivi des feux (créé/renforcé)",0,1,3,0,NULL,278,NULL,"Type de dispositif de détection et suivi des feux (créé/renforcé)",""),
        (291,"Dispositif de détection et suivi des feux opérationnel (oui/non)",0,1,3,1,NULL,278,NULL,"Dispositif de détection et suivi des feux opérationnel (oui/non)",""),
        (292,"Existence de comités/structures de lutte contre les feux (oui/non)",0,1,3,1,40,278,NULL,"Existence de comités/structures de lutte contre les feux (oui/non)",""),
        (293,"Emplacement de comités/structures de lutte contre les feux (localité)",0,1,3,0,NULL,278,NULL,"Emplacement de comités/structures de lutte contre les feux (localité)",""),
        (294,"Type de comité/structure de lutte contre les feux (créé/renforcé)",0,1,3,1,NULL,278,NULL,"Type de comité/structure de lutte contre les feux (créé/renforcé)",""),
        (295,"Comité/structure de lutte contre les feux formé (oui/non)",0,1,3,1,NULL,278,NULL,"Comité/structure de lutte contre les feux formé (oui/non)",""),
        (296,"Comité/structure de lutte contre les feux opérationnel (oui/non)",0,1,3,1,41,278,NULL,"Comité/structure de lutte contre les feux opérationnel (oui/non)",""),
        (297,"Emplacement du pare-feu (localité)",0,1,3,0,NULL,278,NULL,"Emplacement du pare-feu (localité)",""),
        (298,"Longitude pare-feu (degré décimal) : X",0,1,3,0,NULL,278,NULL,"Longitude pare-feu (degré décimal) : X",""),
        (299,"Latitude pare-feu (degré décimal) : Y",0,1,3,0,NULL,278,NULL,"Latitude pare-feu (degré décimal) : Y",""),
        (300,"Longueur de pare-feu établi (km)",0,1,3,1,NULL,278,NULL,"Longueur de pare-feu établi (km)",""),
        (301,"Geojson des pare-feux",0,1,3,0,NULL,278,NULL,"Geojson des pare-feux",""),
        (302,"Nature du pare-feu (nouvellement mis en place, entretenu)",0,1,3,0,NULL,278,NULL,"Nature du pare-feu (nouvellement mis en place, entretenu)",""),
        (303,"Référence PV d'infraction (constatation de feux)",0,1,3,1,NULL,278,NULL,"Référence PV d'infraction (constatation de feux)",""),
        (304,"Identifiant du projet d'appui de lutte contre les feux",0,1,3,0,NULL,278,NULL,"Identifiant du projet d'appui de lutte contre les feux",""),
        (305,"Observations feux",0,1,3,0,NULL,278,NULL,"Observations feux",""),
        (812,"Fichiers (feux) (.zip à importer)",0,1,3,0,NULL,278,NULL,"Fichiers (feux) (.zip à importer)",""),
                                                              
        (306,"Source de données recette",1,1,3,1,46,NULL,NULL,"Source de données recette",""),
        (307,"Origine de recette (Nature de cession/Autorisation de chasse/Caution carnet (facture)/Article et produits en bois, résine de pin, produits artisanaux/Raphia nature brut/Autorisation collecte/Détention animaux/Export collecte CITES/Export collecte non CITES/Export huile essentielle, produit en plante aromatique/Collecte peaux crocodiles/Mobilier divers en bois/Transaction avant jugement/Location gérance)",0,1,3,1,NULL,306,NULL,"Origine de recette (Nature de cession/Autorisation de chasse/Caution carnet (facture)/Article et produits en bois, résine de pin, produits artisanaux/Raphia nature brut/Autorisation collecte/Détention animaux/Export collecte CITES/Export collecte non CITES/Export huile essentielle, produit en plante aromatique/Collecte peaux crocodiles/Mobilier divers en bois/Transaction avant jugement/Location gérance)",""),
        (308,"Espèce concernée",0,1,3,1,NULL,306,NULL,"Espèce concernée",""),
        (309,"CITES (oui/non/autre)",0,1,3,1,NULL,306,NULL,"CITES (oui/non/autre)",""),
        (310,"Recette perçue (Ariary)",0,1,3,1,NULL,306,NULL,"Recette perçue (Ariary)",""),
        (311,"Fichiers correspondant aux recettes (.zip à importer)",0,1,3,0,NULL,306,NULL,"Fichiers correspondant aux recettes (.zip à importer)",""),
        (312,"Observations recette",0,1,3,0,NULL,306,NULL,"Observations recette",""),
        
                                                              
                                                              
                                                              
                                                              
                                                              
                                                              
        (313,"Source de données mobilisation de fonds",1,1,3,1,46,NULL,NULL,"Source de données mobilisation de fonds",""),
        (314,"Source de fonds mobilisés (interne/externe)",0,1,3,1,NULL,313,NULL,"Source de fonds mobilisés (interne/externe)",""),
        (315,"Type de fonds mobilisés (RPI, Privé, Projet, autre)",0,1,3,1,NULL,313,NULL,"Type de fonds mobilisés (RPI, Privé, Projet, autre)",""),
        (316,"Montant du fond public (Ariary)",0,1,3,1,NULL,313,NULL,"Montant du fond public (Ariary)",""),
        (317,"Montant engagé du fond public (Ariary)",0,1,3,1,NULL,313,NULL,"Montant engagé du fond public (Ariary)",""),
        (318,"Montant décaissé du fond public (Ariary)",0,1,3,1,NULL,313,NULL,"Montant décaissé du fond public (Ariary)",""),
        (319,"Taux d'egagement moyen du fond public (%)",0,1,3,0,NULL,313,NULL,"Taux d'egagement moyen du fond public (%)",""),
        (320,"Montant du financement extérieur ou privé (Ariary)",0,1,3,1,NULL,313,NULL,"Montant du financement extérieur ou privé (Ariary)",""),
        (321,"Montant engagé du financement extérieur ou privé (Ariary)",0,1,3,1,NULL,313,NULL,"Montant engagé du financement extérieur ou privé (Ariary)",""),
        (322,"Montant décaissé du financement extérieur ou privé (Ariary)",0,1,3,1,NULL,313,NULL,"Montant décaissé du financement extérieur ou privé (Ariary)",""),
        (323,"Taux d'egagement moyen du financement extérieur ou privé (%)",0,1,3,0,NULL,313,NULL,"Taux d'egagement moyen du financement extérieur ou privé (%)",""),
        (324,"Source du financement externe (mentionner : bailleur/projet)",0,1,3,1,NULL,313,NULL,"Source du financement externe (mentionner : bailleur/projet)",""),
        (325,"Identifiant du projet de financement",0,1,3,0,NULL,313,NULL,"Identifiant du projet de financement",""),
        (326,"Montant alloué pour action environnementale dans les programmes d'investissement directions techniques MEDD et autres (Ariary)",0,1,3,1,NULL,313,NULL,"Montant alloué pour action environnementale dans les programmes d'investissement directions techniques MEDD et autres (Ariary)",""),
        (327,"Montant alloué pour action environnementale dans les programmes d'investissement régionaux (Ariary)",0,1,3,1,NULL,313,NULL,"Montant alloué pour action environnementale dans les programmes d'investissement régionaux (Ariary)",""),
        (328,"Montant alloué pour action environnementale dans les programmes d'investissement communaux (Ariary)",0,1,3,1,NULL,313,NULL,"Montant alloué pour action environnementale dans les programmes d'investissement communaux (Ariary)",""),
        (329,"Montant alloué pour action environnementale dans les programmes d'investissement des Fokontany (Ariary)",0,1,3,1,NULL,313,NULL,"Montant alloué pour action environnementale dans les programmes d'investissement des Fokontany (Ariary)",""),
        (330,"Montant des dons (Ariary)",0,1,3,1,NULL,313,NULL,"Montant des dons (Ariary)",""),
        (331,"Montant de prêts (Ariary)",0,1,3,1,NULL,313,NULL,"Montant de prêts (Ariary)",""),
        (332,"Observations mobilisation de fonds",0,1,3,0,NULL,313,NULL,"Observations mobilisation de fonds",""),
        (813,"Fichiers (mobilisation de fond) (.zip à importer)",0,1,3,0,NULL,313,NULL,"Fichiers (mobilisation de fond) (.zip à importer)",""),
                                                              
                                                              
                                                              
                                                              
                                                              
        (333,"Source de données IEC",1,1,3,1,48,NULL,NULL,"Source de données IEC",""),
        (334,"Thématique de l'IEC",0,1,3,1,NULL,333,NULL,"Thématique de l'IEC",""),
        (335,"Intitulé de l'IEC",0,1,3,1,NULL,333,NULL,"Intitulé de l'IEC",""),
        (336,"Nature de l'IEC (formation professionnelle, formation académique, sensibilisation)",0,1,3,1,NULL,333,NULL,"Nature de l'IEC (formation professionnelle, formation académique, sensibilisation)",""),
        (337,"Désignation des supports produits",0,1,3,0,NULL,333,NULL,"Désignation des supports produits",""),
        (338,"Date de début et de fin de l'IEC",0,1,3,0,NULL,333,NULL,"Date de début et de fin de l'IEC",""),
        (339,"Initiateur de l'IEC",0,1,3,0,NULL,333,NULL,"Initiateur de l'IEC",""),
        (340,"Projet d'appui de l'IEC",0,1,3,0,NULL,333,NULL,"Projet d'appui de l'IEC",""),
        (341,"Identifiant du projet d'appui pour l'IEC",0,1,3,0,NULL,333,NULL,"Identifiant du projet d'appui pour l'IEC",""),
        (342,"Nombre de séance",0,1,3,1,NULL,333,NULL,"Nombre de séance",""),
        (343,"Nombre total de participants",0,1,3,1,NULL,333,NULL,"Nombre total de participants",""),
        (344,"Nombre de participants - de 14 ans",0,1,3,1,NULL,333,NULL,"Nombre de participants - de 14 ans",""),
        (345,"Nombre de participants de 15 à 24 ans",0,1,3,1,NULL,333,NULL,"Nombre de participants de 15 à 24 ans",""),
        (346,"Nombre de participants 25 ans et +",0,1,3,1,NULL,333,NULL,"Nombre de participants 25 ans et +",""),
        (347,"Nombre de représentant d'une OSC (Organisation de la Société Civile) ayant participé",0,1,3,1,NULL,333,NULL,"Nombre de représentant d'une OSC (Organisation de la Société Civile) ayant participé",""),
        (348,"Nombre de représentant de structures locales ayant participé",0,1,3,1,NULL,333,NULL,"Nombre de représentant de structures locales ayant participé",""),
        (349,"Nombre d'agents de l'administration ayant participé",0,1,3,1,NULL,333,NULL,"Nombre d'agents de l'administration ayant participé",""),
        (350,"Cible (étudiant, population locale, VOI, …)",0,1,3,0,NULL,333,NULL,"Cible (étudiant, population locale, VOI, …)",""),
        (351,"Niveau d'intervention (District, Commune, Fokontany)",0,1,3,0,NULL,333,NULL,"Niveau d'intervention (District, Commune, Fokontany)",""),
        (352,"Nom de la Commune bénéficiant de l'IEC",0,1,3,1,NULL,333,NULL,"Nom de la Commune bénéficiant de l'IEC",""),
        (353,"Nom de la localité bénéficiant de l'IEC",0,1,3,0,NULL,333,NULL,"Nom de la localité bénéficiant de l'IEC",""),
        (354,"IEC média classique (radio, télévision, journaux)",0,1,3,0,NULL,333,NULL,"IEC média classique (radio, télévision, journaux)",""),
        (355,"IEC nouveau média (réseaux sociaux, à préciser)",0,1,3,0,NULL,333,NULL,"IEC nouveau média (réseaux sociaux, à préciser)",""),
        (356,"Coût de réalisation de l'IEC (Ariary)",0,1,3,0,NULL,333,NULL,"Coût de réalisation de l'IEC (Ariary)",""),
        (357,"Fichiers (IEC) (.zip à ilmporter)",0,1,3,0,NULL,333,NULL,"Fichiers (IEC) (.zip à ilmporter)",""),
        (358,"Observations IEC",0,1,3,0,NULL,333,NULL,"Observations IEC",""),
                                                              
        (359,"Source de données infrastructure",1,1,3,1,NULL,NULL,NULL,"Source de données infrastructure",""),
        (360,"Type d'infrastructure (bâtiment, route, barrage, école, autre)",0,1,3,1,NULL,359,NULL,"Type d'infrastructure (bâtiment, route, barrage, école, autre)",""),
        (361,"Destination (administrative, logement, garage, autre)",0,1,3,1,NULL,359,NULL,"Destination (administrative, logement, garage, autre)",""),
        (362,"Commune d'implantation de l'infrastructure",0,1,3,1,NULL,359,NULL,"Commune d'implantation de l'infrastructure",""),
        (363,"Emplacement de l'infrastructure (localité)",0,1,3,0,NULL,359,NULL,"Emplacement de l'infrastructure (localité)",""),
        (364,"Secteur impliqué (éducation, santé, travaux publics, ...)",0,1,3,1,NULL,359,NULL,"Secteur impliqué (éducation, santé, travaux publics, ...)",""),
        (365,"Nouvellement construite ou réhabilitée ou existante",0,1,3,1,48,359,NULL,"Nouvellement construite ou réhabilitée ou existante",""),
        (366,"Date d'opérationnalisation/utilisation/réhabilitation de l'infrastructure",0,1,3,1,NULL,359,NULL,"Date d'opérationnalisation/utilisation/réhabilitation de l'infrastructure",""),
        (367,"Infrastructure actuellement opérationnelle (oui/non)",0,1,3,1,NULL,359,NULL,"Infrastructure actuellement opérationnelle (oui/non)",""),
        (368,"Etat actuel de l'infrastructure (mauvais, moyen, bon)",0,1,3,1,NULL,359,NULL,"Etat actuel de l'infrastructure (mauvais, moyen, bon)",""),
        (369,"Infrastructure à condamner ou à réparer",0,1,3,0,NULL,359,NULL,"Infrastructure à condamner ou à réparer",""),
        (370,"Niveau de localisation infrastructures opérationnelles (Direction centrale, Direction régionale, cantonnement, triage)",0,1,3,1,NULL,359,NULL,"Niveau de localisation infrastructures opérationnelles (Direction centrale, Direction régionale, cantonnement, triage)",""),
        (371,"STD ou CTD",0,1,3,1,NULL,359,NULL,"STD ou CTD",""),
        (372,"Personnes/services utilisant le(s) infrastructure(s) (STD, préciser si CTD)",0,1,3,1,NULL,359,NULL,"Personnes/services utilisant le(s) infrastructure(s) (STD, préciser si CTD)",""),
        (373,"Budget pour la construction/réhabilitation de l'infrastructure (Ariary)",0,1,3,0,NULL,359,NULL,"Budget pour la construction/réhabilitation de l'infrastructure (Ariary)",""),
        (374,"Budget annuel pour l'entretien de l'infrastructure (Ariary)",0,1,3,0,NULL,359,NULL,"Budget annuel pour l'entretien de l'infrastructure (Ariary)",""),
        (375,"Source de financement de l'infrastructure (interne ou externe)",0,1,3,1,NULL,359,NULL,"Source de financement de l'infrastructure (interne ou externe)",""),
        (376,"Projet d'appui de l'infrastructure (si externe)",0,1,3,0,NULL,359,NULL,"Projet d'appui de l'infrastructure (si externe)",""),
        (377,"Identifiant du projet d'appui pour l'infrastructure",0,1,3,0,NULL,359,NULL,"Identifiant du projet d'appui pour l'infrastructure",""),
        (378,"Fichiers/images (infrastructure) (.zip à importer)",0,1,3,0,NULL,359,NULL,"Fichiers/images (infrastructure) (.zip à importer)",""),
        (379,"Observations infrastructure",0,1,3,0,NULL,359,NULL,"Observations infrastructure",""),
                                                              
                                                              
        (380,"Source de données matériel de transport",1,1,3,1,NULL,NULL,NULL,"Source de données matériel de transport",""),
        (381,"Désignation du matériel de transport",0,1,3,1,NULL,380,NULL,"Désignation du matériel de transport",""),
        (382,"Marque du matériel de transport",0,1,3,0,NULL,380,NULL,"Marque du matériel de transport",""),
        (383,"Commune d'emplacement du matériel de transport",0,1,3,1,NULL,380,NULL,"Commune d'emplacement du matériel de transport",""),
        (384,"Date d'acquisition/utilisation du matériel de transport",0,1,3,1,NULL,380,NULL,"Date d'acquisition/utilisation du matériel de transport",""),
        (385,"Matériel de transport actuellement opérationnel (oui/non)",0,1,3,1,54,380,NULL,"Matériel de transport actuellement opérationnel (oui/non)",""),
        (386,"Etat actuel du matériel de transport (mauvais, moyen, bon)",0,1,3,1,NULL,380,NULL,"Etat actuel du matériel de transport (mauvais, moyen, bon)",""),
        (387,"Matériel de transport à condamner ou à réparer",0,1,3,0,NULL,380,NULL,"Matériel de transport à condamner ou à réparer",""),
        (388,"Niveau de localisation de matériel de transport en état de marche (Direction centrale, Direction régionale, cantonnement, triage)",0,1,3,1,NULL,380,NULL,"Niveau de localisation de matériel de transport en état de marche (Direction centrale, Direction régionale, cantonnement, triage)",""),
        (389,"Personnes/services utilisant le(s) matériel(s) de transport(s)",0,1,3,1,NULL,380,NULL,"Personnes/services utilisant le(s) matériel(s) de transport(s)",""),
        (390,"Budget pour l'acquisition du matériel de transport (Ariary)",0,1,3,0,NULL,380,NULL,"Budget pour l'acquisition du matériel de transport (Ariary)",""),
        (391,"Budget annuel pour l'entretien du matériel de transport (Ariary)",0,1,3,0,NULL,380,NULL,"Budget annuel pour l'entretien du matériel de transport (Ariary)",""),
        (392,"Source de financement du matériel de transport (interne ou externe)",0,1,3,1,NULL,380,NULL,"Source de financement du matériel de transport (interne ou externe)",""),
        (393,"Projet d'appui du matériel de transport (si externe)",0,1,3,0,NULL,380,NULL,"Projet d'appui du matériel de transport (si externe)",""),
        (394,"Identifiant du projet d'appui pour le matériel de transport",0,1,3,0,NULL,380,NULL,"Identifiant du projet d'appui pour le matériel de transport",""),
        (395,"Fichiers/images (matériel de transport) (.zip à importer)",0,1,3,0,NULL,380,NULL,"Fichiers/images (matériel de transport) (.zip à importer)",""),
        (396,"Observations matériel de transport",0,1,3,0,NULL,380,NULL,"Observations matériel de transport",""),
                                                              
                                                              
        (397,"Source de données matériel informatique",1,1,3,1,NULL,NULL,NULL,"Source de données matériel informatique",""),
        (398,"Désignation du matériel informatique",0,1,3,1,NULL,397,NULL,"Désignation du matériel informatique",""),
        (399,"Marque du matériel informatique",0,1,3,0,NULL,397,NULL,"Marque du matériel informatique",""),
        (400,"Commune d'emplacement du matériel informatique",0,1,3,1,NULL,397,NULL,"Commune d'emplacement du matériel informatique",""),
        (401,"Date d'acquiqition/utilisation du matériel informatique",0,1,3,1,NULL,397,NULL,"Date d'acquiqition/utilisation du matériel informatique",""),
        (402,"Matériel informatique actuellement opérationnel (oui/non)",0,1,3,1,55,397,NULL,"Matériel informatique actuellement opérationnel (oui/non)",""),
        (403,"Etat actuel du matériel informatique (mauvais, moyen, bon)",0,1,3,1,NULL,397,NULL,"Etat actuel du matériel informatique (mauvais, moyen, bon)",""),
        (404,"Matériel informatique à condamner ou à réparer",0,1,3,0,NULL,397,NULL,"Matériel informatique à condamner ou à réparer",""),
        (405,"Niveau de localisation de matériels informatiques en état de marche (Direction centrale, Direction régionale, cantonnement, triage)",0,1,3,1,NULL,397,NULL,"Niveau de localisation de matériels informatiques en état de marche (Direction centrale, Direction régionale, cantonnement, triage)",""),
        (406,"Personnes/services utilisant le(s) matériel(s) informatique(s)",0,1,3,1,NULL,397,NULL,"Personnes/services utilisant le(s) matériel(s) informatique(s)",""),
        (407,"Budget pour l'acquisition du matériel informatique (Ariary)",0,1,3,0,NULL,397,NULL,"Budget pour l'acquisition du matériel informatique (Ariary)",""),
        (408,"Budget annuel pour l'entretien du matériel informatique (Ariary)",0,1,3,0,NULL,397,NULL,"Budget annuel pour l'entretien du matériel informatique (Ariary)",""),
        (409,"Source de financement du matériel informatique (interne ou externe)",0,1,3,1,NULL,397,NULL,"Source de financement du matériel informatique (interne ou externe)",""),
        (410,"Projet d'appui du matériel informatique (si externe)",0,1,3,0,NULL,397,NULL,"Projet d'appui du matériel informatique (si externe)",""),
        (411,"Identifiant du projet d'appui pour le matériel informatique",0,1,3,0,NULL,397,NULL,"Identifiant du projet d'appui pour le matériel informatique",""),
        (412,"Images matériel informatique",0,1,3,0,NULL,397,NULL,"Images matériel informatique",""),
        (413,"Observations matériel informatique",0,1,3,0,NULL,397,NULL,"Observations matériel informatique",""),
        (814,"Fichiers (matériel informatique) (.zip à importer)",0,1,3,0,NULL,397,NULL,"Fichiers (matériel informatique) (.zip à importer)",""),
                                                              
        (414,"Source de données matériel technique",1,1,3,1,NULL,NULL,NULL,"Source de données matériel technique",""),
        (415,"Désignation du matériel technique",0,1,3,1,NULL,414,NULL,"Désignation du matériel technique",""),
        (416,"Marque du matériel technique",0,1,3,0,NULL,414,NULL,"Marque du matériel technique",""),
        (417,"Commune d'emplacement du matériel technique",0,1,3,1,NULL,414,NULL,"Commune d'emplacement du matériel technique",""),
        (418,"Date d'acquiqition/utilisation du matériel technique",0,1,3,1,NULL,414,NULL,"Date d'acquiqition/utilisation du matériel technique",""),
        (419,"Matériel technique actuellement opérationnel (oui/non)",0,1,3,1,55,414,NULL,"Matériel technique actuellement opérationnel (oui/non)",""),
        (420,"Etat actuel du matériel technique (mauvais, moyen, bon)",0,1,3,1,NULL,414,NULL,"Etat actuel du matériel technique (mauvais, moyen, bon)",""),
        (421,"Matériel technique à condamner ou à réparer",0,1,3,0,NULL,414,NULL,"Matériel technique à condamner ou à réparer",""),
        (422,"Niveau de localisation de matériels techniques en état de marche (Direction centrale, Direction régionale, cantonnement, triage)",0,1,3,1,NULL,414,NULL,"Niveau de localisation de matériels techniques en état de marche (Direction centrale, Direction régionale, cantonnement, triage)",""),
        (423,"Personnes/services utilisant le(s) matériel(s) technique(s)",0,1,3,1,NULL,414,NULL,"Personnes/services utilisant le(s) matériel(s) technique(s)",""),
        (424,"Budget pour l'acquisition du matériel technique (Ariary)",0,1,3,0,NULL,414,NULL,"Budget pour l'acquisition du matériel technique (Ariary)",""),
        (425,"Budget annuel pour l'entretien du matériel technique (Ariary)",0,1,3,0,NULL,414,NULL,"Budget annuel pour l'entretien du matériel technique (Ariary)",""),
        (426,"Source de financement du matériel technique (interne ou externe)",0,1,3,1,NULL,414,NULL,"Source de financement du matériel technique (interne ou externe)",""),
        (427,"Projet d'appui du matériel technique (si externe)",0,1,3,0,NULL,414,NULL,"Projet d'appui du matériel technique (si externe)",""),
        (428,"Identifiant du projet d'appui pour le matériel technique",0,1,3,0,NULL,414,NULL,"Identifiant du projet d'appui pour le matériel technique",""),
        (429,"Images matériel technique",0,1,3,0,NULL,414,NULL,"Images matériel technique",""),
        (430,"Observations matériel technique",0,1,3,0,NULL,414,NULL,"Observations matériel technique",""),
        (815,"Fichiers (matériel technique) (.zip à importer)",0,1,3,0,NULL,414,NULL,"Fichiers (matériel technique) (.zip à importer)",""),
                                                              
                                                              
        (431,"Source de données matériel mobilier",1,1,3,1,NULL,NULL,NULL,"Source de données matériel mobilier",""),
        (432,"Désignation du matériel mobilier",0,1,3,1,NULL,431,NULL,"Désignation du matériel mobilier",""),
        (433,"Date d'acquiqition/utilisation du matériel mobilier",0,1,3,1,NULL,431,NULL,"Date d'acquiqition/utilisation du matériel mobilier",""),
        (434,"Commune d'emplacement du matériel mobilier",0,1,3,1,NULL,431,NULL,"Commune d'emplacement du matériel mobilier",""),
        (435,"Matériel mobilier actuellement utilisable (oui/non)",0,1,3,1,56,431,NULL,"Matériel mobilier actuellement utilisable (oui/non)",""),
        (436,"Etat actuel du matériel mobilier (mauvais, moyen, bon)",0,1,3,1,NULL,431,NULL,"Etat actuel du matériel mobilier (mauvais, moyen, bon)",""),
        (437,"Matériel mobilier à condamner ou à réparer",0,1,3,0,NULL,431,NULL,"Matériel mobilier à condamner ou à réparer",""),
        (438,"Niveau de localisation de matériels mobiliers utilisables (Direction centrale, Direction régionale, cantonnement, triage)",0,1,3,1,NULL,431,NULL,"Niveau de localisation de matériels mobiliers utilisables (Direction centrale, Direction régionale, cantonnement, triage)",""),
        (439,"Personnes/services utilisant le(s) matériel(s) mobilier(s)",0,1,3,1,NULL,431,NULL,"Personnes/services utilisant le(s) matériel(s) mobilier(s)",""),
        (440,"Budget pour l'acquisition du matériel mobilier (Ariary)",0,1,3,0,NULL,431,NULL,"Budget pour l'acquisition du matériel mobilier (Ariary)",""),
        (441,"Budget annuel pour l'entretien du matériel mobilier (Ariary)",0,1,3,0,NULL,431,NULL,"Budget annuel pour l'entretien du matériel mobilier (Ariary)",""),
        (442,"Source de financement du matériel mobilier (interne ou externe)",0,1,3,1,NULL,431,NULL,"Source de financement du matériel mobilier (interne ou externe)",""),
        (443,"Projet d'appui du matériel mobilier (si externe)",0,1,3,0,NULL,431,NULL,"Projet d'appui du matériel mobilier (si externe)",""),
        (444,"Identifiant du projet d'appui pour le matériel mobilier",0,1,3,0,NULL,431,NULL,"Identifiant du projet d'appui pour le matériel mobilier",""),
        (445,"Images matériel mobilier",0,1,3,0,NULL,431,NULL,"Images matériel mobilier",""),
        (446,"Observations matériel mobilier",0,1,3,0,NULL,431,NULL,"Observations matériel mobilier",""),
        (816,"Fichiers (matériel mobilier) (.zip à importer)",0,1,3,0,NULL,431,NULL,"Fichiers (matériel mobilier) (.zip à importer)",""),
                                                              
                                                              
        (447,"Source de données outils",1,1,3,1,57,NULL,NULL,"Source de données outils",""),
        (448,"Thématique de l'outil",0,1,3,1,NULL,447,NULL,"Thématique de l'outil",""),
        (449,"Titre de l'outil",0,1,3,1,NULL,447,NULL,"Titre de l'outil",""),
        (450,"Type de l'outil",0,1,3,1,NULL,447,NULL,"Type de l'outil",""),
        (451,"Commune d'application de l'outil (<<Toutes>> si niveau national)",0,1,3,1,NULL,447,NULL,"Commune d'application de l'outil (<<Toutes>> si niveau national)",""),
        (452,"Outil opérationnel (oui/non)",0,1,3,1,NULL,447,NULL,"Outil opérationnel (oui/non)",""),
        (453,"Utilisateurs de l'outil",0,1,3,1,NULL,447,NULL,"Utilisateurs de l'outil",""),
        (454,"Nombre d'outil  produit",0,1,3,1,NULL,447,NULL,"Nombre d'outil  produit",""),
        (455,"Nombre d'outil distribué et utilisé",0,1,3,1,NULL,447,NULL,"Nombre d'outil distribué et utilisé",""),
        (456,"Budget pour la création de l'outil (Ariary)",0,1,3,0,NULL,447,NULL,"Budget pour la création de l'outil (Ariary)",""),
        (457,"Source de financement de l'outil (interne ou externe)",0,1,3,1,NULL,447,NULL,"Source de financement de l'outil (interne ou externe)",""),
        (458,"Projet d'appui de l'outil (si externe)",0,1,3,0,NULL,447,NULL,"Projet d'appui de l'outil (si externe)",""),
        (459,"Identifiant du projet d'appui pour l'outil",0,1,3,0,NULL,447,NULL,"Identifiant du projet d'appui pour l'outil",""),
        (460,"Fichiers (outils) (.zip à importer)",0,1,3,0,NULL,447,NULL,"Fichiers (outils) (.zip à importer)",""),
        (461,"Observations outils",0,1,3,0,NULL,447,NULL,"Observations outils",""),
                                                              
                                                              
                                                              
        (462,"Source de données PPSE",1,1,3,1,NULL,NULL,NULL,"Source de données PPSE",""),
        (463,"Intitulé du projet",0,1,3,1,NULL,462,NULL,"Intitulé du projet",""),
        (464,"Commune d'intervention du projet (<<Toutes>> si niveau national)",0,1,3,1,NULL,462,NULL,"Commune d'intervention du projet (<<Toutes>> si niveau national)",""),
        (465,"Date de commencement du projet",0,1,3,1,NULL,462,NULL,"Date de commencement du projet",""),
        (466,"Date de clôture du projet",0,1,3,0,NULL,462,NULL,"Date de clôture du projet",""),
        (467,"Projet ayant été l'objet de planifiaction (oui/non)",0,1,3,1,63,462,NULL,"Projet ayant été l'objet de planifiaction (oui/non)",""),
        (468,"Projet ayant été l'objet de suivi (oui/non)",0,1,3,1,64,462,NULL,"Projet ayant été l'objet de suivi (oui/non)",""),
        (469,"Projet ayant été l'objet d'évaluation (oui/non)",0,1,3,1,65,462,NULL,"Projet ayant été l'objet d'évaluation (oui/non)",""),
        (470,"Identifiant du projet",0,1,3,0,NULL,462,NULL,"Identifiant du projet",""),
        (471,"Source de financement du projet",0,1,3,1,NULL,462,NULL,"Source de financement du projet",""),
        (472,"Budget attribué aux activités de planification (Ariary)",0,1,3,1,NULL,462,NULL,"Budget attribué aux activités de planification (Ariary)",""),
        (473,"Budget attribué aux activités de suivi (Ariary)",0,1,3,1,NULL,462,NULL,"Budget attribué aux activités de suivi (Ariary)",""),
        (474,"Budget attribué aux activités d'évaluation (Ariary)",0,1,3,1,NULL,462,NULL,"Budget attribué aux activités d'évaluation (Ariary)",""),
        (475,"Nombre de programmation effectuée",0,1,3,1,NULL,462,NULL,"Nombre de programmation effectuée",""),
        (476,"Existence de base de données (oui/non)",0,1,3,1,67,462,NULL,"Existence de base de données (oui/non)",""),
        (477,"Si oui, existence de mise à jour (oui/non)",0,1,3,0,NULL,462,NULL,"Si oui, existence de mise à jour (oui/non)",""),
        (478,"Existence de système d'information opérationnel (oui/non)",0,1,3,1,68,462,NULL,"Existence de système d'information opérationnel (oui/non)",""),
        (479,"Thématique du SI",0,1,3,0,NULL,462,NULL,"Thématique du SI",""),
        (480,"Observations PPSE",0,1,3,0,NULL,462,NULL,"Observations PPSE",""),
        (817,"Fichiers (PPSE) (.zip à importer)",0,1,3,0,NULL,462,NULL,"Fichiers (PPSE) (.zip à importer)",""),
                                                              
                                                              
                                                              
        (481,"Source de données reboisement et gestion des terres",1,1,3,1,NULL,NULL,NULL,"Source de données reboisement et gestion des terres",""),
        (482,"Année d'intervention des activités pour la gestion des terres",0,1,3,0,NULL,481,NULL,"Année d'intervention des activités pour la gestion des terres",""),
        (483,"Catégorie/Zone d'intervention (Agroforesterie, Bassin versant, Dune, Forêt de Tapia, Littoral, Mangrove, Recif corallien)",0,1,3,0,NULL,481,NULL,"Catégorie/Zone d'intervention (Agroforesterie, Bassin versant, Dune, Forêt de Tapia, Littoral, Mangrove, Recif corallien)",""),
        (484,"Existence de protection antiérosive (oui/non)",0,1,3,0,NULL,481,NULL,"Existence de protection antiérosive (oui/non)",""),
        (485,"Autres protections (à préciser)",0,1,3,0,NULL,481,NULL,"Autres protections (à préciser)",""),
        (486,"Superficie de DRS (ha)",0,1,3,1,NULL,481,NULL,"Superficie de DRS (ha)",""),
        (487,"Geojson de la DRS",0,1,3,0,NULL,481,NULL,"Geojson de la DRS",""),
        (488,"Fixation de dunes (oui/non)",0,1,3,1,NULL,481,NULL,"Fixation de dunes (oui/non)",""),
        (489,"Superficie de dune stabilisée (ha)",0,1,3,1,NULL,481,NULL,"Superficie de dune stabilisée (ha)",""),
        (490,"Geojson de la dune stabilisée",0,1,3,0,NULL,481,NULL,"Geojson de la dune stabilisée",""),
        (491,"Type de la défense et restauration des sols adopté (mécanique, biologique, mixte)",0,1,3,0,NULL,481,NULL,"Type de la défense et restauration des sols adopté (mécanique, biologique, mixte)",""),
        (492,"Nombre de ménage pratiquant la DRS",0,1,3,0,65,481,NULL,"Nombre de ménage pratiquant la DRS",""),
        (493,"Comité formé sur la DRS (oui/non)",0,1,3,0,NULL,481,NULL,"Comité formé sur la DRS (oui/non)",""),
        (494,"Si oui, année de création du comité",0,1,3,0,NULL,481,NULL,"Si oui, année de création du comité",""),
        (495,"Comité sur DRS opérationnel (oui/non)",0,1,3,0,NULL,481,NULL,"Comité sur DRS opérationnel (oui/non)",""),
        (496,"Suivi des interventions DRS (oui/non)",0,1,3,0,NULL,481,NULL,"Suivi des interventions DRS (oui/non)",""),
        (497,"Périodicité de suivi DRS (nombre/an)",0,1,3,0,NULL,481,NULL,"Périodicité de suivi DRS (nombre/an)",""),
        (498,"Insitution (Nom de l'entité ou personne responsable du reboisement)",0,1,3,1,NULL,481,NULL,"Insitution (Nom de l'entité ou personne responsable du reboisement)",""),
        (499,"DREDD/CIREDD",0,1,3,0,NULL,481,NULL,"DREDD/CIREDD",""),
        (500,"Commune d'intervention pour le reboisement",0,1,3,1,NULL,481,NULL,"Commune d'intervention pour le reboisement",""),
        (501,"Fokontany d'intervention pour le reboisement",0,1,3,0,NULL,481,NULL,"Fokontany d'intervention pour le reboisement",""),
        (502,"Site/Localité",0,1,3,0,NULL,481,NULL,"Site/Localité",""),
        (503,"Situation juridique (terrain domanial, privé)",0,1,3,1,NULL,481,NULL,"Situation juridique (terrain domanial, privé)",""),
        (504,"Longitude surface reboisée (en degré décimal) : X",0,1,3,1,NULL,481,NULL,"Longitude surface reboisée (en degré décimal) : X",""),
        (505,"Latitude surface reboisée (en degré décimal) : Y",0,1,3,1,NULL,481,NULL,"Latitude surface reboisée (en degré décimal) : Y",""),
        (506,"Objectif de reboisement (restauration, energétique, bois d'œuvre, …)",0,1,3,1,NULL,481,NULL,"Objectif de reboisement (restauration, energétique, bois d'œuvre, …)",""),
        (507,"Superficie restaurée si restauration (ha)",0,1,3,1,NULL,481,NULL,"Superficie restaurée si restauration (ha)",""),
        (508,"Ecosystème (mangrove, zone humide, forêt humide, forêt sèche, reboisement, …)",0,1,3,1,69,481,NULL,"Ecosystème (mangrove, zone humide, forêt humide, forêt sèche, reboisement, …)",""),
        (509,"Surface totale prévue (ha)",0,1,3,0,NULL,481,NULL,"Surface totale prévue (ha)",""),
        (510,"Nombre de plants mis en terre",0,1,3,1,NULL,481,NULL,"Nombre de plants mis en terre",""),
        (511,"Espèce des plants",0,1,3,1,NULL,481,NULL,"Espèce des plants",""),
        (512,"Autochtone ou exotique ou mixte",0,1,3,1,NULL,481,NULL,"Autochtone ou exotique ou mixte",""),
        (513,"Croissance rapide (oui/non/les deux)",0,1,3,1,NULL,481,NULL,"Croissance rapide (oui/non/les deux)",""),
        (514,"Date de mise en terre",0,1,3,1,NULL,481,NULL,"Date de mise en terre",""),
        (515,"Source de plants",0,1,3,1,NULL,481,NULL,"Source de plants",""),
        (516,"Superficie reboisée (ha)",0,1,3,1,NULL,481,NULL,"Superficie reboisée (ha)",""),
        (517,"Geojson surface reboisée",0,1,3,0,NULL,481,NULL,"Geojson surface reboisée",""),
        (518,"Source de financement du reboisement (interne ou externe)",0,1,3,1,NULL,481,NULL,"Source de financement du reboisement (interne ou externe)",""),
        (519,"Projet d'appui du reboisement (si externe)",0,1,3,0,NULL,481,NULL,"Projet d'appui du reboisement (si externe)",""),
        (520,"Identifiant du projet d'appui pour le reboisement et la gestion des terres",0,1,3,0,NULL,481,NULL,"Identifiant du projet d'appui pour le reboisement et la gestion des terres",""),
        (521,"Longueur de pare-feux (km)",0,1,3,1,NULL,481,NULL,"Longueur de pare-feux (km)",""),
        (522,"Matériels de lutte active",0,1,3,0,NULL,481,NULL,"Matériels de lutte active",""),
        (523,"Existence de structure de lutte (oui/non)",0,1,3,0,NULL,481,NULL,"Existence de structure de lutte (oui/non)",""),
        (524,"Surface brûlée (ha)",0,1,3,0,NULL,481,NULL,"Surface brûlée (ha)",""),
        (525,"Geojson surface de reboisement brûlée",0,1,3,0,NULL,481,NULL,"Geojson surface de reboisement brûlée",""),
        (526,"Lutte active ou préventive",0,1,3,0,NULL,481,NULL,"Lutte active ou préventive",""),
        (527,"Date d'intervention",0,1,3,0,NULL,481,NULL,"Date d'intervention",""),
        (528,"Responsable de lutte contre les feux",0,1,3,0,NULL,481,NULL,"Responsable de lutte contre les feux",""),
        (529,"Regarnissage (oui/non)",0,1,3,0,NULL,481,NULL,"Regarnissage (oui/non)",""),
        (530,"Date de regarnissage",0,1,3,0,NULL,481,NULL,"Date de regarnissage",""),
        (531,"Nettoyage (oui/non)",0,1,3,0,NULL,481,NULL,"Nettoyage (oui/non)",""),
        (532,"Date de nettoyage",0,1,3,0,NULL,481,NULL,"Date de nettoyage",""),
        (533,"Elagage (oui/non)",0,1,3,0,NULL,481,NULL,"Elagage (oui/non)",""),
        (534,"Date d'elagage",0,1,3,0,NULL,481,NULL,"Date d'elagage",""),
        (535,"Bénéficiaires des interventions",0,1,3,0,NULL,481,NULL,"Bénéficiaires des interventions",""),
        (536,"Eclaircie 1 (oui/non)",0,1,3,0,NULL,481,NULL,"Eclaircie 1 (oui/non)",""),
        (537,"Date eclaircie 1",0,1,3,0,NULL,481,NULL,"Date eclaircie 1",""),
        (538,"Eclaircie 2 (oui/non)",0,1,3,0,NULL,481,NULL,"Eclaircie 2 (oui/non)",""),
        (539,"Date eclaircie 2",0,1,3,0,NULL,481,NULL,"Date eclaircie 2",""),
        (540,"Coupe rase (oui/non)",0,1,3,0,NULL,481,NULL,"Coupe rase (oui/non)",""),
        (541,"Date coupe rase",0,1,3,0,NULL,481,NULL,"Date coupe rase",""),
        (542,"Observations reboisement et gestion des terres",0,1,3,0,NULL,481,NULL,"Observations reboisement et gestion des terres",""),
        (818,"Fichiers (reboisement) (.zip à importer)",0,1,3,0,NULL,481,NULL,"Fichiers (reboisement) (.zip à importer)",""),
                                                              
                                                              
                                                              
        (543,"Source de données recherche",1,1,3,1,NULL,NULL,NULL,"Source de données recherche",""),
        (544,"Sujet de recherche effectué",0,1,3,1,NULL,543,NULL,"Sujet de recherche effectué",""),
        (545,"Objectif de la recherche (étude de filière, ...)",0,1,3,0,NULL,543,NULL,"Objectif de la recherche (étude de filière, ...)",""),
        (546,"Commune d'intervention de la recherche (<<Toutes>> si niveau national)",0,1,3,1,NULL,543,NULL,"Commune d'intervention de la recherche (<<Toutes>> si niveau national)",""),
        (547,"Date de commencement de la recherche",0,1,3,0,NULL,543,NULL,"Date de commencement de la recherche",""),
        (548,"Date de fin de la recherche",0,1,3,0,NULL,543,NULL,"Date de fin de la recherche",""),
        (549,"Chercheurs (liste)",0,1,3,0,NULL,543,NULL,"Chercheurs (liste)",""),
        (550,"Institution des chercheurs",0,1,3,0,NULL,543,NULL,"Institution des chercheurs",""),
        (551,"Date d'édition du rapport de recherche",0,1,3,0,NULL,543,NULL,"Date d'édition du rapport de recherche",""),
        (552,"Résultats de la recherche",0,1,3,0,NULL,543,NULL,"Résultats de la recherche",""),
        (553,"Résultats de recherche disponibles (oui/non)",0,1,3,1,75,543,NULL,"Résultats de recherche disponibles (oui/non)",""),
        (554,"Résultats de recherche appliqués (oui/non)",0,1,3,1,76,543,NULL,"Résultats de recherche appliqués (oui/non)",""),
        (555,"Produits de recherche diffusés, vulgarisés, promus (oui/non)",0,1,3,1,77,543,NULL,"Produits de recherche diffusés, vulgarisés, promus (oui/non)",""),
        (556,"Source de financement de la recherche (interne ou externe)",0,1,3,1,NULL,543,NULL,"Source de financement de la recherche (interne ou externe)",""),
        (557,"Projet d'appui de la recherche (si externe)",0,1,3,0,NULL,543,NULL,"Projet d'appui de la recherche (si externe)",""),
        (558,"Identifiant du projet d'appui pour la recherche",0,1,3,0,NULL,543,NULL,"Identifiant du projet d'appui pour la recherche",""),
        (559,"Coûts des activités de recherche (Ariary)",0,1,3,0,NULL,543,NULL,"Coûts des activités de recherche (Ariary)",""),
        (560,"Observations recherche",0,1,3,0,NULL,543,NULL,"Observations recherche",""),
        (819,"Fichiers (recherches) (.zip à importer)",0,1,3,0,NULL,543,NULL,"Fichiers (recherches) (.zip à importer)",""),
                                                              
                                                              
                                                              
        (561,"Source de données RSE",1,1,3,1,NULL,NULL,NULL,"Source de données RSE",""),
        (562,"Intitulé du projet développé dans le cadre de RSE (Responsabilité Sociétale des Entreprises)",0,1,3,1,NULL,561,NULL,"Intitulé du projet développé dans le cadre de RSE (Responsabilité Sociétale des Entreprises)",""),
        (563,"Objectifs du projet RSE",0,1,3,1,NULL,561,NULL,"Objectifs du projet RSE",""),
        (564,"Date de début et fin de la RSE",0,1,3,0,NULL,561,NULL,"Date de début et fin de la RSE",""),
        (565,"Commune d'intervention pour RSE",0,1,3,0,NULL,561,NULL,"Commune d'intervention pour RSE",""),
        (566,"Fokontany d'intervention pour RSE",0,1,3,0,NULL,561,NULL,"Fokontany d'intervention pour RSE",""),
        (567,"Types d'intervention (éducation environnementale, reboisement/restauration, …)",0,1,3,0,NULL,561,NULL,"Types d'intervention (éducation environnementale, reboisement/restauration, …)",""),
        (568,"Supports afférents produits (liste)",0,1,3,0,NULL,561,NULL,"Supports afférents produits (liste)",""),
        (569,"Parties prenantes pour RSE (liste)",0,1,3,0,NULL,561,NULL,"Parties prenantes pour RSE (liste)",""),
        (570,"Nombre de ménages bénéficiaires de la RSE",0,1,3,0,NULL,561,NULL,"Nombre de ménages bénéficiaires de la RSE",""),
        (571,"Nombre d'autres bénéficiaires de la RSE (groupement, école, …)",0,1,3,0,NULL,561,NULL,"Nombre d'autres bénéficiaires de la RSE (groupement, école, …)",""),
        (572,"Existence de suivi des projets RSE (oui/non)",0,1,3,0,NULL,561,NULL,"Existence de suivi des projets RSE (oui/non)",""),
        (573,"Périodicité de suivi RSE (nombre par an)",0,1,3,0,NULL,561,NULL,"Périodicité de suivi RSE (nombre par an)",""),
        (574,"Identifiant du projet d'appui pour la RSE",0,1,3,0,NULL,561,NULL,"Identifiant du projet d'appui pour la RSE",""),
        (575,"Coût de réalisation de la RSE (Arirary)",0,1,3,0,NULL,561,NULL,"Coût de réalisation de la RSE (Arirary)",""),
        (576,"Observations RSE",0,1,3,0,NULL,561,NULL,"Observations RSE",""),
        (820,"Fichiers (RSE) (.zip à importer)",0,1,3,0,NULL,561,NULL,"Fichiers (RSE) (.zip à importer)",""),
                                                              
        (577,"Source de données ressources humaines",1,1,3,1,NULL,NULL,NULL,"Source de données ressources humaines",""),
        (578,"Intitulé du poste",0,1,3,1,NULL,577,NULL,"Intitulé du poste",""),
        (579,"Justificatif d'assignation (Décisions, Note de service, arrêtés, décrets avec numéro)",0,1,3,1,NULL,577,NULL,"Justificatif d'assignation (Décisions, Note de service, arrêtés, décrets avec numéro)",""),
        (580,"Poste occupé ou vaccant",0,1,3,1,NULL,577,NULL,"Poste occupé ou vaccant",""),
        (581,"Type du poste (administratif, technique)",0,1,3,1,80,577,NULL,"Type du poste (administratif, technique)",""),
        (582,"Statut du personnel (ECD, ELD, EFA, fonctionnaire)",0,1,3,1,79,577,NULL,"Statut du personnel (ECD, ELD, EFA, fonctionnaire)",""),
        (583,"Commune d'affectation (<<Toutes>> si niveau national)",0,1,3,0,NULL,577,NULL,"Commune d'affectation (<<Toutes>> si niveau national)",""),
        (584,"Année d'affectation",0,1,3,0,NULL,577,NULL,"Année d'affectation",""),
        (585,"Date de recrutement/année",0,1,3,0,NULL,577,NULL,"Date de recrutement/année",""),
        (586,"Date estimée de retraite/année",0,1,3,0,NULL,577,NULL,"Date estimée de retraite/année",""),
        (587,"Personne bénéficiant de formation (oui, non)",0,1,3,0,NULL,577,NULL,"Personne bénéficiant de formation (oui, non)",""),
        (588,"Sujet de formation",0,1,3,0,NULL,577,NULL,"Sujet de formation",""),
        (589,"Formation appliquée/utilisée (oui/non)",0,1,3,0,NULL,577,NULL,"Formation appliquée/utilisée (oui/non)",""),
        (590,"Besoins en formation pour le poste ",0,1,3,0,NULL,577,NULL,"Besoins en formation pour le poste ",""),
        (591,"Observations ressources humaines",0,1,3,0,NULL,577,NULL,"Observations ressources humaines",""),
        (821,"Fichiers (RH) (.zip à importer)",0,1,3,0,NULL,577,NULL,"Fichiers (RH) (.zip à importer)",""),
                                                              
                                                              
                                                              
        (592,"Source de données TG",1,1,3,1,NULL,NULL,NULL,"Source de données TG",""),
        (593,"TG nouvellement créé ou renouvelé",0,1,3,1,NULL,592,NULL,"TG nouvellement créé ou renouvelé",""),
        (594,"Nom de la COBA/VOI",0,1,3,1,NULL,592,NULL,"Nom de la COBA/VOI",""),
        (595,"Fokontany d'implatation du TG",0,1,3,0,NULL,592,NULL,"Fokontany d'implatation du TG",""),
        (596,"Commune d'implatation du TG",0,1,3,1,NULL,592,NULL,"Commune d'implatation du TG",""),
        (597,"Type de forêts (Primaire, Secondaire, Littorale, Fourré, Mangrove, Satrana, Raphia, Tapia, Domaniale, Reboisement, Zone de pêches, etc.)",0,1,3,1,NULL,592,NULL,"Type de forêts (Primaire, Secondaire, Littorale, Fourré, Mangrove, Satrana, Raphia, Tapia, Domaniale, Reboisement, Zone de pêches, etc.)",""),
        (598,"Surface contrat 1 (ha)",0,1,3,1,NULL,592,NULL,"Surface contrat 1 (ha)",""),
        (599,"Type de TG (GCF, GELOSE)",0,1,3,1,NULL,592,NULL,"Type de TG (GCF, GELOSE)",""),
        (600,"Vocation/Objectifs (Conservation, Valorisation, Ecotourisme, Droit d'usage (CDU), Restauration, Production, Reserve, Réhabilitation, Enrichissement, Reboisement, Exploitation, Production durable, Zone de culture, Plantes fourragères, Production charbon de bois, Utilisation culturelle, etc.)",0,1,3,1,NULL,592,NULL,"Vocation/Objectifs (Conservation, Valorisation, Ecotourisme, Droit d'usage (CDU), Restauration, Production, Reserve, Réhabilitation, Enrichissement, Reboisement, Exploitation, Production durable, Zone de culture, Plantes fourragères, Production charbon de bois, Utilisation culturelle, etc.)",""),
        (601,"Surface contrat 2 (ha)",0,1,3,1,NULL,592,NULL,"Surface contrat 2 (ha)",""),
        (602,"Date 1er contrat",0,1,3,1,NULL,592,NULL,"Date 1er contrat",""),
        (603,"Date Evaluation 1er contrat",0,1,3,0,NULL,592,NULL,"Date Evaluation 1er contrat",""),
        (604,"Date Déliberation",0,1,3,0,NULL,592,NULL,"Date Déliberation",""),
        (605,"Date 2ème contrat",0,1,3,0,NULL,592,NULL,"Date 2ème contrat",""),
        (606,"Ressources concernées dans le site de TG",0,1,3,0,NULL,592,NULL,"Ressources concernées dans le site de TG",""),
        (607,"Nombre des membres de COBA/VOI",0,1,3,0,NULL,592,NULL,"Nombre des membres de COBA/VOI",""),
        (608,"COBA/VOI opérationnelle (oui/non)",0,1,3,1,NULL,592,NULL,"COBA/VOI opérationnelle (oui/non)",""),
        (609,"Nombre de ménages bénéficiaires du TG",0,1,3,1,NULL,592,NULL,"Nombre de ménages bénéficiaires du TG",""),
        (610,"COBA/VOI appuyée/soutenue (oui/non)",0,1,3,1,87,592,NULL,"COBA/VOI appuyée/soutenue (oui/non)",""),
        (611,"Type d'appui pour TG (dotation matériels, formation, AGR…)",0,1,3,0,NULL,592,NULL,"Type d'appui pour TG (dotation matériels, formation, AGR…)",""),
        (612,"Organisme d'appui du TG",0,1,3,1,NULL,592,NULL,"Organisme d'appui du TG",""),
        (613,"Projet d'appui du TG",0,1,3,0,NULL,592,NULL,"Projet d'appui du TG",""),
        (614,"Identifiant du projet d'appui du TG",0,1,3,0,NULL,592,NULL,"Identifiant du projet d'appui du TG",""),
        (615,"Existence de suivi du TG (oui/non)",0,1,3,1,83,592,NULL,"Existence de suivi du TG (oui/non)",""),
        (616,"Objetcif du suivi de TG",0,1,3,0,NULL,592,NULL,"Objetcif du suivi de TG",""),
        (617,"Date de réalisation du suivi de TG",0,1,3,0,NULL,592,NULL,"Date de réalisation du suivi de TG",""),
        (618,"Equipe de réalisation du suivi de TG",0,1,3,0,NULL,592,NULL,"Equipe de réalisation du suivi de TG",""),
        (619,"Rapport de suivi de TG (oui/non)",0,1,3,0,NULL,592,NULL,"Rapport de suivi de TG (oui/non)",""),
        (620,"Date d'édition rapport de suivi TG",0,1,3,0,NULL,592,NULL,"Date d'édition rapport de suivi TG",""),
        (621,"Existence d'évaluation du TG (oui/non)",0,1,3,1,84,592,NULL,"Existence d'évaluation du TG (oui/non)",""),
        (622,"Objectif de l'évaluation de TG",0,1,3,0,NULL,592,NULL,"Objectif de l'évaluation de TG",""),
        (623,"Date de réalisation de l'évaluation de TG",0,1,3,0,NULL,592,NULL,"Date de réalisation de l'évaluation de TG",""),
        (624,"Equipe de réalisation de l'évaluation de TG",0,1,3,0,NULL,592,NULL,"Equipe de réalisation de l'évaluation de TG",""),
        (625,"Rapport d'évaluation de TG (oui/non)",0,1,3,0,NULL,592,NULL,"Rapport d'évaluation de TG (oui/non)",""),
        (626,"Date d'édition rapport évaluation TG",0,1,3,0,NULL,592,NULL,"Date d'édition rapport évaluation TG",""),
        (627,"Geojson TG",0,1,3,0,NULL,592,NULL,"Geojson TG",""),
        (628,"Observations TG",0,1,3,0,NULL,592,NULL,"Observations TG",""),
        (822,"Fichiers (TG) (.zip à importer)",0,1,3,0,NULL,592,NULL,"Fichiers (TG) (.zip à importer)",""),
                                                              
                                                              
                                                              
        (629,"Source de données pépinière",1,1,3,1,NULL,NULL,NULL,"Source de données pépinière",""),
        (630,"Date de création de la pépinière",0,1,3,1,NULL,629,NULL,"Date de création de la pépinière",""),
        (631,"Pépinière fonctionnelle (oui/non)",0,1,3,1,NULL,629,NULL,"Pépinière fonctionnelle (oui/non)",""),
        (632,"Commune d'implantation de la pépinière",0,1,3,1,NULL,629,NULL,"Commune d'implantation de la pépinière",""),
        (633,"Longitude pépinière (en degré décimal) : X",0,1,3,1,NULL,629,NULL,"Longitude pépinière (en degré décimal) : X",""),
        (634,"Latitude pépinière (en degré décimal) : Y",0,1,3,1,NULL,629,NULL,"Latitude pépinière (en degré décimal) : Y",""),
        (635,"Type de pépinière (villageoise, individuelle, institutionnelle, …)",0,1,3,0,NULL,629,NULL,"Type de pépinière (villageoise, individuelle, institutionnelle, …)",""),
        (636,"Pépinière privée (oui/non)",0,1,3,0,NULL,629,NULL,"Pépinière privée (oui/non)",""),
        (637,"Geojson localisation pépinière",0,1,3,0,NULL,629,NULL,"Geojson localisation pépinière",""),
        (638,"Source de financement de la pépinière (interne ou externe)",0,1,3,1,NULL,629,NULL,"Source de financement de la pépinière (interne ou externe)",""),
        (639,"Projet d'appui de la pépinière (si externe)",0,1,3,0,NULL,629,NULL,"Projet d'appui de la pépinière (si externe)",""),
        (640,"Identifiant du projet d'appui de la pépinière",0,1,3,0,NULL,629,NULL,"Identifiant du projet d'appui de la pépinière",""),
        (641,"Nom Propriétaire (Nom et prénom si personne physique ; Nom ou dénomination si personne morale)",0,1,3,0,NULL,629,NULL,"Nom Propriétaire (Nom et prénom si personne physique ; Nom ou dénomination si personne morale)",""),
        (642,"Genre du propriétaire (masculin, féminin, autre)",0,1,3,0,NULL,629,NULL,"Genre du propriétaire (masculin, féminin, autre)",""),
        (643,"Nombre total des employés",0,1,3,0,NULL,629,NULL,"Nombre total des employés",""),
        (644,"Nombre des femmes impliquées dans la production de plants",0,1,3,0,NULL,629,NULL,"Nombre des femmes impliquées dans la production de plants",""),
        (645,"Essences utilisées en pépinière",0,1,3,0,NULL,629,NULL,"Essences utilisées en pépinière",""),
        (646,"Capacite maximale de production (nombre)",0,1,3,0,NULL,629,NULL,"Capacite maximale de production (nombre)",""),
        (647,"Nombre de plants prêts à être mis en terre produits",0,1,3,1,NULL,629,NULL,"Nombre de plants prêts à être mis en terre produits",""),
        (648,"Observations pépinière",0,1,3,0,NULL,629,NULL,"Observations pépinière",""),
        (823,"Fichiers (pépinière) (.zip à importer)",0,1,3,0,NULL,629,NULL,"Fichiers (pépinière) (.zip à importer)",""),
                                                              
                                                              
                                                              
        (649,"Source de données DD",1,1,3,1,NULL,NULL,NULL,"Source de données DD",""),
        (650,"Intitulé de la SNICDD",0,1,3,1,NULL,649,NULL,"Intitulé de la SNICDD",""),
        (651,"Date d'élaboration de la SNICDD",0,1,3,0,NULL,649,NULL,"Date d'élaboration de la SNICDD",""),
        (652,"Parties prenantes dans l'élaboration",0,1,3,0,NULL,649,NULL,"Parties prenantes dans l'élaboration",""),
        (653,"SNICDD opérationnelle (oui/non)",0,1,3,0,NULL,649,NULL,"SNICDD opérationnelle (oui/non)",""),
        (654,"Intitulé de politique sectorielle alignée au DD",0,1,3,1,NULL,649,NULL,"Intitulé de politique sectorielle alignée au DD",""),
        (655,"Objectif de politique sectorielle alignée au DD",0,1,3,0,NULL,649,NULL,"Objectif de politique sectorielle alignée au DD",""),
        (656,"Date d'adoption de politique sectorielle alignée au DD",0,1,3,0,NULL,649,NULL,"Date d'adoption de politique sectorielle alignée au DD",""),
        (657,"Politique sectorielle alignée au DD opérationnelle (oui/non)",0,1,3,1,31,649,NULL,"Politique sectorielle alignée au DD opérationnelle (oui/non)",""),
        (658,"Intitulé de politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC)",0,1,3,1,NULL,649,NULL,"Intitulé de politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC)",""),
        (659,"Objectif de politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC)",0,1,3,0,NULL,649,NULL,"Objectif de politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC)",""),
        (660,"Date d'adoption de politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC)",0,1,3,0,NULL,649,NULL,"Date d'adoption de politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC)",""),
        (661,"Politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC) opérationnelle (oui/non)",0,1,3,0,NULL,649,NULL,"Politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC) opérationnelle (oui/non)",""),
        (662,"Nom de promoteur ayant un label de DD",0,1,3,1,NULL,649,NULL,"Nom de promoteur ayant un label de DD",""),
        (663,"Date d'obtention du label",0,1,3,0,NULL,649,NULL,"Date d'obtention du label",""),
        (664,"Commune d'obtention du label",0,1,3,1,NULL,649,NULL,"Commune d'obtention du label",""),
        (665,"Label toujours valide (oui/non)",0,1,3,0,NULL,649,NULL,"Label toujours valide (oui/non)",""),
        (666,"Intitulé du projet/programme en DD développé",0,1,3,1,NULL,649,NULL,"Intitulé du projet/programme en DD développé",""),
        (667,"Année de début projet/programme en DD",0,1,3,0,NULL,649,NULL,"Année de début projet/programme en DD",""),
        (668,"Année de fin projet/programme en DD",0,1,3,0,NULL,649,NULL,"Année de fin projet/programme en DD",""),
        (669,"Initiateur du projet/programme en DD",0,1,3,0,NULL,649,NULL,"Initiateur du projet/programme en DD",""),
        (670,"Intitulé du financement dans le cadre du DD",0,1,3,0,NULL,649,NULL,"Intitulé du financement dans le cadre du DD",""),
        (671,"Source de financement (interne ou externe)",0,1,3,0,NULL,649,NULL,"Source de financement (interne ou externe)",""),
        (672,"Date d'accord de financement",0,1,3,0,NULL,649,NULL,"Date d'accord de financement",""),
        (673,"Montant du financement (Ariary)",0,1,3,0,NULL,649,NULL,"Montant du financement (Ariary)",""),
        (674,"Identifiant du projet d'appui pour le DD",0,1,3,0,NULL,649,NULL,"Identifiant du projet d'appui pour le DD",""),
        (675,"Observations DD",0,1,3,0,NULL,649,NULL,"Observations DD",""),
        (824,"Fichiers (DD) (.zip à importer)",0,1,3,0,NULL,649,NULL,"Fichiers (DD) (.zip à importer)",""),
                                                              
                                                              
                                                              
        (676,"Source de données PSE",1,1,3,1,NULL,NULL,NULL,"Source de données PSE",""),
        (677,"Type de Services Environnementaux (régulation, production, …)",0,1,3,1,NULL,676,NULL,"Type de Services Environnementaux (régulation, production, …)",""),
        (678,"Fournisseur du SE (projets, Etat, communauté, …)",0,1,3,0,NULL,676,NULL,"Fournisseur du SE (projets, Etat, communauté, …)",""),
        (679,"Commune d'implantation du PSE",0,1,3,1,NULL,676,NULL,"Commune d'implantation du PSE",""),
        (680,"Intitulé de l'activité de PSE développée",0,1,3,1,NULL,676,NULL,"Intitulé de l'activité de PSE développée",""),
        (681,"Activités de PSE appuyées (oui/non)",0,1,3,0,NULL,676,NULL,"Activités de PSE appuyées (oui/non)",""),
        (682,"Type d'appui venant du PSE (dotation matériels, formation, AGR…)",0,1,3,0,NULL,676,NULL,"Type d'appui venant du PSE (dotation matériels, formation, AGR…)",""),
        (683,"Source de financement du PSE (interne ou externe)",0,1,3,1,NULL,676,NULL,"Source de financement du PSE (interne ou externe)",""),
        (684,"Projet d'appui du PSE (si externe)",0,1,3,0,NULL,676,NULL,"Projet d'appui du PSE (si externe)",""),
        (685,"Identifiant du projet d'appui pour le PSE",0,1,3,0,NULL,676,NULL,"Identifiant du projet d'appui pour le PSE",""),
        (686,"Nombre de ménages bénéficiaires du PSE",0,1,3,1,NULL,676,NULL,"Nombre de ménages bénéficiaires du PSE",""),
        (687,"Micro-projets financés (oui/non)",0,1,3,0,NULL,676,NULL,"Micro-projets financés (oui/non)",""),
        (688,"Lequel/lesquels?",0,1,3,0,NULL,676,NULL,"Lequel/lesquels?",""),
        (689,"Micro projets alternatifs réalisés (liste)",0,1,3,0,NULL,676,NULL,"Micro projets alternatifs réalisés (liste)",""),
        (690,"Micro-projets sont suivis (oui/non)",0,1,3,0,NULL,676,NULL,"Micro-projets sont suivis (oui/non)",""),
        (691,"Filières de la biodiversité dotées de mécanismes de partage équitable de bénéfices (liste)",0,1,3,0,NULL,676,NULL,"Filières de la biodiversité dotées de mécanismes de partage équitable de bénéfices (liste)",""),
        (692,"Projets alternatifs aux pressions mis en œuvre dans les zones d'intervention (liste)",0,1,3,0,NULL,676,NULL,"Projets alternatifs aux pressions mis en œuvre dans les zones d'intervention (liste)",""),
        (693,"Structures intercommunales appuyées (liste)",0,1,3,0,NULL,676,NULL,"Structures intercommunales appuyées (liste)",""),
        (694,"Etudes de filières en relation avec les PSE réalisées (liste)",0,1,3,0,NULL,676,NULL,"Etudes de filières en relation avec les PSE réalisées (liste)",""),
        (695,"Valeur des services ecosystémiques fournis (culturelle, éconimique, …)",0,1,3,0,NULL,676,NULL,"Valeur des services ecosystémiques fournis (culturelle, éconimique, …)",""),
        (696,"Observations PSE",0,1,3,0,NULL,676,NULL,"Observations PSE",""),
        (825,"Fichiers (PSE) (.zip à importer)",0,1,3,0,NULL,676,NULL,"Fichiers (PSE) (.zip à importer)",""),
                                                              
                                                              
                                                              
        (697,"Source de données corruption",1,1,3,1,NULL,NULL,NULL,"Source de données corruption",""),
        (698,"Type de doléances (corruption, manquement au code de déontologie et ethique environnementale)",0,1,3,1,NULL,697,NULL,"Type de doléances (corruption, manquement au code de déontologie et ethique environnementale)",""),
        (699,"Date de reception de doléance",0,1,3,0,NULL,697,NULL,"Date de reception de doléance",""),
        (700,"Doléances traitées (oui/non)",0,1,3,1,30,697,NULL,"Doléances traitées (oui/non)",""),
        (701,"Commune de réception de la doléance",0,1,3,1,NULL,697,NULL,"Commune de réception de la doléance",""),
        (702,"Type de corruption",0,1,3,0,NULL,697,NULL,"Type de corruption",""),
        (703,"Transmission des cas de corruption au Conseil de disipline (oui/non)",0,1,3,0,NULL,697,NULL,"Transmission des cas de corruption au Conseil de disipline (oui/non)",""),
        (704,"Sanction par le Conseil de discipline",0,1,3,0,NULL,697,NULL,"Sanction par le Conseil de discipline",""),
        (705,"Transmission à la juridication compétente des affaires de corruption (oui/non)",0,1,3,0,NULL,697,NULL,"Transmission à la juridication compétente des affaires de corruption (oui/non)",""),
        (706,"Nombre de personnes condamnées pour corruption",0,1,3,0,NULL,697,NULL,"Nombre de personnes condamnées pour corruption",""),
        (707,"Nombre d'infraction de blanchiment de capitaux retenu par le SAMIFIN",0,1,3,0,NULL,697,NULL,"Nombre d'infraction de blanchiment de capitaux retenu par le SAMIFIN",""),
        (708,"Médiatisation des poursuites judiciaires en matière de trafic de ressources naturelles (oui/non)",0,1,3,0,NULL,697,NULL,"Médiatisation des poursuites judiciaires en matière de trafic de ressources naturelles (oui/non)",""),
        (709,"Nombre d'intervention du BIANCO ",0,1,3,0,NULL,697,NULL,"Nombre d'intervention du BIANCO ",""),
        (710,"Identifiant du projet d'appui pour la lutte contre la corruption",0,1,3,0,NULL,697,NULL,"Identifiant du projet d'appui pour la lutte contre la corruption",""),
        (711,"Observations corruption",0,1,3,0,NULL,697,NULL,"Observations corruption",""),
        (826,"Fichiers (corruption) (.zip à importer)",0,1,3,0,NULL,697,NULL,"Fichiers (corruption) (.zip à importer)",""),
                                                              
                                                              
                                                              
        (712,"Source de données info projets",1,1,3,1,NULL,NULL,NULL,"Source de données info projets",""),
        (713,"Intitulé du projet",0,1,3,1,NULL,712,NULL,"Intitulé du projet",""),
        (714,"Région d'intervention",0,1,3,1,NULL,712,NULL,"Région d'intervention",""),
        (715,"Année de début et année de fin",0,1,3,1,NULL,712,NULL,"Année de début et année de fin",""),
        (716,"Thématique touchée",0,1,3,1,NULL,712,NULL,"Thématique touchée",""),
        (717,"Coût total",0,1,3,1,NULL,712,NULL,"Coût total",""),
        (718,"Objectif général ",0,1,3,1,NULL,712,NULL,"Objectif général ",""),
        (719,"Objectifs specifiques",0,1,3,1,NULL,712,NULL,"Objectifs specifiques",""),
        (720,"Bénéficiaires",0,1,3,1,NULL,712,NULL,"Bénéficiaires",""),
        (721,"Résultats et effets attendus",0,1,3,1,NULL,712,NULL,"Résultats et effets attendus",""),
        (722,"Activités principales",0,1,3,1,NULL,712,NULL,"Activités principales",""),
        (723,"Financement (Subvention, co-financement, Ressource Propre Interne, don, emprunt, …)",0,1,3,1,NULL,712,NULL,"Financement (Subvention, co-financement, Ressource Propre Interne, don, emprunt, …)",""),
        (724,"Code/Identifiant du projet",0,1,3,1,NULL,712,NULL,"Code/Identifiant du projet",""),
        (725,"Observations info projets",0,1,3,0,NULL,712,NULL,"Observations info projets",""),
        (827,"Fichiers (info projets) (.zip à importer)",0,1,3,0,NULL,712,NULL,"Fichiers (info projets) (.zip à importer)","")`
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
