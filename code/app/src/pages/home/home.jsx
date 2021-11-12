import React, {useState, useEffect} from 'react';
import { NavLink } from 'react-router-dom';
import  CarteN  from '../../components/CarteN'
import ROUTES from "Constants/routes";
import CONST from "Constants/general";

export default function Home(props) {

    // const animatedComponents = makeAnimated();

    const [questions, setQuestions] = useState([])
    const [headerTotal, setHeaderTotal] = useState([])
    const [header, setHeader] = useState([])
    const [responses, setResponses] = useState([])

    const [annees, setAnnees] = useState([])

    // const [annee, setAnnee] = useState(parseInt(new Date().getFullYear()))
    const [annee, setAnnee] = useState(2019)
    const [niveau, setNiveau] = useState(CONST.LEVEL_DISTRICT)
    
    function loadDate() {
        let years = []
        const today = parseInt(new Date().getFullYear());
        for (let index = today; index > 2018; index--) {
            years.push(index);
        }
        setAnnees(years)
    }

    function getHeader() {
        window.api.get('asynchronous-get','question').then(result => {
            setQuestions(result)
            let option = [];
            result.forEach((element, idx) => {
                // option.push(<Option key={element.id + element.label + element.id} >{element.label}</Option>)
                option.push({label: element.label, value: element.id, index:idx})
            });
            setHeaderTotal(option)
            setHeader(option)
        })
    }
    
    function getData() {
        window.api.getTrans('asynchronous-get-trans','reponse', {level: niveau, date: annee}).then(result => {
            console.log("data response : ___________");
            console.log(result);
            setResponses(result)
        })
    }

    function updateData(level, date) {
        window.api.getTrans('asynchronous-get-trans','reponse', {level: level, date: date}).then(result => {
            console.log("data response : ___________");
            console.log(result);
            setResponses(result)
        })
    }

    useEffect(() => {
        // loadDate()
        // getHeader()
        // getData()
        // loadRegion()
    }, [responses.length])

    const handleOnChangeNiveau = (val) => {
        setNiveau(val);
        updateData(val, annee);
    }

    const handleOnChangeAnnee = (val) => {
        setAnnee(val);
        updateData(niveau, val);
    }

    return (
        <div className="Users Home">
            <div className="container">
                {/* <div className="head">
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
                </div> */}
                <div className="component">
                    <div className="divide3">
                        <div className="card-button">
                            <div className="card-head card-blue">
                                <h3>Rapport mensuel</h3>
                            </div>
                            <div className="card-body">
                                <span>16/22 Régions</span>
                                <p>120/144 Disctricts</p>
                            </div>
                            
                        </div>
                        <div className="card-button">
                            <div className="card-head card-green">
                                <h3>Rapport trimestriel</h3>
                            </div>
                            <div className="card-body">
                                <span>16/22 Régions</span>
                                <p>120/144 Disctricts</p>
                            </div>
                        </div>
                        <div className="card-button">
                            <div className="card-head card-brown">
                                <h3>Rapport annuel</h3>
                            </div>
                            <div className="card-body">
                                <span>16/22 Régions</span>
                                <p>120/144 Disctricts</p>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="menu-button">
                        <div className="left">
                            <div className="item header-btn indicateur-button">
                                <p>Indicateurs</p>
                            </div>
                            <NavLink to={ROUTES.DATA}>
                                <div className="item server-button header-btn">
                                    <p>Base de <br/> données</p>
                                </div>
                            </NavLink>
                        </div>
                        <div className="right">
                            <NavLink to={ROUTES.THEMATIQUE}>
                                <button className="item">
                                    Liste des  Thématiques
                                </button>
                             </NavLink>
                             <NavLink to={ROUTES.INDICATEUR}>
                                <button className="item">
                                    Liste des Indicateurs
                                </button>
                            </NavLink>
                            <NavLink to={ROUTES.QUESTIONS}>
                                <button className="item">
                                    Liste des Questions
                                </button>
                            </NavLink>
                            <NavLink to={ROUTES.USERS}>
                                <button className="item">
                                    Liste des Utilisateurs
                                </button>
                            </NavLink>
                        </div>
                    </div>

                    <hr />

                    <CarteN regionJson={window.api.getMap} />

                </div>
            </div>
        </div>
    )
}
