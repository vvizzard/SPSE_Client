import React, {useState, useEffect} from 'react'
import { NavLink } from 'react-router-dom'

export default function Indicateur(props) {

    const [indicateurs, setIndicateurs] = useState([]);
    const [thematiques, setThematiques] = useState([]);
    const [arrangedThematique, setArrangedThematique] = useState({})

    const [label, setLabel] = useState("")
    const [desc, setDesc] = useState("")
    const [thematique, setThematique] = useState("")

    
    function getIndicateurs() {
        window.api.get('asynchronous-get','indicateur').then(result => {
            setIndicateurs(result)
        })
        window.api.get('asynchronous-get','thematique').then(result => {
            setThematiques(result)
            let temp = {};
            result.map(e => {
                temp["id_"+e.id] = e;
            });
            setArrangedThematique(temp);
        })
    }

    // function del(id) {
    //     window.api.send('asynchronous-validate', 'user', ids, val).then(res => {
    //         updateUser(res)
    //     })
    // }

    useEffect(() => {
        getIndicateurs()
    }, [indicateurs.length])

    function send() {
        window.api.add(
            "asynchronous-add", 
            'indicateur', 
            {
                "label":label, 
                "comment":desc,
                "thematique_id":thematique
            }
        ).then(result => {
            setIndicateurs(result)
        })
    }

    const handleOnClickRetirer = () => {
        
    }

    function handleClickAjouter() {
        send()
    }

    return (
        <div className="Users Thematique Indicateur">
            <div className="container">
                <div className="head">
                    <h1>Indicateurs</h1>
                    <div className="track">
                        <ul>
                            <li className="track-item">
                                <NavLink to="/home">Accueil</NavLink>
                            </li>
                            &#60;
                            <li className="track-item">Indicateur</li>
                        </ul>
                    </div>
                </div>
                <div className="component">
                    <div className="awaiting">
                        <h2>Liste des indicateurs</h2>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Thématique</th>
                                    <th>Nom</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {indicateurs && indicateurs.map((user, idx) => {
                                    return <tr key={'users_awaiting_list_'+idx}>
                                        <td key={'users_awaiting_n'+idx}>
                                            {user.id}
                                        </td>
                                        <td key={'users_awaiting_tt'+idx}>
                                            {
                                                (arrangedThematique && arrangedThematique["id_"+user.thematique_id])
                                                    ?arrangedThematique["id_"+user.thematique_id].label
                                                    :"" 
                                            }
                                        </td>
                                        <td key={'users_awaiting_e'+idx}>
                                            {user.label}
                                        </td>
                                        <td key={'users_awaiting_t'+idx}>
                                            {user.comment}
                                        </td>
                                    </tr>
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="add">
                        <h2>Ajouter un nouveau indicateur</h2>
                        <div className="form">
                            <div className="form-group">
                                <label htmlFor="dist">Thématiques</label>
                                <select id="dist" onChange={ event => setThematique(event.target.value) } >
                                    <option value="">Choisissez la indicateur</option>
                                    {
                                        thematiques && thematiques.map((cat, idx) => {
                                            return <option key={"opt_key_"+cat.id} value={cat.id}>{cat.label}</option>
                                        })
                                    }
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="nom">Nom</label>
                                <input type="text" name="nom" id="nom" 
                                placeholder="Veuillez taper ici la designation" 
                                onChange={ event => setLabel(event.target.value) } />
                            </div>
                            <div className="form-group">
                                <label htmlFor="desc">Description</label>
                                <input type="text" name="desc" id="desc" 
                                placeholder="Veuillez taper ici la description" 
                                onChange={ event => setDesc(event.target.value) } />
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
