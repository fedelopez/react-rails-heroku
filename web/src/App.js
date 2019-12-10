import React from 'react';
import './App.css';

class App extends React.Component {
    state = {
        conferences: []
    };

    componentDidMount() {
        fetch('/api/conferences')
            .then(response => response.json())
            .then(json => {
                this.setState({conferences: json})
            });
    }

    render() {
        const conferenceElements = this.state.conferences.map((conf) => <li>{conf.name}, {conf.city}</li>);
        return (
            <div>
                <header className="App-header">Upcoming developer conferences in 2020</header>
                <ul>{conferenceElements}</ul>
            </div>
        );
    }
}

export default App;
