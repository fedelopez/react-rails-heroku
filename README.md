# README

## Setting up the apps

Create a Rails app, no test files, API mode and targeting PostgreSQL:

```bash
rails new react-rails-heroku -T --api --database=postgresql
```

Navigate inside the newly created app and generate a new React app on a folder named `web`:

```bash
cd react-rails-heroku
npx create-react-app web
```

## Setting up the backend

Create a Rails model to persist information about conferences in 2020:

```bash
rails generate model Conference name:string city:string url:string date_start:date date_end:date
```

Update the `seeds.rb` with the following entries:

```ruby
Conference.create(name: 'JSCONF Hawaiʻi', url: 'https://www.jsconfhi.com', city: 'Waikiki', date_start: '05/02/2020', date_end: '07/02/2020')
Conference.create(name: 'Codemania', url: 'https://codemania.io', city: 'Auckland', date_start: '01/05/2020', date_end: '')
Conference.create(name: 'ElixirConf', url: 'https://codemania.io', city: 'Aurora', date_start: '02/09/2020', date_end: '05/09/2020')
Conference.create(name: 'SpringOne', url: 'https://springoneplatform.io', city: 'Seattle', date_start: '21/09/2020', date_end: '24/09/2020')
Conference.create(name: 'WeAreDevelopers', url: 'https://www.wearedevelopers.com/events/world-congress', city: 'Berlin', date_start: '28/05/2020', date_end: '29/05/2020')
Conference.create(name: 'Strange Loop', url: 'https://www.thestrangeloop.com', city: 'St. Louis', date_start: '12/09/2020', date_end: '14/09/2020')
Conference.create(name: 'JBCNConf', url: 'https://www.jbcnconf.com/2020', city: 'Barcelona', date_start: '06/07/2020', date_end: '08/07/2020')
Conference.create(name: 'ReactConf AU', url: 'https://reactconfau.com', city: 'Sydney', date_start: '27/08/2020', date_end: '28/08/2020')
```

Create the DB, run the migration and seed it:
```bash
rails db:create && rails db:migrate && rails db:seed
```

Create a controller `Conferences` with a `get` action:
```bash
rails generate controller Conferences get
```

Update the generated route in `routes.rb` to the following:
```ruby
get '/api/conferences', to: 'conferences#get'
```

## Setting up the frontend

```jsx harmony
import React from 'react';
import './App.css';

class App extends React.Component {
    state = {
        conferences: []
    };

    componentDidMount() {
        fetch('/conferences')
            .then(response => response.json())
            .then(json => {
               this.setState({conferences: json})
            });
    }

    render() {
        const conferenceElements = this.state.conferences.map((conf) => <li>{conf.name}, {conf.city}</li>);
        return (
            <div className="App">
                <header className="App-header">Upcoming developer conferences in 2020</header>
                <ul>{conferenceElements}</ul>
            </div>
        );
    }
}

export default App;
```

## Proxying to the Rails app from React

Add the following line to the `package.json`

```text
"proxy": "http://localhost:3001"
```

This will instruct the React local web server to proxy all the calls to the address provided.

## Starting both servers at the same time

Create a file on the project root folder named `Procfile.dev` with the following contents:

```text
web: PORT=3000 yarn --cwd web start
backend: bundle exec rails s -p 3001
```

Notice how we are telling to start Rails on port 3001, now all the requests form the React app
will be redirected to the backend!

Start both apps with the following command:

```bash
heroku local -f Procfile.dev
```

Create a `Procfile` for production`. It will tell Heroku how to run the Rails app:

```text
web: bundle exec rails s
release: bin/rake db:migrate
```

Note the `release` command, this is ran by Heroku just before a new release of the app is deployed, and we will use it 
to make sure our DB is migrated.

Create the app in Heroku (make sure you are logged in):

```bash
heroku apps:create
```

Now let's add the buildpacks with the runtimes needed to deploy our app:

```bash
heroku buildpacks:add heroku/nodejs
heroku buildpacks:add heroku/ruby
```

```bash
git push heroku master
```

```bash
heroku run rake db:seed
```

```bash
heroku open
```