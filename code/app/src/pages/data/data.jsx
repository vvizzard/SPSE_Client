import React, {useState, useEffect} from 'react';
import { NavLink } from 'react-router-dom';
import { MultiSelect } from "react-multi-select-component";
import ROUTES from "Constants/routes";
import CONST from "Constants/general";
import Table from '../../components/Table'

export default function Data(props) {

    // const animatedComponents = makeAnimated();

    const [questions, setQuestions] = useState([])
    const [headerTotal, setHeaderTotal] = useState([])
    const [header, setHeader] = useState([])
    const [responses, setResponses] = useState([])

    const [annees, setAnnees] = useState([])

    const [column, setColumn] = useState([
        {
          Header: ' ',
          columns: [
            {
              Header: 'ID',
              accessor: 'id',
            },
            {
              Header: 'Nom',
              accessor: 'label',
            },
            {
              Header: 'Description',
              accessor: 'comment',
            },
          ],
        }
      ])
    const [data, setData] = useState([{id:1}])

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
            makeHeader()
        })
    }

    function updateData(level, date) {
        window.api.getTrans('asynchronous-get-trans','reponse', {level: level, date: date}).then(result => {
            console.log("data response : ___________");
            console.log(result);
            setResponses(result)
            makeHeader(header, result)
        })
    }

    function makeHeader(hd = header, rsp = responses) {
        var cl = [{
            Header: niveau ,
            accessor: 'acc0',
            Cell: e => {
                let splited = e&&e.value?e.value.split('_'):' _ '
                return niveau===CONST.LEVEL_DISTRICT
                        ?<NavLink to={ROUTES.DATA_DETAIL+"/"+splited[1]}>{ splited[0] }</NavLink>
                        :e.value
            }
        }];
        let lim = 1;
        {hd && questions && hd.map(e => {
            cl.push(
                {
                    Header: questions[e.index].label + '( ' + questions[e.index].unite + ')' ,
                    accessor: 'acc'+lim
                }
            )
            lim++
        })}
        const columns = [{
            Header: ' ',
            columns: cl,
        }]
        console.log("changement de colonne");
        console.log(columns);
        setColumn(columns)

        // Data
        var dt = []
        let pas = 0
        { 
            rsp && rsp.map((e, i) => {
                let vari = {}
                vari['acc0']=e[0].district+'_'+e[0].district_id
                pas++
                {hd && hd.map((q, j) => {
                    vari['acc'+pas] = e[q.index]?e[q.index].reponse:0
                    pas++
                })}
                pas = 0
                dt.push(vari) 
            }) 
        }

        { responses && responses.map((e, i) => {
            let link = niveau===CONST.LEVEL_DISTRICT
                ?<NavLink to={ROUTES.DATA_DETAIL+"/"+e[0].district_id}>{ e[0].district }</NavLink>
                : e[0].district 
            return <tr key={ 'body_'+'tr'+'_'+i }>
                <td>{ link }</td>
                {header && header.map((q, j) => {
                    return <td key={'body'+(e[q.index]?e[q.index].id:'ss')+i+'td'+'_'+j}>{e[q.index]?e[q.index].reponse:0}</td>
                })}
            </tr>
        }) }


        console.log("changement de données");
        console.log(columns);
        console.log(dt);
        setData(dt)
    }

    useEffect(() => {
        loadDate()
        getHeader()
        getData()

    }, [responses.length])

    const handleOnChangeNiveau = (val) => {
        setNiveau(val);
        updateData(val, annee);
    }

    const handleOnChangeAnnee = (val) => {
        setAnnee(val);
        updateData(niveau, val);
    }

    const handleOnChangeHeader = (v) => {
        setHeader(v)
        makeHeader(v)
    }

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
                    <div className="filter">
                        <div className="form-group">
                            <label htmlFor="">Niveau</label>
                            <select value={niveau} 
                                    onChange={ event => handleOnChangeNiveau(event.target.value) }>
                                <option value={CONST.LEVEL_REGION}>Région</option>
                                <option value={CONST.LEVEL_DISTRICT}>District</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="">Année</label>
                            <select name="" id="" value={annee} 
                                    onChange={ event => handleOnChangeAnnee(event.target.value) }>
                                {annees && annees.map(e => {
                                    return <option value={e}>{e}</option>
                                })}
                            </select>
                            {/* <input type="text" /> */}
                        </div>
                        <div>
                            <h1>Choisir les colonnes</h1>
                            {/* <pre>{JSON.stringify(selected)}</pre> */}
                            <MultiSelect
                            options={headerTotal}
                            value={header}
                            onChange={handleOnChangeHeader}
                            labelledBy="Choisir"
                            />
                        </div>
                    </div>
                    <br />
                    <div className="awaiting">
                        <h2>Tableau des données</h2>
                        <br />
                        {/* <table className="table">
                            <thead>
                                <tr>
                                    <th>District</th>
                                    {header && questions && header.map(e => {
                                        return <th 
                                                title={ questions[e.index] && questions[e.index].question?questions[e.index].question:"" }
                                                key={ 'header_'+questions[e.index].label+questions[e.index].id }>
                                            { questions[e.index].label + '( ' + questions[e.index].unite + ')' }
                                        </th>
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                { responses && responses.map((e, i) => {
                                    let link = niveau===CONST.LEVEL_DISTRICT
                                        ?<NavLink to={ROUTES.DATA_DETAIL+"/"+e[0].district_id}>{ e[0].district }</NavLink>
                                        : e[0].district 
                                    return <tr key={ 'body_'+'tr'+'_'+i }>
                                        <td>{ link }</td>
                                        {header && header.map((q, j) => {
                                            return <td key={'body'+(e[q.index]?e[q.index].id:'ss')+i+'td'+'_'+j}>{e[q.index]?e[q.index].reponse:0}</td>
                                        })}
                                    </tr>
                                }) }
                            </tbody>
                        </table> */}

                        <Table columns={column} data={data} />

                        {/* <div className="action">
                            <button className="success btn" onClick={handleOnClickValider}>
                                Valider
                            </button>
                            <button className="danger btn">
                                Supprimer
                            </button>
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    )
}
