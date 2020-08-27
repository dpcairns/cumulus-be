const request = require('superagent');
const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this protected route, we get the user's id like so: ${req.userId}`
  });
});


// REQ.userId => always camel case!
app.get('/api/weather', async (req, res) => {
  try {
    const user_id = req.userId;

    const data = await client.query(`
    SELECT *
    FROM weather 
    WHERE user_id = $1`, [user_id]);

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }

});


app.get('/api/weather/:id', async (req, res) => {
  const weatherId = req.params.id;

  const userId = req.userId;

  const data = await client.query(`
  SELECT * FROM weather
  WHERE weather.id = $1
`,
    [weatherId]
  );

  // SELECT * FROM weather
  // WHERE weather.id = $1 AND weather.user_id = $2;
  // `, [weatherId, userId]);
  // const data = await client.query(`

  res.json(data.rows[0]);

});


async function getSearchResults(city, state, country) {

  const response = await request.get(`https://api.weatherbit.io/v2.0/current?key=${process.env.WEATHERBIT_API_KEY}&city=${city}&state=${state}&country=${country}`);

  const userCity = response.body.data[0];
  // const real_time = new Date().getFullYear();
  console.log(userCity);

  return {
    location: userCity.city_name,
    country_code: userCity.country_code,
    state_code: userCity.state_code,
    uv: userCity.uv,
    weather_description: userCity.weather.description,
    timezone: userCity.timezone,
    temp: userCity.temp,
    sunrise: userCity.sunrise,
    sunset: userCity.sunset,
    lat: userCity.lat,
    lon: userCity.lon,
  };

}


app.get('/api/search/', async (req, res) => {

  try {
    const userCity = req.query.city;
    const userState = req.query.state;
    const userCountry = req.query.country;

    const mungedData = await getSearchResults(userCity, userState, userCountry);
    res.json(mungedData);
    console.log(mungedData, 'okkkkkkkkkkkkkkkkk');
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});


app.put('/api/weather/:id', async (req, res) => {
  const weatherId = req.params.id;

  try {
    const userId = req.userId;

    const newWeather = {
      location: req.body.location,
      country_code: req.body.country_code,
      uv: req.body.uv,
      weather_description: req.body.weather_description,
      timezone: req.body.timezone,
      temp: req.body.temp,
      sunrise: req.body.sunrise,
      sunset: req.body.sunset,
      lat: req.body.lat,
      lon: req.body.lon,
    };


    const data = await client.query(`
      UPDATE weather 
        SET 
          location=$1, 
          country_code=$2, 
          uv=$3, 
          weather_description=$4, 
          timezone=$5, 
          temp=$6, 
          sunrise=$7, 
          sunset=$8, 
          lat=$9, 
          lon=$10 
        WHERE weather.id = $11 AND user_id = $12
        RETURNING *
    `, [newWeather.location,
    newWeather.country_code,
    newWeather.uv,
    newWeather.weather_description,
    newWeather.timezone,
    newWeather.temp,
    newWeather.sunrise,
    newWeather.sunset,
    newWeather.lat,
    newWeather.lon,
      weatherId,
      userId]
    );
    res.json(data.rows[0]);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.post('/api/weather', async (req, res) => {
  try {
    const newWeather = {
      location: req.body.location,
      country_code: req.body.country_code,
      state_code: req.body.state_code,
      lat: req.body.lat,
      lon: req.body.lon
    };

    const data = await client.query(`
      INSERT INTO weather(location, country_code, state_code, lat, lon, user_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
      [newWeather.location,
      newWeather.country_code,
      newWeather.state_code,
      newWeather.lat,
      newWeather.lon,
      req.userId]
    );

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});


app.delete('/api/weather/:id', async (req, res) => {

  const weatherId = req.params.id;
  const userId = req.userId;

  try {
    const data = await client.query(`
    DELETE FROM weather 
    WHERE weather.id=$1 
    AND user_id=$2`,
      [weatherId, userId]
    );

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;

