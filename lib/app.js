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
app.get('/api/weather', async(req, res) => {
  try {
    const user_id = req.userId;
    
    const data = await client.query(`
    SELECT *
    FROM weather 
    WHERE user_id = $1`, [user_id]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
  
});


app.get('/api/weather/:id', async(req, res) => {
  const weatherId = req.params.id;

  const userId = req.userId;

  const data = await client.query(`
    SELECT * FROM weather
    WHERE weather.id = $1 AND weather.user_id = $2;
    `, [weatherId, userId]);

  res.json(data.rows[0]);
});


app.put('/api/weather/:id', async(req, res) => {
  const weatherId = req.params.id;
  
  try {
    const userId = req.userId;
    
    const newWeather = {
      location: req.body.location,
      country_code: req.body.country_code,
      right_now: req.body.right_now,
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
          right_now=$3, 
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
      newWeather.right_now,
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

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});



app.post('/api/weather', async(req, res) => {
  try {
    const userId = req.userId;

    const newWeather = {
      location: req.body.location,
      country_code: req.body.country_code,
      right_now: req.body.right_now,
      weather_description: req.body.weather_description,
      timezone: req.body.timezone,
      temp: req.body.temp,
      sunrise: req.body.sunrise,
      sunset: req.body.sunset,
      lat: req.body.lat,
      lon: req.body.lon,
      user_id: userId
    };

    const data = await client.query(`
      INSERT INTO weather(location, country_code, right_now, weather_description, timezone, temp, sunrise, sunset, lat, lon, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `,
    [newWeather.location,
      newWeather.country_code,
      newWeather.right_now,
      newWeather.weather_description,
      newWeather.timezone,
      newWeather.temp,
      newWeather.sunrise,
      newWeather.sunset,
      newWeather.lat,
      newWeather.lon,
      userId]
    );

    res.json(data.rows);
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});


app.delete('/api/weather/:id', async(req, res) => {

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
  } catch(e) {

    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;

