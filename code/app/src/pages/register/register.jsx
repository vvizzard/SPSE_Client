import React, {useEffect, useState} from 'react'
import ROUTES from "Constants/routes";
import logo from '../../../../assets/img/logo_medd.jpg'
import { NavLink, Redirect } from 'react-router-dom'

export default function Register(props) {
    const [categories, setCategories] = useState([])
    const [districts, setDistricts] = useState([])
    
    const [category, setCategory] = useState("")
    const [nom, setNom] = useState("")
    const [email, setEmail] = useState("")
    const [tel, setTel] = useState("")
    const [pw, setPw] = useState("")
    const [district, setDistrict] = useState("")
    const [validate, setValidate] = useState(0)
    
    const [border, setBorder] = useState("")
    const [disabled, setdisabled] = useState(true)

    const [redirect, setRedirect] = useState("")

    function getCategories() {
        window.api.get("asynchronous-get", 'category').then(result => {
            setCategories(result);
        });
        window.api.get("asynchronous-get", 'district').then(result => {
            setDistricts(result);
        });
    }


    function send() {
        window.api.add(
            "asynchronous-add", 
            'user', 
            {
                "nom":nom, 
                "email":email, 
                "tel":tel, 
                "pw":pw, 
                "category_id": category,
                "district_id": district
            }
        ).then(result => {
            if(result === true) setRedirect(<Redirect to={ROUTES.LOGIN} />) 
        })
    }

    useEffect(() => {
        getCategories();
    }, [categories.length])    

    function handleCpw(cpw) {
        if(pw===cpw) {
            setBorder('border-success');
            setdisabled(false);
        } else {
            setBorder('border-danger');
            setdisabled(true);
        }
    }

    function handleInscription() {
        send()
        // setRedirect(<Redirect to={ROUTES.QUESTION} />)
        // setRedirect(<Redirect to={ROUTES.DATA} />)
        setRedirect(<Redirect to={ROUTES.LOGIN} />)
    }

    return (
        <div className="Login">
            <div className="container">
                <div className="login-card register-card">
                    <div className="description">
                        <img src={logo} className="Medd-logo" alt="logo" />
                        <h1>SPSE</h1>
                        <p>
                            Si vous êtes déjà inscrit, veuillez vous <NavLink to="/">connecter</NavLink>
                        </p>
                    </div>
                    <div className="form">
                        <div className="form-group">
                            <label htmlFor="dist">District</label><br></br>
                            <select id="dist" onChange={ event => setDistrict(event.target.value) } >
                                <option value="">Choisissez le district</option>
                                {
                                    districts && districts.map((cat, idx) => {
                                        return <option value={cat.id}>{cat.label}</option>
                                    })
                                }
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="categorie">Catégorie</label><br></br>
                            <select id="categorie" onChange={ event => setCategory(event.target.value) } >
                                <option value="">Choisissez la catégorie</option>
                                {
                                    categories && categories.map((cat, idx) => {
                                        return <option value={cat.id}>{cat.label}</option>
                                    })
                                }
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="nom">Nom</label><br></br>
                            <input type="text" name="nom" id="nom" 
                            placeholder="Veuillez taper ici votre nom complet" 
                            onChange={ event => setNom(event.target.value) } />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">E-mail</label><br></br>
                            <input type="email" name="email" id="email" 
                            placeholder="Veuillez taper ici votre adresse e-mail" 
                            onChange={ event => setEmail(event.target.value) } />
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">Tel</label><br></br>
                            <input type="phone" name="phone" id="phone" 
                            placeholder="Veuillez taper ici votre numéro de téléphone" 
                            onChange={ event => setTel(event.target.value) } />
                        </div>
                        <div className="form-group">
                            <label htmlFor="pw">Mot de passe</label>
                            <input type="password" name="pw" id="pw" 
                                placeholder="Veuillez taper ici votre mot de passe"
                                className={ border }
                                onChange={ event => setPw(event.target.value) } />
                        </div>
                        <div className="form-group">
                            <label htmlFor="pw">Confirmation du mot de passe</label>
                            <input type="password" name="pw" id="pw" 
                                placeholder="Veuillez retaper le mot de passe pour confirmation"
                                className={ border }
                                onChange={ event => handleCpw(event.target.value) } />
                        </div>
                        {/* <NavLink to="/users"> */}
                            <button disabled={ disabled } onClick={handleInscription}>S'inscrire</button>
                            {/* <button onClick={handleInscription}>S'inscrire</button> */}
                        {/* </NavLink> */}
                        {redirect}
                    </div>
                </div>
            </div>
        </div>
    )
}
