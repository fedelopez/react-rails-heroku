import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import App from "./App";

const About = () => <h1>Coming soon!</h1>;

function Routes() {
    return (
        <Router>
            <Switch>
                <Route path="/about">
                    <About/>
                </Route>
                <Route exact path="/">
                    <App/>
                </Route>
            </Switch>
        </Router>
    );
}

export default Routes;
