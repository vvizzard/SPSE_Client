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
    sql.push(`INSERT INTO "category" ("id","label","rank") VALUES (1,'cantonnement',1),
            (2,'RPSE',1),
            (3,'DREDD',2),
            (4,'DPSE',3)`);

    sql.push(`INSERT INTO "region" ("id","label","comment","province_id") VALUES (1,'Boeny',NULL,4),
        (2,'Analamanga',NULL,1)`);

    sql.push(`INSERT INTO "district" ("id","label","comment","region_id") VALUES (1,'Andranofasika',NULL,1),
        (2,'Andramasina',NULL,2),
        (3,'Marosakoa',NULL,1),
        (4,'Anjozorobe',NULL,2)`);

    sql.push(`INSERT INTO "user" ("id","nom","email","tel","pw","category_id","validate","district_id") VALUES (1,'RAZAFINDRAKOTO Franck','frazafindrakoto@gmail.com','0344578935','test',1,0,1),
        (2,'RABETRANO Princia','prabetrano@gmail.com','0342598744','test',4,1,2),
        (3,'RABEZANDRY Marcelle','mrabezandry@gmail.com','0345485246','test',2,0,3),
        (4,'RAKOTONANDRASANA Harilala','hrakotonandrasana@gmail.com','0341255548','test',3,0,4),
        (5,'RAZAFINJOELINA Tahiana','trazafinjoelina@gmail.com','0345123698','test',3,1,NULL),
        (6,'admin','admin','admin','admin',4,1,1)`);

    sql.push(`INSERT INTO "thematique" ("id","label","comment") VALUES 
        (1,'Actes administratifs', 'Cantonnement'),
        (2,'Aires prot??g??es (AP)','Cantonnement'),
        (3,'Biodiversit??','Cantonnement'),
        (4,'Cadre national et international (juridique, politique, strat??gique)','Centrale'),
        (5,'Changement Climatique et REDD+','Cantonnement'),
        (31, 'Changement Climatique et REDD+ (centrale)', 'Centrale'),
        (6,'Contr??les environnementaux','Cantonnement'),
        (7, 'Contr??les for??stiers', 'Cantonnement'),
        (8,'Partenariat','Centrale'),
        (9,'Economie verte','Cantonnement'),
        (10,'Environnement (pollution, ??valuation environnementale, gouvernance)','Centrale'),
        (11,'Feux??','Cantonnement'),
        (12,'Finances','Centrale'),
        (13,'Informations g??n??rales','Centrale'),
        (14,'Informations, education, communication (IEC)','Tous'),
        (15,'Logistique (Infrastructure)','Tous'),
        (16, 'Logistique (Mat??riel roulant)', 'Tous'),
        (17, 'Logistique (Mat??riel informatique)', 'Tous'),
        (18, 'Logistique (Mat??riel mobilier)', 'Tous'),
        (19,'Outils (guide, manuel)','Centrale'),
        (20,'Planification, programmation, suivi-evaluation','Centrale'),
        (21,'Reboisement','Cantonnement'),
        (22,'Recherche et d??veloppement','Centrale'),
        (23,'Responsabilit?? Soci??tale des Entreprises (RSE : reboisements, ??ducation environnementale, ...)','Centrale'),
        (24,'Ressources humaines','Tous'),
        (25,'Transfert de gestion','Centrale'),
        (26,'Transition ??cologique et r??silience (D??sertification et d??gradation des terres)','Cantonnement'),
        (27,'Developpement durable (economie, sociale, environnement, culture)','Centrale'),
        (28,'Paiement des services environnementaux (PSE)','Centrale'),
        (29,'Corruption','Tous')`);

    sql.push(`INSERT INTO "indicateur" ("id","label","comment","thematique_id") VALUES 
        (1,"Quantit?? de Charbon de bois declar??", "", 1),
        (2,"Quantit?? de Bois de chauffe  declar??", "", 1),
        (3,"Quantit?? de Bois COS declar??", "", 1),
        (4,"Quantit?? de Anacarde declar??", "", 1),
        (5,"Quantit?? de Baie rose declar??", "", 1),
        (6,"Quantit?? de Miel  declar??", "", 1),
        (7,"Quantit?? de Moringa declar??", "", 1),
        (8,"Quantit?? de Charbon de bois ??coul??", "", 1),
        (9,"Quantit?? de Bois de chauffe  ??coul??", "", 1),
        (10,"Quantit?? de Bois COS ??coul??", "", 1),
        (11,"Quantit?? de Anacarde ??coul??", "", 1),
        (12,"Quantit?? de Baie rose ??coul??", "", 1),
        (13,"Quantit?? de Miel  ??coul??", "", 1),
        (14,"Quantit?? de Moringa ??coul??", "", 1),
        (15,"Superficie des Aires prot??g??es terrestres", "", 2),
        (16,"Superficie des Aires prot??g??es marines", "", 2),
        (17,"Taux AP ayant un gestionnaire", "", 2),
        (18,"Efficacit?? de gestion ", "", 2),
        (19,"Nombre de m??nages b??n??ficiant des activit??s de conservations/d??veloppement (AGR)", "", 2),
        (20,"Taux de r??alisation des activit??s dans le PAG", "", 2),
        (21,"Taux des aires prot??g??es marines et des zones humides", "", 2),
        (22,"Esp??ces objet de trafic illicite", "", 3),
        (23,"Nombre de textes", "", 4),
        (24,"Nombre de conventions ratifi??es", "", 4),
        (25,"Textes adopt??s", "", 4),
        (26,"Nombre de b??n??ficiaires d'action de lutte contre le changement climatique", "", 5),
        (27,"Puit de carbone g??r?? durablement", "", 5),
        (28,"Nombre de contr??les effectu??s", "", 6),
        (29,"Nombre d'infractions constat??es", "", 6),
        (30,"Nombre de dossiers trait??s", "", 6),
        (31,"Taux de dossiers trait??s", "", 6),
        (32,"Rapport entre plaintes re??ues et trait??es dans le secteur de l'agriculture", "", 6),
        (33,"Rapport entre plaintes re??ues et trait??es dans le secteur industriel", "", 6),
        (34,"Rapport entre plaintes re??ues et trait??es dans le secteur de service", "", 6),
        (35,"Taux de diminution de nombre d'infractions constat??es", "", 6),
        (36,"Nombre d'infractions d??f??r??es", "", 6),
        (37,"Nombre de cas de transaction avant jugement", "", 6),
        (38,"Quantit?? de produits saisis", "", 6),
        (39,"Nombre de conventions de partenariat d??velopp??es et sign??es", "", 7),
        (40,"Taux de projets issus des partenariats", "", 7),
        (41,"Nombre de cha??nes de valeurs vertes promues", "", 8),
        (42,"Nombre de certifications vertes promues par cha??ne de valeurs li??es aux ressources naturelles", "", 8),
        (43,"Nombre d'emplois verts d??cents cr????s", "", 8),
        (44,"Nombre d'alternative ??cologique promue", "", 8),
        (45,"Nombre de mise en conformit??, permis et/ou autorisation environnementale (PREE), permis environnementaux d??livr??s", "", 9),
        (46,"Nombre d'infrastructures de gestion de d??chets cr????es", "", 9),
        (47,"Surfaces br??l??es", "", 10),
        (48,"Longueur totale de pare-feu", "", 10),
        (49,"Nombre de structures op??rationnelles de gestion des feux", "", 10),
        (50,"Taux de r??duction de superficie br??l??e", "", 10),
        (51,"Recettes per??ues", "", 11),
        (52,"Taux d'engagement total", "", 11),
        (53,"Taux de d??caissement", "", 11),
        (54,"Montant mobilis?? pour le secteur environnement", "", 11),
        (55,"Augmentation du budget allou?? au secteur environnement", "", 11),
        (56,"Taux d'engagement du fond public", "", 11),
        (57,"Financement allou?? par le secteur priv??", "", 11),
        (58,"Taux d'engagement moyen des fonds ext??rieurs", "", 11),
        (59,"Nombre de Districts", "", 12),
        (60,"Nombre de communes", "", 12),
        (61,"Nombre de population", "", 12),
        (62,"Nombre d'IEC effectu??es", "", 13),
        (63,"Ratio formation sur environnement et DD", "", 13),
        (64,"Nombre de participants form??s en Actes administratifs", "", 13),
        (65,"Nombre de participants form??s en Aires prot??g??es (AP)", "", 13),
        (66,"Nombre de participants form??s en Biodiversit??", "", 13),
        (67,"Nombre de participants form??s en Cadre national et international (juridique, politique, strat??gique)", "", 13),
        (68,"Nombre de participants form??s en Changement Climatique et REDD+", "", 13),
        (69,"Nombre de participants form??s en Contr??les environnementaux et forestiers", "", 13),
        (70,"Nombre de participants form??s en Partenariat", "", 13),
        (71,"Nombre de participants form??s en Economie verte", "", 13),
        (72,"Nombre de participants form??s en Environnement (pollution, ??valuation environnementale, gouvernance)", "", 13),
        (73,"Nombre de participants form??s en Feux??", "", 13),
        (74,"Nombre de participants form??s en Finances", "", 13),
        (75,"Nombre de participants form??s en Informations g??n??rales", "", 13),
        (76,"Nombre de participants form??s en Logistique", "", 13),
        (77,"Nombre de participants form??s en Outils (guide, manuel)", "", 13),
        (78,"Nombre de participants form??s en Planification, programmation, suivi-evaluation", "", 13),
        (79,"Nombre de participants form??s en Reboisement", "", 13),
        (80,"Nombre de participants form??s en Recherche et d??veloppement", "", 13),
        (81,"Nombre de participants form??s en Responsabilit?? Soci??tale des Entreprises (RSE : reboisements, ??ducation environnementale, ...)", "", 13),
        (82,"Nombre de participants form??s en Ressources humaines", "", 13),
        (83,"Nombre de participants form??s en Transfert de gestion", "", 13),
        (84,"Nombre de participants form??s en Transition ??cologique et r??silience (D??sertification et d??gradation des terres)", "", 13),
        (85,"Nombre de participants form??s en Developpement durable (economie, sociale, environnement, culture)", "", 13),
        (86,"Nombre de participants form??s en Paiement des services environnementaux (PSE)", "", 13),
        (87,"Nombre de participants form??s en Corruption", "", 13),
        (88,"Nombre de syst??me d'information pour Actes administratifs", "", 13),
        (89,"Nombre de syst??me d'information pour Aires prot??g??es (AP)", "", 13),
        (90,"Nombre de syst??me d'information pour Biodiversit??", "", 13),
        (91,"Nombre de syst??me d'information pour Cadre national et international (juridique, politique, strat??gique)", "", 13),
        (92,"Nombre de syst??me d'information pour Changement Climatique et REDD+", "", 13),
        (93,"Nombre de syst??me d'information pour Contr??les environnementaux et forestiers", "", 13),
        (94,"Nombre de syst??me d'information pour Partenariat", "", 13),
        (95,"Nombre de syst??me d'information pour Economie verte", "", 13),
        (96,"Nombre de syst??me d'information pour Environnement (pollution, ??valuation environnementale, gouvernance)", "", 13),
        (97,"Nombre de syst??me d'information pour Feux??", "", 13),
        (98,"Nombre de syst??me d'information pour Finances", "", 13),
        (99,"Nombre de syst??me d'information pour Informations g??n??rales", "", 13),
        (100,"Nombre de syst??me d'information pour Logistique", "", 13),
        (101,"Nombre de syst??me d'information pour Outils (guide, manuel)", "", 13),
        (102,"Nombre de syst??me d'information pour Planification, programmation, suivi-evaluation", "", 13),
        (103,"Nombre de syst??me d'information pour Reboisement", "", 13),
        (104,"Nombre de syst??me d'information pour Recherche et d??veloppement", "", 13),
        (105,"Nombre de syst??me d'information pour Responsabilit?? Soci??tale des Entreprises (RSE : reboisements, ??ducation environnementale, ...)", "", 13),
        (106,"Nombre de syst??me d'information pour Ressources humaines", "", 13),
        (107,"Nombre de syst??me d'information pour Transfert de gestion", "", 13),
        (108,"Nombre de syst??me d'information pour Transition ??cologique et r??silience (D??sertification et d??gradation des terres)", "", 13),
        (109,"Nombre de syst??me d'information pour Developpement durable (economie, sociale, environnement, culture)", "", 13),
        (110,"Nombre de syst??me d'information pour Paiement des services environnementaux (PSE)", "", 13),
        (111,"Nombre de syst??me d'information pour Corruption", "", 13),
        (112,"Taux d'adoption de l'IEC (%)", "", 13),
        (113,"Nombre d'infrastructures fonctionnelles", "", 14),
        (114,"Nombre de mat??riels roulants fonctionnels", "", 14),
        (115,"Nombre de mat??riels informatiques fonctionnels", "", 14),
        (116,"Nombre de mat??riels mobiliers", "", 14),
        (117,"Nombre de contribution infrastructure au niveau CTD comptabilis??e", "", 14),
        (118,"Taux de recouvrement national des infrastructures des STD construites ou r??habilit??es (%)", "", 14),
        (119,"Nombre de mat??riels informatiques ?? condamner", "", 14),
        (120,"Nombre de guides appliqu??s pour Actes administratifs", "", 15),
        (121,"Nombre de guides appliqu??s pour Aires prot??g??es (AP)", "", 15),
        (122,"Nombre de guides appliqu??s pour Biodiversit??", "", 15),
        (123,"Nombre de guides appliqu??s pour Cadre national et international (juridique, politique, strat??gique)", "", 15),
        (124,"Nombre de guides appliqu??s pour Changement Climatique et REDD+", "", 15),
        (125,"Nombre de guides appliqu??s pour Contr??les environnementaux et forestiers", "", 15),
        (126,"Nombre de guides appliqu??s pour Partenariat", "", 15),
        (127,"Nombre de guides appliqu??s pour Economie verte", "", 15),
        (128,"Nombre de guides appliqu??s pour Environnement (pollution, ??valuation environnementale, gouvernance)", "", 15),
        (129,"Nombre de guides appliqu??s pour Feux??", "", 15),
        (130,"Nombre de guides appliqu??s pour Finances", "", 15),
        (131,"Nombre de guides appliqu??s pour Informations g??n??rales", "", 15),
        (132,"Nombre de guides appliqu??s pour Logistique", "", 15),
        (133,"Nombre de guides appliqu??s pour Outils (guide, manuel)", "", 15),
        (134,"Nombre de guides appliqu??s pour Planification, programmation, suivi-evaluation", "", 15),
        (135,"Nombre de guides appliqu??s pour Reboisement", "", 15),
        (136,"Nombre de guides appliqu??s pour Recherche et d??veloppement", "", 15),
        (137,"Nombre de guides appliqu??s pour Responsabilit?? Soci??tale des Entreprises (RSE : reboisements, ??ducation environnementale, ...)", "", 15),
        (138,"Nombre de guides appliqu??s pour Ressources humaines", "", 15),
        (139,"Nombre de guides appliqu??s pour Transfert de gestion", "", 15),
        (140,"Nombre de guides appliqu??s pour Transition ??cologique et r??silience (D??sertification et d??gradation des terres)", "", 15),
        (141,"Nombre de guides appliqu??s pour Developpement durable (economie, sociale, environnement, culture)", "", 15),
        (142,"Nombre de guides appliqu??s pour Paiement des services environnementaux (PSE)", "", 15),
        (143,"Nombre de guides appliqu??s pour Corruption", "", 15),
        (144,"Nombre d'outils disponibles et utilis??s pour Actes administratifs", "", 15),
        (145,"Nombre d'outils disponibles et utilis??s pour Aires prot??g??es (AP)", "", 15),
        (146,"Nombre d'outils disponibles et utilis??s pour Biodiversit??", "", 15),
        (147,"Nombre d'outils disponibles et utilis??s pour Cadre national et international (juridique, politique, strat??gique)", "", 15),
        (148,"Nombre d'outils disponibles et utilis??s pour Changement Climatique et REDD+", "", 15),
        (149,"Nombre d'outils disponibles et utilis??s pour Contr??les environnementaux et forestiers", "", 15),
        (150,"Nombre d'outils disponibles et utilis??s pour Partenariat", "", 15),
        (151,"Nombre d'outils disponibles et utilis??s pour Economie verte", "", 15),
        (152,"Nombre d'outils disponibles et utilis??s pour Environnement (pollution, ??valuation environnementale, gouvernance)", "", 15),
        (153,"Nombre d'outils disponibles et utilis??s pour Feux??", "", 15),
        (154,"Nombre d'outils disponibles et utilis??s pour Finances", "", 15),
        (155,"Nombre d'outils disponibles et utilis??s pour Informations g??n??rales", "", 15),
        (156,"Nombre d'outils disponibles et utilis??s pour Logistique", "", 15),
        (157,"Nombre d'outils disponibles et utilis??s pour Outils (guide, manuel)", "", 15),
        (158,"Nombre d'outils disponibles et utilis??s pour Planification, programmation, suivi-evaluation", "", 15),
        (159,"Nombre d'outils disponibles et utilis??s pour Reboisement", "", 15),
        (160,"Nombre d'outils disponibles et utilis??s pour Recherche et d??veloppement", "", 15),
        (161,"Nombre d'outils disponibles et utilis??s pour Responsabilit?? Soci??tale des Entreprises (RSE : reboisements, ??ducation environnementale, ...)", "", 15),
        (162,"Nombre d'outils disponibles et utilis??s pour Ressources humaines", "", 15),
        (163,"Nombre d'outils disponibles et utilis??s pour Transfert de gestion", "", 15),
        (164,"Nombre d'outils disponibles et utilis??s pour Transition ??cologique et r??silience (D??sertification et d??gradation des terres)", "", 15),
        (165,"Nombre d'outils disponibles et utilis??s pour Developpement durable (economie, sociale, environnement, culture)", "", 15),
        (166,"Nombre d'outils disponibles et utilis??s pour Paiement des services environnementaux (PSE)", "", 15),
        (167,"Nombre d'outils disponibles et utilis??s pour Corruption", "", 15),
        (168,"Nombre de programmes/projets qui ont fait l'objet de planification", "", 16),
        (169,"Nombre de programmes/projets qui ont fait l'objet de suivi", "", 16),
        (170,"Nombre de programmes/projets qui ont fait l'objet d'??valuation", "", 16),
        (171,"Superficie rebois??e totale", "", 17),
        (172,"Superficie de mangroves restaur??es", "", 17),
        (173,"Nombre de plants produits", "", 17),
        (174,"Taux de r??sultats de recherches appliqu??s", "", 18),
        (175,"Nombre de projets d??velopp??s dans le cadre de RSE", "", 19),
        (176,"Nombre de personnel en fonction", "", 20),
        (177,"Ratio entre personnel administratif et technique", "", 20)`);

    sql.push(`INSERT INTO "province" ("id","label","comment") VALUES (1,'Antananarivo','8864904553756276688'),
        (2,'Antsiranana','-8711031052795110745'),
        (3,'Toamasina','2810143387255338619'),
        (4,'Mahajanga','-949041082025301867'),
        (5,'Fianarantsoa','7270744785182717817'),
        (6,'Antsiranana','-6562433572110832805'),
        (7,'Toliara','-4460846208442074585')`);

    sql.push(`INSERT INTO "reponse" ("id","question_id","user_id","date","link_gps","link_photo","reponse","comment") VALUES (1,1,1,'21-12-2020',NULL,NULL,250.0,NULL),
        (2,2,1,'21-12-2020',NULL,NULL,12.0,NULL),
        (3,3,1,'21-12-2020',NULL,NULL,100.0,NULL),
        (4,4,1,'21-12-2021',NULL,NULL,25.0,NULL),
        (5,1,1,'21-12-2019',NULL,NULL,250.0,NULL),
        (6,2,1,'21-12-2019',NULL,NULL,10.0,NULL),
        (7,3,1,'21-12-2019',NULL,NULL,600.0,NULL),
        (8,4,1,'21-12-2019',NULL,NULL,75.0,NULL),
        (9,1,2,'21-12-2020',NULL,NULL,100.0,NULL),
        (10,2,2,'21-12-2020',NULL,NULL,100.0,NULL),
        (11,3,2,'21-12-2020',NULL,NULL,100.0,NULL),
        (12,4,2,'21-12-2020',NULL,NULL,100.0,NULL),
        (13,1,2,'21-12-2019',NULL,NULL,250.0,NULL),
        (14,2,2,'21-12-2019',NULL,NULL,10.0,NULL),
        (15,3,2,'21-12-2019',NULL,NULL,600.0,NULL),
        (16,4,2,'21-12-2019',NULL,NULL,75.0,NULL),
        (17,1,3,'21-12-2020',NULL,NULL,100.0,NULL),
        (18,2,3,'21-12-2020',NULL,NULL,100.0,NULL),
        (19,3,3,'21-12-2020',NULL,NULL,100.0,NULL),
        (20,4,3,'21-12-2020',NULL,NULL,100.0,NULL),
        (21,1,3,'21-12-2019',NULL,NULL,250.0,NULL),
        (22,2,3,'21-12-2019',NULL,NULL,10.0,NULL),
        (23,3,3,'21-12-2019',NULL,NULL,600.0,NULL),
        (24,4,3,'21-12-2019',NULL,NULL,75.0,NULL),
        (25,1,4,'21-12-2020',NULL,NULL,100.0,NULL),
        (26,2,4,'21-12-2020',NULL,NULL,100.0,NULL),
        (27,3,4,'21-12-2020',NULL,NULL,100.0,NULL),
        (28,4,4,'21-12-2020',NULL,NULL,100.0,NULL),
        (29,1,4,'21-12-2019',NULL,NULL,250.0,NULL),
        (30,2,4,'21-12-2019',NULL,NULL,10.0,NULL),
        (31,3,4,'21-12-2019',NULL,NULL,600.0,NULL),
        (32,4,4,'21-12-2019',NULL,NULL,75.0,NULL)`);

    sql.push(`INSERT INTO "question" 
        ("id","question","is_principale","field_type","level","obligatoire","indicateur_id","objectif","label","unite", "question_mere_id") VALUES 
        (1,'Quelle est la superficie totale rebois??e?',1,1,3,1,1,NULL,'Surface totale rebois??e','ha', NULL),
        (2,'Quel est le nombre total d esp??ce otoctone rebois??e',1,1,3,1,2,NULL,'Nombre d esp??ce otoctone rebois??e','Unit??', NULL),
        (3,'Quelle est la superficie totale br??l??e?',1,1,3,1,3,NULL,'Surface br??l??e','ha', NULL),
        
        (4,'Superficie de TG nouvellement cr????',1,1,3,1,74,NULL,'Superficie de TG nouvellement cr????','ha', null),
        (5,'Superficie de TG renouvel??',1,1,3,1,75,NULL,'Superficie de TG renouvel??','ha', null),
        (6,'Nombre de contrats de TG ??valu??s',1,1,3,1,76,NULL,'Nombre de contrats de TG ??valu??s','ha', null),
        (7,'Superficie (autres transversales)',1,1,3,1,77,NULL,'Superficie (autres transversales)','ha', null),
        (8,'Nombre de b??n??ficiaires de TG (semestre, annuel)',1,1,3,1,78,NULL,'Nombre de b??n??ficiaires de TG (semestre, annuel)','ha', null),
        (9,'TG suivi',1,1,3,1,79,NULL,'TG suivi','ha', null),
        (10,'Nombre de COBA form??es',1,1,3,1,80,NULL,'Nombre de COBA form??es','ha', null),
        (11,'Association soutenue (%) : appuy??e/total',1,1,3,1,81,NULL,'Association soutenue (%) : appuy??e/total','ha', null),
        
        (12,'Intitul?? du contrat de transfert de gestion',1,1,3,1,NULL,NULL,'Intitul?? du contrat de transfert de gestion',null, 11),
        (13,'Nom du site',0,1,3,1,NULL,NULL,'Nom du site',null, 12),
        (14,'Emplacement (R??gion, District, Commune)',0,1,3,1,NULL,NULL,'Emplacement (R??gion, District, Commune)',null, 11),
        (15,'Date de signature',0,1,3,1,NULL,NULL,'Date de signature',null, 11),
        (16,'Ressources concern??es dans le site de TG',0,1,3,1,NULL,NULL,'Ressources concern??es dans le site de TG',null, 11),
        (17,'Vocations du site de TG',0,1,3,1,NULL,NULL,'Vocations du site de TG',null, 11),
        (18,'Superficie du TG',0,1,3,1,NULL,NULL,'Superficie du TG',null, 11),
        (19,'Nouvellement cr???? (oui/non)',0,1,3,1,NULL,NULL,'Nouvellement cr???? (oui/non)',null, 11),
        (20,'Renouvel?? (oui/non)',0,1,3,1,NULL,NULL,'Renouvel?? (oui/non)',null, 11),
        (21,'Nom de COBA/VOI',0,1,3,1,NULL,NULL,'Nom de COBA/VOI',null, 11),
        (22,'Nombre des membres',0,1,3,1,NULL,NULL,'Nombre des membres',null, 11),
        (23,'Structur??e (oui/non)',0,1,3,1,NULL,NULL,'Structur??e (oui/non)',null, 11),
        (24,'Form??e (oui/non)',0,1,3,1,NULL,NULL,'Form??e (oui/non)',null, 11),
        (25,'Op??rationnelle (oui/non)',0,1,3,1,NULL,NULL,'Op??rationnelle (oui/non)',null, 11),
        (26,'Nombre de m??nages b??n??ficiaires',0,1,3,1,NULL,NULL,'Nombre de m??nages b??n??ficiaires',null, 11),
        (27,'Appuy??e (oui/non)',0,1,3,1,NULL,NULL,'Appuy??e (oui/non)',null, 11),
        (28,'Organisme d appui',0,1,3,1,NULL,NULL,'Organisme d appui',null, 11),
        (29,'Projet',0,1,3,1,NULL,NULL,'Projet',null, 11),
        (30,'Intitul?? du suivi de TG',0,1,3,1,NULL,NULL,'Intitul?? du suivi de TG',null, 11),
        (31,'Date de r??alisation',0,1,3,1,NULL,NULL,'Date de r??alisation',null, 11),
        (32,'Equipe de r??alisation',0,1,3,1,NULL,NULL,'Equipe de r??alisation',null, 11),
        (33,'Rapport de suivi (oui/non)',0,1,3,1,NULL,NULL,'Rapport de suivi (oui/non)',null, 11),
        (34,'Date d ??dition',0,1,3,1,NULL,NULL,'Date d ??dition',null, 11),
        (35,'Intitul?? de l ??valuation de TG',0,1,3,1,NULL,NULL,'Intitul?? de l ??valuation de TG',null, 11),
        (36,'Date de r??alisation',0,1,3,1,NULL,NULL,'Date de r??alisation',null, 11),
        (37,'Equipe de r??alisation',0,1,3,1,NULL,NULL,'Equipe de r??alisation',null, 11),
        (38,'Rapport d ??valuation (oui/non)',0,1,3,1,NULL,NULL,'Rapport d ??valuation (oui/non)',null, 11),
        (39,'Date d ??dition',0,1,3,1,NULL,NULL,'Date d ??dition',null, 11),

        ("41","Taux de r??sultats de recherches appliqu??s",1,1,3,1,18,NULL,"Taux de r??sultats de recherches appliqu??s",NULL, NULL),
        ("42","Sujet des recherches effectu??s",1,1,3,1,NULL,NULL,"Sujet des recherches effectu??s",NULL, "41"),
        ("43","Objectif (??tude de fili??re, ...)",0,1,3,1,NULL,NULL,"Objectif (??tude de fili??re, ...)",NULL, "41"),
        ("44","Zone d'intervention",0,1,3,1,NULL,NULL,"Zone d'intervention",NULL, "41"),
        ("45","Date de commencement",0,1,3,1,NULL,NULL,"Date de commencement",NULL, "41"),
        ("46","Date de fin",0,1,3,1,NULL,NULL,"Date de fin",NULL, "41"),
        ("47","Chercheurs (liste)",0,1,3,1,NULL,NULL,"Chercheurs (liste)",NULL, "41"),
        ("48","Institution des chercheurs",0,1,3,1,NULL,NULL,"Institution des chercheurs",NULL, "41"),
        ("49","Date d'??dition du rapport de recherche",0,1,3,1,NULL,NULL,"Date d'??dition du rapport de recherche",NULL, "41"),
        ("50","R??sultats de la recherche",0,1,3,1,NULL,NULL,"R??sultats de la recherche",NULL, "41"),
        ("51","R??sultats appliqu??s (r??ussi/non)",0,1,3,1,NULL,NULL,"R??sultats appliqu??s (r??ussi/non)",NULL, "41"),
        ("52","Source de financement",0,1,3,1,NULL,NULL,"Source de financement",NULL, "41"),
        ("53","Projet",0,1,3,1,NULL,NULL,"Projet",NULL, "41"),
        ("54","Co??ts des activit??s de recherche (Ariary)",0,1,3,1,NULL,NULL,"Co??ts des activit??s de recherche (Ariary)",NULL, "41"),

        (40,'Quelle est la longueure totale de pare-feux?',1,1,3,1,4,NULL,'Longueure totale de pare-feux','km', NULL)`);

    // // Add default values
    // sql.push('INSERT INTO "category" ("id","label","rank") VALUES (1,\'cantonnement\',1),(2,\'RPSE\',1),(3,\'DREDD\',2),(4,\'DPSE\',3)')
    // sql.push('INSERT INTO "user" ("id","nom","email","tel","pw","category_id","validate") VALUES (1,\'RAZAFINDRAKOTO Franck\',\'frazafindrakoto@gmail.com\',\'0344578935\',\'test\',1,0),(2,\'RABETRANO Princia\',\'prabetrano@gmail.com\',\'0342598744\',\'test\',4,0),(3,\'RABEZANDRY Marcelle\',\'mrabezandry@gmail.com\',\'0345485246\',\'test\',2,0),(4,\'RAKOTONANDRASANA Harilala\',\'hrakotonandrasana@gmail.com\',\'0341255548\',\'test\',3,1),(5,\'RAZAFINJOELINA Tahiana\',\'trazafinjoelina@gmail.com\',\'0345123698\',\'test\',3,1)')
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
          log.info("database:");
          log.info(sql);
          log.info(params);
          log.info(rows);

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
    let database = this.getDatabase();
    const resp = database.exec(sql);
    database.close;
    return resp;
  }
}

module.exports = BaseDao;
