import React from 'react';
import logo from './logo.svg';
import './App.css';
import {BrowserRouter as Router, Switch, Route, Link} from "react-router-dom"
import OtherPage from "./otherPage";
import Fib  from "./fib";


function App() {
  return (
      <Router>
          <header>
              <Link to="/">Home</Link>
              <Link to="/otherpage">Other Page</Link>
          </header>
        <div className="App">
            <Switch>
                <Route path="/" component={Fib}  exact/>
                <Route path="/otherPage" component={OtherPage} exact/>
            </Switch>
        </div>
    </Router>
  );
}
export default App;