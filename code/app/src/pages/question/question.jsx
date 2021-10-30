import React, {useState, useEffect} from 'react'
import { NavLink } from 'react-router-dom'

export default function Question(props) {

    const [questions, setQuestions] = useState([]);
    const [questionsa, setQuestionsa] = useState([]);
    const [questionsv, setQuestionsv] = useState([]);

    const [awaiting, setAwaiting] = useState([]);
    const [validated, setValidated] = useState([]);

    function updateUser(questions) {
        // var ua = [];
        // var uv = [];
        // setQuestions(questions);
        // questions.forEach(user => {
        //     user.validate === 1 ? uv.push(user):ua.push(user)
        // });
        
        // setAwaiting(new Array(ua.length).fill(false))
        // setValidated(new Array(uv.length).fill(false))
        // setQuestionsa(ua);
        // setQuestionsv(uv);
    }
    
    function getQuestions() {
        window.api.get('asynchronous-get','question').then(result => {
            setQuestions(result)
            let option = [];
            result.forEach((element, idx) => {
                option.push({label: element.label, value: element.id, index:idx})
            });
        })
    }

    function validate(ids, val) {
        window.api.send('asynchronous-validate', 'user', ids, val).then(res => {
            updateUser(res)
        })
    }

    useEffect(() => {
        getQuestions()
    }, [questions.length])

    const handleOnChange = (tableValidated, position) => {
        let temp = tableValidated?validated:awaiting
        const updatedTable = temp.map((item, index) => 
            index === position ? !item : item
        )
        tableValidated?setValidated(updatedTable):setAwaiting(updatedTable)
    }

    const handleOnClickValider = () => {
        let ids = []
        awaiting.forEach((value, idx) => {
            if (value) ids.push(questionsa[idx].id)
        });
        validate(ids, 1)
    }

    const handleOnClickRetirer = () => {
        let ids = []
        validated.forEach((value, idx) => {
            if (value) ids.push(questionsv[idx].id)
        });
        validate(ids, 0)
    }

    const set = s => {}

    return (
        <div className="Users Question">
            <div className="container">
                <div className="head">
                    <h1>Question</h1>
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
                    <div className="form">
                        {/* <div className="form-group">
                            <label htmlFor="id">Catégorie</label><br></br>
                            <select onChange={ event => setCategory(event.target.value) } >
                                <option value="">Choisissez la catégorie</option>
                                {
                                    categories && categories.map((cat, idx) => {
                                        return <option value={cat.id}>{cat.label}</option>
                                    })
                                }
                            </select>
                        </div> */}
                        <div className="form-group">
                            <label htmlFor="id">Niveau</label>
                            <input type="text" name="id" id="id" 
                            placeholder="Veuillez taper ici votre nom complet" 
                            onChange={ event => set(event.target.value) } />
                        </div>
                        <div className="form-group">
                            <label htmlFor="id">Fréquence de réponse</label>
                            <input type="email" name="id" id="id" 
                            placeholder="Veuillez taper ici votre adresse e-mail" 
                            onChange={ event => set(event.target.value) } />
                        </div>
                        <div className="form-group">
                            <label htmlFor="id">Indicateur ciblé</label>
                            <input type="phone" name="id" id="id" 
                            placeholder="Veuillez taper ici votre numéro de téléphone" 
                            onChange={ event => set(event.target.value) } />
                        </div>
                        <div className="form-group">
                            <label htmlFor="id">Question principale ciblée</label>
                            <input type="phone" name="id" id="id" 
                            placeholder="Veuillez taper ici votre numéro de téléphone" 
                            onChange={ event => set(event.target.value) } />
                        </div>
                        <div className="form-group">
                            <label htmlFor="id">Type de réponse (texte, nombre, date, ...)</label>
                            <input type="phone" name="id" id="id" 
                            placeholder="Veuillez taper ici votre numéro de téléphone" 
                            onChange={ event => set(event.target.value) } />
                        </div>
                        <div className="form-group">
                            <label htmlFor="id">Unité</label>
                            <input type="phone" name="id" id="id" 
                            placeholder="Veuillez taper ici votre numéro de téléphone" 
                            onChange={ event => set(event.target.value) } />
                        </div>
                        <div className="form-group">
                            <label htmlFor="id">Designation</label>
                            <input type="phone" name="id" id="id" 
                            placeholder="Veuillez taper ici votre numéro de téléphone" 
                            onChange={ event => set(event.target.value) } />
                        </div>
                        <div className="form-group">
                            <label htmlFor="id">Question</label>
                            <input type="phone" name="id" id="id" 
                            placeholder="Veuillez taper ici votre numéro de téléphone" 
                            onChange={ event => set(event.target.value) } />
                        </div>
                        {/* <NavLink to="/questions"> */}
                            {/* <button disabled={ disabled } onClick={handleInscription}>S'inscrire</button> */}
                            <button >S'inscrire</button>
                        {/* </NavLink> */}
                        
                    </div>
                </div>
            </div>
        </div>
    )
}
