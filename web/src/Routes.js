import React from 'react';
import {Router} from '@reach/router'
import App from "./App";

const About = () => <h1>Coming soon!</h1>;

function Routes() {
    return (
        <Router>
            <App path="/"/>
            <About path="about"/>
        </Router>
    );
}

export default Routes;
