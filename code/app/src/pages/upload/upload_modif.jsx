import React, { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import Table from "../../components/Table";
import CONST from "Constants/general";

export default function Upload(props) {
  const params = useParams();

  const [thematique, setThematique] = useState([]);
  const [excel, setExcel] = useState("");
  const [tabFocus, setTabFocus] = useState(["actif"]);

  const [responses, setResponses] = useState([]);
  const [column, setColumn] = useState([]);

  const [annee, setAnnee] = useState(
    new Date().getMonth() + "-" + new Date().getFullYear()
  );
  // const [annee, setAnnee] = useState('2019')
  const [th, setTh] = useState(1);

  const [indicateurs, setIndicateurs] = useState("");

  function makeHeader(questions) {
    let cl = [];
    questions.forEach((element) => {
      cl.push({
        Header: element.question,
        accessor: element.question.replaceAll(/[^a-zA-Z0-9]/g, "_"),
      });
    });

    setColumn([
      {
        Header: " ",
        columns: cl,
      },
    ]);
  }

  function makeIndicateur(indicateurs) {
    setIndicateurs(
      <div className="indicateurs-table">
        <table className="table">
          <thead>
            <tr>
              <th>Indicateur</th>
              <th>Valeur</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(indicateurs).map(([key, value]) => {
              return (
                <tr>
                  <td key={key + value}>{key}</td>
                  <td key={value + key}>{value}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  function getData(idTh = th) {
    window.api
      .getTrans("asynchronous-get-trans", "reponse_non_valide", {
        id: props.user.district_id,
        level: "district",
        date: annee,
        thid: idTh,
        comment: 0
      })
      .then((result) => {
        console.log("upload data : ");
        console.log(result);
        makeHeader(result.questions);
        makeIndicateur(result.indicateurs);
        setResponses(result.reponses);
      });
  }

  // function updateData(idTh) {
  //   window.api
  //     .getTrans("asynchronous-get-trans", "reponse_non_valide", {
  //       id: props.user.district_id,
  //       level: "district",
  //       date: annee,
  //       thid: idTh,
  //       comment: 0
  //     })
  //     .then((result) => {
  //       console.log("upload update data : ___________");
  //       console.log(result);
  //       setResponses(result[0].reponses);
  //       makeIndicateur(result[0].indicateurs);
  //     });
  // }

  function validate() {
    window.api
      .getTrans("valider-terminer", "reponse", props.user.district_id)
      .then((result) => {
        if(result) {
            alert("L'opération a été un succès")
            setResponses([])
            // getData()
        } else alert("Une erreur est survenu lors de l'opération")
        console.log("data response : ___________");
        console.log(result);
      });
  }

  function getThematique() {
    window.api.get("asynchronous-get", "thematique").then((result) => {
      let valiny = [];
      if(props.user.category_id == 0) {
        valiny = result.filter((item) => item.comment == "Centrale"||item.comment == "Tous");  
      } else {
        valiny = result.filter((item) => item.comment == "Cantonnement"||item.comment == "Tous");  
      }
      
      
      setThematique(valiny);
    });
  }

  useEffect(() => {
    getThematique();
    getData();
  }, []);

  function send(thematiqueId) {
    window.api.exporter("export", "thematique", thematiqueId).then((result) => {
      if (!result)
        alert(
          "Une erreur s'est produite, Veuillez réessayer ultérieurement. Si le problème persiste, veuillez faire par au responsable technique "
        );
    });
  }

  function read() {
    window.api.importer("import", "thematique", props.user.id).then((result) => {
      if (!result) {
        alert(
          "Une erreur s'est produite, Veuillez réessayer ultérieurement. Si le problème persiste, veuillez faire par au responsable technique "
        );
      } else if (result==true) {
        alert("L'opération a été terminé avec succes");
      } else alert(result);

      getData(th);
    });
  }

  // function read() {
  //   window.api
  //     .importer("import", "thematique", props.user.id)
  //     .then((result) => {
  //       if (!result)
  //         alert(
  //           "Une erreur s'est produite, Veuillez réessayer ultérieurement. Si le problème persiste, veuillez faire par au responsable technique "
  //         );
  //       else alert("L'opération a été terminé avec succes");
  //     });
  // }

  function importGeoJson() {
    window.api.upload("import-geojson", "geojson", props.user.id).then((result) => {
      if (!result)
        alert(
          "Une erreur s'est produite, Veuillez réessayer ultérieurement. Si le problème persiste, veuillez faire par au responsable technique "
        );
      else alert("L'opération a été terminé avec succes");
    });
  }

  function importDoc() {
    window.api.upload("import-geojson", "zip", props.user.id).then((result) => {
      if (!result)
        alert(
          "Une erreur s'est produite, Veuillez réessayer ultérieurement. Si le problème persiste, veuillez faire par au responsable technique "
        );
      else alert("L'opération a été terminé avec succes");
    });
  }

  const handleOnClickTab = (idx, thid) => {
    let tbs = [];
    tbs[idx] = ["actif"];
    setTabFocus(tbs);
    setTh(thid);
    getData(thid);
  };

  function handleClickTerminer() {
    validate();
  }

  function handleOnClickCanevas(thematiqueId) {
    send(thematiqueId);
  }

  function handleOnClickImport() {
    read();
  }

  function handleOnClickImportGeojson() {
    importGeoJson();
  }

  function handleOnClickImportDoc() {
    importDoc();
  }

  return (
    <div className="Users Upload">
      <div className="container">
        <div className="head">
          <h1>Mis à jour</h1>
          <div className="track">
            <ul>
              <li className="track-item">
                <NavLink to="/home">Accueil</NavLink>
              </li>
              &#60;
              <li className="track-item">Mis à jour</li>
            </ul>
          </div>
        </div>
        <div className="component">
          <div className="add">
            <h2>Canevas</h2>
            <div className="canevas-btn">
              {thematique &&
                thematique.map((user, idx) => {
                  return (
                    <button
                      className="item "
                      onClick={() => {
                        handleOnClickCanevas(user.id);
                      }}>
                      {user.label}
                    </button>
                  );
                })}
            </div>
          </div>
          <hr />
          <div className="awaiting">
            <h2>Base de données en cours</h2>
            <div className="tab">
              {thematique &&
                thematique.map((user, idx) => {
                  return (
                    <a
                      className={
                        tabFocus && tabFocus[idx]
                          ? "item " + tabFocus[idx]
                          : "item"
                      }
                      onClick={() => {
                        handleOnClickTab(idx, user.id);
                      }}>
                      {user.label}
                    </a>
                  );
                })}
            </div>

            {indicateurs}

            <Table columns={column} data={responses} nowrap={true} />
          </div>

          {excel}

          <div className="bottom-btn">
            <button
              onClick={() => {
                handleOnClickImport();
              }}>
              Importer le canevas
            </button>
            <button
              onClick={() => {
                handleOnClickImportGeojson();
              }}>
              Importer les données géographiques
            </button>
            <button
              onClick={() => {
                handleOnClickImportDoc();
              }}>
              Importer les documents/images
            </button>
            <button
              onClick={() => {
                handleClickTerminer();
              }}>
              Valider et terminer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
