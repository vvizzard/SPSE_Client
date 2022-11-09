import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Table from "../../components/Table";

export default function PtaDredd(props) {
  const [excel, setExcel] = useState("");

  const [responses, setResponses] = useState([
    { indicateur: "test", thematique: "acte", objectif: null },
    { thematique: "acte", indicateur: "test", objectif: 4 },
  ]);

  const [level, setLevel] = useState(1);

  const [column, setColumn] = useState([]);

  const [districts, setDistricts] = useState([]);
  const [distId, setDistId] = useState(props.user.district_id);
  const [userId, setUserId] = useState(props.user.id);

  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [th, setTh] = useState(1);

  const [indicateurs, setIndicateurs] = useState("");

  const [annees, setAnnees] = useState([]);

  function makeDate() {
    let dates = [];
    for (let i = -1; annee - i >= 2021; i++) {
      dates.push(annee - i);
    }
    setAnnees(dates);
  }

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

  // const [filtreLvl, setFiltreLvl] = useState(
  //   <div className="form-group">
  //     <label htmlFor="">Type : </label>
  //     <select
  //       name=""
  //       id=""
  //       value={level}
  //       onChange={(event) => handleOnChangeLevel(event.target.value)}>
  //       <option key={"type_1"} value="1">
  //         District
  //       </option>
  //       <option key={"type_2"} value="2">
  //         Compilation
  //       </option>
  //     </select>
  //   </div>
  // );

  function getData(dist = distId, an = annee) {
    if (level == 2) dist = null;
    window.api
      .getPTA("asynchronous-get-pta", "pta", {
        district_id: dist,
        date: an,
      })
      .then((rss) => {
        console.log("PTA : get pta");
        console.log(rss);
        console.log("---------------------------------");
        makeHeader();
        console.log(rss);
        const rssTemp = rss.filter((elt) => {
          return elt.validated === 0 || elt.validated === null;
        });
        console.log(rssTemp);
        setResponses(rssTemp);
      });
  }

  useEffect(() => {
    makeDate();
    loadDistrict();
    getData();
  }, []);

  function validate() {
    window.api
      .getTrans("valider-pta", "pta", {
        user_id: userId,
        district_id: distId,
        annee: annee,
      })
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

  function handleOnClickValidate() {
    validate();
  }

  const handleOnChangeDist = (val) => {
    setDistId(val);
    getData(val);
    const indicateurEnCours = districts.find((element) => element.id == val);
    setUserId(indicateurEnCours.user_id);
  };

  const handleOnChangeAnnee = (val) => {
    setAnnee(val);
    getData(distId, val);
  };

  const handleOnChangeLevel = (val) => {
    setLevel(val);
    level == 1 ? getData(null, annee) : getData(distId, annee);
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
            <div className={level == 1 ? "mizara3" : "mizara2"}>
              <div className="form-group">
                <label htmlFor="">Type : </label>
                <select
                  name=""
                  id=""
                  value={level}
                  onChange={(event) => handleOnChangeLevel(event.target.value)}>
                  <option key={"type_1"} value="1">
                    District
                  </option>
                  <option key={"type_2"} value="2">
                    Compilation
                  </option>
                </select>
              </div>
              {level == 1 && (
                <div className="form-group">
                  <label htmlFor="">District : </label>
                  <select
                    name=""
                    id=""
                    value={distId}
                    onChange={(event) =>
                      handleOnChangeDist(event.target.value)
                    }>
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
              )}
              <div className="form-group">
                <label htmlFor="">Année : </label>
                <select
                  name=""
                  id=""
                  value={annee}
                  onChange={(event) => handleOnChangeAnnee(event.target.value)}>
                  {annees &&
                    annees.map((e) => {
                      return (
                        <option key={"currYear_" + e} value={e}>
                          {e}
                        </option>
                      );
                    })}
                </select>
              </div>
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
                handleOnClickValidate();
              }}>
              Valider
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
