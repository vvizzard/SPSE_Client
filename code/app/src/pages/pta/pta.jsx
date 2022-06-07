import React, { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import Table from "../../components/Table";
// import CONST from "Constants/general";

export default function Pta(props) {
  const params = useParams();

  const [thematique, setThematique] = useState([]);
  const [excel, setExcel] = useState("");
  const [tabFocus, setTabFocus] = useState(["actif"]);

  const [responses, setResponses] = useState([
    { indicateur: "test", thematique: "acte", objectif: null },
    { thematique: "acte", indicateur: "test", objectif: 4 },
  ]);
  const [column, setColumn] = useState([]);

  const [districts, setDistricts] = useState([]);
  const [distId, setDistId] = useState(props.user.district_id);
  const [userId, setUserId] = useState(props.user.id);

  const [annee, setAnnee] = useState(new Date().getFullYear());
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

  function makeHeader() {
    let cl = [
      {
        Header: "Thématique",
        accessor: "thematique",
      },
      {
        Header: "Indicateur",
        accessor: "indicateur",
      },
      {
        Header: "Objectif",
        accessor: "objectif",
      },
    ];

    setColumn([
      {
        Header: " ",
        columns: cl,
      },
    ]);
  }

  function getData(idTh = th, dist = distId) {
    window.api
      .getPTA("asynchronous-get-pta", "pta", {
        district_id: dist,
        date: annee,
      })
      .then((rss) => {
        console.log("PTA : get pta");
        console.log(rss);
        console.log("---------------------------------");
        makeHeader();
        setResponses(rss);
      });
  }

  useEffect(() => {
    loadDistrict();
    // getThematique();
    getData();
    // handleOnClickTab(0, 1);
  }, []);

  function read() {
    window.api
      .importer("import", "pta", { user_id: userId, district_id: distId })
      .then((result) => {
        if (!result) {
          alert(
            "Une erreur s'est produite, Veuillez réessayer ultérieurement. Si le problème persiste, veuillez faire par au responsable technique "
          );
        } else if (result == true) {
          alert("L'opération a été terminé avec succes");
        } else alert(result);

        getData();
      });
  }

  // function importDoc() {
  //   window.api.upload("import-geojson", "xlsx", userId).then((result) => {
  //     if (!result)
  //       alert(
  //         "Une erreur s'est produite, Veuillez réessayer ultérieurement. Si le problème persiste, veuillez faire par au responsable technique "
  //       );
  //     else alert("L'opération a été terminé avec succes");
  //   });
  // }

  function handleOnClickImport() {
    read();
  }

  // function handleOnClickImportDoc() {
  //   importDoc();
  // }

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
          <h1>PTA</h1>
          <div className="track">
            <ul>
              <li className="track-item">
                <NavLink to="/home">Accueil</NavLink>
              </li>
              &#60;
              <li className="track-item">PTA</li>
            </ul>
          </div>
        </div>
        <div className="component">
          <div className="awaiting">
            <h2>PTA de l'année</h2>
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

            {indicateurs}

            <Table
              className="pta-table"
              columns={column}
              data={responses}
              nowrap={true}
            />
          </div>

          {excel}

          <div className="bottom-btn">
            <button
              onClick={() => {
                handleOnClickImport();
              }}>
              Importer le PTA
            </button>
            {/* <button
              onClick={() => {
                handleOnClickImportDoc();
              }}>
              Stocker le PTA dans le serveur
            </button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
