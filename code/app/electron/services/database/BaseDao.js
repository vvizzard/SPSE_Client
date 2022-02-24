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

    // Set values to indicateur
    sql.push(
      `INSERT INTO "indicateur" ("id","label","comment","thematique_id", "sum", "moy", "count") VALUES 
        (1,"Quantité de produit déclaré ","",1,1,0,0),
        (2,"Nombre d'autorisation de recherche délivrée ","",2,0,0,1),
        (3,"Superficie des Aires protégées ","",3,1,0,0),
        (5,"Nombre AP ayant un gestionnaire","",3,0,0,1),
        (6,"Nombre de ménages bénéficiant des activités de conservations/développement (AGR)","",3,1,0,0),
        (7,"Nombre d'activités réalisées dans les PAG","",3,1,0,0),
        (8,"Superficie Aire protégée restaurée","",3,1,0,0),
        (9,"Espèces objet de trafic illicite","",4,0,0,1),
        (10,"Nombre de textes élaborés","",5,0,0,1),
        (11,"Nombre de textes mis à jour","",5,0,0,1),
        (12,"Nombre de conventions ratifiées","",5,0,0,1),
        (13,"Nombre de textes adoptés","",5,0,0,1),
        (14,"Nombre de victimes touchés par les catastrophes naturelles","",6,1,0,0),
        (15,"Nombre de ménages bénéficiaires d'action de lutte contre le changement climatique","",7,1,0,0),
        (16,"Superficie de puit de carbone géré durablement","",7,1,0,0),
        (17,"Contrôles environnementaux effectués","",8,0,0,1),
        (18,"Nombre d'infractions environnementales constatées","",8,1,0,0),
        (19,"Nombre de dossiers d'infractions environnementales traités","",8,1,0,0),
        (20,"Nombre de plaintes environnementales reçues","",8,1,0,0),
        (21,"Nombre de plaintes environnementales traitées ","",8,1,0,0),
        (22,"Nombre de contrôles forestiers effectués","",9,0,0,1),
        (23,"Nombre d'infractions forestières constatées","",9,1,0,0),
        (24,"Nombre de dossiers d'infractions forestières traités","",9,1,0,0),
        (25,"Nombre d'infractions forestiers déférées","",9,1,0,0),
        (26,"Nombre de cas de transaction avant jugement","",9,1,0,0),
        (27,"Quantité de produits saisis ","",9,1,0,0),
        (28,"Nombre de conventions de partenariat développées et signées","",10,0,0,1),
        (29,"Projets issus des partenariats ","",10,0,0,1),
        (30,"Certifications vertes promues par chaîne de valeurs liées aux ressources naturelles","",11,0,0,1),
        (31,"Nombre d'emplois verts décents créés","",11,1,0,0),
        (32,"Promotion d'alternative écologique","",11,0,0,1),
        (33,"Mise en conformité, permis et/ou autorisation environnementale (PREE), permis environnementaux délivrés","",12,0,0,1),
        (34,"Nombre d'infrastructures de gestion de déchets créées","",12,0,0,1),
        (35,"Surfaces brûlées ","",13,1,0,0),
        (36,"Longueur totale de pare-feu","",13,1,0,0),
        (37,"Structures opérationnelles de gestion des feux","",13,0,0,1),
        (38,"Structures de gestion des feux","",13,0,0,1),
        (39,"Système d'alerte de feux","",13,0,0,1),
        (40,"Recettes perçues (par thématiques d'intérêts)","",14,1,0,0),
        (41,"Montant du fond public mobilisé","",14,1,0,0),
        (42,"Montant du financement extérieur ou privé mobilisé","",14,1,0,0),
        (43,"Montant des dons mobilisés","",14,1,0,0),
        (44,"Montant de prêts budgétaires mobilisés","",14,1,0,0),
        (45,"Nombre de Districts","",15,0,0,1),
        (46,"Nombre de communes","",15,1,0,0),
        (47,"Nombre de population","",15,1,0,0),
        (48,"Nombre d'IEC effectuées ","",16,0,0,1),
        (49,"Nombre de participants formés","",16,1,0,0),
        (50,"Nombre d'agents de l'administration formés","",16,1,0,0),
        (51,"Nombre de séance de formation","",16,1,0,0),
        (52,"Nombre d'infrastructures ","",17,0,0,1),
        (53,"Nombre d'infrastructures construites ou réhabilitées ","",17,0,0,1),
        (54,"Nombre de matériel roulant ","",18,0,0,1),
        (55,"Nombre de matériel informatique ","",19,1,0,0),
        (56,"Nombre de matériel mobilier ","",20,1,0,0),
        (57,"Nombre de guides produits","",21,1,0,0),
        (58,"Nombre d'outils disponibles et utilisés","",21,1,0,0),
        (59,"Projets qui ont fait l'objet de planification","",22,0,0,1),
        (60,"Projets qui ont fait l'objet de suivi","",22,0,0,1),
        (61,"Projets qui ont fait l'objet d'évaluation","",22,0,0,1),
        (62,"Nombre de programmation éffectuée","",22,1,0,0),
        (63,"Base de données mise en place ","",22,0,0,1),
        (64,"Système d'information opérationnel","",22,0,0,1),
        (65,"Superficie reboisée ","",23,1,0,0),
        (66,"Superficie restaurée","",23,1,0,0),
        (67,"Superficie des dunes stabilisées","",23,1,0,0),
        (68,"Nombre de plants mis en terre","",23,1,0,0),
        (69,"Nombre de recherches effectuées","",24,0,0,1),
        (70,"Résultats de recherches disponibles","",24,0,0,1),
        (71,"Résultats de recherches appliqués","",24,0,0,1),
        (72,"Produits de recherche diffusés, vulgarisés, promus","",24,0,0,1),
        (73,"Nombre de projets développés dans le cadre de RSE","",25,0,0,1),
        (74,"Nombre de poste","",26,0,0,1),
        (75,"Nombre de personnel ","",26,0,0,1),
        (76,"Superficie de TG nouvellement créé","",27,1,0,0),
        (77,"Superficie de TG renouvelé","",27,1,0,0),
        (78,"TG suivi","",27,0,0,1),
        (79,"TG évalué","",27,0,0,1),
        (80,"Nombre de ménages bénéficiaires de TG","",27,1,0,0),
        (81,"COBA formées","",27,0,0,1),
        (82,"Association (COBA/VOI) soutenue","",27,0,0,1),
        (83,"Nombre de plants produits","",28,1,0,0),
        (84,"Politiques sectorielles alignées au DD ","",29,0,0,1),
        (85,"Nombre de promoteur ayant un label de DD ","",29,1,0,0),
        (86,"Nombre d'activités PSE développées","",30,0,0,1),
        (87,"Nombre de ménages bénéficiaires des activités de PSE","",30,1,0,0),
        (88,"Nombre de doléances sur la corruption reçues","",31,1,0,0),
        (89,"Doléances sur la corruption traitées","",31,1,0,0)`
    );

    // Set values to question
    sql.push(
      `INSERT INTO question (id, question, is_principale, field_type, level, obligatoire, indicateur_id, question_mere_id, objectif, label, unite) VALUES 
        (1,"Commune d'intervention pour les actes",1,1,3,1,NULL,NULL,NULL,"Commune d'intervention pour les actes",""),
        (2,"Type d'actes administratrifs (permis de coupe, autorisation de coupe, permis d'exploitation, convention de collecte PFNL)",0,1,3,1,1,1,NULL,"Type d'actes administratrifs (permis de coupe, autorisation de coupe, permis d'exploitation, convention de collecte PFNL)",""),
        (3,"Référence de l'acte administratif",0,1,3,1,NULL,1,NULL,"Référence de l'acte administratif",""),
        (4,"Types de produits inscrits dans l'acte administratif (Anacarde (kg), Baie rose (kg), Bois COS (m³), Bois de chauffe (stère), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",0,1,3,1,NULL,1,NULL,"Types de produits inscrits dans l'acte administratif (Anacarde (kg), Baie rose (kg), Bois COS (m³), Bois de chauffe (stère), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",""),
        (5,"Espèces concernées par l'acte administratif",0,1,3,1,NULL,1,NULL,"Espèces concernées par l'acte administratif",""),
        (6,"Quantité totale des produits inscrits dans l'acte administratif",0,1,3,1,NULL,1,NULL,"Quantité totale des produits inscrits dans l'acte administratif",""),
        (7,"Quantité des produits exportés inscrits dans l'acte administratif",0,1,3,1,NULL,1,NULL,"Quantité des produits exportés inscrits dans l'acte administratif",""),
        (8,"Destination des produits inscrits dans l'acte administratif (autoconsommation/marché local/marché national/exportation)",0,1,3,1,NULL,1,NULL,"Destination des produits inscrits dans l'acte administratif (autoconsommation/marché local/marché national/exportation)",""),
        (9,"Existence d'autorisation de transport octroyée (oui/non)",0,1,3,1,NULL,1,NULL,"Existence d'autorisation de transport octroyée (oui/non)",""),
        (10,"Référence d'autorisation de transport",0,1,3,1,NULL,1,NULL,"Référence d'autorisation de transport",""),
        (11,"Existence de laissez-passer délivré (oui/non)",0,1,3,1,NULL,1,NULL,"Existence de laissez-passer délivré (oui/non)",""),
        (12,"Référence de laissez-passer",0,1,3,1,NULL,1,NULL,"Référence de laissez-passer",""),
        (13,"Nom de l'opérateur",0,1,3,0,NULL,1,NULL,"Nom de l'opérateur",""),
        (14,"Exportateur agréé (oui/non)",0,1,3,0,NULL,1,NULL,"Exportateur agréé (oui/non)",""),
        (15,"Valeur (annuelle) des produits à l'exportation (Ariary)",0,1,3,0,NULL,1,NULL,"Valeur (annuelle) des produits à l'exportation (Ariary)",""),
        (16,"Acte de conformité/de refus d'importation des produits avec référence",0,1,3,0,NULL,1,NULL,"Acte de conformité/de refus d'importation des produits avec référence",""),
        (17,"Observations actes administratifs exploitation",0,1,3,0,NULL,1,NULL,"Observations actes administratifs exploitation",""),
        (18,"Source de données actes administratifs exploitation",0,1,3,1,NULL,1,NULL,"Source de données actes administratifs exploitation",""),
    
    
    
        (19,"Autorisation de recherche délivrée (oui/non)",1,1,3,1,2,NULL,NULL,"Autorisation de recherche délivrée (oui/non)",""),
        (20,"Référence d'autorisation de recherche",0,1,3,1,NULL,19,NULL,"Référence d'autorisation de recherche",""),
        (21,"Produits associés (faune ou flore)",0,1,3,1,NULL,19,NULL,"Produits associés (faune ou flore)",""),
        (22,"Espèces mises en jeu",0,1,3,0,NULL,19,NULL,"Espèces mises en jeu",""),
        (23,"Quotas de prélèvement",0,1,3,0,NULL,19,NULL,"Quotas de prélèvement",""),
        (24,"Observations actes administratifs recherche",0,1,3,0,NULL,19,NULL,"Observations actes administratifs recherche",""),
        (25,"Source de données actes administratifs recherche",0,1,3,1,NULL,19,NULL,"Source de données actes administratifs recherche",""),
    
    
    
        (26,"Nom de l'AP",1,1,3,1,NULL,NULL,NULL,"Nom de l'AP",""),
        (27,"Catégorie de l'AP (I, II, III, IV, V, VI, Autre)",0,1,3,1,NULL,26,NULL,"Catégorie de l'AP (I, II, III, IV, V, VI, Autre)",""),
        (28,"Statut temporaire ou définitif",0,1,3,0,NULL,26,NULL,"Statut temporaire ou définitif",""),
        (29,"Décret si définitif",0,1,3,0,NULL,26,NULL,"Décret si définitif",""),
        (30,"Shapefile de l'AP",0,1,3,0,NULL,26,NULL,"Shapefile de l'AP",""),
        (31,"Type : terrestre ou marine",0,1,3,1,3,26,NULL,"Type : terrestre ou marine",""),
        (32,"Présence de zones humides (oui/non)",0,1,3,1,NULL,26,NULL,"Présence de zones humides (oui/non)",""),
        (33,"Superficie zones humides (ha)",0,1,3,1,NULL,26,NULL,"Superficie zones humides (ha)",""),
        (34,"Nom du gestionnaire",0,1,3,1,NULL,26,NULL,"Nom du gestionnaire",""),
        (35,"Nombre de ménages bénéficiant des activités de conservations/développement (AGR)",0,1,3,1,NULL,26,NULL,"Nombre de ménages bénéficiant des activités de conservations/développement (AGR)",""),
        (36,"Existence de PAG élaboré (oui/non)",0,1,3,1,NULL,26,NULL,"Existence de PAG élaboré (oui/non)",""),
        (37,"Nombre d'activités dans le PAG",0,1,3,1,NULL,26,NULL,"Nombre d'activités dans le PAG",""),
        (38,"Nombre d'activités réalisées dans le PAG",0,1,3,1,NULL,26,NULL,"Nombre d'activités réalisées dans le PAG",""),
        (39,"Existence de PGES élaboré (oui/non)",0,1,3,0,NULL,26,NULL,"Existence de PGES élaboré (oui/non)",""),
        (40,"Existence de EIE réalisé (oui/non)",0,1,3,0,NULL,26,NULL,"Existence de EIE réalisé (oui/non)",""),
        (41,"Existence de permis environnemental délivré (oui/non)",0,1,3,0,NULL,26,NULL,"Existence de permis environnemental délivré (oui/non)",""),
        (42,"AP redélimitée (oui/non)",0,1,3,0,NULL,26,NULL,"AP redélimitée (oui/non)",""),
        (43,"Superficie de l'AP (ha)",0,1,3,1,NULL,26,NULL,"Superficie de l'AP (ha)",""),
        (44,"Superficie restaurée dans l'AP (ha)",0,1,3,1,NULL,26,NULL,"Superficie restaurée dans l'AP (ha)",""),
        (45,"Contrat de délégation de gestion signé (oui/non)",0,1,3,0,NULL,26,NULL,"Contrat de délégation de gestion signé (oui/non)",""),
        (46,"AP disposant de structures opérationnelles de gestion (oui/non)",0,1,3,0,5,26,NULL,"AP disposant de structures opérationnelles de gestion (oui/non)",""),
        (47,"AP dont la création et la gestion sont appuyées (oui/non)",0,1,3,0,NULL,26,NULL,"AP dont la création et la gestion sont appuyées (oui/non)",""),
        (48,"Type d'appui pour l'AP (dotation matériels, formation, AGR, …)",0,1,3,0,NULL,26,NULL,"Type d'appui pour l'AP (dotation matériels, formation, AGR, …)",""),
        (49,"Source de financement de l'AP (interne ou externe)",0,1,3,1,NULL,26,NULL,"Source de financement de l'AP (interne ou externe)",""),
        (50,"Projet d'appui de l'AP (si externe)",0,1,3,1,NULL,26,NULL,"Projet d'appui de l'AP (si externe)",""),
        (51,"Identifiant du projet d'appui de l'AP",0,1,3,0,NULL,26,NULL,"Identifiant du projet d'appui de l'AP",""),
        (52,"AP dotée d'un système de gestion administrative et financière (oui/non)",0,1,3,0,NULL,26,NULL,"AP dotée d'un système de gestion administrative et financière (oui/non)",""),
        (53,"AP dotée d'un système de suivi écologique opérationnel (oui/non)",0,1,3,0,NULL,26,NULL,"AP dotée d'un système de suivi écologique opérationnel (oui/non)",""),
        (54,"AP disposant d'un résultat de suivi écologique (oui/non)",0,1,3,0,NULL,26,NULL,"AP disposant d'un résultat de suivi écologique (oui/non)",""),
        (55,"AP dotée de système de gestion des feux (oui/non)",0,1,3,0,NULL,26,NULL,"AP dotée de système de gestion des feux (oui/non)",""),
        (56,"AP dotée d'un système de surveillance et de contrôle opérationnel (oui/non)",0,1,3,0,NULL,26,NULL,"AP dotée d'un système de surveillance et de contrôle opérationnel (oui/non)",""),
        (57,"AP avec maintenance/entretien des infrastructures de conservation assurés (oui/non)",0,1,3,0,NULL,26,NULL,"AP avec maintenance/entretien des infrastructures de conservation assurés (oui/non)",""),
        (58,"AP dotée d'infrastructures écotouristiques (oui/non)",0,1,3,0,NULL,26,NULL,"AP dotée d'infrastructures écotouristiques (oui/non)",""),
        (59,"AP avec maintenance et entretien des infrastructures écotouristiques et de service assurés (oui/non)",0,1,3,0,NULL,26,NULL,"AP avec maintenance et entretien des infrastructures écotouristiques et de service assurés (oui/non)",""),
        (60,"AP faisant objet d'un zonage matérialisé (oui/non)",0,1,3,0,NULL,26,NULL,"AP faisant objet d'un zonage matérialisé (oui/non)",""),
        (61,"AP mettant en œuvre dans leurs ZP des programmes spécifiques d'éducation environnementale (oui/non)",0,1,3,0,NULL,26,NULL,"AP mettant en œuvre dans leurs ZP des programmes spécifiques d'éducation environnementale (oui/non)",""),
        (62,"AP faisant objet de restauration d’habitats (oui/non)",0,1,3,0,NULL,26,NULL,"AP faisant objet de restauration d’habitats (oui/non)",""),
        (63,"Indice d'efficacité globale de gestion de l'AP",0,1,3,1,NULL,26,NULL,"Indice d'efficacité globale de gestion de l'AP",""),
        (64,"Liste des menaces et pressions recensées",0,1,3,0,NULL,26,NULL,"Liste des menaces et pressions recensées",""),
        (65,"Taux de réduction des menaces au niveau de l'AP (%)",0,1,3,0,NULL,26,NULL,"Taux de réduction des menaces au niveau de l'AP (%)",""),
        (66,"Taux de déforestation annuelle (%)",0,1,3,0,NULL,26,NULL,"Taux de déforestation annuelle (%)",""),
        (67,"Nom de sites hors AP disposant de plan d'aménagement et de gestion écotouristique opérationnel (liste)",0,1,3,0,NULL,26,NULL,"Nom de sites hors AP disposant de plan d'aménagement et de gestion écotouristique opérationnel (liste)",""),
        (68,"Observations AP",0,1,3,0,NULL,26,NULL,"Observations AP",""),
        (69,"Source de données AP",0,1,3,1,NULL,26,NULL,"Source de données AP",""),
    
    
    
        (70,"Espèce inventoriée",1,1,3,1,NULL,NULL,NULL,"Espèce inventoriée",""),
        (71,"Nom vernaculaire",0,1,3,1,NULL,70,NULL,"Nom vernaculaire",""),
        (72,"Commune d'intervention pour l'inventaire",0,1,3,1,NULL,70,NULL,"Commune d'intervention pour l'inventaire",""),
        (73,"Longitude (degré décimal) : X",0,1,3,1,NULL,70,NULL,"Longitude (degré décimal) : X",""),
        (74,"Latitude (degré décimal) : Y",0,1,3,1,NULL,70,NULL,"Latitude (degré décimal) : Y",""),
        (75,"Shapefile correspondant biodiversité",0,1,3,0,NULL,70,NULL,"Shapefile correspondant biodiversité",""),
        (76,"Statut UICN",0,1,3,0,NULL,70,NULL,"Statut UICN",""),
        (77,"Endémique (oui/non)",0,1,3,0,NULL,70,NULL,"Endémique (oui/non)",""),
        (78,"Ressource phare (oui/non)",0,1,3,0,NULL,70,NULL,"Ressource phare (oui/non)",""),
        (79,"Ressource menacée (oui/non)",0,1,3,0,NULL,70,NULL,"Ressource menacée (oui/non)",""),
        (80,"Cible de conservation (oui/non)",0,1,3,0,NULL,70,NULL,"Cible de conservation (oui/non)",""),
        (81,"Nom de l'AP de provenance de la ressource",0,1,3,0,NULL,70,NULL,"Nom de l'AP de provenance de la ressource",""),
        (82,"Liste des menaces et pressions recensées",0,1,3,0,NULL,70,NULL,"Liste des menaces et pressions recensées",""),
        (83,"Liste PFL associés",0,1,3,0,NULL,70,NULL,"Liste PFL associés",""),
        (84,"PFL inscrit dans CITES (oui/non)",0,1,3,0,NULL,70,NULL,"PFL inscrit dans CITES (oui/non)",""),
        (85,"Liste PFNL associés",0,1,3,0,NULL,70,NULL,"Liste PFNL associés",""),
        (86,"PFNL inscrit dans CITES (oui/non)",0,1,3,0,NULL,70,NULL,"PFNL inscrit dans CITES (oui/non)",""),
        (87,"Existence de filière concernant la ressource/biodiversité (oui/non)",0,1,3,0,NULL,70,NULL,"Existence de filière concernant la ressource/biodiversité (oui/non)",""),
        (88,"Appui financier et/ou technique de la filière (oui/non)",0,1,3,0,NULL,70,NULL,"Appui financier et/ou technique de la filière (oui/non)",""),
        (89,"Source de financement de l'inventaire de biodiversité (interne ou externe)",0,1,3,1,NULL,70,NULL,"Source de financement de l'inventaire de biodiversité (interne ou externe)",""),
        (90,"Projet d'appui pour l'inventaire de biodiversité (si externe)",0,1,3,1,NULL,70,NULL,"Projet d'appui pour l'inventaire de biodiversité (si externe)",""),
        (91,"Identifiant du projet d'appui pour la biodiversité",0,1,3,0,NULL,70,NULL,"Identifiant du projet d'appui pour la biodiversité",""),
        (92,"Espèce objet de trafic illicite (oui/non)",0,1,3,1,9,70,NULL,"Espèce objet de trafic illicite (oui/non)",""),
        (93,"Date de constat",0,1,3,0,NULL,70,NULL,"Date de constat",""),
        (94,"Quantité saisie",0,1,3,0,NULL,70,NULL,"Quantité saisie",""),
        (95,"Unité de mesure des effets saisies",0,1,3,0,NULL,70,NULL,"Unité de mesure des effets saisies",""),
        (96,"Dossier de traffic traité (oui/non)",0,1,3,0,NULL,70,NULL,"Dossier de traffic traité (oui/non)",""),
        (97,"Référence du dossier",0,1,3,0,NULL,70,NULL,"Référence du dossier",""),
        (98,"Images de la biodiversité",0,1,3,0,NULL,70,NULL,"Images de la biodiversité",""),
        (99,"Observations biodiversité",0,1,3,0,NULL,70,NULL,"Observations biodiversité",""),
        (100,"Source de données biodiversité",0,1,3,1,NULL,70,NULL,"Source de données biodiversité",""),
    
    
    
        (101,"Intitulé du cadre",1,1,3,1,NULL,NULL,NULL,"Intitulé du cadre",""),
        (102,"Type (Convention, Loi, Décret, Arrêté, Circulaire)",0,1,3,1,NULL,101,NULL,"Type (Convention, Loi, Décret, Arrêté, Circulaire)",""),
        (103,"Cadre legislatif ou technique",0,1,3,1,NULL,101,NULL,"Cadre legislatif ou technique",""),
        (104,"Thématique",0,1,3,1,NULL,101,NULL,"Thématique",""),
        (105,"Objectifs du cadre",0,1,3,1,NULL,101,NULL,"Objectifs du cadre",""),
        (106,"Date de promulgation",0,1,3,1,NULL,101,NULL,"Date de promulgation",""),
        (107,"Date de validation",0,1,3,1,NULL,101,NULL,"Date de validation",""),
        (108,"Secteur concerné par le cadre",0,1,3,1,NULL,101,NULL,"Secteur concerné par le cadre",""),
        (109,"Légiferer (oui/non)",0,1,3,1,NULL,101,NULL,"Légiferer (oui/non)",""),
        (110,"Nouveau (oui/non)",0,1,3,1,NULL,101,NULL,"Nouveau (oui/non)",""),
        (111,"Mis à jour (oui/non)",0,1,3,1,11,101,NULL,"Mis à jour (oui/non)",""),
        (112,"Ratifié (oui/non)",0,1,3,1,12,101,NULL,"Ratifié (oui/non)",""),
        (113,"Adopté (oui/non)",0,1,3,1,13,101,NULL,"Adopté (oui/non)",""),
        (114,"Cadre mis en œuvre (oui/non)",0,1,3,1,NULL,101,NULL,"Cadre mis en œuvre (oui/non)",""),
        (115,"Intégrant la cohérence intersectorielle sur la gestion environnementale et climatique (oui/non)",0,1,3,1,NULL,101,NULL,"Intégrant la cohérence intersectorielle sur la gestion environnementale et climatique (oui/non)",""),
        (116,"Textes d'application (liste)",0,1,3,1,NULL,101,NULL,"Textes d'application (liste)",""),
        (117,"Identifiant du projet d'appui pour le cadre",0,1,3,0,NULL,101,NULL,"Identifiant du projet d'appui pour le cadre",""),
        (118,"Fichiers (cadre)",0,1,3,0,NULL,101,NULL,"Fichiers (cadre)",""),
        (119,"Observations cadre",0,1,3,0,NULL,101,NULL,"Observations cadre",""),
        (120,"Source de données cadre",0,1,3,1,NULL,101,NULL,"Source de données cadre",""),
    
    
    
        (121,"Nature des catastrophes naturelles",1,1,3,1,NULL,NULL,NULL,"Nature des catastrophes naturelles",""),
        (122,"Date de la catastrophe naturelle",0,1,3,0,NULL,121,NULL,"Date de la catastrophe naturelle",""),
        (123,"Nombre de victimes corporelles dues aux catastrophes naturelles",0,1,3,1,NULL,121,NULL,"Nombre de victimes corporelles dues aux catastrophes naturelles",""),
        (124,"Nombre de personnes déplacées pour cause d’aléas climatiques",0,1,3,0,NULL,121,NULL,"Nombre de personnes déplacées pour cause d’aléas climatiques",""),
        (125,"Matériels endommagés dus aux catastrophes naturelles",0,1,3,0,NULL,121,NULL,"Matériels endommagés dus aux catastrophes naturelles",""),
        (126,"Ampleur des dommages matériels dus aux catastrophes naturelles (faible, moyen, fort)",0,1,3,0,NULL,121,NULL,"Ampleur des dommages matériels dus aux catastrophes naturelles (faible, moyen, fort)",""),
        (127,"Liste de zones enclavées suite aux aléas climatiques",0,1,3,0,NULL,121,NULL,"Liste de zones enclavées suite aux aléas climatiques",""),
        (128,"Identifiant du projet d'appui pour la lutte contre le CC et REDD+",0,1,3,0,NULL,121,NULL,"Identifiant du projet d'appui pour la lutte contre le CC et REDD+",""),
        (129,"Observations CC et REDD+",0,1,3,0,NULL,121,NULL,"Observations CC et REDD+",""),
        (130,"Source de données CC et REDD+",0,1,3,1,NULL,121,NULL,"Source de données CC et REDD+",""),
    
    
        (131,"Nom des plans de mise en œuvre de la Politique Nationale de Lutte contre le Changement Climatique mise en place",1,1,3,0,NULL,NULL,NULL,"Nom des plans de mise en œuvre de la Politique Nationale de Lutte contre le Changement Climatique mise en place",""),
        (132,"Nom de projet d'adaptation et résilience au changement climatique et REDD+",0,1,3,0,NULL,131,NULL,"Nom de projet d'adaptation et résilience au changement climatique et REDD+",""),
        (133,"Plan et projet mis en œuvre (oui/non)",0,1,3,0,NULL,131,NULL,"Plan et projet mis en œuvre (oui/non)",""),
        (134,"Activités sectorielles ou projets intégrant le climat et le changement climatique (liste)",0,1,3,0,NULL,131,NULL,"Activités sectorielles ou projets intégrant le climat et le changement climatique (liste)",""),
        (135,"Stations climatologiques participant à la veille climatique et agrométéorologique (liste)",0,1,3,0,NULL,131,NULL,"Stations climatologiques participant à la veille climatique et agrométéorologique (liste)",""),
        (136,"Action de lutte contre le changement climatique intégrée dans la promotion d'une économie résiliente (liste)",0,1,3,0,NULL,131,NULL,"Action de lutte contre le changement climatique intégrée dans la promotion d'une économie résiliente (liste)",""),
        (137,"Commune d'intervention pour la lutte contre CC",0,1,3,1,NULL,131,NULL,"Commune d'intervention pour la lutte contre CC",""),
        (138,"Nombre de ménages bénéficiaires pour la lutte contre CC",0,1,3,1,NULL,131,NULL,"Nombre de ménages bénéficiaires pour la lutte contre CC",""),
        (139,"Nombre de femmes bénéficiaires pour la lutte contre CC",0,1,3,0,NULL,131,NULL,"Nombre de femmes bénéficiaires pour la lutte contre CC",""),
        (140,"Nombre de jeunes bénéficiaires pour la lutte contre CC",0,1,3,0,NULL,131,NULL,"Nombre de jeunes bénéficiaires pour la lutte contre CC",""),
        (141,"Source de financement pour la lutte contre CC (interne ou externe)",0,1,3,1,NULL,131,NULL,"Source de financement pour la lutte contre CC (interne ou externe)",""),
        (142,"Projet d'appui pour la lutte contre CC (si externe)",0,1,3,1,NULL,131,NULL,"Projet d'appui pour la lutte contre CC (si externe)",""),
        (143,"Identifiant du projet d'appui pour la lutte contre le CC et REDD+ (centrale)",0,1,3,0,NULL,131,NULL,"Identifiant du projet d'appui pour la lutte contre le CC et REDD+ (centrale)",""),
        (144,"Surface de forêts gérées dans le cadre du CC et REDD+ (ha)",0,1,3,1,NULL,131,NULL,"Surface de forêts gérées dans le cadre du CC et REDD+ (ha)",""),
        (145,"Shapefile correspondant CC et REDD+",0,1,3,0,NULL,131,NULL,"Shapefile correspondant CC et REDD+",""),
        (146,"Taux d'emission de CO2 (%)",0,1,3,0,NULL,131,NULL,"Taux d'emission de CO2 (%)",""),
        (147,"Observations CC et REDD+ (centrale)",0,1,3,0,NULL,131,NULL,"Observations CC et REDD+ (centrale)",""),
        (148,"Source de données CC et REDD+ (centrale)",0,1,3,1,NULL,131,NULL,"Source de données CC et REDD+ (centrale)",""),
    
    
    
        (149,"Intitulé de la mission de contrôle environnemental",1,1,3,1,NULL,NULL,NULL,"Intitulé de la mission de contrôle environnemental",""),
        (150,"Date de la mission de contrôle environnemental",0,1,3,0,NULL,149,NULL,"Date de la mission de contrôle environnemental",""),
        (151,"Mission de contrôle environnemental effectuée ou réalisée (oui/non)",0,1,3,1,17,149,NULL,"Mission de contrôle environnemental effectuée ou réalisée (oui/non)",""),
        (152,"Commune de réalisation du contrôle environnemental",0,1,3,1,NULL,149,NULL,"Commune de réalisation du contrôle environnemental",""),
        (153,"Nombre d'infraction environnementale",0,1,3,1,NULL,149,NULL,"Nombre d'infraction environnementale",""),
        (154,"Nature de l'infraction environnementale",0,1,3,0,NULL,149,NULL,"Nature de l'infraction environnementale",""),
        (155,"Motif de PV d'infraction environnementale établi (constat)",0,1,3,0,NULL,149,NULL,"Motif de PV d'infraction environnementale établi (constat)",""),
        (156,"Référence de dossiers d'infractions environnementales",0,1,3,1,NULL,149,NULL,"Référence de dossiers d'infractions environnementales",""),
        (157,"Nombre de dossier d'infractions environnementales traité",0,1,3,1,NULL,149,NULL,"Nombre de dossier d'infractions environnementales traité",""),
        (158,"Existence de dispositifs de contrôle environnemental de proximité (oui/non)",0,1,3,0,NULL,149,NULL,"Existence de dispositifs de contrôle environnemental de proximité (oui/non)",""),
        (159,"Dispositifs de contrôle redynamisés (oui/non)",0,1,3,0,NULL,149,NULL,"Dispositifs de contrôle redynamisés (oui/non)",""),
        (160,"Nombre de plaintes environnementales reçues",0,1,3,1,NULL,149,NULL,"Nombre de plaintes environnementales reçues",""),
        (161,"Intitulé de plaintes environnementales déposées avec référence (liste)",0,1,3,0,NULL,149,NULL,"Intitulé de plaintes environnementales déposées avec référence (liste)",""),
        (162,"Date de déposition des plainte",0,1,3,0,NULL,149,NULL,"Date de déposition des plainte",""),
        (163,"Nombre de plaintes environnementales traitées",0,1,3,1,NULL,149,NULL,"Nombre de plaintes environnementales traitées",""),
        (164,"Secteur concerné (Agriculture, Industrie, Service)",0,1,3,1,21,149,NULL,"Secteur concerné (Agriculture, Industrie, Service)",""),
        (165,"Date de début de traitement",0,1,3,0,NULL,149,NULL,"Date de début de traitement",""),
        (166,"Nombre de plaintes environnementales résolues",0,1,3,1,NULL,149,NULL,"Nombre de plaintes environnementales résolues",""),
        (167,"Date de résolution des plaintes",0,1,3,0,NULL,149,NULL,"Date de résolution des plaintes",""),
        (168,"Mesures correctives et recommandations",0,1,3,0,NULL,149,NULL,"Mesures correctives et recommandations",""),
        (169,"Identifiant du projet d'appui pour les contrôles environnementaux",0,1,3,0,NULL,149,NULL,"Identifiant du projet d'appui pour les contrôles environnementaux",""),
        (170,"Observations contrôles environnementaux",0,1,3,0,NULL,149,NULL,"Observations contrôles environnementaux",""),
        (171,"Source de données contrôles environnementaux",0,1,3,1,NULL,149,NULL,"Source de données contrôles environnementaux",""),
    
    
    
        (172,"Intitulé de la mission de contrôle forestier",1,1,3,1,NULL,NULL,NULL,"Intitulé de la mission de contrôle forestier",""),
        (173,"Date de la mission de contrôle forestier",0,1,3,0,NULL,172,NULL,"Date de la mission de contrôle forestier",""),
        (174,"Mission de contrôle forestier effectuée ou réalisée (oui/non)",0,1,3,1,22,172,NULL,"Mission de contrôle forestier effectuée ou réalisée (oui/non)",""),
        (175,"Commune de réalisation du contrôle forestier",0,1,3,0,NULL,172,NULL,"Commune de réalisation du contrôle forestier",""),
        (176,"Nombre d'infraction forestière",0,1,3,1,NULL,172,NULL,"Nombre d'infraction forestière",""),
        (177,"Motif du PV d'infraction forestière (constat)",0,1,3,0,NULL,172,NULL,"Motif du PV d'infraction forestière (constat)",""),
        (178,"Intitulé du PV de saisie avec référence",0,1,3,0,NULL,172,NULL,"Intitulé du PV de saisie avec référence",""),
        (179,"Type de produit saisi (PFL, PFNL)",0,1,3,0,NULL,172,NULL,"Type de produit saisi (PFL, PFNL)",""),
        (180,"Nature du produit saisi (brut, fini)",0,1,3,0,NULL,172,NULL,"Nature du produit saisi (brut, fini)",""),
        (181,"Espèce du produit saisi",0,1,3,0,NULL,172,NULL,"Espèce du produit saisi",""),
        (182,"Date de saisi du produit",0,1,3,0,NULL,172,NULL,"Date de saisi du produit",""),
        (183,"Designation du produit saisi (Anacarde (kg), Baie rose (kg), Bois COS (m³), Bois de chauffe (stère), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",0,1,3,1,27,172,NULL,"Designation du produit saisi (Anacarde (kg), Baie rose (kg), Bois COS (m³), Bois de chauffe (stère), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",""),
        (184,"Quantité de produit saisi",0,1,3,1,NULL,172,NULL,"Quantité de produit saisi",""),
        (185,"Date de sequestre",0,1,3,0,NULL,172,NULL,"Date de sequestre",""),
        (186,"Localisation des produits sequestrés (localité)",0,1,3,0,NULL,172,NULL,"Localisation des produits sequestrés (localité)",""),
        (187,"Référence conclusions emis par les représentants ministériels vers le parquet",0,1,3,0,NULL,172,NULL,"Référence conclusions emis par les représentants ministériels vers le parquet",""),
        (188,"Nombre infraction déférée",0,1,3,1,NULL,172,NULL,"Nombre infraction déférée",""),
        (189,"Intitulé du dossier transmis au parquet avec référence (liste)",0,1,3,1,NULL,172,NULL,"Intitulé du dossier transmis au parquet avec référence (liste)",""),
        (190,"Nombre de transaction avant jugement",0,1,3,1,NULL,172,NULL,"Nombre de transaction avant jugement",""),
        (191,"Nature de l'infraction verbalisée",0,1,3,0,NULL,172,NULL,"Nature de l'infraction verbalisée",""),
        (192,"Référence de dossiers d'infractions forestières",0,1,3,1,NULL,172,NULL,"Référence de dossiers d'infractions forestières",""),
        (193,"Nombre de dossier d'infractions forestières traité",0,1,3,1,NULL,172,NULL,"Nombre de dossier d'infractions forestières traité",""),
        (194,"Mesures correctives et recommandations",0,1,3,0,NULL,172,NULL,"Mesures correctives et recommandations",""),
        (195,"Existence de dispositifs de contrôle forestier de proximité (oui/non)",0,1,3,0,NULL,172,NULL,"Existence de dispositifs de contrôle forestier de proximité (oui/non)",""),
        (196,"En cas défrichement, surface defrichée (ha)",0,1,3,0,NULL,172,NULL,"En cas défrichement, surface defrichée (ha)",""),
        (197,"Dispositifs de contrôle redynamisés (oui/non)",0,1,3,0,NULL,172,NULL,"Dispositifs de contrôle redynamisés (oui/non)",""),
        (198,"Identifiant du projet d'appui pour les contrôles forestiers",0,1,3,0,NULL,172,NULL,"Identifiant du projet d'appui pour les contrôles forestiers",""),
        (199,"Observations contrôles forestiers",0,1,3,0,NULL,172,NULL,"Observations contrôles forestiers",""),
        (200,"Source de données contrôles forestiers",0,1,3,1,NULL,172,NULL,"Source de données contrôles forestiers",""),
    
    
    
        (201,"Nom de la Convention de partenariat élaborée",1,1,3,1,NULL,NULL,NULL,"Nom de la Convention de partenariat élaborée",""),
        (202,"Type de partenariat (PPP, international, …)",0,1,3,0,NULL,201,NULL,"Type de partenariat (PPP, international, …)",""),
        (203,"Convention de partenariat signée (oui/non)",0,1,3,1,28,201,NULL,"Convention de partenariat signée (oui/non)",""),
        (204,"Objet de la convention de partenariat",0,1,3,1,NULL,201,NULL,"Objet de la convention de partenariat",""),
        (205,"Il s'agit de projet (oui/non)",0,1,3,1,29,201,NULL,"Il s'agit de projet (oui/non)",""),
        (206,"si oui, quel/quels projet(s) ?",0,1,3,1,NULL,201,NULL,"si oui, quel/quels projet(s) ?",""),
        (207,"Date d'élaboration de la convention de partenariat",0,1,3,0,NULL,201,NULL,"Date d'élaboration de la convention de partenariat",""),
        (208,"Date de signature de la convention de partenariat",0,1,3,0,NULL,201,NULL,"Date de signature de la convention de partenariat",""),
        (209,"Entités signataires",0,1,3,0,NULL,201,NULL,"Entités signataires",""),
        (210,"Durée de la convention de partenariat",0,1,3,0,NULL,201,NULL,"Durée de la convention de partenariat",""),
        (211,"Cibles de la convention de partenariat",0,1,3,0,NULL,201,NULL,"Cibles de la convention de partenariat",""),
        (212,"Nombre de ménages bénéficiaires dans le cadre du partenariat",0,1,3,0,NULL,201,NULL,"Nombre de ménages bénéficiaires dans le cadre du partenariat",""),
        (213,"Identifiant du projet d'appui pour le partenariat",0,1,3,0,NULL,201,NULL,"Identifiant du projet d'appui pour le partenariat",""),
        (214,"Fichiers (partenariat)",0,1,3,0,NULL,201,NULL,"Fichiers (partenariat)",""),
        (215,"Observations partenariat",0,1,3,0,NULL,201,NULL,"Observations partenariat",""),
        (216,"Source de données partenariat",0,1,3,1,NULL,201,NULL,"Source de données partenariat",""),
    
    
    
        (217,"Commune d'implantation de l'économie verte",1,1,3,1,NULL,NULL,NULL,"Commune d'implantation de l'économie verte",""),
        (218,"Chaîne de valeur verte promue",0,1,3,1,NULL,217,NULL,"Chaîne de valeur verte promue",""),
        (219,"Ressource naturelle mise en jeu dans la chaîne de valeur",0,1,3,0,NULL,217,NULL,"Ressource naturelle mise en jeu dans la chaîne de valeur",""),
        (220,"Existence de certifications vertes promues par chaîne de valeur liée aux ressources naturelles (oui/non)",0,1,3,1,30,217,NULL,"Existence de certifications vertes promues par chaîne de valeur liée aux ressources naturelles (oui/non)",""),
        (221,"Superficie (ha) des ressources gérées en vue de l’exploitation durable",0,1,3,0,NULL,217,NULL,"Superficie (ha) des ressources gérées en vue de l’exploitation durable",""),
        (222,"Nature du produit (PFNL ou PFL)",0,1,3,0,NULL,217,NULL,"Nature du produit (PFNL ou PFL)",""),
        (223,"Designation du produit brut (Anacarde (kg), Baie rose (kg), Bois COS (m³), Bois de chauffe (stère), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",0,1,3,0,NULL,217,NULL,"Designation du produit brut (Anacarde (kg), Baie rose (kg), Bois COS (m³), Bois de chauffe (stère), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",""),
        (224,"Quantité produit brut",0,1,3,0,NULL,217,NULL,"Quantité produit brut",""),
        (225,"Quantité produit brut vendu",0,1,3,0,NULL,217,NULL,"Quantité produit brut vendu",""),
        (226,"Prix unitaire de vente de produit brut (Ariary)",0,1,3,0,NULL,217,NULL,"Prix unitaire de vente de produit brut (Ariary)",""),
        (227,"Designation du produit transformé (Anacarde (kg), Baie rose (kg), Bois COS (m³), Bois de chauffe (stère), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",0,1,3,0,NULL,217,NULL,"Designation du produit transformé (Anacarde (kg), Baie rose (kg), Bois COS (m³), Bois de chauffe (stère), Charbon de bois (kg), Huile essentielle (litre), Miel (litre), Moringa (kg), Raphia (kg), Autre (kg))",""),
        (228,"Quantité produit transformé",0,1,3,0,NULL,217,NULL,"Quantité produit transformé",""),
        (229,"Quantité produit transformé vendu",0,1,3,0,NULL,217,NULL,"Quantité produit transformé vendu",""),
        (230,"Prix unitaire de vente de produit transformé (Ariary)",0,1,3,0,NULL,217,NULL,"Prix unitaire de vente de produit transformé (Ariary)",""),
        (231,"Destination des produits (vente locale, exportation, …)",0,1,3,0,NULL,217,NULL,"Destination des produits (vente locale, exportation, …)",""),
        (232,"Nombre de ménages bénéficiaires de la chaîne de valeur",0,1,3,0,NULL,217,NULL,"Nombre de ménages bénéficiaires de la chaîne de valeur",""),
        (233,"Nombre de femmes bénéficiaires de la chaîne de valeur",0,1,3,0,NULL,217,NULL,"Nombre de femmes bénéficiaires de la chaîne de valeur",""),
        (234,"Nombre de jeune bénéficiaires de la chaîne de valeur (15 à 24 ans)",0,1,3,0,NULL,217,NULL,"Nombre de jeune bénéficiaires de la chaîne de valeur (15 à 24 ans)",""),
        (235,"Nombre total de personnes impliquées directement dans la chaîne de valeur",0,1,3,0,NULL,217,NULL,"Nombre total de personnes impliquées directement dans la chaîne de valeur",""),
        (236,"Existence de suivis écologiques (oui/non)",0,1,3,0,NULL,217,NULL,"Existence de suivis écologiques (oui/non)",""),
        (237,"Chaîne de valeur appuyée financièrement et/ou techniquement (oui/non)",0,1,3,0,NULL,217,NULL,"Chaîne de valeur appuyée financièrement et/ou techniquement (oui/non)",""),
        (238,"Organisme d'appui de la chaîne de valeur",0,1,3,1,NULL,217,NULL,"Organisme d'appui de la chaîne de valeur",""),
        (239,"Projet d'appui de la chaîne de valeur",0,1,3,1,NULL,217,NULL,"Projet d'appui de la chaîne de valeur",""),
        (240,"Identifiant du projet d'appui de la chaîne de valeur",0,1,3,0,NULL,217,NULL,"Identifiant du projet d'appui de la chaîne de valeur",""),
        (241,"Nombre d'emplois verts décents créés",0,1,3,1,NULL,217,NULL,"Nombre d'emplois verts décents créés",""),
        (242,"Nombre total d'empoyés recrutés par les emplois verts créés",0,1,3,0,NULL,217,NULL,"Nombre total d'empoyés recrutés par les emplois verts créés",""),
        (243,"Nombre de femme employées dans les emplois verts",0,1,3,0,NULL,217,NULL,"Nombre de femme employées dans les emplois verts",""),
        (244,"Types d'alternatives développées (charbon vert, résidus de culture, gaz butane, ethanol, énergie solaire, biogaz, sac écologique, autres)",0,1,3,1,NULL,217,NULL,"Types d'alternatives développées (charbon vert, résidus de culture, gaz butane, ethanol, énergie solaire, biogaz, sac écologique, autres)",""),
        (245,"Quantité produite par type d'alternative (liste)",0,1,3,0,NULL,217,NULL,"Quantité produite par type d'alternative (liste)",""),
        (246,"Alternative promue (oui/non)",0,1,3,1,31,217,NULL,"Alternative promue (oui/non)",""),
        (247,"Nombre total de ménage adoptant les alternatives",0,1,3,0,NULL,217,NULL,"Nombre total de ménage adoptant les alternatives",""),
        (248,"Prix unitaire des alternatives (Ariary)",0,1,3,0,NULL,217,NULL,"Prix unitaire des alternatives (Ariary)",""),
        (249,"Observations économie verte",0,1,3,0,NULL,217,NULL,"Observations économie verte",""),
        (250,"Source de données économie verte",0,1,3,1,NULL,217,NULL,"Source de données économie verte",""),
    
    
    
        (251,"Nom de l'infrastructure de gestion de pollution mis en place",1,1,3,1,NULL,NULL,NULL,"Nom de l'infrastructure de gestion de pollution mis en place",""),
        (252,"Objet de l'infrastructure de gestion de pollution mis en place (centre de tri, centre de traitement des déchets)",0,1,3,1,NULL,251,NULL,"Objet de l'infrastructure de gestion de pollution mis en place (centre de tri, centre de traitement des déchets)",""),
        (253,"Type de déchets traités (solides, médicaux, éléctroniques, liquides…)",0,1,3,1,NULL,251,NULL,"Type de déchets traités (solides, médicaux, éléctroniques, liquides…)",""),
        (254,"Commune d'implantantion de l'infrastructure de gestion de pollution",0,1,3,1,NULL,251,NULL,"Commune d'implantantion de l'infrastructure de gestion de pollution",""),
        (255,"Date de création de l'infrastructure",0,1,3,0,NULL,251,NULL,"Date de création de l'infrastructure",""),
        (256,"Infrastucture de gestion de pollution opérationnelle (oui/non)",0,1,3,0,NULL,251,NULL,"Infrastucture de gestion de pollution opérationnelle (oui/non)",""),
        (257,"Déchets valorisés par an (kg)",0,1,3,0,NULL,251,NULL,"Déchets valorisés par an (kg)",""),
        (258,"Disponibilité de kit d'analyse et de contrôle de pollution (oui/non)",0,1,3,0,NULL,251,NULL,"Disponibilité de kit d'analyse et de contrôle de pollution (oui/non)",""),
        (259,"Existence des observatoires de pollution (oui/non)",0,1,3,0,NULL,251,NULL,"Existence des observatoires de pollution (oui/non)",""),
        (260,"Observatoire opérationnel (oui/non)",0,1,3,0,NULL,251,NULL,"Observatoire opérationnel (oui/non)",""),
        (261,"Disponibilité de décharges d'ordures (oui/non)",0,1,3,0,NULL,251,NULL,"Disponibilité de décharges d'ordures (oui/non)",""),
        (262,"Emplacement de la décharge (localité)",0,1,3,0,NULL,251,NULL,"Emplacement de la décharge (localité)",""),
        (263,"Decharge d'ordures opérationnelle (oui/non)",0,1,3,1,NULL,251,NULL,"Decharge d'ordures opérationnelle (oui/non)",""),
        (264,"Existence de laboratoires nationaux et de centres de recherches renforcés techniquement et matériellement pour le traitement de déchets (oui/non)",0,1,3,0,NULL,251,NULL,"Existence de laboratoires nationaux et de centres de recherches renforcés techniquement et matériellement pour le traitement de déchets (oui/non)",""),
        (265,"si oui, lequel/lesquels?",0,1,3,0,NULL,251,NULL,"si oui, lequel/lesquels?",""),
        (266,"Nom du projet d'investissement souhaitant s'implanté",0,1,3,1,NULL,251,NULL,"Nom du projet d'investissement souhaitant s'implanté",""),
        (267,"Secteur d'activité (Agriculture, Industriel, Service)",0,1,3,0,NULL,251,NULL,"Secteur d'activité (Agriculture, Industriel, Service)",""),
        (268,"Existence de permis environnementaux délivrés (oui/non)",0,1,3,1,33,251,NULL,"Existence de permis environnementaux délivrés (oui/non)",""),
        (269,"Projet d'investissement conforme au Décret MECIE (oui/non)",0,1,3,0,NULL,251,NULL,"Projet d'investissement conforme au Décret MECIE (oui/non)",""),
        (270,"Date de quittance",0,1,3,0,NULL,251,NULL,"Date de quittance",""),
        (271,"Projet d'investissement ayant un Programme d'Engagement Environnemental (PREE) (oui/non)",0,1,3,1,NULL,251,NULL,"Projet d'investissement ayant un Programme d'Engagement Environnemental (PREE) (oui/non)",""),
        (272,"Existence de suivi environnemental mené sur la mise en œuvre de cahiers des charges environnementales (oui/non)",0,1,3,0,NULL,251,NULL,"Existence de suivi environnemental mené sur la mise en œuvre de cahiers des charges environnementales (oui/non)",""),
        (273,"Activités relatives à l'éducation environnementale réalisées (liste)",0,1,3,0,NULL,251,NULL,"Activités relatives à l'éducation environnementale réalisées (liste)",""),
        (274,"Nombre des agents assermentés en tant qu'OPJ pour les contrôles et inspections environnementales",0,1,3,0,NULL,251,NULL,"Nombre des agents assermentés en tant qu'OPJ pour les contrôles et inspections environnementales",""),
        (275,"Identifiant du projet d'appui pour l'environnement",0,1,3,0,NULL,251,NULL,"Identifiant du projet d'appui pour l'environnement",""),
        (276,"Observations environnement",0,1,3,0,NULL,251,NULL,"Observations environnement",""),
        (277,"Source de données environnement",0,1,3,1,NULL,251,NULL,"Source de données environnement",""),
    
    
    
        (278,"Commune de localisation de point de feux et surfaces brûlées suivant les points GPS des activités de patrouilles et de contrôle",1,1,3,1,NULL,NULL,NULL,"Commune de localisation de point de feux et surfaces brûlées suivant les points GPS des activités de patrouilles et de contrôle",""),
        (279,"Longitude point de feux (degré décimal) : X",0,1,3,1,NULL,278,NULL,"Longitude point de feux (degré décimal) : X",""),
        (280,"Latitude point de feux (degré décimal) : Y",0,1,3,1,NULL,278,NULL,"Latitude point de feux (degré décimal) : Y",""),
        (281,"Date de cas de feux",0,1,3,0,NULL,278,NULL,"Date de cas de feux",""),
        (282,"Shapefile des points de feux",0,1,3,0,NULL,278,NULL,"Shapefile des points de feux",""),
        (283,"Superficie des zones brulées suivant les points GPS des activités de patrouilles et de contrôle sur terrain (ha)",0,1,3,1,NULL,278,NULL,"Superficie des zones brulées suivant les points GPS des activités de patrouilles et de contrôle sur terrain (ha)",""),
        (284,"Type : Forêt ou hors forêt",0,1,3,1,35,278,NULL,"Type : Forêt ou hors forêt",""),
        (285,"Shapefile des surfaces brûlées",0,1,3,0,NULL,278,NULL,"Shapefile des surfaces brûlées",""),
        (286,"Date de zones brûlées",0,1,3,0,NULL,278,NULL,"Date de zones brûlées",""),
        (287,"Existence de dispositifs de détection et suivi des feux (oui/non)",0,1,3,1,39,278,NULL,"Existence de dispositifs de détection et suivi des feux (oui/non)",""),
        (288,"Emplacement de dispositifs de détection et suivi des feux (localité)",0,1,3,0,NULL,278,NULL,"Emplacement de dispositifs de détection et suivi des feux (localité)",""),
        (289,"Type de dispositif de détection et suivi des feux (créé/renforcé)",0,1,3,0,NULL,278,NULL,"Type de dispositif de détection et suivi des feux (créé/renforcé)",""),
        (290,"Dispositif de détection et suivi des feux opérationnel (oui/non)",0,1,3,1,NULL,278,NULL,"Dispositif de détection et suivi des feux opérationnel (oui/non)",""),
        (291,"Existence de comités/structures de lutte contre les feux (oui/non)",0,1,3,1,38,278,NULL,"Existence de comités/structures de lutte contre les feux (oui/non)",""),
        (292,"Emplacement de comités/structures de lutte contre les feux (localité)",0,1,3,0,NULL,278,NULL,"Emplacement de comités/structures de lutte contre les feux (localité)",""),
        (293,"Type de comité/structure de lutte contre les feux (créé/renforcé)",0,1,3,1,NULL,278,NULL,"Type de comité/structure de lutte contre les feux (créé/renforcé)",""),
        (294,"Comité/structure de lutte contre les feux formé (oui/non)",0,1,3,1,NULL,278,NULL,"Comité/structure de lutte contre les feux formé (oui/non)",""),
        (295,"Comité/structure de lutte contre les feux opérationnel (oui/non)",0,1,3,1,37,278,NULL,"Comité/structure de lutte contre les feux opérationnel (oui/non)",""),
        (296,"Emplacement du pare-feu (localité)",0,1,3,0,NULL,278,NULL,"Emplacement du pare-feu (localité)",""),
        (297,"Longitude pare-feu (degré décimal) : X",0,1,3,1,NULL,278,NULL,"Longitude pare-feu (degré décimal) : X",""),
        (298,"Latitude pare-feu (degré décimal) : Y",0,1,3,1,NULL,278,NULL,"Latitude pare-feu (degré décimal) : Y",""),
        (299,"Longueur de pare-feu établi (km)",0,1,3,1,NULL,278,NULL,"Longueur de pare-feu établi (km)",""),
        (300,"Shapefile des pare-feux",0,1,3,0,NULL,278,NULL,"Shapefile des pare-feux",""),
        (301,"Nature du pare-feu (nouvellement mis en place, entretenu)",0,1,3,0,NULL,278,NULL,"Nature du pare-feu (nouvellement mis en place, entretenu)",""),
        (302,"Référence PV d'infraction (constatation de feux)",0,1,3,1,NULL,278,NULL,"Référence PV d'infraction (constatation de feux)",""),
        (303,"Identifiant du projet d'appui de lutte contre les feux",0,1,3,0,NULL,278,NULL,"Identifiant du projet d'appui de lutte contre les feux",""),
        (304,"Observations feux",0,1,3,0,NULL,278,NULL,"Observations feux",""),
        (305,"Source de données feux",0,1,3,1,NULL,278,NULL,"Source de données feux",""),
    
    
    
        (306,"Thématiques d'intérêt du ministère en charge des forêts et de l'environnement",1,1,3,1,46,NULL,NULL,"Thématiques d'intérêt du ministère en charge des forêts et de l'environnement",""),
        (307,"Activités à réaliser (liste)",0,1,3,0,NULL,306,NULL,"Activités à réaliser (liste)",""),
        (308,"Acteurs dans la réalisatoin des activités",0,1,3,0,NULL,306,NULL,"Acteurs dans la réalisatoin des activités",""),
        (309,"Budget prévu pour la réalisation des activités pour le secteur environnement (Ariary)",0,1,3,1,NULL,306,NULL,"Budget prévu pour la réalisation des activités pour le secteur environnement (Ariary)",""),
        (310,"Budget de fonctionnement (Ariary)",0,1,3,1,NULL,306,NULL,"Budget de fonctionnement (Ariary)",""),
        (311,"Montant du fond public (Ariary)",0,1,3,1,NULL,306,NULL,"Montant du fond public (Ariary)",""),
        (312,"Taux d'egagement moyen du fond public (%)",0,1,3,1,NULL,306,NULL,"Taux d'egagement moyen du fond public (%)",""),
        (313,"Montant du financement extérieur ou privé (Ariary)",0,1,3,1,NULL,306,NULL,"Montant du financement extérieur ou privé (Ariary)",""),
        (314,"Taux d'egagement moyen du financement extérieur ou privé (%)",0,1,3,1,NULL,306,NULL,"Taux d'egagement moyen du financement extérieur ou privé (%)",""),
        (315,"PIP/CDMT/ budgets programmes établis (liste)",0,1,3,0,NULL,306,NULL,"PIP/CDMT/ budgets programmes établis (liste)",""),
        (316,"Programmes/projets relatifs à la protection de l'environnement et la gestion des ressources naturelles/de la biodiversité ayant obtenus des financements extérieurs (liste)",0,1,3,0,NULL,306,NULL,"Programmes/projets relatifs à la protection de l'environnement et la gestion des ressources naturelles/de la biodiversité ayant obtenus des financements extérieurs (liste)",""),
        (317,"Mecanismes de perennisation financière mise en place et opérationnel (liste)",0,1,3,0,NULL,306,NULL,"Mecanismes de perennisation financière mise en place et opérationnel (liste)",""),
        (318,"Actions environnementales dans les programmes d'investissement régional/communal (liste)",0,1,3,0,NULL,306,NULL,"Actions environnementales dans les programmes d'investissement régional/communal (liste)",""),
        (319,"Montant alloué pour action environnementale dans les programmes d'investissement régional/communal (Ariary)",0,1,3,1,NULL,306,NULL,"Montant alloué pour action environnementale dans les programmes d'investissement régional/communal (Ariary)",""),
        (320,"Montant des dons (Ariary)",0,1,3,1,NULL,306,NULL,"Montant des dons (Ariary)",""),
        (321,"Montant de prêts budgétaires (Ariary)",0,1,3,1,NULL,306,NULL,"Montant de prêts budgétaires (Ariary)",""),
        (322,"Montant engagé pour la réalisation des activités (Ariary)",0,1,3,1,NULL,306,NULL,"Montant engagé pour la réalisation des activités (Ariary)",""),
        (323,"Montant décaissé pour la réalisation des activités (Ariary)",0,1,3,1,NULL,306,NULL,"Montant décaissé pour la réalisation des activités (Ariary)",""),
        (324,"Origine de recette (exploitation des PFL, collecte des PFNL, vente des produits saisis, exportation des PFL,exportation des PFNL, visites touristique dans les aires protégées)",0,1,3,1,NULL,306,NULL,"Origine de recette (exploitation des PFL, collecte des PFNL, vente des produits saisis, exportation des PFL,exportation des PFNL, visites touristique dans les aires protégées)",""),
        (325,"Recette perçue (Ariary)",0,1,3,1,NULL,306,NULL,"Recette perçue (Ariary)",""),
        (326,"Observations finances",0,1,3,0,NULL,306,NULL,"Observations finances",""),
        (327,"Source de données finances",0,1,3,1,NULL,306,NULL,"Source de données finances",""),
    
    
    
        (328,"Intitulé du Districts",1,1,3,1,NULL,NULL,NULL,"Intitulé du Districts",""),
        (329,"Liste Communes",0,1,3,0,NULL,328,NULL,"Liste Communes",""),
        (330,"Nombre de communes",0,1,3,1,NULL,328,NULL,"Nombre de communes",""),
        (331,"Nombre de population",0,1,3,1,NULL,328,NULL,"Nombre de population",""),
        (332,"Nombre homme",0,1,3,1,NULL,328,NULL,"Nombre homme",""),
        (333,"Nombre femme",0,1,3,1,NULL,328,NULL,"Nombre femme",""),
        (334,"Nombre enfant",0,1,3,1,NULL,328,NULL,"Nombre enfant",""),
        (335,"Nombre de ménage",0,1,3,1,NULL,328,NULL,"Nombre de ménage",""),
        (336,"Association oeuvrant dans la gestion de l'environnement et des ressources naturelles (liste)",0,1,3,1,NULL,328,NULL,"Association oeuvrant dans la gestion de l'environnement et des ressources naturelles (liste)",""),
        (337,"Nombre total de membre des associations",0,1,3,1,NULL,328,NULL,"Nombre total de membre des associations",""),
        (338,"Nombre de projets en cours",0,1,3,1,NULL,328,NULL,"Nombre de projets en cours",""),
        (339,"Observations info générales",0,1,3,0,NULL,328,NULL,"Observations info générales",""),
        (340,"Source de données info générales",0,1,3,1,NULL,328,NULL,"Source de données info générales",""),
    
    
    
        (341,"Thématique de l'IEC",1,1,3,1,48,NULL,NULL,"Thématique de l'IEC",""),
        (342,"Intitulé de l'IEC",0,1,3,1,NULL,341,NULL,"Intitulé de l'IEC",""),
        (343,"Nature de l'IEC (formation, sensibilisation)",0,1,3,1,NULL,341,NULL,"Nature de l'IEC (formation, sensibilisation)",""),
        (344,"Support produit (designation)",0,1,3,0,NULL,341,NULL,"Support produit (designation)",""),
        (345,"Date de début et de fin de l'IEC",0,1,3,0,NULL,341,NULL,"Date de début et de fin de l'IEC",""),
        (346,"Initiateur de l'IEC",0,1,3,0,NULL,341,NULL,"Initiateur de l'IEC",""),
        (347,"Projet d'appui de l'IEC",0,1,3,1,NULL,341,NULL,"Projet d'appui de l'IEC",""),
        (348,"Identifiant du projet d'appui pour l'IEC",0,1,3,0,NULL,341,NULL,"Identifiant du projet d'appui pour l'IEC",""),
        (349,"Nombre de séance",0,1,3,1,NULL,341,NULL,"Nombre de séance",""),
        (350,"Nombre total de participants",0,1,3,1,NULL,341,NULL,"Nombre total de participants",""),
        (351,"Nombre de participants - de 14 ans",0,1,3,1,NULL,341,NULL,"Nombre de participants - de 14 ans",""),
        (352,"Nombre de participants de 15 à 24 ans",0,1,3,1,NULL,341,NULL,"Nombre de participants de 15 à 24 ans",""),
        (353,"Nombre de participants 25 ans et +",0,1,3,1,NULL,341,NULL,"Nombre de participants 25 ans et +",""),
        (354,"Nombre de représentant d'une OSC ayant participé",0,1,3,1,NULL,341,NULL,"Nombre de représentant d'une OSC ayant participé",""),
        (355,"Nombre de représentant de structures locales ayant participé",0,1,3,1,NULL,341,NULL,"Nombre de représentant de structures locales ayant participé",""),
        (356,"Nombre d'agents de l'administration ayant participé",0,1,3,1,NULL,341,NULL,"Nombre d'agents de l'administration ayant participé",""),
        (357,"Cible (élève, population locale, VOI, …)",0,1,3,0,NULL,341,NULL,"Cible (élève, population locale, VOI, …)",""),
        (358,"Niveau d'intervention (District, Commune, Fokontany)",0,1,3,0,NULL,341,NULL,"Niveau d'intervention (District, Commune, Fokontany)",""),
        (359,"Nom de la Commune bénéficiant de l'IEC",0,1,3,1,NULL,341,NULL,"Nom de la Commune bénéficiant de l'IEC",""),
        (360,"Nom de la localité bénéficiant de l'IEC",0,1,3,0,NULL,341,NULL,"Nom de la localité bénéficiant de l'IEC",""),
        (361,"IEC média classique (radio, télévision, journaux)",0,1,3,1,NULL,341,NULL,"IEC média classique (radio, télévision, journaux)",""),
        (362,"IEC nouveau média (réseaux sociaux, à préciser)",0,1,3,1,NULL,341,NULL,"IEC nouveau média (réseaux sociaux, à préciser)",""),
        (363,"Observations IEC",0,1,3,0,NULL,341,NULL,"Observations IEC",""),
        (364,"Source de données IEC",0,1,3,1,NULL,341,NULL,"Source de données IEC",""),
    
    
    
        (365,"Type d'infrastructure (bâtiment, route, barrage, école, autre)",1,1,3,1,NULL,NULL,NULL,"Type d'infrastructure (bâtiment, route, barrage, école, autre)",""),
        (366,"Destination (administrative, logement, garage, autre)",0,1,3,1,NULL,365,NULL,"Destination (administrative, logement, garage, autre)",""),
        (367,"Commune d'implantation de l'infrastructure",0,1,3,1,NULL,365,NULL,"Commune d'implantation de l'infrastructure",""),
        (368,"Emplacement de l'infrastructure (localité)",0,1,3,0,NULL,365,NULL,"Emplacement de l'infrastructure (localité)",""),
        (369,"Secteur impliqué (éducation, santé, travaux publics, ...)",0,1,3,1,NULL,365,NULL,"Secteur impliqué (éducation, santé, travaux publics, ...)",""),
        (370,"Nouvellement construite ou réhabilitée ou existante",0,1,3,1,NULL,365,NULL,"Nouvellement construite ou réhabilitée ou existante",""),
        (371,"Date d'opérationnalisation/utilisation/réhabilitation de l'infrastructure",0,1,3,0,NULL,365,NULL,"Date d'opérationnalisation/utilisation/réhabilitation de l'infrastructure",""),
        (372,"Infrastructure actuellement opérationnelle (oui/non)",0,1,3,1,NULL,365,NULL,"Infrastructure actuellement opérationnelle (oui/non)",""),
        (373,"Etat actuel de l'infrastructure (mauvais, moyen, bon)",0,1,3,0,52,365,NULL,"Etat actuel de l'infrastructure (mauvais, moyen, bon)",""),
        (374,"Niveau de localisation infrastructures opérationnelles (Direction centrale, Direction régionale, cantonnement, triage)",0,1,3,1,NULL,365,NULL,"Niveau de localisation infrastructures opérationnelles (Direction centrale, Direction régionale, cantonnement, triage)",""),
        (375,"STD ou CTD",0,1,3,1,53,365,NULL,"STD ou CTD",""),
        (376,"Personnes/services utilisant le(s) infrastructure(s) (STD, préciser si CTD)",0,1,3,1,NULL,365,NULL,"Personnes/services utilisant le(s) infrastructure(s) (STD, préciser si CTD)",""),
        (377,"Budget pour la construction/réhabilitation de l'infrastructure (Ariary)",0,1,3,0,NULL,365,NULL,"Budget pour la construction/réhabilitation de l'infrastructure (Ariary)",""),
        (378,"Budget pour l'entretien de l'infrastructure (Ariary)",0,1,3,0,NULL,365,NULL,"Budget pour l'entretien de l'infrastructure (Ariary)",""),
        (379,"Source de financement de l'infrastructure (interne ou externe)",0,1,3,1,NULL,365,NULL,"Source de financement de l'infrastructure (interne ou externe)",""),
        (380,"Projet d'appui de l'infrastructure (si externe)",0,1,3,0,NULL,365,NULL,"Projet d'appui de l'infrastructure (si externe)",""),
        (381,"Identifiant du projet d'appui pour l'infrastructure",0,1,3,0,NULL,365,NULL,"Identifiant du projet d'appui pour l'infrastructure",""),
        (382,"Images infrastructure",0,1,3,0,NULL,365,NULL,"Images infrastructure",""),
        (383,"Observations infrastructure",0,1,3,0,NULL,365,NULL,"Observations infrastructure",""),
        (384,"Source de données infrastructure",0,1,3,1,NULL,365,NULL,"Source de données infrastructure",""),
    
    
    
        (385,"Désignation du matériel roulant",1,1,3,1,NULL,NULL,NULL,"Désignation du matériel roulant",""),
        (386,"Marque du matériel roulant",0,1,3,0,NULL,385,NULL,"Marque du matériel roulant",""),
        (387,"Commune d'emplacement du matériel roulant",0,1,3,1,NULL,385,NULL,"Commune d'emplacement du matériel roulant",""),
        (388,"Date d'acquisition/utilisation du matériel roulant",0,1,3,1,NULL,385,NULL,"Date d'acquisition/utilisation du matériel roulant",""),
        (389,"Matériel roulant actuellement opérationnel (oui/non)",0,1,3,1,NULL,385,NULL,"Matériel roulant actuellement opérationnel (oui/non)",""),
        (390,"Etat actuel du matériel roulant (mauvais, moyen, bon)",0,1,3,1,54,385,NULL,"Etat actuel du matériel roulant (mauvais, moyen, bon)",""),
        (391,"Niveau de localisation de matériel roulant en état de marche (Direction centrale, Direction régionale, cantonnement, triage)",0,1,3,1,NULL,385,NULL,"Niveau de localisation de matériel roulant en état de marche (Direction centrale, Direction régionale, cantonnement, triage)",""),
        (392,"Personnes/services utilisant le(s) matériel(s) roulant(s)",0,1,3,1,NULL,385,NULL,"Personnes/services utilisant le(s) matériel(s) roulant(s)",""),
        (393,"Budget pour l'acquisition du matériel roulant (Ariary)",0,1,3,0,NULL,385,NULL,"Budget pour l'acquisition du matériel roulant (Ariary)",""),
        (394,"Budget pour l'entretien du matériel roulant (Ariary)",0,1,3,0,NULL,385,NULL,"Budget pour l'entretien du matériel roulant (Ariary)",""),
        (395,"Source de financement du matériel roulant (interne ou externe)",0,1,3,1,NULL,385,NULL,"Source de financement du matériel roulant (interne ou externe)",""),
        (396,"Projet d'appui du matériel roulant (si externe)",0,1,3,1,NULL,385,NULL,"Projet d'appui du matériel roulant (si externe)",""),
        (397,"Identifiant du projet d'appui pour le matériel roulant",0,1,3,0,NULL,385,NULL,"Identifiant du projet d'appui pour le matériel roulant",""),
        (398,"Images matériel roulant",0,1,3,0,NULL,385,NULL,"Images matériel roulant",""),
        (399,"Observations matériel roulant",0,1,3,0,NULL,385,NULL,"Observations matériel roulant",""),
        (400,"Source de données matériel roulant",0,1,3,1,NULL,385,NULL,"Source de données matériel roulant",""),
    
    
    
        (401,"Désignation du matériel informatique",1,1,3,1,NULL,NULL,NULL,"Désignation du matériel informatique",""),
        (402,"Marque du matériel informatique",0,1,3,0,NULL,401,NULL,"Marque du matériel informatique",""),
        (403,"Commune d'emplacement du matériel informatique",0,1,3,1,NULL,401,NULL,"Commune d'emplacement du matériel informatique",""),
        (404,"Date d'acquiqition/utilisation du matériel informatique",0,1,3,1,NULL,401,NULL,"Date d'acquiqition/utilisation du matériel informatique",""),
        (405,"Matériel informatique actuellement opérationnel (oui/non)",0,1,3,1,NULL,401,NULL,"Matériel informatique actuellement opérationnel (oui/non)",""),
        (406,"Etat actuel du matériel informatique (mauvais, moyen, bon)",0,1,3,1,55,401,NULL,"Etat actuel du matériel informatique (mauvais, moyen, bon)",""),
        (407,"A condamner ou à réparer",0,1,3,1,NULL,401,NULL,"A condamner ou à réparer",""),
        (408,"Niveau de localisation de matériels informatiques en état de marche (Direction centrale, Direction régionale, cantonnement, triage)",0,1,3,1,NULL,401,NULL,"Niveau de localisation de matériels informatiques en état de marche (Direction centrale, Direction régionale, cantonnement, triage)",""),
        (409,"Personnes/services utilisant le(s) matériel(s) informatique(s)",0,1,3,1,NULL,401,NULL,"Personnes/services utilisant le(s) matériel(s) informatique(s)",""),
        (410,"Budget pour l'acquisition du matériel informatique (Ariary)",0,1,3,0,NULL,401,NULL,"Budget pour l'acquisition du matériel informatique (Ariary)",""),
        (411,"Budget pour l'entretien du matériel informatique (Ariary)",0,1,3,0,NULL,401,NULL,"Budget pour l'entretien du matériel informatique (Ariary)",""),
        (412,"Source de financement du matériel informatique (interne ou externe)",0,1,3,1,NULL,401,NULL,"Source de financement du matériel informatique (interne ou externe)",""),
        (413,"Projet d'appui du matériel informatique (si externe)",0,1,3,1,NULL,401,NULL,"Projet d'appui du matériel informatique (si externe)",""),
        (414,"Identifiant du projet d'appui pour le matériel informatique",0,1,3,0,NULL,401,NULL,"Identifiant du projet d'appui pour le matériel informatique",""),
        (415,"Images matériel informatique",0,1,3,0,NULL,401,NULL,"Images matériel informatique",""),
        (416,"Observations matériel informatique",0,1,3,0,NULL,401,NULL,"Observations matériel informatique",""),
        (417,"Source de données matériel informatique",0,1,3,1,NULL,401,NULL,"Source de données matériel informatique",""),
    
    
    
        (418,"Désignation du matériel mobilier",1,1,3,1,NULL,NULL,NULL,"Désignation du matériel mobilier",""),
        (419,"Date d'acquiqition/utilisation du matériel mobilier",0,1,3,0,NULL,418,NULL,"Date d'acquiqition/utilisation du matériel mobilier",""),
        (420,"Commune d'emplacement du matériel mobilier",0,1,3,1,NULL,418,NULL,"Commune d'emplacement du matériel mobilier",""),
        (421,"Matériel mobilier actuellement utilisable (oui/non)",0,1,3,1,NULL,418,NULL,"Matériel mobilier actuellement utilisable (oui/non)",""),
        (422,"Etat actuel du matériel mobilier (mauvais, moyen, bon)",0,1,3,1,56,418,NULL,"Etat actuel du matériel mobilier (mauvais, moyen, bon)",""),
        (423,"Niveau de localisation de matériels mobiliers utilisables (Direction centrale, Direction régionale, cantonnement, triage)",0,1,3,1,NULL,418,NULL,"Niveau de localisation de matériels mobiliers utilisables (Direction centrale, Direction régionale, cantonnement, triage)",""),
        (424,"Personnes/services utilisant le(s) matériel(s) mobilier(s)",0,1,3,1,NULL,418,NULL,"Personnes/services utilisant le(s) matériel(s) mobilier(s)",""),
        (425,"Budget pour l'acquisition du matériel mobilier (Ariary)",0,1,3,0,NULL,418,NULL,"Budget pour l'acquisition du matériel mobilier (Ariary)",""),
        (426,"Budget pour l'entretien du matériel mobilier (Ariary)",0,1,3,0,NULL,418,NULL,"Budget pour l'entretien du matériel mobilier (Ariary)",""),
        (427,"Source de financement du matériel mobilier (interne ou externe)",0,1,3,1,NULL,418,NULL,"Source de financement du matériel mobilier (interne ou externe)",""),
        (428,"Projet d'appui du matériel mobilier (si externe)",0,1,3,1,NULL,418,NULL,"Projet d'appui du matériel mobilier (si externe)",""),
        (429,"Identifiant du projet d'appui pour le matériel mobilier",0,1,3,0,NULL,418,NULL,"Identifiant du projet d'appui pour le matériel mobilier",""),
        (430,"Images matériel mobilier",0,1,3,0,NULL,418,NULL,"Images matériel mobilier",""),
        (431,"Observations matériel mobilier",0,1,3,0,NULL,418,NULL,"Observations matériel mobilier",""),
        (432,"Source de données matériel mobilier",0,1,3,1,NULL,418,NULL,"Source de données matériel mobilier",""),
    
    
    
        (433,"Outil ou guide",1,1,3,1,57,NULL,NULL,"Outil ou guide",""),
        (434,"Thématique de l'outil ou du guide",0,1,3,1,NULL,433,NULL,"Thématique de l'outil ou du guide",""),
        (435,"Titre de l'outil ou du guide",0,1,3,1,NULL,433,NULL,"Titre de l'outil ou du guide",""),
        (436,"Objet de l'outil ou du guide",0,1,3,1,NULL,433,NULL,"Objet de l'outil ou du guide",""),
        (437,"Nature de l'outil",0,1,3,1,NULL,433,NULL,"Nature de l'outil",""),
        (438,"Commune d'application de l'outil ou du guide (<<Toutes>> si niveau national)",0,1,3,1,NULL,433,NULL,"Commune d'application de l'outil ou du guide (<<Toutes>> si niveau national)",""),
        (439,"Outil ou guide opérationnel (oui/non)",0,1,3,1,NULL,433,NULL,"Outil ou guide opérationnel (oui/non)",""),
        (440,"Utilisateur de l'outil ou du guide",0,1,3,1,NULL,433,NULL,"Utilisateur de l'outil ou du guide",""),
        (441,"Nombre d'outil ou de guide produit",0,1,3,1,NULL,433,NULL,"Nombre d'outil ou de guide produit",""),
        (442,"Nombre d'outil ou de guide distribué et utilisé",0,1,3,1,NULL,433,NULL,"Nombre d'outil ou de guide distribué et utilisé",""),
        (443,"Budget pour la création de l'outil ou du guide (Ariary)",0,1,3,0,NULL,433,NULL,"Budget pour la création de l'outil ou du guide (Ariary)",""),
        (444,"Source de financement de l'outil ou du guide (interne ou externe)",0,1,3,1,NULL,433,NULL,"Source de financement de l'outil ou du guide (interne ou externe)",""),
        (445,"Projet d'appui de l'outil ou du guide (si externe)",0,1,3,1,NULL,433,NULL,"Projet d'appui de l'outil ou du guide (si externe)",""),
        (446,"Identifiant du projet d'appui pour l'outil ou le guide",0,1,3,0,NULL,433,NULL,"Identifiant du projet d'appui pour l'outil ou le guide",""),
        (447,"Fichiers (outils et guides)",0,1,3,0,NULL,433,NULL,"Fichiers (outils et guides)",""),
        (448,"Observations outils",0,1,3,0,NULL,433,NULL,"Observations outils",""),
        (449,"Source de données outils",0,1,3,1,NULL,433,NULL,"Source de données outils",""),
    
    
    
        (450,"Intitulé du projet",1,1,3,1,NULL,NULL,NULL,"Intitulé du projet",""),
        (451,"Commune d'intervention du projet",0,1,3,1,NULL,450,NULL,"Commune d'intervention du projet",""),
        (452,"Date de commencement du projet",0,1,3,1,NULL,450,NULL,"Date de commencement du projet",""),
        (453,"Date de clôture du projet",0,1,3,1,NULL,450,NULL,"Date de clôture du projet",""),
        (454,"Projet ayant été l'objet de planifiaction (oui/non)",0,1,3,1,59,450,NULL,"Projet ayant été l'objet de planifiaction (oui/non)",""),
        (455,"Projet ayant été l'objet de suivi (oui/non)",0,1,3,1,60,450,NULL,"Projet ayant été l'objet de suivi (oui/non)",""),
        (456,"Projet ayant été l'objet d'évaluation (oui/non)",0,1,3,1,61,450,NULL,"Projet ayant été l'objet d'évaluation (oui/non)",""),
        (457,"Identifiant du projet",0,1,3,1,NULL,450,NULL,"Identifiant du projet",""),
        (458,"Source de financement du projet",0,1,3,1,NULL,450,NULL,"Source de financement du projet",""),
        (459,"Budget attribué aux activités de planification (Ariary)",0,1,3,1,NULL,450,NULL,"Budget attribué aux activités de planification (Ariary)",""),
        (460,"Budget attribué aux activités de suivi (Ariary)",0,1,3,1,NULL,450,NULL,"Budget attribué aux activités de suivi (Ariary)",""),
        (461,"Budget attribué aux activités d'évaluation (Ariary)",0,1,3,1,NULL,450,NULL,"Budget attribué aux activités d'évaluation (Ariary)",""),
        (462,"Nombre de programmation effectuée",0,1,3,1,NULL,450,NULL,"Nombre de programmation effectuée",""),
        (463,"Existence de base de données (oui/non)",0,1,3,1,63,450,NULL,"Existence de base de données (oui/non)",""),
        (464,"Si oui, existence de mise à jour (oui/non)",0,1,3,1,NULL,450,NULL,"Si oui, existence de mise à jour (oui/non)",""),
        (465,"Existence de système d'information opérationnel (oui/non)",0,1,3,1,64,450,NULL,"Existence de système d'information opérationnel (oui/non)",""),
        (466,"Thématique du SI",0,1,3,0,NULL,450,NULL,"Thématique du SI",""),
        (467,"Observations PPSE",0,1,3,0,NULL,450,NULL,"Observations PPSE",""),
        (468,"Source de données PPSE",0,1,3,1,NULL,450,NULL,"Source de données PPSE",""),
    
    
    
        (469,"Insitution",1,1,3,0,NULL,NULL,NULL,"Insitution",""),
        (470,"DREDD/CIREDD",0,1,3,0,NULL,469,NULL,"DREDD/CIREDD",""),
        (471,"Commune d'intervention pour le reboisement",0,1,3,1,NULL,469,NULL,"Commune d'intervention pour le reboisement",""),
        (472,"Fokontany d'intervention pour le reboisement",0,1,3,0,NULL,469,NULL,"Fokontany d'intervention pour le reboisement",""),
        (473,"Site/Localité",0,1,3,0,NULL,469,NULL,"Site/Localité",""),
        (474,"Situation juridique (terrain domanial, privé)",0,1,3,1,NULL,469,NULL,"Situation juridique (terrain domanial, privé)",""),
        (475,"Longitude surface reboisée (en degré décimal) : X",0,1,3,1,NULL,469,NULL,"Longitude surface reboisée (en degré décimal) : X",""),
        (476,"Latitude surface reboisée (en degré décimal) : Y",0,1,3,1,NULL,469,NULL,"Latitude surface reboisée (en degré décimal) : Y",""),
        (477,"Entité ou personne responsable du reboisement",0,1,3,1,NULL,469,NULL,"Entité ou personne responsable du reboisement",""),
        (478,"Objectif de reboisement (restauration, energétique, bois d'œuvre, …)",0,1,3,1,NULL,469,NULL,"Objectif de reboisement (restauration, energétique, bois d'œuvre, …)",""),
        (479,"Superficie restaurée si restauration (ha)",0,1,3,1,NULL,469,NULL,"Superficie restaurée si restauration (ha)",""),
        (480,"Ecosystème (mangrove, zone humide, forêt humide, forêt sèche, reboisement, …)",0,1,3,1,65,469,NULL,"Ecosystème (mangrove, zone humide, forêt humide, forêt sèche, reboisement, …)",""),
        (481,"Surface totale prévue (ha)",0,1,3,0,NULL,469,NULL,"Surface totale prévue (ha)",""),
        (482,"Nombre de plants mis en terre",0,1,3,1,NULL,469,NULL,"Nombre de plants mis en terre",""),
        (483,"Espèce des plants",0,1,3,1,NULL,469,NULL,"Espèce des plants",""),
        (484,"Autochtone ou exotique",0,1,3,1,NULL,469,NULL,"Autochtone ou exotique",""),
        (485,"Croissance rapide (oui/non)",0,1,3,1,NULL,469,NULL,"Croissance rapide (oui/non)",""),
        (486,"Date de mise en terre",0,1,3,1,NULL,469,NULL,"Date de mise en terre",""),
        (487,"Source de plants",0,1,3,1,NULL,469,NULL,"Source de plants",""),
        (488,"Superficie reboisée (ha)",0,1,3,1,NULL,469,NULL,"Superficie reboisée (ha)",""),
        (489,"Shapefile surface reboisée",0,1,3,0,NULL,469,NULL,"Shapefile surface reboisée",""),
        (490,"Source de financement du reboisement (interne ou externe)",0,1,3,1,NULL,469,NULL,"Source de financement du reboisement (interne ou externe)",""),
        (491,"Projet d'appui du reboisement (si externe)",0,1,3,1,NULL,469,NULL,"Projet d'appui du reboisement (si externe)",""),
        (492,"Identifiant du projet d'appui pour le reboisement et la gestion des terres",0,1,3,0,NULL,469,NULL,"Identifiant du projet d'appui pour le reboisement et la gestion des terres",""),
        (493,"Pare feux (km)",0,1,3,1,NULL,469,NULL,"Pare feux (km)",""),
        (494,"Matériels de lutte active",0,1,3,0,NULL,469,NULL,"Matériels de lutte active",""),
        (495,"Existence de structure de lutte (oui/non)",0,1,3,0,NULL,469,NULL,"Existence de structure de lutte (oui/non)",""),
        (496,"Surface brûlée (ha)",0,1,3,0,NULL,469,NULL,"Surface brûlée (ha)",""),
        (497,"Shapefile surface de reboisement brûlée",0,1,3,0,NULL,469,NULL,"Shapefile surface de reboisement brûlée",""),
        (498,"Lutte active ou passive",0,1,3,0,NULL,469,NULL,"Lutte active ou passive",""),
        (499,"Date d'intervention",0,1,3,0,NULL,469,NULL,"Date d'intervention",""),
        (500,"Responsable de lutte contre les feux",0,1,3,0,NULL,469,NULL,"Responsable de lutte contre les feux",""),
        (501,"Regarnissage (oui/non)",0,1,3,0,NULL,469,NULL,"Regarnissage (oui/non)",""),
        (502,"Date de regarnissage",0,1,3,0,NULL,469,NULL,"Date de regarnissage",""),
        (503,"Nettoyage (oui/non)",0,1,3,0,NULL,469,NULL,"Nettoyage (oui/non)",""),
        (504,"Date de nettoyage",0,1,3,0,NULL,469,NULL,"Date de nettoyage",""),
        (505,"Elagage (oui/non)",0,1,3,0,NULL,469,NULL,"Elagage (oui/non)",""),
        (506,"Date d'elagage",0,1,3,0,NULL,469,NULL,"Date d'elagage",""),
        (507,"Bénéficiaires des interventions",0,1,3,0,NULL,469,NULL,"Bénéficiaires des interventions",""),
        (508,"Eclaicie 1 (oui/non)",0,1,3,0,NULL,469,NULL,"Eclaicie 1 (oui/non)",""),
        (509,"Date eclaircie 1",0,1,3,0,NULL,469,NULL,"Date eclaircie 1",""),
        (510,"Eclarcie 2 (oui/non)",0,1,3,0,NULL,469,NULL,"Eclarcie 2 (oui/non)",""),
        (511,"Date eclaircie 2",0,1,3,0,NULL,469,NULL,"Date eclaircie 2",""),
        (512,"Coupe rase (oui/non)",0,1,3,0,NULL,469,NULL,"Coupe rase (oui/non)",""),
        (513,"Date coupe rase",0,1,3,0,NULL,469,NULL,"Date coupe rase",""),
        (514,"Année d'intervention des activités pour la gestion des terres",0,1,3,0,NULL,469,NULL,"Année d'intervention des activités pour la gestion des terres",""),
        (515,"Catégorie/Zone d'intervention (Agroforesterie, Bassin versant, Dune, Forêt de Tapia, Littoral, Mangrove, Recif corallien)",0,1,3,0,NULL,469,NULL,"Catégorie/Zone d'intervention (Agroforesterie, Bassin versant, Dune, Forêt de Tapia, Littoral, Mangrove, Recif corallien)",""),
        (516,"Terre dégradée avec des interventions de défense ou de protection (oui/non)",0,1,3,1,NULL,469,NULL,"Terre dégradée avec des interventions de défense ou de protection (oui/non)",""),
        (517,"Existence de protection antiérosive (oui/non)",0,1,3,1,NULL,469,NULL,"Existence de protection antiérosive (oui/non)",""),
        (518,"Autres protections (à préciser)",0,1,3,1,NULL,469,NULL,"Autres protections (à préciser)",""),
        (519,"Superficie de DRS (ha)",0,1,3,1,NULL,469,NULL,"Superficie de DRS (ha)",""),
        (520,"Shapefile de la DRS",0,1,3,0,NULL,469,NULL,"Shapefile de la DRS",""),
        (521,"Fixation de dunes (oui/non)",0,1,3,1,NULL,469,NULL,"Fixation de dunes (oui/non)",""),
        (522,"Superficie de dune stabilisée (ha)",0,1,3,1,NULL,469,NULL,"Superficie de dune stabilisée (ha)",""),
        (523,"Shapefile de la dune stabilisée",0,1,3,0,NULL,469,NULL,"Shapefile de la dune stabilisée",""),
        (524,"Type de la défense et restauration des sols adopté (mécanique, biologique, mixte)",0,1,3,0,NULL,469,NULL,"Type de la défense et restauration des sols adopté (mécanique, biologique, mixte)",""),
        (525,"Nombre de ménage pratiquant la DRS",0,1,3,0,NULL,469,NULL,"Nombre de ménage pratiquant la DRS",""),
        (526,"Comité formé sur la DRS (oui/non)",0,1,3,0,NULL,469,NULL,"Comité formé sur la DRS (oui/non)",""),
        (527,"Si oui, année de création du comité",0,1,3,0,NULL,469,NULL,"Si oui, année de création du comité",""),
        (528,"Comité sur DRS opérationnel (oui/non)",0,1,3,0,NULL,469,NULL,"Comité sur DRS opérationnel (oui/non)",""),
        (529,"Suivi des interventions DRS (oui/non)",0,1,3,0,NULL,469,NULL,"Suivi des interventions DRS (oui/non)",""),
        (530,"Périodicité de suivi DRS (nombre/an)",0,1,3,0,NULL,469,NULL,"Périodicité de suivi DRS (nombre/an)",""),
        (531,"Observations reboisement et gestion des terres",0,1,3,0,NULL,469,NULL,"Observations reboisement et gestion des terres",""),
        (532,"Source de données reboisement et gestion des terres",0,1,3,1,NULL,469,NULL,"Source de données reboisement et gestion des terres",""),
                                                              
                                                              
                                                              
        (533,"Sujet de recherche effectué",1,1,3,1,NULL,NULL,NULL,"Sujet de recherche effectué",""),
        (534,"Objectif de la recherche (étude de filière, ...)",0,1,3,0,NULL,533,NULL,"Objectif de la recherche (étude de filière, ...)",""),
        (535,"Commune d'intervention de la recherche",0,1,3,1,NULL,533,NULL,"Commune d'intervention de la recherche",""),
        (536,"Date de commencement de la recherche",0,1,3,0,NULL,533,NULL,"Date de commencement de la recherche",""),
        (537,"Date de fin de la recherche",0,1,3,0,NULL,533,NULL,"Date de fin de la recherche",""),
        (538,"Chercheurs (liste)",0,1,3,0,NULL,533,NULL,"Chercheurs (liste)",""),
        (539,"Institution des chercheurs",0,1,3,0,NULL,533,NULL,"Institution des chercheurs",""),
        (540,"Date d'édition du rapport de recherche",0,1,3,0,NULL,533,NULL,"Date d'édition du rapport de recherche",""),
        (541,"Résultats de la recherche",0,1,3,0,NULL,533,NULL,"Résultats de la recherche",""),
        (542,"Résultats de recherche disponibles (oui/non)",0,1,3,1,70,533,NULL,"Résultats de recherche disponibles (oui/non)",""),
        (543,"Résultats de recherche appliqués (oui/non)",0,1,3,1,71,533,NULL,"Résultats de recherche appliqués (oui/non)",""),
        (544,"Produits de recherche diffusés, vulgarisés, promus (oui/non)",0,1,3,1,72,533,NULL,"Produits de recherche diffusés, vulgarisés, promus (oui/non)",""),
        (545,"Source de financement de la recherche (interne ou externe)",0,1,3,1,NULL,533,NULL,"Source de financement de la recherche (interne ou externe)",""),
        (546,"Projet d'appui de la recherche (si externe)",0,1,3,1,NULL,533,NULL,"Projet d'appui de la recherche (si externe)",""),
        (547,"Coûts des activités de recherche (Ariary)",0,1,3,0,NULL,533,NULL,"Coûts des activités de recherche (Ariary)",""),
        (548,"Identifiant du projet d'appui pour la recherche",0,1,3,0,NULL,533,NULL,"Identifiant du projet d'appui pour la recherche",""),
        (549,"Observations recherche",0,1,3,0,NULL,533,NULL,"Observations recherche",""),
        (550,"Source de données recherche",0,1,3,1,NULL,533,NULL,"Source de données recherche",""),
                                                              
                                                              
                                                              
        (551,"Intitulé du projet développé dans le cadre de RSE (Responsabilité Sociétale des Entreprises)",1,1,3,1,NULL,NULL,NULL,"Intitulé du projet développé dans le cadre de RSE (Responsabilité Sociétale des Entreprises)",""),
        (552,"Objectifs du projet RSE",0,1,3,1,NULL,551,NULL,"Objectifs du projet RSE",""),
        (553,"Date de réalisation RSE",0,1,3,0,NULL,551,NULL,"Date de réalisation RSE",""),
        (554,"Commune d'intervention pour RSE",0,1,3,0,NULL,551,NULL,"Commune d'intervention pour RSE",""),
        (555,"Types d'intervention (éducation environnementale, reboisement/restauration, …)",0,1,3,0,NULL,551,NULL,"Types d'intervention (éducation environnementale, reboisement/restauration, …)",""),
        (556,"Supports afférents produits (liste)",0,1,3,0,NULL,551,NULL,"Supports afférents produits (liste)",""),
        (557,"Parties prenantes pour RSE (liste)",0,1,3,0,NULL,551,NULL,"Parties prenantes pour RSE (liste)",""),
        (558,"Nombre de ménages bénéficiaires de la RSE",0,1,3,0,NULL,551,NULL,"Nombre de ménages bénéficiaires de la RSE",""),
        (559,"Nombre d'autres bénéficiaires de la (groupement, école, …)",0,1,3,0,NULL,551,NULL,"Nombre d'autres bénéficiaires de la (groupement, école, …)",""),
        (560,"Existence de suivi des projets RSE (oui/non)",0,1,3,0,NULL,551,NULL,"Existence de suivi des projets RSE (oui/non)",""),
        (561,"Périodicité de suivi RSE (nombre par an)",0,1,3,0,NULL,551,NULL,"Périodicité de suivi RSE (nombre par an)",""),
        (562,"Identifiant du projet d'appui pour la RSE",0,1,3,0,NULL,551,NULL,"Identifiant du projet d'appui pour la RSE",""),
        (563,"Observations RSE",0,1,3,0,NULL,551,NULL,"Observations RSE",""),
        (564,"Source de données RSE",0,1,3,1,NULL,551,NULL,"Source de données RSE",""),
                                                              
                                                              
                                                              
        (565,"Intitulé du poste",1,1,3,1,NULL,NULL,NULL,"Intitulé du poste",""),
        (566,"Justificatif d'assignation (Décisions, Note de service, arrêtés, décrets avec numéro)",0,1,3,1,NULL,565,NULL,"Justificatif d'assignation (Décisions, Note de service, arrêtés, décrets avec numéro)",""),
        (567,"Poste occupé ou vaccant",0,1,3,1,74,565,NULL,"Poste occupé ou vaccant",""),
        (568,"Type du poste (administratif, technique)",0,1,3,1,75,565,NULL,"Type du poste (administratif, technique)",""),
        (569,"Statut du personnel (ECD, ELD, EFA, fonctionnaire)",0,1,3,1,74,565,NULL,"Statut du personnel (ECD, ELD, EFA, fonctionnaire)",""),
        (570,"Commune d'affectation",0,1,3,0,NULL,565,NULL,"Commune d'affectation",""),
        (571,"Année d'affectation",0,1,3,0,NULL,565,NULL,"Année d'affectation",""),
        (572,"Date de recrutement/année",0,1,3,0,NULL,565,NULL,"Date de recrutement/année",""),
        (573,"Date estimée de retraite/année",0,1,3,0,NULL,565,NULL,"Date estimée de retraite/année",""),
        (574,"Personne bénéficiant de formation (oui, non)",0,1,3,0,NULL,565,NULL,"Personne bénéficiant de formation (oui, non)",""),
        (575,"Sujet de formation",0,1,3,0,NULL,565,NULL,"Sujet de formation",""),
        (576,"Formation appliquée/utilisée (oui/non)",0,1,3,0,NULL,565,NULL,"Formation appliquée/utilisée (oui/non)",""),
        (577,"Besoins en formation pour le poste ",0,1,3,0,NULL,565,NULL,"Besoins en formation pour le poste ",""),
        (578,"Observations ressources humaines",0,1,3,0,NULL,565,NULL,"Observations ressources humaines",""),
        (579,"Source de données ressources humaines",0,1,3,1,NULL,565,NULL,"Source de données ressources humaines",""),
                                                              
                                                              
                                                              
        (580,"Site du TG",1,1,3,0,NULL,NULL,NULL,"Site du TG",""),
        (581,"Fokontany d'implatation du TG",0,1,3,0,NULL,580,NULL,"Fokontany d'implatation du TG",""),
        (582,"Commune d'implatation du TG",0,1,3,1,NULL,580,NULL,"Commune d'implatation du TG",""),
        (583,"Type de forêts (Primaire, Secondaire, Littorale, Fourré, Mangrove, Satrana, Raphia, Tapia, Domaniale, Reboisement, Zone de pêches, etc.)",0,1,3,1,NULL,580,NULL,"Type de forêts (Primaire, Secondaire, Littorale, Fourré, Mangrove, Satrana, Raphia, Tapia, Domaniale, Reboisement, Zone de pêches, etc.)",""),
        (584,"Surface contrat 1 (ha)",0,1,3,1,NULL,580,NULL,"Surface contrat 1 (ha)",""),
        (585,"Type de TG (GCF, GELOSE)",0,1,3,1,NULL,580,NULL,"Type de TG (GCF, GELOSE)",""),
        (586,"Vocation/Objectifs (Conservation, Valorisation, Ecotourisme, Droit d'usage (CDU), Restauration, Production, Reserve, Réhabilitation, Enrichissement, Reboisement, Exploitation, Production durable, Zone de culture, Plantes fourragères, Production charbon de bois, Utilisation culturelle, etc.)",0,1,3,1,NULL,580,NULL,"Vocation/Objectifs (Conservation, Valorisation, Ecotourisme, Droit d'usage (CDU), Restauration, Production, Reserve, Réhabilitation, Enrichissement, Reboisement, Exploitation, Production durable, Zone de culture, Plantes fourragères, Production charbon de bois, Utilisation culturelle, etc.)",""),
        (587,"Surface contrat 2 (ha)",0,1,3,1,NULL,580,NULL,"Surface contrat 2 (ha)",""),
        (588,"Date 1er contrat",0,1,3,1,NULL,580,NULL,"Date 1er contrat",""),
        (589,"Date Evaluation 1er contrat",0,1,3,1,NULL,580,NULL,"Date Evaluation 1er contrat",""),
        (590,"Date Déliberation",0,1,3,1,NULL,580,NULL,"Date Déliberation",""),
        (591,"Date 2ème contrat",0,1,3,0,NULL,580,NULL,"Date 2ème contrat",""),
        (592,"Ressources concernées dans le site de TG",0,1,3,1,NULL,580,NULL,"Ressources concernées dans le site de TG",""),
        (593,"Nouvellement créé ou renouvelé",0,1,3,1,NULL,580,NULL,"Nouvellement créé ou renouvelé",""),
        (594,"Nom de la COBA/VOI",0,1,3,1,NULL,580,NULL,"Nom de la COBA/VOI",""),
        (595,"Date de création de la COBA/VOI",0,1,3,0,NULL,580,NULL,"Date de création de la COBA/VOI",""),
        (596,"Nombre des membres de COBA/VOI",0,1,3,0,NULL,580,NULL,"Nombre des membres de COBA/VOI",""),
        (597,"COBA/VOI structurée (oui/non)",0,1,3,0,NULL,580,NULL,"COBA/VOI structurée (oui/non)",""),
        (598,"COBA/VOI formée (oui/non)",0,1,3,1,81,580,NULL,"COBA/VOI formée (oui/non)",""),
        (599,"COBA/VOI opérationnelle (oui/non)",0,1,3,0,NULL,580,NULL,"COBA/VOI opérationnelle (oui/non)",""),
        (600,"Nombre de ménages bénéficiaires du TG",0,1,3,1,NULL,580,NULL,"Nombre de ménages bénéficiaires du TG",""),
        (601,"COBA/VOI appuyée/soutenue (oui/non)",0,1,3,1,82,580,NULL,"COBA/VOI appuyée/soutenue (oui/non)",""),
        (602,"Type d'appui pour TG (dotation matériels, formation, AGR…)",0,1,3,0,NULL,580,NULL,"Type d'appui pour TG (dotation matériels, formation, AGR…)",""),
        (603,"Organisme d'appui du TG",0,1,3,1,NULL,580,NULL,"Organisme d'appui du TG",""),
        (604,"Projet d'appui du TG",0,1,3,1,NULL,580,NULL,"Projet d'appui du TG",""),
        (605,"Identifiant du projet d'appui du TG",0,1,3,0,NULL,580,NULL,"Identifiant du projet d'appui du TG",""),
        (606,"Existence de suivi du TG (oui/non)",0,1,3,1,78,580,NULL,"Existence de suivi du TG (oui/non)",""),
        (607,"Objetcif du suivi de TG",0,1,3,0,NULL,580,NULL,"Objetcif du suivi de TG",""),
        (608,"Date de réalisation du suivi de TG",0,1,3,0,NULL,580,NULL,"Date de réalisation du suivi de TG",""),
        (609,"Equipe de réalisation du suivi de TG",0,1,3,0,NULL,580,NULL,"Equipe de réalisation du suivi de TG",""),
        (610,"Rapport de suivi de TG (oui/non)",0,1,3,0,NULL,580,NULL,"Rapport de suivi de TG (oui/non)",""),
        (611,"Date d'édition rapport de suivi TG",0,1,3,0,NULL,580,NULL,"Date d'édition rapport de suivi TG",""),
        (612,"Existence d'évaluation du TG (oui/non)",0,1,3,1,79,580,NULL,"Existence d'évaluation du TG (oui/non)",""),
        (613,"Objectif de l'évaluation de TG",0,1,3,0,NULL,580,NULL,"Objectif de l'évaluation de TG",""),
        (614,"Date de réalisation de l'évaluation de TG",0,1,3,0,NULL,580,NULL,"Date de réalisation de l'évaluation de TG",""),
        (615,"Equipe de réalisation de l'évaluation de TG",0,1,3,0,NULL,580,NULL,"Equipe de réalisation de l'évaluation de TG",""),
        (616,"Rapport d'évaluation de TG (oui/non)",0,1,3,0,NULL,580,NULL,"Rapport d'évaluation de TG (oui/non)",""),
        (617,"Date d'édition rapport évaluation TG",0,1,3,0,NULL,580,NULL,"Date d'édition rapport évaluation TG",""),
        (618,"Shapefile TG",0,1,3,0,NULL,580,NULL,"Shapefile TG",""),
        (619,"Observations TG",0,1,3,0,NULL,580,NULL,"Observations TG",""),
        (620,"Source de données TG",0,1,3,1,NULL,580,NULL,"Source de données TG",""),
                                                              
                                                              
                                                              
        (621,"Date de création de la pépinière",1,1,3,0,NULL,NULL,NULL,"Date de création de la pépinière",""),
        (622,"Pépinière fonctionnelle (oui/non)",0,1,3,0,NULL,621,NULL,"Pépinière fonctionnelle (oui/non)",""),
        (623,"Commune d'implantation de la pépinière",0,1,3,1,NULL,621,NULL,"Commune d'implantation de la pépinière",""),
        (624,"Longitude pépinière (en degré décimal) : X",0,1,3,1,NULL,621,NULL,"Longitude pépinière (en degré décimal) : X",""),
        (625,"Latitude pépinière (en degré décimal) : Y",0,1,3,1,NULL,621,NULL,"Latitude pépinière (en degré décimal) : Y",""),
        (626,"Type de pépinière (villageoise, individuelle, institutionnelle, …)",0,1,3,0,NULL,621,NULL,"Type de pépinière (villageoise, individuelle, institutionnelle, …)",""),
        (627,"Pépinière privée (oui/non)",0,1,3,0,NULL,621,NULL,"Pépinière privée (oui/non)",""),
        (628,"Shapefile localisation pépinière",0,1,3,0,NULL,621,NULL,"Shapefile localisation pépinière",""),
        (629,"Source de financement de la pépinière (interne ou externe)",0,1,3,1,NULL,621,NULL,"Source de financement de la pépinière (interne ou externe)",""),
        (630,"Projet d'appui de la pépinière (si externe)",0,1,3,1,NULL,621,NULL,"Projet d'appui de la pépinière (si externe)",""),
        (631,"Identifiant du projet d'appui de la pépinière",0,1,3,0,NULL,621,NULL,"Identifiant du projet d'appui de la pépinière",""),
        (632,"Nom Propriétaire (Nom et prénom si personne physique ; Nom ou dénomination si personne morale)",0,1,3,0,NULL,621,NULL,"Nom Propriétaire (Nom et prénom si personne physique ; Nom ou dénomination si personne morale)",""),
        (633,"Genre du propriétaire (masculin, féminin, autre)",0,1,3,0,NULL,621,NULL,"Genre du propriétaire (masculin, féminin, autre)",""),
        (634,"Nombre total des employés",0,1,3,0,NULL,621,NULL,"Nombre total des employés",""),
        (635,"Nombre des femmes impliquées à la production de plants.",0,1,3,0,NULL,621,NULL,"Nombre des femmes impliquées à la production de plants.",""),
        (636,"Essences utilisées en pépinière",0,1,3,0,NULL,621,NULL,"Essences utilisées en pépinière",""),
        (637,"Capacite maximale de production (nombre)",0,1,3,0,NULL,621,NULL,"Capacite maximale de production (nombre)",""),
        (638,"Nombre de plants prêts à être mis en terre produits",0,1,3,1,NULL,621,NULL,"Nombre de plants prêts à être mis en terre produits",""),
        (639,"Observations pépinière",0,1,3,0,NULL,621,NULL,"Observations pépinière",""),
        (640,"Source de données pépinière",0,1,3,1,NULL,621,NULL,"Source de données pépinière",""),
                                                              
                                                              
                                                              
        (641,"Intitulé de la SNICDD",1,1,3,1,NULL,NULL,NULL,"Intitulé de la SNICDD",""),
        (642,"Date d'élaboration de la SNICDD",0,1,3,0,NULL,641,NULL,"Date d'élaboration de la SNICDD",""),
        (643,"Parties prenantes dans l'élaboration",0,1,3,0,NULL,641,NULL,"Parties prenantes dans l'élaboration",""),
        (644,"SNICDD opérationnelle (oui/non)",0,1,3,0,NULL,641,NULL,"SNICDD opérationnelle (oui/non)",""),
        (645,"Intitulé de politique sectorielle alignée au DD",0,1,3,1,NULL,641,NULL,"Intitulé de politique sectorielle alignée au DD",""),
        (646,"Objectif de politique sectorielle alignée au DD",0,1,3,0,NULL,641,NULL,"Objectif de politique sectorielle alignée au DD",""),
        (647,"Date d'adoption de politique sectorielle alignée au DD",0,1,3,0,NULL,641,NULL,"Date d'adoption de politique sectorielle alignée au DD",""),
        (648,"Politique sectorielle alignée au DD opérationnelle (oui/non)",0,1,3,0,84,641,NULL,"Politique sectorielle alignée au DD opérationnelle (oui/non)",""),
        (649,"Intitulé de politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC)",0,1,3,1,NULL,641,NULL,"Intitulé de politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC)",""),
        (650,"Objectif de politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC)",0,1,3,0,NULL,641,NULL,"Objectif de politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC)",""),
        (651,"Date d'adoption de politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC)",0,1,3,0,NULL,641,NULL,"Date d'adoption de politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC)",""),
        (652,"Politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC) opérationnelle (oui/non)",0,1,3,0,NULL,641,NULL,"Politique de développement et de planification territoriale alignée au DD (PRD, PCD, SAC) opérationnelle (oui/non)",""),
        (653,"Nombre de promoteur ayant un label de DD",0,1,3,1,NULL,641,NULL,"Nom de promoteur ayant un label de DD",""),
        (654,"Date d'obtention du label",0,1,3,0,NULL,641,NULL,"Date d'obtention du label",""),
        (655,"Commune d'obtention du label",0,1,3,1,NULL,641,NULL,"Commune d'obtention du label",""),
        (656,"Label toujours valide (oui/non)",0,1,3,0,NULL,641,NULL,"Label toujours valide (oui/non)",""),
        (657,"Intitulé du projet/programme en DD développé",0,1,3,1,NULL,641,NULL,"Intitulé du projet/programme en DD développé",""),
        (658,"Année de début projet/programme en DD",0,1,3,0,NULL,641,NULL,"Année de début projet/programme en DD",""),
        (659,"Année de fin projet/programme en DD",0,1,3,0,NULL,641,NULL,"Année de fin projet/programme en DD",""),
        (660,"Initiateur du projet/programme en DD",0,1,3,0,NULL,641,NULL,"Initiateur du projet/programme en DD",""),
        (661,"Intitulé du financement dans le cadre du DD",0,1,3,0,NULL,641,NULL,"Intitulé du financement dans le cadre du DD",""),
        (662,"Source de financement (interne ou externe)",0,1,3,0,NULL,641,NULL,"Source de financement (interne ou externe)",""),
        (663,"Date d'accord de financement",0,1,3,0,NULL,641,NULL,"Date d'accord de financement",""),
        (664,"Montant du financement (Ariary)",0,1,3,1,NULL,641,NULL,"Montant du financement (Ariary)",""),
        (665,"Identifiant du projet d'appui pour le DD",0,1,3,0,NULL,641,NULL,"Identifiant du projet d'appui pour le DD",""),
        (666,"Observations DD",0,1,3,0,NULL,641,NULL,"Observations DD",""),
        (667,"Source de données DD",0,1,3,1,NULL,641,NULL,"Source de données DD",""),
                                                              
                                                              
                                                              
        (668,"Type de Services Environnementaux (régulation, production, …)",1,1,3,0,NULL,NULL,NULL,"Type de Services Environnementaux (régulation, production, …)",""),
        (669,"Fournisseur du SE (projets, Etat, communauté, …)",0,1,3,0,NULL,668,NULL,"Fournisseur du SE (projets, Etat, communauté, …)",""),
        (670,"Commune d'oimplantation du PSE",0,1,3,1,NULL,668,NULL,"Commune d'oimplantation du PSE",""),
        (671,"Intitulé de l'activité de PSE développée",0,1,3,1,NULL,668,NULL,"Intitulé de l'activité de PSE développée",""),
        (672,"Activités de PSE appuyées (oui/non)",0,1,3,0,NULL,668,NULL,"Activités de PSE appuyées (oui/non)",""),
        (673,"Type d'appui venant du PSE (dotation matériels, formation, AGR…)",0,1,3,0,NULL,668,NULL,"Type d'appui venant du PSE (dotation matériels, formation, AGR…)",""),
        (674,"Source de financement du PSE (interne ou externe)",0,1,3,1,NULL,668,NULL,"Source de financement du PSE (interne ou externe)",""),
        (675,"Projet d'appui du PSE (si externe)",0,1,3,1,NULL,668,NULL,"Projet d'appui du PSE (si externe)",""),
        (676,"Identifiant du projet d'appui pour le PSE",0,1,3,0,NULL,668,NULL,"Identifiant du projet d'appui pour le PSE",""),
        (677,"Nombre de ménages bénéficiaires du PSE",0,1,3,1,NULL,668,NULL,"Nombre de ménages bénéficiaires du PSE",""),
        (678,"Micro-projets financés (oui/non)",0,1,3,0,NULL,668,NULL,"Micro-projets financés (oui/non)",""),
        (679,"Lequel/lesquels?",0,1,3,0,NULL,668,NULL,"Lequel/lesquels?",""),
        (680,"Micro projets alternatifs réalisés (liste)",0,1,3,0,NULL,668,NULL,"Micro projets alternatifs réalisés (liste)",""),
        (681,"Micro-projets sont suivis (oui/non)",0,1,3,0,NULL,668,NULL,"Micro-projets sont suivis (oui/non)",""),
        (682,"Filières de la biodiversité dotées de mécanismes de partage équitable de bénéfices (liste)",0,1,3,0,NULL,668,NULL,"Filières de la biodiversité dotées de mécanismes de partage équitable de bénéfices (liste)",""),
        (683,"Projets alternatifs aux pressions mis en œuvre dans les zones d'intervention (liste)",0,1,3,0,NULL,668,NULL,"Projets alternatifs aux pressions mis en œuvre dans les zones d'intervention (liste)",""),
        (684,"Structures intercommunales appuyées (liste)",0,1,3,0,NULL,668,NULL,"Structures intercommunales appuyées (liste)",""),
        (685,"Etudes de filières en relation avec les PSE réalisées (liste)",0,1,3,0,NULL,668,NULL,"Etudes de filières en relation avec les PSE réalisées (liste)",""),
        (686,"Valeur des services ecosystémiques fournis (culturelle, éconimique, …)",0,1,3,0,NULL,668,NULL,"Valeur des services ecosystémiques fournis (culturelle, éconimique, …)",""),
        (687,"Observations PSE",0,1,3,0,NULL,668,NULL,"Observations PSE",""),
        (688,"Source de données PSE",0,1,3,1,NULL,668,NULL,"Source de données PSE",""),
                                                              
                                                              
                                                              
        (689,"Type de doléances (corruption, manquement au code de déontologie et ethique environnementale)",1,1,3,1,NULL,NULL,NULL,"Type de doléances (corruption, manquement au code de déontologie et ethique environnementale)",""),
        (690,"Doléances traitées (oui/non)",0,1,3,1,89,689,NULL,"Doléances traitées (oui/non)",""),
        (691,"Commune de réception de la doléance",0,1,3,1,NULL,689,NULL,"Commune de réception de la doléance",""),
        (692,"Type de corruption (actif, passif)",0,1,3,0,NULL,689,NULL,"Type de corruption (actif, passif)",""),
        (693,"Transmission des cas de corruption au Conseil de disipline (oui/non)",0,1,3,0,NULL,689,NULL,"Transmission des cas de corruption au Conseil de disipline (oui/non)",""),
        (694,"Sanction par le Conseil de discipline",0,1,3,0,NULL,689,NULL,"Sanction par le Conseil de discipline",""),
        (695,"Transmission à la juridication compétente des affaires de corruption (oui/non)",0,1,3,0,NULL,689,NULL,"Transmission à la juridication compétente des affaires de corruption (oui/non)",""),
        (696,"Nombre de personnes condamnées pour corruption",0,1,3,0,NULL,689,NULL,"Nombre de personnes condamnées pour corruption",""),
        (697,"Nombre de prevention dans le cadre de la lutte anti corruption",0,1,3,0,NULL,689,NULL,"Nombre de prevention dans le cadre de la lutte anti corruption",""),
        (698,"Nombre d'infraction de blanchiment de capitaux retenu par le SAMIFIN",0,1,3,0,NULL,689,NULL,"Nombre d'infraction de blanchiment de capitaux retenu par le SAMIFIN",""),
        (699,"Médiatisation des poursuites judiciaires en matière de trafic de ressources naturelles (oui/non)",0,1,3,0,NULL,689,NULL,"Médiatisation des poursuites judiciaires en matière de trafic de ressources naturelles (oui/non)",""),
        (700,"Nombre d'intervention du BIANCO ",0,1,3,0,NULL,689,NULL,"Nombre d'intervention du BIANCO ",""),
        (701,"Identifiant du projet d'appui pour la lutte contre la corruption",0,1,3,0,NULL,689,NULL,"Identifiant du projet d'appui pour la lutte contre la corruption",""),
        (702,"Observations corruption",0,1,3,0,NULL,689,NULL,"Observations corruption",""),
        (703,"Source de données corruption",0,1,3,1,NULL,689,NULL,"Source de données corruption",""),
                                                              
                                                              
                                                              
        (704,"Intitulé du projet",1,1,3,1,NULL,NULL,NULL,"Intitulé du projet",""),
        (705,"Région d'intervention",0,1,3,1,NULL,704,NULL,"Région d'intervention",""),
        (706,"Année de début et année de fin",0,1,3,1,NULL,704,NULL,"Année de début et année de fin",""),
        (707,"Thématique touchée",0,1,3,1,NULL,704,NULL,"Thématique touchée",""),
        (708,"Coût total",0,1,3,1,NULL,704,NULL,"Coût total",""),
        (709,"Objectif général ",0,1,3,1,NULL,704,NULL,"Objectif général ",""),
        (710,"Objectifs specifiques",0,1,3,1,NULL,704,NULL,"Objectifs specifiques",""),
        (711,"Bénéficiaires",0,1,3,1,NULL,704,NULL,"Bénéficiaires",""),
        (712,"Résultats et effets attendus",0,1,3,1,NULL,704,NULL,"Résultats et effets attendus",""),
        (713,"Activités principales",0,1,3,1,NULL,704,NULL,"Activités principales",""),
        (714,"Financement (Subvention, co-financement, Ressource Propre Interne, don, emprunt, …)",0,1,3,1,NULL,704,NULL,"Financement (Subvention, co-financement, Ressource Propre Interne, don, emprunt, …)",""),
        (715,"Code/Identifiant du projet",0,1,3,1,NULL,704,NULL,"Code/Identifiant du projet",""),
        (716,"Observations info projets",0,1,3,0,NULL,704,NULL,"Observations info projets",""),
        (717,"Source de données info projets",0,1,3,1,NULL,704,NULL,"Source de données info projets","")`
    );

    // Update values of indicateur to link with questions
    sql.push(`UPDATE indicateur set id_question = 	6	WHERE id = 	1`);
    sql.push(`UPDATE indicateur set id_question = 	19	WHERE id = 	2`);
    sql.push(`UPDATE indicateur set id_question = 	43	WHERE id = 	3`);
    sql.push(`UPDATE indicateur set id_question = 	26	WHERE id = 	5`);
    sql.push(`UPDATE indicateur set id_question = 	35	WHERE id = 	6`);
    sql.push(`UPDATE indicateur set id_question = 	38	WHERE id = 	7`);
    sql.push(`UPDATE indicateur set id_question = 	44	WHERE id = 	8`);
    sql.push(`UPDATE indicateur set id_question = 	70	WHERE id = 	9`);
    sql.push(`UPDATE indicateur set id_question = 	101	WHERE id = 	10`);
    sql.push(`UPDATE indicateur set id_question = 	101	WHERE id = 	11`);
    sql.push(`UPDATE indicateur set id_question = 	101	WHERE id = 	12`);
    sql.push(`UPDATE indicateur set id_question = 	101	WHERE id = 	13`);
    sql.push(`UPDATE indicateur set id_question = 	123	WHERE id = 	14`);
    sql.push(`UPDATE indicateur set id_question = 	138	WHERE id = 	15`);
    sql.push(`UPDATE indicateur set id_question = 	144	WHERE id = 	16`);
    sql.push(`UPDATE indicateur set id_question = 	149	WHERE id = 	17`);
    sql.push(`UPDATE indicateur set id_question = 	153	WHERE id = 	18`);
    sql.push(`UPDATE indicateur set id_question = 	157	WHERE id = 	19`);
    sql.push(`UPDATE indicateur set id_question = 	160	WHERE id = 	20`);
    sql.push(`UPDATE indicateur set id_question = 	163	WHERE id = 	21`);
    sql.push(`UPDATE indicateur set id_question = 	172	WHERE id = 	22`);
    sql.push(`UPDATE indicateur set id_question = 	176	WHERE id = 	23`);
    sql.push(`UPDATE indicateur set id_question = 	193	WHERE id = 	24`);
    sql.push(`UPDATE indicateur set id_question = 	188	WHERE id = 	25`);
    sql.push(`UPDATE indicateur set id_question = 	190	WHERE id = 	26`);
    sql.push(`UPDATE indicateur set id_question = 	184	WHERE id = 	27`);
    sql.push(`UPDATE indicateur set id_question = 	201	WHERE id = 	28`);
    sql.push(`UPDATE indicateur set id_question = 	201	WHERE id = 	29`);
    sql.push(`UPDATE indicateur set id_question = 	220	WHERE id = 	30`);
    sql.push(`UPDATE indicateur set id_question = 	241	WHERE id = 	31`);
    sql.push(`UPDATE indicateur set id_question = 	220	WHERE id = 	32`);
    sql.push(`UPDATE indicateur set id_question = 	268	WHERE id = 	33`);
    sql.push(`UPDATE indicateur set id_question = 	251	WHERE id = 	34`);
    sql.push(`UPDATE indicateur set id_question = 	283	WHERE id = 	35`);
    sql.push(`UPDATE indicateur set id_question = 	299	WHERE id = 	36`);
    sql.push(`UPDATE indicateur set id_question = 	278	WHERE id = 	37`);
    sql.push(`UPDATE indicateur set id_question = 	278	WHERE id = 	38`);
    sql.push(`UPDATE indicateur set id_question = 	278	WHERE id = 	39`);
    sql.push(`UPDATE indicateur set id_question = 	325	WHERE id = 	40`);
    sql.push(`UPDATE indicateur set id_question = 	319	WHERE id = 	41`);
    sql.push(`UPDATE indicateur set id_question = 	313	WHERE id = 	42`);
    sql.push(`UPDATE indicateur set id_question = 	320	WHERE id = 	43`);
    sql.push(`UPDATE indicateur set id_question = 	321	WHERE id = 	44`);
    sql.push(`UPDATE indicateur set id_question = 	328	WHERE id = 	45`);
    sql.push(`UPDATE indicateur set id_question = 	330	WHERE id = 	46`);
    sql.push(`UPDATE indicateur set id_question = 	331	WHERE id = 	47`);
    sql.push(`UPDATE indicateur set id_question = 	341	WHERE id = 	48`);
    sql.push(`UPDATE indicateur set id_question = 	350	WHERE id = 	49`);
    sql.push(`UPDATE indicateur set id_question = 	356	WHERE id = 	50`);
    sql.push(`UPDATE indicateur set id_question = 	349	WHERE id = 	51`);
    sql.push(`UPDATE indicateur set id_question = 	365	WHERE id = 	52`);
    sql.push(`UPDATE indicateur set id_question = 	356	WHERE id = 	53`);
    sql.push(`UPDATE indicateur set id_question = 	385	WHERE id = 	54`);
    sql.push(`UPDATE indicateur set id_question = 	401	WHERE id = 	55`);
    sql.push(`UPDATE indicateur set id_question = 	418	WHERE id = 	56`);
    sql.push(`UPDATE indicateur set id_question = 	441	WHERE id = 	57`);
    sql.push(`UPDATE indicateur set id_question = 	442	WHERE id = 	58`);
    sql.push(`UPDATE indicateur set id_question = 	450	WHERE id = 	59`);
    sql.push(`UPDATE indicateur set id_question = 	450	WHERE id = 	60`);
    sql.push(`UPDATE indicateur set id_question = 	450	WHERE id = 	61`);
    sql.push(`UPDATE indicateur set id_question = 	462	WHERE id = 	62`);
    sql.push(`UPDATE indicateur set id_question = 	450	WHERE id = 	63`);
    sql.push(`UPDATE indicateur set id_question = 	450	WHERE id = 	64`);
    sql.push(`UPDATE indicateur set id_question = 	487	WHERE id = 	65`);
    sql.push(`UPDATE indicateur set id_question = 	478	WHERE id = 	66`);
    sql.push(`UPDATE indicateur set id_question = 	521	WHERE id = 	67`);
    sql.push(`UPDATE indicateur set id_question = 	481	WHERE id = 	68`);
    sql.push(`UPDATE indicateur set id_question = 	532	WHERE id = 	69`);
    sql.push(`UPDATE indicateur set id_question = 	532	WHERE id = 	70`);
    sql.push(`UPDATE indicateur set id_question = 	532	WHERE id = 	71`);
    sql.push(`UPDATE indicateur set id_question = 	532	WHERE id = 	72`);
    sql.push(`UPDATE indicateur set id_question = 	550	WHERE id = 	73`);
    sql.push(`UPDATE indicateur set id_question = 	564	WHERE id = 	74`);
    sql.push(`UPDATE indicateur set id_question = 	564	WHERE id = 	75`);
    sql.push(`UPDATE indicateur set id_question = 	583	WHERE id = 	76`);
    sql.push(`UPDATE indicateur set id_question = 	586	WHERE id = 	77`);
    sql.push(`UPDATE indicateur set id_question = 	582	WHERE id = 	78`);
    sql.push(`UPDATE indicateur set id_question = 	582	WHERE id = 	79`);
    sql.push(`UPDATE indicateur set id_question = 	599	WHERE id = 	80`);
    sql.push(`UPDATE indicateur set id_question = 	582	WHERE id = 	81`);
    sql.push(`UPDATE indicateur set id_question = 	582	WHERE id = 	82`);
    sql.push(`UPDATE indicateur set id_question = 	638	WHERE id = 	83`);
    sql.push(`UPDATE indicateur set id_question = 	640	WHERE id = 	84`);
    sql.push(`UPDATE indicateur set id_question = 	652	WHERE id = 	85`);
    sql.push(`UPDATE indicateur set id_question = 	670	WHERE id = 	86`);
    sql.push(`UPDATE indicateur set id_question = 	676	WHERE id = 	87`);
    sql.push(`UPDATE indicateur set id_question = 	688	WHERE id = 	88`);
    sql.push(`UPDATE indicateur set id_question = 	688	WHERE id = 	89`);

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
