import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { MultiSelect } from "react-multi-select-component";
import ROUTES from "Constants/routes";
import CONST from "Constants/general";
import Table from "../../components/Table";

export default function Indicateur(props) {
  // const animatedComponents = makeAnimated();

  const [thematique, setThematique] = useState([]);
  const [tabFocus, setTabFocus] = useState(["actif"]);
  const [th, setTh] = useState(1);

  const [indicateurs, setIndicateurs] = useState([]);
  const [indicateursToShow, setIndicateursToShow] = useState([]);

  const [annees, setAnnees] = useState([]);

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
  const [data, setData] = useState([{ id: 1 }]);

  const [annee, setAnnee] = useState(parseInt(new Date().getFullYear()));
  const [niveau, setNiveau] = useState(CONST.LEVEL_DISTRICT);

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
    let cl = [];

    {
      Object.entries(indicateurs[0]).map(([key, value]) => {
        cl.push({
          Header: key,
          accessor: key,
        });
      });
    }

    setColumn([
      {
        Header: " ",
        columns: cl,
      },
    ]);

    setIndicateurs(indicateurs);
    setIndicateursToShow(indicateurs);
  }

  function getData(level = niveau, date = annee, thid = th) {
    window.api
      .getTrans("asynchronous-get-trans", "reponse", {
        level: level,
        date: date,
        thid: thid,
      })
      .then((result) => {
        console.log("data response : ___________");
        console.log(result);
        let resTemp = [];
        result.forEach((element) => {
          if (element.reponses.length > 0) {
            // console.log("---------bofffff-----------xxxxxxxxxxx");
            element.indicateurs = {
              District: element.reponses[0]["_District_"],
              ...element.indicateurs,
            };
            resTemp.push(element.indicateurs);
            // console.log("---------bofffff-----------xxxxxxxxxxx");
            // console.log(element);
            // console.log(resTemp);
          }
        });
        // setIndicateurs(resTemp);
        console.log("data response : ___________");
        console.log(resTemp);
        // makeHeader(result[0].questions);
        makeIndicateur(resTemp);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    getThematique();
    loadDate();
    getData();
  }, [indicateurs.length]);

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
            <Table columns={column} data={indicateursToShow} nowrap={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
