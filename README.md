## The name of the project
Cumulus

## Names of the team members
Heather, Annalise, Ron, Katie

## A description of the project
This app lets users search for a location and returns weather data. User can save the tile to their favorites.

## The overall problem domain and how the project solves those problems
Creating a mobile weather app for travel-minded users.

## Versioning
**Back end**
- 0.0.1 - Load seed data
- 0.0.2 - endpoints rendering
- 0.0.3 - search endpoint added

**Front end**
- 0.0.1 - Sign In
- 0.0.2 - Sign Up
- 0.0.3 - Nav Links added
- 0.0.4 - Display search results 
- 0.0.5 - Redirect to favorite page
- 0.0.6 - Render favorites page
- 0.0.7 - Redirect favorites page
- 0.0.8 - Delete and favorite functions working
- 0.0.9 - Redirect button from detail page
- 1.0.0 - App functioning working
- 1.1.0 - Add styles for desktop and mobile view

## A list of any libraries, frameworks, or packages that your application requires in order to properly function
- Superagent
- Express
- Cors
- React router
- Jest

## Instructions that the user may need to follow in order to get your application up and running on their own computer
Deploy to netlify and register for a Weatherbit API key.

## Clearly defined API endpoints with sample responses

```js
// GET all weather tiles endpoint
app.get('/api/weather');

//Sample response
const expectWeather = [{
      location: '',
      state_code: '',
      country_code: '',
      lat: '',
      lon: '',
      id: 2,
      user_id: 2
    }];

// GET weather tile by id (detail page) endpoint
app.get('/api/weather/:id')

//Sample response
const expectWeather = [{
      location: '',
      state_code: '',
      country_code: '',
      lat: '',
      lon: '',
      id: 2,
      user_id: 2
    }];

// SEARCH endpoint
app.get('/api/search/')

//Sample response
const expectWeather = [{
      location: '',
      state_code: '',
      country_code: '',
      lat: '',
      lon: '',
      id: 2,
    }];

// POST endpoint
app.post('/api/weather')

//Sample response
const expectWeather = [{
      location: '',
      state_code: '',
      country_code: '',
      id: 2,
    }];

// DELETE endpoint
app.delete('/api/weather/:id')

```

## Clearly defined database schemas

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(256) NOT NULL,
    hash VARCHAR(512) NOT NULL
);  

CREATE TABLE weather (
    id SERIAL PRIMARY KEY NOT NULL,
    location VARCHAR(512) NOT NULL,
    state_code VARCHAR(512) NOT NULL,
    country_code VARCHAR(5) NOT NULL,
    lat VARCHAR(512) NOT NULL,
    lon VARCHAR(512) NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id)
);
```

## Photo Credit
https://www.pexels.com/photo/seaside-994605/
Fabian Wiktor

## Country Data Source
https://github.com/getprove/node-country-codes