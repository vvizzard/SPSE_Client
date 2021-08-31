import React from 'react'
import logo from '../img/logo_medd.jpg';

export default function Home(props) {
    return (
        <div className="Login">
            <div className="container">
                <div className="login-card">
                <div className="description">
                    <img src={logo} className="Medd-logo" alt="logo" />
                    <h1>{props.user.id}</h1>
                    <p>Bienvenue, veuillez vous connecter {props.user.pw}</p>
                </div>
                <div className="form">
                    <div className="form-group">
                    <label htmlFor="id">Nom</label><br></br>
                    <input type="text" name="id" id="id" 
                        placeholder="Veuillez taper ici votre nom" />
                    </div>
                    <div className="form-group">
                    <label htmlFor="pw">Mot de passe</label>
                    <input type="password" name="pw" id="pw" 
                        placeholder="Veuillez taper ici votre mot de passe" />
                    </div>
                    <button>Connexion</button>
                </div>
                </div>
            </div>
        </div>
    )
}
