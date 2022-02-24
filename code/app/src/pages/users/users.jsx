import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

export default function Users(props) {
  const [users, setUsers] = useState([]);
  const [usersa, setUsersa] = useState([]);
  const [usersv, setUsersv] = useState([]);

  const [awaiting, setAwaiting] = useState([]);
  const [validated, setValidated] = useState([]);

  function updateUser(users) {
    // var ua = [];
    // var uv = [];
    setUsers(users);
    const uv = users.filter((item) => item.validate === 1);
    const ua = users.filter((item) => item.validate === 0);
    // users.forEach((user) => {
    //   if (user.validate === 1) {
    //     uv.push(user);
    //   } else {
    //     if (
    //       user.region_id === props.user.region_id &&
    //       user.rank === props.user.rank - 1
    //     ) {
    //       ua.push(user);
    //     }
    //   }
    // });

    setAwaiting(new Array(ua.length).fill(false));
    setValidated(new Array(uv.length).fill(false));
    setUsersa(ua);
    setUsersv(uv);
  }

  function getUsers() {
    /*window.api
      .get(
        "asynchronous-get",
        "user"
        // {rank: props.user.rank-1, idByRegion: props.user.district_id}
      )
      .then((result) => {
        updateUser(result);
      })
      .catch((error) => {
        console.log(error);
      });*/

    window.api
      .get("asynchronous-get", "user", {
        rank: props.user.rank - 1,
        district_id: props.user.district_id,
      })
      .then((result) => {
        updateUser(result);
        // console.log("result--------------------------------------");
        // console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function validate(ids, val) {
    window.api
      .send("asynchronous-validate", "user", ids, val)
      .then((res) => {
        updateUser(res);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function del(ids) {
    console.log(ids);
    window.api
      .getTrans("asynchronous-deletes", "user", ids)
      .then((res) => {
        if (res) getUsers();
        else
          alert(
            "Une erreur s'est produite, veuillez réessayer ultérieurement ou contacter le responsable"
          );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    getUsers();
  }, [users.length]);

  const handleOnChange = (tableValidated, position) => {
    let temp = tableValidated ? validated : awaiting;
    const updatedTable = temp.map((item, index) =>
      index === position ? !item : item
    );
    tableValidated ? setValidated(updatedTable) : setAwaiting(updatedTable);
  };

  const handleOnClickValider = () => {
    let ids = [];
    awaiting.forEach((value, idx) => {
      if (value) ids.push(usersa[idx].id);
    });
    validate(ids, 1);
  };

  const handleOnClickDel = () => {
    let ids = [];
    awaiting.forEach((value, idx) => {
      if (value) ids.push(usersa[idx].id);
    });
    del(ids);
  };

  const handleOnClickRetirer = () => {
    let ids = [];
    validated.forEach((value, idx) => {
      if (value) ids.push(usersv[idx].id);
    });
    validate(ids, 0);
  };

  return (
    <div className="Users">
      <div className="container">
        <div className="head">
          <h1>Utilisateurs</h1>
          <div className="track">
            <ul>
              <li className="track-item">
                <NavLink to="/home">Accueil</NavLink>
              </li>
              &#60;
              <li className="track-item">Utilisateurs</li>
            </ul>
          </div>
        </div>
        <div className="component">
          <div className="awaiting">
            <h2>Utilisateur en attente de validation</h2>
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>Nom</th>
                  <th>E-mail</th>
                  <th>Tel</th>
                  <th>Catégorie</th>
                </tr>
              </thead>
              <tbody>
                {usersa &&
                  usersa.map((user, idx) => {
                    return (
                      <tr key={"users_awaiting_list_" + idx}>
                        <td key={"users_awaiting_a" + idx}>
                          <input
                            key={"users_awaiting_check_" + idx}
                            type="checkbox"
                            checked={awaiting[idx]}
                            onChange={() => handleOnChange(false, idx)}
                          />
                        </td>
                        <td key={"users_awaiting_n" + idx}>{user.nom}</td>
                        <td key={"users_awaiting_e" + idx}>{user.email}</td>
                        <td key={"users_awaiting_t" + idx}>{user.tel}</td>
                        <td key={"users_awaiting_l" + idx}>{user.label}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            <div className="action">
              <button className="success btn" onClick={handleOnClickValider}>
                Valider
              </button>
              <button className="danger btn" onClick={handleOnClickDel}>
                Supprimer
              </button>
            </div>
          </div>
          <div className="validated">
            <h2>Les utilisateurs validés</h2>
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>Nom</th>
                  <th>E-mail</th>
                  <th>Tel</th>
                  <th>Catégorie</th>
                </tr>
              </thead>
              <tbody>
                {usersv &&
                  usersv.map((user, idx) => {
                    return (
                      <tr key={"users_validated_list" + idx}>
                        <td key={"users_validated_a" + idx}>
                          <input
                            key={"users_validated_check" + idx}
                            type="checkbox"
                            checked={validated[idx]}
                            onChange={() => handleOnChange(true, idx)}
                          />
                        </td>
                        <td key={"users_validated_n" + idx}>{user.nom}</td>
                        <td key={"users_validated_e" + idx}>{user.email}</td>
                        <td key={"users_validated_t" + idx}>{user.tel}</td>
                        <td key={"users_validated_l" + idx}>{user.label}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            <div className="action">
              <button className="danger btn" onClick={handleOnClickRetirer}>
                Retirer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
