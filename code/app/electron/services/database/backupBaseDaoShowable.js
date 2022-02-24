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
        (2,'Aires protégées (AP)','Cantonnement'),
        (3,'Biodiversité','Cantonnement'),
        (4,'Cadre national et international (juridique, politique, stratégique)','Centrale'),
        (5,'Changement Climatique et REDD+','Cantonnement'),
        (31, 'Changement Climatique et REDD+ (centrale)', 'Centrale'),
        (6,'Contrôles environnementaux','Cantonnement'),
        (7, 'Contrôles forêstiers', 'Cantonnement'),
        (8,'Partenariat','Centrale'),
        (9,'Economie verte','Cantonnement'),
        (10,'Environnement (pollution, évaluation environnementale, gouvernance)','Centrale'),
        (11,'Feux ','Cantonnement'),
        (12,'Finances','Centrale'),
        (13,'Informations générales','Centrale'),
        (14,'Informations, education, communication (IEC)','Tous'),
        (15,'Logistique (Infrastructure)','Tous'),
        (16, 'Logistique (Matériel roulant)', 'Tous'),
        (17, 'Logistique (Matériel informatique)', 'Tous'),
        (18, 'Logistique (Matériel mobilier)', 'Tous'),
        (19,'Outils (guide, manuel)','Centrale'),
        (20,'Planification, programmation, suivi-evaluation','Centrale'),
        (21,'Reboisement','Cantonnement'),
        (22,'Recherche et développement','Centrale'),
        (23,'Responsabilité Sociétale des Entreprises (RSE : reboisements, éducation environnementale, ...)','Centrale'),
        (24,'Ressources humaines','Tous'),
        (25,'Transfert de gestion','Centrale'),
        (26,'Transition écologique et résilience (Désertification et dégradation des terres)','Cantonnement'),
        (27,'Developpement durable (economie, sociale, environnement, culture)','Centrale'),
        (28,'Paiement des services environnementaux (PSE)','Centrale'),
        (29,'Corruption','Tous')`);

    sql.push(`INSERT INTO "indicateur" ("id","label","comment","thematique_id") VALUES 
        (1,"Quantité de Charbon de bois declaré", "", 1),
        (2,"Quantité de Bois de chauffe  declaré", "", 1),
        (3,"Quantité de Bois COS declaré", "", 1),
        (4,"Quantité de Anacarde declaré", "", 1),
        (5,"Quantité de Baie rose declaré", "", 1),
        (6,"Quantité de Miel  declaré", "", 1),
        (7,"Quantité de Moringa declaré", "", 1),
        (8,"Quantité de Charbon de bois écoulé", "", 1),
        (9,"Quantité de Bois de chauffe  écoulé", "", 1),
        (10,"Quantité de Bois COS écoulé", "", 1),
        (11,"Quantité de Anacarde écoulé", "", 1),
        (12,"Quantité de Baie rose écoulé", "", 1),
        (13,"Quantité de Miel  écoulé", "", 1),
        (14,"Quantité de Moringa écoulé", "", 1),
        (15,"Superficie des Aires protégées terrestres", "", 2),
        (16,"Superficie des Aires protégées marines", "", 2),
        (17,"Taux AP ayant un gestionnaire", "", 2),
        (18,"Efficacité de gestion ", "", 2),
        (19,"Nombre de ménages bénéficiant des activités de conservations/développement (AGR)", "", 2),
        (20,"Taux de réalisation des activités dans le PAG", "", 2),
        (21,"Taux des aires protégées marines et des zones humides", "", 2),
        (22,"Espèces objet de trafic illicite", "", 3),
        (23,"Nombre de textes", "", 4),
        (24,"Nombre de conventions ratifiées", "", 4),
        (25,"Textes adoptés", "", 4),
        (26,"Nombre de bénéficiaires d'action de lutte contre le changement climatique", "", 5),
        (27,"Puit de carbone géré durablement", "", 5),
        (28,"Nombre de contrôles effectués", "", 6),
        (29,"Nombre d'infractions constatées", "", 6),
        (30,"Nombre de dossiers traités", "", 6),
        (31,"Taux de dossiers traités", "", 6),
        (32,"Rapport entre plaintes reçues et traitées dans le secteur de l'agriculture", "", 6),
        (33,"Rapport entre plaintes reçues et traitées dans le secteur industriel", "", 6),
        (34,"Rapport entre plaintes reçues et traitées dans le secteur de service", "", 6),
        (35,"Taux de diminution de nombre d'infractions constatées", "", 6),
        (36,"Nombre d'infractions déférées", "", 6),
        (37,"Nombre de cas de transaction avant jugement", "", 6),
        (38,"Quantité de produits saisis", "", 6),
        (39,"Nombre de conventions de partenariat développées et signées", "", 7),
        (40,"Taux de projets issus des partenariats", "", 7),
        (41,"Nombre de chaînes de valeurs vertes promues", "", 8),
        (42,"Nombre de certifications vertes promues par chaîne de valeurs liées aux ressources naturelles", "", 8),
        (43,"Nombre d'emplois verts décents créés", "", 8),
        (44,"Nombre d'alternative écologique promue", "", 8),
        (45,"Nombre de mise en conformité, permis et/ou autorisation environnementale (PREE), permis environnementaux délivrés", "", 9),
        (46,"Nombre d'infrastructures de gestion de déchets créées", "", 9),
        (47,"Surfaces brûlées", "", 10),
        (48,"Longueur totale de pare-feu", "", 10),
        (49,"Nombre de structures opérationnelles de gestion des feux", "", 10),
        (50,"Taux de réduction de superficie brûlée", "", 10),
        (51,"Recettes perçues", "", 11),
        (52,"Taux d'engagement total", "", 11),
        (53,"Taux de décaissement", "", 11),
        (54,"Montant mobilisé pour le secteur environnement", "", 11),
        (55,"Augmentation du budget alloué au secteur environnement", "", 11),
        (56,"Taux d'engagement du fond public", "", 11),
        (57,"Financement alloué par le secteur privé", "", 11),
        (58,"Taux d'engagement moyen des fonds extérieurs", "", 11),
        (59,"Nombre de Districts", "", 12),
        (60,"Nombre de communes", "", 12),
        (61,"Nombre de population", "", 12),
        (62,"Nombre d'IEC effectuées", "", 13),
        (63,"Ratio formation sur environnement et DD", "", 13),
        (64,"Nombre de participants formés en Actes administratifs", "", 13),
        (65,"Nombre de participants formés en Aires protégées (AP)", "", 13),
        (66,"Nombre de participants formés en Biodiversité", "", 13),
        (67,"Nombre de participants formés en Cadre national et international (juridique, politique, stratégique)", "", 13),
        (68,"Nombre de participants formés en Changement Climatique et REDD+", "", 13),
        (69,"Nombre de participants formés en Contrôles environnementaux et forestiers", "", 13),
        (70,"Nombre de participants formés en Partenariat", "", 13),
        (71,"Nombre de participants formés en Economie verte", "", 13),
        (72,"Nombre de participants formés en Environnement (pollution, évaluation environnementale, gouvernance)", "", 13),
        (73,"Nombre de participants formés en Feux ", "", 13),
        (74,"Nombre de participants formés en Finances", "", 13),
        (75,"Nombre de participants formés en Informations générales", "", 13),
        (76,"Nombre de participants formés en Logistique", "", 13),
        (77,"Nombre de participants formés en Outils (guide, manuel)", "", 13),
        (78,"Nombre de participants formés en Planification, programmation, suivi-evaluation", "", 13),
        (79,"Nombre de participants formés en Reboisement", "", 13),
        (80,"Nombre de participants formés en Recherche et développement", "", 13),
        (81,"Nombre de participants formés en Responsabilité Sociétale des Entreprises (RSE : reboisements, éducation environnementale, ...)", "", 13),
        (82,"Nombre de participants formés en Ressources humaines", "", 13),
        (83,"Nombre de participants formés en Transfert de gestion", "", 13),
        (84,"Nombre de participants formés en Transition écologique et résilience (Désertification et dégradation des terres)", "", 13),
        (85,"Nombre de participants formés en Developpement durable (economie, sociale, environnement, culture)", "", 13),
        (86,"Nombre de participants formés en Paiement des services environnementaux (PSE)", "", 13),
        (87,"Nombre de participants formés en Corruption", "", 13),
        (88,"Nombre de système d'information pour Actes administratifs", "", 13),
        (89,"Nombre de système d'information pour Aires protégées (AP)", "", 13),
        (90,"Nombre de système d'information pour Biodiversité", "", 13),
        (91,"Nombre de système d'information pour Cadre national et international (juridique, politique, stratégique)", "", 13),
        (92,"Nombre de système d'information pour Changement Climatique et REDD+", "", 13),
        (93,"Nombre de système d'information pour Contrôles environnementaux et forestiers", "", 13),
        (94,"Nombre de système d'information pour Partenariat", "", 13),
        (95,"Nombre de système d'information pour Economie verte", "", 13),
        (96,"Nombre de système d'information pour Environnement (pollution, évaluation environnementale, gouvernance)", "", 13),
        (97,"Nombre de système d'information pour Feux ", "", 13),
        (98,"Nombre de système d'information pour Finances", "", 13),
        (99,"Nombre de système d'information pour Informations générales", "", 13),
        (100,"Nombre de système d'information pour Logistique", "", 13),
        (101,"Nombre de système d'information pour Outils (guide, manuel)", "", 13),
        (102,"Nombre de système d'information pour Planification, programmation, suivi-evaluation", "", 13),
        (103,"Nombre de système d'information pour Reboisement", "", 13),
        (104,"Nombre de système d'information pour Recherche et développement", "", 13),
        (105,"Nombre de système d'information pour Responsabilité Sociétale des Entreprises (RSE : reboisements, éducation environnementale, ...)", "", 13),
        (106,"Nombre de système d'information pour Ressources humaines", "", 13),
        (107,"Nombre de système d'information pour Transfert de gestion", "", 13),
        (108,"Nombre de système d'information pour Transition écologique et résilience (Désertification et dégradation des terres)", "", 13),
        (109,"Nombre de système d'information pour Developpement durable (economie, sociale, environnement, culture)", "", 13),
        (110,"Nombre de système d'information pour Paiement des services environnementaux (PSE)", "", 13),
        (111,"Nombre de système d'information pour Corruption", "", 13),
        (112,"Taux d'adoption de l'IEC (%)", "", 13),
        (113,"Nombre d'infrastructures fonctionnelles", "", 14),
        (114,"Nombre de matériels roulants fonctionnels", "", 14),
        (115,"Nombre de matériels informatiques fonctionnels", "", 14),
        (116,"Nombre de matériels mobiliers", "", 14),
        (117,"Nombre de contribution infrastructure au niveau CTD comptabilisée", "", 14),
        (118,"Taux de recouvrement national des infrastructures des STD construites ou réhabilitées (%)", "", 14),
        (119,"Nombre de matériels informatiques à condamner", "", 14),
        (120,"Nombre de guides appliqués pour Actes administratifs", "", 15),
        (121,"Nombre de guides appliqués pour Aires protégées (AP)", "", 15),
        (122,"Nombre de guides appliqués pour Biodiversité", "", 15),
        (123,"Nombre de guides appliqués pour Cadre national et international (juridique, politique, stratégique)", "", 15),
        (124,"Nombre de guides appliqués pour Changement Climatique et REDD+", "", 15),
        (125,"Nombre de guides appliqués pour Contrôles environnementaux et forestiers", "", 15),
        (126,"Nombre de guides appliqués pour Partenariat", "", 15),
        (127,"Nombre de guides appliqués pour Economie verte", "", 15),
        (128,"Nombre de guides appliqués pour Environnement (pollution, évaluation environnementale, gouvernance)", "", 15),
        (129,"Nombre de guides appliqués pour Feux ", "", 15),
        (130,"Nombre de guides appliqués pour Finances", "", 15),
        (131,"Nombre de guides appliqués pour Informations générales", "", 15),
        (132,"Nombre de guides appliqués pour Logistique", "", 15),
        (133,"Nombre de guides appliqués pour Outils (guide, manuel)", "", 15),
        (134,"Nombre de guides appliqués pour Planification, programmation, suivi-evaluation", "", 15),
        (135,"Nombre de guides appliqués pour Reboisement", "", 15),
        (136,"Nombre de guides appliqués pour Recherche et développement", "", 15),
        (137,"Nombre de guides appliqués pour Responsabilité Sociétale des Entreprises (RSE : reboisements, éducation environnementale, ...)", "", 15),
        (138,"Nombre de guides appliqués pour Ressources humaines", "", 15),
        (139,"Nombre de guides appliqués pour Transfert de gestion", "", 15),
        (140,"Nombre de guides appliqués pour Transition écologique et résilience (Désertification et dégradation des terres)", "", 15),
        (141,"Nombre de guides appliqués pour Developpement durable (economie, sociale, environnement, culture)", "", 15),
        (142,"Nombre de guides appliqués pour Paiement des services environnementaux (PSE)", "", 15),
        (143,"Nombre de guides appliqués pour Corruption", "", 15),
        (144,"Nombre d'outils disponibles et utilisés pour Actes administratifs", "", 15),
        (145,"Nombre d'outils disponibles et utilisés pour Aires protégées (AP)", "", 15),
        (146,"Nombre d'outils disponibles et utilisés pour Biodiversité", "", 15),
        (147,"Nombre d'outils disponibles et utilisés pour Cadre national et international (juridique, politique, stratégique)", "", 15),
        (148,"Nombre d'outils disponibles et utilisés pour Changement Climatique et REDD+", "", 15),
        (149,"Nombre d'outils disponibles et utilisés pour Contrôles environnementaux et forestiers", "", 15),
        (150,"Nombre d'outils disponibles et utilisés pour Partenariat", "", 15),
        (151,"Nombre d'outils disponibles et utilisés pour Economie verte", "", 15),
        (152,"Nombre d'outils disponibles et utilisés pour Environnement (pollution, évaluation environnementale, gouvernance)", "", 15),
        (153,"Nombre d'outils disponibles et utilisés pour Feux ", "", 15),
        (154,"Nombre d'outils disponibles et utilisés pour Finances", "", 15),
        (155,"Nombre d'outils disponibles et utilisés pour Informations générales", "", 15),
        (156,"Nombre d'outils disponibles et utilisés pour Logistique", "", 15),
        (157,"Nombre d'outils disponibles et utilisés pour Outils (guide, manuel)", "", 15),
        (158,"Nombre d'outils disponibles et utilisés pour Planification, programmation, suivi-evaluation", "", 15),
        (159,"Nombre d'outils disponibles et utilisés pour Reboisement", "", 15),
        (160,"Nombre d'outils disponibles et utilisés pour Recherche et développement", "", 15),
        (161,"Nombre d'outils disponibles et utilisés pour Responsabilité Sociétale des Entreprises (RSE : reboisements, éducation environnementale, ...)", "", 15),
        (162,"Nombre d'outils disponibles et utilisés pour Ressources humaines", "", 15),
        (163,"Nombre d'outils disponibles et utilisés pour Transfert de gestion", "", 15),
        (164,"Nombre d'outils disponibles et utilisés pour Transition écologique et résilience (Désertification et dégradation des terres)", "", 15),
        (165,"Nombre d'outils disponibles et utilisés pour Developpement durable (economie, sociale, environnement, culture)", "", 15),
        (166,"Nombre d'outils disponibles et utilisés pour Paiement des services environnementaux (PSE)", "", 15),
        (167,"Nombre d'outils disponibles et utilisés pour Corruption", "", 15),
        (168,"Nombre de programmes/projets qui ont fait l'objet de planification", "", 16),
        (169,"Nombre de programmes/projets qui ont fait l'objet de suivi", "", 16),
        (170,"Nombre de programmes/projets qui ont fait l'objet d'évaluation", "", 16),
        (171,"Superficie reboisée totale", "", 17),
        (172,"Superficie de mangroves restaurées", "", 17),
        (173,"Nombre de plants produits", "", 17),
        (174,"Taux de résultats de recherches appliqués", "", 18),
        (175,"Nombre de projets développés dans le cadre de RSE", "", 19),
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
        (1,'Quelle est la superficie totale reboisée?',1,1,3,1,1,NULL,'Surface totale reboisée','ha', NULL),
        (2,'Quel est le nombre total d espèce otoctone reboisée',1,1,3,1,2,NULL,'Nombre d espèce otoctone reboisée','Unité', NULL),
        (3,'Quelle est la superficie totale brûlée?',1,1,3,1,3,NULL,'Surface brûlée','ha', NULL),
        
        (4,'Superficie de TG nouvellement créé',1,1,3,1,74,NULL,'Superficie de TG nouvellement créé','ha', null),
        (5,'Superficie de TG renouvelé',1,1,3,1,75,NULL,'Superficie de TG renouvelé','ha', null),
        (6,'Nombre de contrats de TG évalués',1,1,3,1,76,NULL,'Nombre de contrats de TG évalués','ha', null),
        (7,'Superficie (autres transversales)',1,1,3,1,77,NULL,'Superficie (autres transversales)','ha', null),
        (8,'Nombre de bénéficiaires de TG (semestre, annuel)',1,1,3,1,78,NULL,'Nombre de bénéficiaires de TG (semestre, annuel)','ha', null),
        (9,'TG suivi',1,1,3,1,79,NULL,'TG suivi','ha', null),
        (10,'Nombre de COBA formées',1,1,3,1,80,NULL,'Nombre de COBA formées','ha', null),
        (11,'Association soutenue (%) : appuyée/total',1,1,3,1,81,NULL,'Association soutenue (%) : appuyée/total','ha', null),
        
        (12,'Intitulé du contrat de transfert de gestion',1,1,3,1,NULL,NULL,'Intitulé du contrat de transfert de gestion',null, 11),
        (13,'Nom du site',0,1,3,1,NULL,NULL,'Nom du site',null, 12),
        (14,'Emplacement (Région, District, Commune)',0,1,3,1,NULL,NULL,'Emplacement (Région, District, Commune)',null, 11),
        (15,'Date de signature',0,1,3,1,NULL,NULL,'Date de signature',null, 11),
        (16,'Ressources concernées dans le site de TG',0,1,3,1,NULL,NULL,'Ressources concernées dans le site de TG',null, 11),
        (17,'Vocations du site de TG',0,1,3,1,NULL,NULL,'Vocations du site de TG',null, 11),
        (18,'Superficie du TG',0,1,3,1,NULL,NULL,'Superficie du TG',null, 11),
        (19,'Nouvellement créé (oui/non)',0,1,3,1,NULL,NULL,'Nouvellement créé (oui/non)',null, 11),
        (20,'Renouvelé (oui/non)',0,1,3,1,NULL,NULL,'Renouvelé (oui/non)',null, 11),
        (21,'Nom de COBA/VOI',0,1,3,1,NULL,NULL,'Nom de COBA/VOI',null, 11),
        (22,'Nombre des membres',0,1,3,1,NULL,NULL,'Nombre des membres',null, 11),
        (23,'Structurée (oui/non)',0,1,3,1,NULL,NULL,'Structurée (oui/non)',null, 11),
        (24,'Formée (oui/non)',0,1,3,1,NULL,NULL,'Formée (oui/non)',null, 11),
        (25,'Opérationnelle (oui/non)',0,1,3,1,NULL,NULL,'Opérationnelle (oui/non)',null, 11),
        (26,'Nombre de ménages bénéficiaires',0,1,3,1,NULL,NULL,'Nombre de ménages bénéficiaires',null, 11),
        (27,'Appuyée (oui/non)',0,1,3,1,NULL,NULL,'Appuyée (oui/non)',null, 11),
        (28,'Organisme d appui',0,1,3,1,NULL,NULL,'Organisme d appui',null, 11),
        (29,'Projet',0,1,3,1,NULL,NULL,'Projet',null, 11),
        (30,'Intitulé du suivi de TG',0,1,3,1,NULL,NULL,'Intitulé du suivi de TG',null, 11),
        (31,'Date de réalisation',0,1,3,1,NULL,NULL,'Date de réalisation',null, 11),
        (32,'Equipe de réalisation',0,1,3,1,NULL,NULL,'Equipe de réalisation',null, 11),
        (33,'Rapport de suivi (oui/non)',0,1,3,1,NULL,NULL,'Rapport de suivi (oui/non)',null, 11),
        (34,'Date d édition',0,1,3,1,NULL,NULL,'Date d édition',null, 11),
        (35,'Intitulé de l évaluation de TG',0,1,3,1,NULL,NULL,'Intitulé de l évaluation de TG',null, 11),
        (36,'Date de réalisation',0,1,3,1,NULL,NULL,'Date de réalisation',null, 11),
        (37,'Equipe de réalisation',0,1,3,1,NULL,NULL,'Equipe de réalisation',null, 11),
        (38,'Rapport d évaluation (oui/non)',0,1,3,1,NULL,NULL,'Rapport d évaluation (oui/non)',null, 11),
        (39,'Date d édition',0,1,3,1,NULL,NULL,'Date d édition',null, 11),

        ("41","Taux de résultats de recherches appliqués",1,1,3,1,18,NULL,"Taux de résultats de recherches appliqués",NULL, NULL),
        ("42","Sujet des recherches effectués",1,1,3,1,NULL,NULL,"Sujet des recherches effectués",NULL, "41"),
        ("43","Objectif (étude de filière, ...)",0,1,3,1,NULL,NULL,"Objectif (étude de filière, ...)",NULL, "41"),
        ("44","Zone d'intervention",0,1,3,1,NULL,NULL,"Zone d'intervention",NULL, "41"),
        ("45","Date de commencement",0,1,3,1,NULL,NULL,"Date de commencement",NULL, "41"),
        ("46","Date de fin",0,1,3,1,NULL,NULL,"Date de fin",NULL, "41"),
        ("47","Chercheurs (liste)",0,1,3,1,NULL,NULL,"Chercheurs (liste)",NULL, "41"),
        ("48","Institution des chercheurs",0,1,3,1,NULL,NULL,"Institution des chercheurs",NULL, "41"),
        ("49","Date d'édition du rapport de recherche",0,1,3,1,NULL,NULL,"Date d'édition du rapport de recherche",NULL, "41"),
        ("50","Résultats de la recherche",0,1,3,1,NULL,NULL,"Résultats de la recherche",NULL, "41"),
        ("51","Résultats appliqués (réussi/non)",0,1,3,1,NULL,NULL,"Résultats appliqués (réussi/non)",NULL, "41"),
        ("52","Source de financement",0,1,3,1,NULL,NULL,"Source de financement",NULL, "41"),
        ("53","Projet",0,1,3,1,NULL,NULL,"Projet",NULL, "41"),
        ("54","Coûts des activités de recherche (Ariary)",0,1,3,1,NULL,NULL,"Coûts des activités de recherche (Ariary)",NULL, "41"),

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
