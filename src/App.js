import React, {useState} from 'react'
import { Login, Home, Users } from './screen'
import { MemoryRouter as Router, Route, Switch } from 'react-router-dom'
import './App.css'

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path="/" exact render={(props) => (
            <Login log={setUser} />
          )} />
          <Route path="/home" exact render={(props) => (
            <Home user={user} />
          )} />
          <Route path="/users" exact render={(props) => (
            <Users user={user} />
          )} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
