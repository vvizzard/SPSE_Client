import React, {useState, useEffect} from 'react'
import { NavLink } from 'react-router-dom'

export default function Thematique(props) {

    const [thematiques, setThematiques] = useState([]);

    const [label, setLabel] = useState("")
    const [desc, setDesc] = useState("")

    
    function getThematiques() {
        window.api.get('asynchronous-get','thematique').then(result => {
            setThematiques(result)
        })
    }

    // function del(id) {
    //     window.api.send('asynchronous-validate', 'user', ids, val).then(res => {
    //         updateUser(res)
    //     })
    // }

    useEffect(() => {
        getThematiques()
    }, [thematiques.length])

    function send() {
        window.api.add(
            "asynchronous-add", 
            'thematique', 
            {
                "label":label, 
                "comment":desc
            }
        ).then(result => {
            // if(result === true) getThematiques() 
            setThematiques(result)
        })
    }

    const handleOnClickRetirer = () => {
        
    }

    function handleClickAjouter() {
        send()
    }

    return (
        <div className="Users Thematique">
            <div className="container">
                <div className="head">
                    <h1>Thématiques</h1>
                    <div className="track">
                        <ul>
                            <li className="track-item">
                                <NavLink to="/home">Accueil</NavLink>
                            </li>
                            &#60;
                            <li className="track-item">Thématiques</li>
                        </ul>
                    </div>
                </div>
                <div className="component">
                    <div className="awaiting">
                        <h2>Liste des thématiques</h2>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Nom</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {thematiques && thematiques.map((user, idx) => {
                                    return <tr key={'users_awaiting_list_'+idx}>
                                        <td key={'users_awaiting_n'+idx}>
                                            {user.id}
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
                        <h2>Ajouter un nouveau thématique</h2>
                        <div className="form">
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
