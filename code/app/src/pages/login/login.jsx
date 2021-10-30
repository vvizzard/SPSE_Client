import React, {useState} from 'react'
import ROUTES from "Constants/routes";
import logo from '../../../../assets/img/logo_medd.jpg'
import { NavLink, Redirect } from 'react-router-dom'

export default function Login(props) {

    const [id, setId] = useState(null);
    const [pw, setPw] = useState(null);

    const [error, setError] = useState("")

    const [redirect, setRedirect] = useState("")

    function send() {
        window.api.get("asynchronous-get", 'user', {"email":id, "pw":pw}).then(result => {
            (result && result.length == 1) 
                ? setRedirect(<Redirect to={ROUTES.HOME} />) 
                : setError("Une erreure s'est produite, veuillez vérifier votre e-mail et mot de passe")
        })
    }

    function handleClickConnexion() {
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
                        <p>
                            Sinon, vous pouvez aller à l' <NavLink to={ROUTES.REGISTER}>inscription</NavLink>
                        </p>
                    </div>
                    <div className="form">
                        <p>{ error }</p>
                        <div className="form-group">
                            <label htmlFor="id">E-mail</label>
                            <input type="text" name="id" id="id" 
                            placeholder="Veuillez taper ici votre adresse e-mail" 
                            onChange={ event => setId(event.target.value) } />
                        </div>
                        <div className="form-group">
                            <label htmlFor="pw">Mot de passe</label>
                            <input type="password" name="pw" id="pw" 
                                placeholder="Veuillez taper ici votre mot de passe"
                                onChange={ event => setPw(event.target.value) } />
                        </div>
                            <button onClick={handleClickConnexion}>Connexion</button>
                    </div>
                </div>
            </div>
            { redirect }
        </div>
    )
}
