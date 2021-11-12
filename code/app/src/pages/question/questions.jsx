import React, {useState, useEffect} from 'react'
import { NavLink } from 'react-router-dom'

export default function Questions(props) {

    const [questions, setQuestions] = useState([]);
    const [indicateurs, setIndicateurs] = useState([]);
    const [arrangedIndicateur, setArrangedIndicateur] = useState({})

    const [question, setQuestion] = useState("")
    const [principale, setPrincipale] = useState("")
    const [type, setType] = useState("")
    const [niveau, setNiveau] = useState("")
    const [frequence, setFrequence] = useState("")
    const [questionCible, setQuestionCible] = useState("")
    const [label, setLabel] = useState("")
    const [desc, setUnite] = useState("")
    const [indicateur, setIndicateur] = useState("")

    
    function getQuestions() {
        window.api.get('asynchronous-get','question').then(result => {
            setQuestions(result)
        })
        window.api.get('asynchronous-get','indicateur').then(result => {
            setIndicateurs(result)
            let temp = {};
            result.map(e => {
                temp["id_"+e.id] = e;
            });
            setArrangedIndicateur(temp);
        })
    }

    // function del(id) {
    //     window.api.send('asynchronous-validate', 'user', ids, val).then(res => {
    //         updateUser(res)
    //     })
    // }

    useEffect(() => {
        getQuestions()
    }, [questions.length])

    function send() {
        var params = {}
        params = {
            "question":question, 
            "is_principale":principale, 
            "field_type":type, 
            "level":niveau, 
            "frequence_resp":frequence, 
            "label":label, 
            "unite":desc,
        }
        indicateur!=""?params.indicateur_id = indicateur:""
        questionCible!=""?params.question_mere_id = questionCible:""
        window.api.add(
            "asynchronous-add", 
            'question', 
            params
        ).then(result => {
            setQuestions(result)
        })
    }

    const handleOnClickRetirer = () => {
        
    }

    function handleClickAjouter() {
        send()
    }

    return (
        <div className="Users Thematique Indicateur Question">
            <div className="container">
                <div className="head">
                    <h1>Questions</h1>
                    <div className="track">
                        <ul>
                            <li className="track-item">
                                <NavLink to="/home">Accueil</NavLink>
                            </li>
                            &#60;
                            <li className="track-item">Question</li>
                        </ul>
                    </div>
                </div>
                <div className="component">
                    <div className="awaiting">
                        <h2>Liste des questions</h2>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Indicateur</th>
                                    <th>Question</th>
                                    <th>Début d'une file</th>
                                    <th>Type de la réponse</th>
                                    <th>Niveau</th>
                                    <th>Fréquence de réponse</th>
                                    {/* <th>Objectif</th> */}
                                    <th>Désignation</th>
                                    <th>Unité</th>
                                    <th>ID question principale relié</th>
                                </tr>
                            </thead>
                            <tbody>
                                {questions && questions.map((user, idx) => {
                                    return <tr key={'users_awaiting_list_'+idx}>
                                        <td key={'users_awaiting_n'+idx}>
                                            {user.id}
                                        </td>
                                        <td key={'users_awaiting_zz'+idx}>
                                            {user.indicateur_id}
                                        </td>
                                        <td key={'users_awaiting_a'+idx}>
                                            {user.question}
                                        </td>
                                        <td key={'users_awaiting_z'+idx}>
                                            {user.is_principale}
                                        </td>
                                        <td key={'users_awaiting_e'+idx}>
                                            {user.field_type}
                                        </td>
                                        <td key={'users_awaiting_f'+idx}>
                                            {user.level}
                                        </td>
                                        <td key={'users_awaiting_d'+idx}>
                                            {user.frequence_resp}
                                        </td>
                                        
                                        {/* <td key={'users_awaiting_q'+idx}>
                                            {user.objectif}
                                        </td> */}
                                        <td key={'users_awaiting_l'+idx}>
                                            {user.label}
                                        </td>
                                        <td key={'users_awaiting_m'+idx}>
                                            {user.unite}
                                        </td>
                                        <td key={'users_awaiting_xx'+idx}>
                                            {user.question_mere_id}
                                        </td>
                                    </tr>
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="add">
                        <h2>Ajouter une nouvelle question</h2>
                        <div className="form">
                            <div className="form-group">
                                <label htmlFor="dist">Indicateurs</label>
                                <select id="dist" onChange={ event => setIndicateur(event.target.value) } >
                                    <option value="">Choisissez l'indicateur</option>
                                    {
                                        indicateurs && indicateurs.map((cat, idx) => {
                                            return <option key={"opt_key_"+cat.id} value={cat.id}>{cat.label}</option>
                                        })
                                    }
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="quest">Question</label>
                                <input type="text" name="quest" id="quest" 
                                placeholder="Veuillez taper ici la question" 
                                onChange={ event => setQuestion(event.target.value) } />
                            </div>
                            <div className="form-group">
                                <label htmlFor="deb_fil">Début d'une file</label>
                                <select id="deb_fil" onChange={ event => setPrincipale(event.target.value) } >
                                    <option value="0">Non</option>
                                    <option value="1">Oui</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="type">Type de réponse</label>
                                <select id="type" onChange={ event => setType(event.target.value) } >
                                    <option value="1">Nombre</option>
                                    <option value="2">Texte</option>
                                    <option value="3">Date</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="niveau">Niveau</label>
                                <select id="niveau" onChange={ event => setNiveau(event.target.value) } >
                                    <option value="1">District</option>
                                    <option value="2">Region</option>
                                    <option value="3">Centrale</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="freq">Fréquence de réponse</label>
                                <input type="number" name="freq" id="freq" 
                                placeholder="Veuillez taper ici la fréquence" 
                                onChange={ event => setFrequence(event.target.value) } />
                            </div>
                            <div className="form-group">
                                <label htmlFor="designation">Designation</label>
                                <input type="désignation" name="designation" id="designation" 
                                placeholder="Veuillez taper ici la désignation" 
                                onChange={ event => setLabel(event.target.value) } />
                            </div>
                            <div className="form-group">
                                <label htmlFor="unite">Unité</label>
                                <input type="text" name="unite" id="unite" 
                                placeholder="Veuillez taper ici l'unité de réponse" 
                                onChange={ event => setUnite(event.target.value) } />
                            </div>
                            <div className="form-group">
                                <label htmlFor="quest_princ_cible">Question principale ciblée si existant</label>
                                <select id="quest_princ_cible" onChange={ event => setQuestionCible(event.target.value) } >
                                    <option value="">Choisissez la question ciblé</option>
                                    {
                                        questions && questions.map((cat, idx) => {
                                            return <option key={"opt_key_"+cat.id} value={cat.id}>{cat.label}</option>
                                        })
                                    }
                                </select>
                            </div>
                            <div>
                                <button onClick={handleClickAjouter}>Ajouter</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
