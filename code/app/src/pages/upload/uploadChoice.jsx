import React, { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import Table from "../../components/Table";
import CONST from "Constants/general";

export default function UploadChoice(props) {
  const params = useParams();

  const [thematique, setThematique] = useState([]);
  const [excel, setExcel] = useState("");
  const [tabFocus, setTabFocus] = useState(["actif"]);

  const [responses, setResponses] = useState([]);
  const [column, setColumn] = useState([]);

  const [districts, setDistricts] = useState([]);
  const [distId, setDistId] = useState(props.user.district_id);
  const [userId, setUserId] = useState(props.user.id);

  const [annee, setAnnee] = useState(
    new Date().getMonth() + 1 + "-" + new Date().getFullYear()
  );
  // const [annee, setAnnee] = useState('2019')
  const [th, setTh] = useState(1);

  const [indicateurs, setIndicateurs] = useState("");

  function loadDistrict() {
    window.api
      .getTrans2(
        "asynchronous-get-district-validation",
        "district",
        props.user.district_id
      )
      .then((result) => {
        console.log("uploadChoice : get district");
        console.log(result);
        console.log("---------------------------");
        setDistricts(result);
        setUserId(props.user.id);
        setDistId(props.user.district_id);
      });
  }

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
                <tr key={key + "indicateurs"}>
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

  function getData(idTh = th, dist = distId) {
    window.api
      .getTrans("asynchronous-get-trans", "reponse_non_valide", {
        district_id: dist,
        // level: "district",
        date: annee,
        thid: idTh,
        comment: 0,
      })
      .then((rss) => {
        console.log("uploadChoice : get reponse_non_valide");
        console.log(rss);
        console.log("---------------------------------");
        makeHeader(rss.questions);
        makeIndicateur(rss.indicateurs);
        setResponses(rss.reponses);
      });
  }

  function validate() {
    window.api
      .getTrans("valider-terminer", "reponse", distId)
      .then((result) => {
        if (result) {
          alert("L'opération a été un succès");
          setResponses([]);
          // getData()
        } else alert("Une erreur est survenu lors de l'opération");
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
    loadDistrict();
    getThematique();
    getData();
    // handleOnClickTab(0, 1);
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
    window.api.importer("import", "thematique", userId).then((result) => {
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

  function importGeoJson() {
    window.api.upload("import-geojson", "geojson", userId).then((result) => {
      if (!result)
        alert(
          "Une erreur s'est produite, Veuillez réessayer ultérieurement. Si le problème persiste, veuillez faire par au responsable technique "
        );
      else alert("L'opération a été terminé avec succes");
    });
  }

  function importDoc() {
    window.api.upload("import-geojson", "zip", userId).then((result) => {
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

  const handleOnChangeDist = (val) => {
    setDistId(val);
    getData(th, val);
    // console.log("boooooooooooooooooooooo");
    // console.log("district id ");
    // console.log(val);
    // console.log(districts);
    const indicateurEnCours = districts.find((element) => element.id == val);
    // console.log(indicateurEnCours);
    setUserId(indicateurEnCours.user_id);
  };

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
                thematique.map((thematiqueId, idx) => {
                  return (
                    <button
                      key={"thq"+thematiqueId.id}
                      className="item "
                      onClick={() => {
                        handleOnClickCanevas(thematiqueId.id);
                      }}>
                      {thematiqueId.label}
                    </button>
                  );
                })}
            </div>
          </div>
          <hr />
          <div className="awaiting">
            <h2>Base de données en cours</h2>
            <div className="form-group">
              <label htmlFor="">District : </label>
              <select
                name=""
                id=""
                value={distId}
                onChange={(event) => handleOnChangeDist(event.target.value)}>
                {districts &&
                  districts.map((e) => {
                    return (
                      <option key={e.id + "_" + e.label} value={e.id}>
                        {e.label}
                      </option>
                    );
                  })}
              </select>
            </div>
            <div className="tab">
              {thematique &&
                thematique.map((thematiqueId, idx) => {
                  return (
                    <a
                      key={"thq-a-"+thematiqueId.id+idx}
                      className={
                        tabFocus && tabFocus[idx]
                          ? "item " + tabFocus[idx]
                          : "item"
                      }
                      onClick={() => {
                        handleOnClickTab(idx, thematiqueId.id);
                      }}>
                      {thematiqueId.label}
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
