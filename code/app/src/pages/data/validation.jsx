import React, { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import { MultiSelect } from "react-multi-select-component";
import CONST from "Constants/general";
import Table from "../../components/Table";
import CarteM from "../../components/CarteM";

export default function Validation(props) {
  const [thematique, setThematique] = useState([]);
  const [tabFocus, setTabFocus] = useState(["actif"]);
  const [column, setColumn] = useState([]);
  const [responses, setResponses] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [distId, setDistId] = useState(props.user.district_id);
  const [userId, setUserId] = useState(props.user.id);
  const [th, setTh] = useState(1);
  const [indicateurs, setIndicateurs] = useState("");

  const [annee, setAnnee] = useState(
    new Date().getMonth() + 1 + "-" + new Date().getFullYear()
  );

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

    // console.log("Make header");
    // console.log("Maque header questions");
    // console.log(questions);
    // console.log("Make header column");
    // console.log([
    //   {
    //     Header: " ",
    //     columns: cl,
    //   },
    // ]);
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
        comment: 1,
      })
      .then((result) => {
        console.log("validation : getData");
        console.log(result);
        console.log("------------------------------------------");
        makeHeader(result.questions);
        makeIndicateur(result.indicateurs);
        setResponses(result.reponses);
      });
  }

  function getThematique() {
    window.api.get("asynchronous-get", "thematique").then((result) => {
      setThematique(result);
    });
  }

  function reject() {
    window.api
      .getTrans("rejeter", "reponse", { district_id: distId })
      .then((result) => {
        console.log("rejeter : ___________");
        console.log(result);
        if (result) {
          alert("L'opération a été un succes");
          getData();
        } else {
          alert("Une erreur est survenue lors de l'opération");
        }
      });
  }

  function validate() {
    window.api
      .getTrans("terminer", "reponse", {
        district_id: distId,
        user_id: props.user.id,
      })
      .then((result) => {
        console.log("Valider : ___________");
        console.log(result);
        if (result) {
          alert("L'opération a été un succes");
          getData();
        } else {
          alert("Une erreur est survenue lors de l'opération");
        }
      });
  }

  useEffect(() => {
    loadDistrict();
    getThematique();
    getData();
  }, []);

  const handleOnChangeDist = (val) => {
    setDistId(val);
    getData(th, val);
  };

  const handleOnClickTab = (idx, thid) => {
    let tbs = [];
    tbs[idx] = ["actif"];
    setTabFocus(tbs);
    setTh(thid);
    getData(thid);
  };

  function handleClickValider() {
    validate();
  }

  function handleOnClickRefuser() {
    reject();
  }

  return (
    <div className="Users">
      <div className="container">
        <div className="head">
          <h1>Base de Données </h1>
          <div className="track">
            <ul>
              <li className="track-item">
                <NavLink to="/home">Accueil</NavLink>
              </li>
              &#60;
              <li className="track-item">Base de données</li>
            </ul>
          </div>
        </div>
        <div className="component">
          <div className="awaiting">
            <div className="head-filter">
              <h2>Détail</h2>
              <div className="form-group">
                <label htmlFor="">District : </label>
                <select
                  name=""
                  id=""
                  value={distId}
                  onChange={(event) => handleOnChangeDist(event.target.value)}>
                  {districts &&
                    districts.map((e) => {
                      return <option key={"dist-opt"+e.id} value={e.id}>{e.label}</option>;
                    })}
                </select>
              </div>
            </div>
            <div className="tab">
              {thematique &&
                thematique.map((user, idx) => {
                  return (
                    <a
                      key={"thq-a-"+user.id+idx}
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
            <br />
            <br />
            <CarteM thematique={th} regionJson={window.api.getMap} />
          </div>
          <div className="bottom-btn">
            <button
              onClick={() => {
                handleOnClickRefuser();
              }}>
              Refuser
            </button>
            <button
              onClick={() => {
                handleClickValider();
              }}>
              Valider
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
