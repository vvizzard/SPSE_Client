import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import Table from "../../components/Table";

export default function PtaDpse(props) {
  const [responses, setResponses] = useState([
    { indicateur: "test", thematique: "acte", objectif: null },
    { thematique: "acte", indicateur: "test", objectif: 4 },
  ]);
  const [column, setColumn] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [distId, setDistId] = useState(props.user.district_id);
  const [annee, setAnnee] = useState(new Date().getFullYear());

  function loadDistrict() {
    window.api
      .getTrans("asynchronous-get-trans", "district", {})
      .then((result) => {
        console.log("ptaDpse : get district");
        console.log(result);
        console.log("---------------------------");
        setDistricts(result);
        setDistId(props.user.district_id);
        getData();
      });
  }

  function makeHeader() {
    let cl = [
      {
        Header: "Date",
        accessor: "date",
      },
      {
        Header: "District",
        accessor: "district",
      },
      {
        Header: "Fichier",
        accessor: "file",
      },
    ];

    setColumn([
      {
        Header: " ",
        columns: cl,
      },
    ]);
  }

  function getData(dist = distId) {
    window.api
      .getPTA("asynchronous-get-pta", "pta_file", {
        district_id: dist,
        date: annee,
      })
      .then((rss) => {
        console.log("PTA : get pta");
        console.log(rss);
        rss.forEach((element) => {
          element.file = "https://spse.llanddev.org/upload/" + element.file;
        });
        console.log("---------------------------------");
        makeHeader();
        setResponses(rss);
      });
  }

  useEffect(() => {
    loadDistrict();
  }, []);

  const handleOnChangeDist = (val) => {
    setDistId(val);
    getData(th, val);
    const indicateurEnCours = districts.find((element) => element.id == val);
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

            <Table
              className="pta-table"
              columns={column}
              data={responses}
              nowrap={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
