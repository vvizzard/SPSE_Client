import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { MultiSelect } from "react-multi-select-component";
import ROUTES from "Constants/routes";
import CONST from "Constants/general";
import Table from "../../components/Table";
import CarteM from "../../components/CarteM";

export default function PtaData(props) {
  // Filtre select
  const [annees, setAnnees] = useState([]);
  const [thematique, setThematique] = useState([]);

  // Current state
  const [th, setTh] = useState(1);
  const [annee, setAnnee] = useState(parseInt(new Date().getFullYear()));
  const [niveau, setNiveau] = useState(CONST.LEVEL_DISTRICT);
  const [tabFocus, setTabFocus] = useState(["actif"]);

  // Datas
  const [indicateurs, setIndicateurs] = useState("");
  // const [header, setHeader] = useState([]);
  const [responses, setResponses] = useState([]);
  const [data, setData] = useState([{ id: 1 }]);
  const [column, setColumn] = useState([
    {
      Header: " ",
      columns: [
        {
          Header: "ID",
          accessor: "id",
        },
        {
          Header: "Nom",
          accessor: "label",
        },
        {
          Header: "Description",
          accessor: "comment",
        },
      ],
    },
  ]);
  
  // const animatedComponents = makeAnimated();
  // const [questions, setQuestions] = useState([]);
  // const [headerTotal, setHeaderTotal] = useState([]);

  // Setup constant data 
  function loadDate() {
    let years = [];
    const today = parseInt(new Date().getFullYear());
    for (let index = today; index > 2018; index--) {
      years.push(index);
    }
    setAnnees(years);
  }
  
  function getThematique() {
    window.api
      .get("asynchronous-get", "thematique")
      .then((result) => {
        setThematique(result);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // Make table
  // function makeHeader(questions) {
  //   let cl = [];
  //   questions.forEach((element) => {
  //     cl.push({
  //       Header: element.question,
  //       accessor: element.question.replaceAll(/[^a-zA-Z0-9]/g, "_"),
  //     });
  //   });

  //   setColumn([
  //     {
  //       Header: " ",
  //       columns: cl,
  //     },
  //   ]);
  // }

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

  
  function getData(level = niveau, date = annee, thid = th) {
    window.api
      .getTrans("asynchronous-get-trans", "pta", {
        thematiqueId: thid,
        date: date,
        districtId: null,
      })
      .then((result) => {
        console.log("getData : pta");
        console.log(result);
        console.log("getData fin -----------------------------");
        // setResponses(result.reponses ? result.reponses : []);
        // makeHeader(result.questions ? result.questions : []);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  

  
  

  

  

  

  

  

  

  function exportExcel(level = niveau, date = annee, thid = th) {
    window.api
      .exporterReponse("export_reponse", "reponse", {
        level: level,
        date: date,
        thid: thid,
      })
      .then((rs) => {
        console.log("rs");
        console.log(rs);
      });
  }

  useEffect(() => {
    getThematique();
    loadDate();
    // getHeader();
    getData();
  }, [responses.length]);

  // const handleOnChangeHeader = (v) => {
  //   setHeader(v);
  //   makeHeader(v);
  // };

  const handleOnChangeNiveau = (val) => {
    setNiveau(val);
    getData(val);
  };

  const handleOnChangeAnnee = (val) => {
    setAnnee(val);
    getData(niveau, val);
  };

  const handleOnClickTab = (idx, thid) => {
    let tbs = [];
    tbs[idx] = ["actif"];
    setTabFocus(tbs);
    setTh(thid);
    getData(niveau, annee, thid);
  };

  const handleOnClickExport = (val) => {
    exportExcel();
  };

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
          <div className="filter">
            <div className="form-group">
              <label htmlFor="">Niveau</label>
              <select
                value={niveau}
                onChange={(event) => handleOnChangeNiveau(event.target.value)}>
                <option value={CONST.LEVEL_REGION}>National</option>
                <option value={CONST.LEVEL_REGION}>Région</option>
                <option value={CONST.LEVEL_DISTRICT}>District</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="">Année</label>
              <select
                name=""
                id=""
                value={annee}
                onChange={(event) => handleOnChangeAnnee(event.target.value)}>
                {annees &&
                  annees.map((e) => {
                    return <option value={e}>{e}</option>;
                  })}
              </select>
            </div>
          </div>
          <br />
          <div className="awaiting">
            <h2>Tableau des données</h2>
            <br />
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
            <br />

            {indicateurs}

            <Table columns={column} data={responses} nowrap={true} />
            <br />
            <div className="bottom-btn">
              <button
                onClick={() => {
                  handleOnClickExport("");
                }}>
                Exporter
              </button>
            </div>
            <br />
            <CarteM thematique={th} regionJson={window.api.getMap} />
          </div>
        </div>
      </div>
    </div>
  );
}
