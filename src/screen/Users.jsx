import React, {useState} from 'react'
import { NavLink } from 'react-router-dom'

import SendAsynch from '../services/renderer'

export default function Users(props) {
    const [users, setUsers] = useState([]);

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
                                    <th>Nom</th>
                                    <th>E-mail</th>
                                    <th>Tel</th>
                                    <th>Catégorie</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>RAKOTOARINIVO</td>
                                    <td>hrakotoarinivo@gmail.com</td>
                                    <td>0345698852</td>
                                    <td>RPSE</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="action">
                            <button className="success btn">
                                Valider
                            </button>
                            <button className="danger btn">
                                Supprimer
                            </button>
                        </div>
                    </div>
                    <div className="validated">
                    <h2>Les utilisateurs validés</h2>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>E-mail</th>
                                    <th>Tel</th>
                                    <th>Catégorie</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>RAKOTOARINIVO</td>
                                    <td>hrakotoarinivo@gmail.com</td>
                                    <td>0345698852</td>
                                    <td>RPSE</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
