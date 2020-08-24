const client = require('../lib/client');
// import our seed data:
const weather = require('./weather.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      weather.map(weather_search => {
        return client.query(`
                    INSERT INTO weather (
                      location, 
                      country_code, 
                      right_now, 
                      weather_description, 
                      timezone, 
                      temp, 
                      sunrise, 
                      sunset, 
                      lat, 
                      lon, 
                      user_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
                `,
        [
          weather_search.location, 
          weather_search.country_code, 
          weather_search.current_time, 
          weather_search.weather_description, 
          weather_search.timezone, 
          weather_search.temp, 
          weather_search.sunrise, 
          weather_search.sunset, 
          weather_search.lat, 
          weather_search.lon, 
          user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
