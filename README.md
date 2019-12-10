![General Assembly](https://github.com/fedelopez/react-rails-heroku/blob/master/docs/generalassembly.png)

# Deploying a React app served by Rails in Heroku

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

Create a controller named `ApiController` with no actions:

```bash
rails generate controller ApiController
```

Make sure it looks empty as follows:

```ruby
class ApiController < ActionController::API
end
```

Update the `Conferences` controller to return all conferences and extend `ApiController`:

```ruby
class ConferencesController < ApiController
  def get
    render json: Conference.all.as_json, status: 200
  end
end
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

Create a top level `package.json` to instruct Heroku serving the Rails app from React:

```json
{
  "name": "react-rails-heroku",
  "license": "MIT",
  "engines": {
    "node": "10.15.3",
    "yarn": "1.15.2"
  },
  "scripts": {
    "build": "yarn --cwd web install && yarn --cwd web build",
    "deploy": "cp -a web/build/. public/",
    "heroku-postbuild": "yarn build && yarn deploy"
  }
}
```

Create the app in Heroku (make sure you are logged in):

```bash
heroku apps:create
```

Now let's add the buildpacks with the runtimes needed to deploy our app:

```bash
heroku buildpacks:add heroku/nodejs --index 1 --app <APP NAME>
heroku buildpacks:add heroku/ruby --index 2 --app <APP NAME>
```

After running the second command, you should get this message:

```text
Buildpack added. Next release on cryptic-garden-37409 will use:
  1. heroku/nodejs
  2. heroku/ruby
Run git push heroku master to create a new release using these buildpacks.
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

## Routing 

First up, we’re going to tell Rails to pass any HTML requests that it doesn't catch to our React app:

In your `app/controllers/application_controller.rb`, add a `fallback_index_html` method:

Note: Make sure it extends `ActionController::Base` otherwise it won't be able to render properly the html:

```ruby
class ApplicationController < ActionController::Base
  def fallback_index_html
    render :file => 'public/index.html'
  end
end
```

And at the bottom of your `config/routes.rb`:

```ruby
get '*path', to: "application#fallback_index_html", constraints: ->(request) do
  !request.xhr? && request.format.html?
end
```

Now you can add a routing library such as React Router DOM:

```bash
yarn add react-router-dom
```

Create a `Routes` component:

```jsx harmony
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
```

And in `index.js` make sure to render the `Routes.js` instead of the `App.js`:

```jsx harmony
ReactDOM.render(<Routes />, document.getElementById('root'));
```

