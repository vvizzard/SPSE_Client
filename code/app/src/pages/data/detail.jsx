import React, {useState, useEffect} from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { MultiSelect } from "react-multi-select-component";
import CONST from "Constants/general";

export default function Detail(props) {

    const params = useParams()

    const [responses, setResponses] = useState([])
    const [responseToShow, setResponseToShow] = useState([])
    const [responseHtml, setResponseHtml] = useState([])
    
    const [annee, setAnnee] = useState(2019)
    const [annees, setAnnees] = useState([])

    function loadDate() {
        let years = []
        const today = parseInt(new Date().getFullYear());
        for (let index = today; index > 2018; index--) {
            years.push(index);
        }
        setAnnees(years)
    }
    
    function getData() {
        console.log("params");
        console.log(params);
        window.api.getTrans('asynchronous-get-trans','reponse', {id:params.id, level: "district", date: annee}).then(result => {
            console.log("data response : ___________");
            console.log(result);
            setResponses(result[0]);
            let rts = {};
            responses.map(e=>{
                if(e.question_mere_id==null) {
                    rts["id_"+e.question] = [];
                    rts["id_"+e.question].push(e);
                } else {
                    rts["id_"+e.question_mere_id].push(e);
                }
            });
            console.log("new response : ");
            console.log(rts);
            setResponseToShow(rts);
            showResp(Object.values(rts));
        })
    }

    function showResp(arr) {
        let valiny = [];
        arr.map(e => {

            valiny.push(<div>
                <h3 className="question_princ">
                    {e[0].question_label +" : "+e[0].reponse +e[0].unite}
                </h3>
            </div>)

            let head = [];
            let bodyTd = [];
            let body = [];

            let breakPoint = 0;
            
            for (let i = 1; i < e.length; i++) {
                if(i>1 && (e[i+1] && e[i+1].is_principale==1)) {
                    breakPoint = i;
                }
                head.push(e[i].question_label);
                bodyTd.push(
                    <td key={ 'qb_'+e[i].question_label+'_'+i }>
                        {e[i].reponse}
                    </td>
                );
                if(i%breakPoint==0 || i+1==e.length) {
                    body.push (
                        <tr key={"rsp_"+e[i].question_label+i}>{bodyTd.map(e=>{return e})}</tr>
                    );
                    bodyTd = [];
                }
            }

            valiny.push(
                <table className="table">
                    <thead>
                        <tr>{[...new Set(head)].map((emt, i)=>{
                            return (
                                <th key={ 'qh_'+emt+'_'+i }>
                                    {emt}
                                </th>
                            )
                        })}</tr>
                    </thead>
                    <tbody>
                        {body.map(emt=>{return emt})}
                    </tbody>
                </table>
            )
        });
        setResponseHtml(valiny);
    }

    function updateData(date) {
        window.api.getTrans('asynchronous-get-trans','reponse', {id:params.id, level: CONST.LEVEL_DISTRICT, date: date}).then(result => {
            console.log("data response : ___________");
            console.log(result);
            setResponses(result)
        })
    }

    const handleOnChangeAnnee = (val) => {
        setAnnee(val);
        updateData(val);
    }

    useEffect(() => {
        loadDate()
        getData()
    }, [responses.length])

    

    return (
        <div className="Users">
            <div className="container">
                <div className="head">
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
                </div>
                <div className="component">
                    <div className="awaiting">
                        <div className="head-filter">
                            <h2>Détail</h2>
                            <div className="form-group">
                                <label htmlFor="">Année : </label>
                                <select name="" id="" value={annee} 
                                        onChange={ event => handleOnChangeAnnee(event.target.value) }>
                                    {annees && annees.map(e => {
                                        return <option value={e}>{e}</option>
                                    })}
                                </select>
                                {/* <input type="text" /> */}
                            </div>
                        </div>
                        <br />
                        
                        {/* <h3 className="question_princ">
                            {
                                responseToShow["id_1"]&&responseToShow["id_1"][0]
                                    ?responseToShow["id_1"][0].question_label
                                        +" : "+responseToShow["id_1"][0].reponse
                                        +responseToShow["id_1"][0].unite
                                    :""
                            }
                        </h3>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Label</th>
                                    <th>Question</th>
                                    <th className="t-right">Réponse</th>
                                </tr>
                            </thead>
                            <tbody>
                                { responses && responses.map((e, i) => {
                                    return <tr key={ 'body_'+'tr'+'_'+i }>
                                        <td>{ e.question_label + " ( " + e.unite + " )" }</td>
                                        <td>{ e.qst }</td>
                                        <td className="t-right">{ e.reponse }</td>
                                    </tr>
                                }) }
                            </tbody>
                        </table> */}

                        {responseHtml && responseHtml.map(e => {
                            return e
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
