import React, {useState} from 'react'
import logo from '../img/logo_medd.jpg'
import { NavLink } from 'react-router-dom'

import SendAsynch from '../services/renderer'

export default function Login(props) {
    const [id, setId] = useState(null);
    const [pw, setPw] = useState(null);
    const [resp, setResp] = useState("");

    function checkLogin() {
        props.log({
            "id": id,
            "pw": pw
        });
    }

    function send(data) {
        SendAsynch(data).then(result => {
            setResp(result);
        })
    }

    function handleSendData() {
        send({
            email: id,
            pw: pw
        });
    }

    return (
        <div className="Login">
            <div className="container">
                <div className="login-card">
                    <div className="description">
                        <img src={logo} className="Medd-logo" alt="logo" />
                        <h1>SPSE</h1>
                        <p>Bienvenue, veuillez vous connecter</p>
                        <p>{resp && JSON.stringify(resp, null, 2)}</p>
                    </div>
                    <div className="form">
                        <div className="form-group">
                            <label htmlFor="id">Nom</label><br></br>
                            <input type="text" name="id" id="id" 
                            placeholder="Veuillez taper ici votre nom" 
                            onChange={ event => setId(event.target.value) } />
                        </div>
                        <div className="form-group">
                        <label htmlFor="pw">Mot de passe</label>
                        <input type="password" name="pw" id="pw" 
                            placeholder="Veuillez taper ici votre mot de passe"
                            onChange={ event => setPw(event.target.value) } />
                        </div>
                        <NavLink to="/users">
                            <button onClick={checkLogin}>Connexion</button>
                        </NavLink>
                        <button onClick={handleSendData}>testPingPong</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
