// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom

require('dotenv').config();
const { execSync } = require('child_process');
const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');
describe('routes', () => {
  let token;

  const newWeather = {
    location: '',
    state_code: '',
    country_code: '',
    lat: '',
    lon: '',
    id: 2,
    user_id: 2
  };

  const expectWeather = [{
    location: '',
    state_code: '',
    country_code: '',
    lat: '',
    lon: '',
    id: 2,
    user_id: 2
  }];

  beforeAll(async done => {
    execSync('npm run setup-db');
    client.connect();
    const signInData = await fakeRequest(app)
      .post('/auth/signup')
      .send({
        email: 'jon@user.com',
        password: '1234'
      });
    token = signInData.body.token;
    return done();
  });
  afterAll(done => {
    return client.end(done);
  });
  test('returns a new weather when creating new request', async (done) => {
    const data = await fakeRequest(app)
      .post('/api/weather')
      .send(newWeather)
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(data.body).toEqual(expectWeather);
    done();
  });


  test('returns weather for the user when hitting GET /api/weather', async (done) => {
    const expectWeather = [{
      location: '',
      state_code: '',
      country_code: '',
      lat: '',
      lon: '',
      id: 2,
      user_id: 2
    }];
    const data = await fakeRequest(app)
      .get('/api/weather')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(data.body).toEqual(expectWeather);
    done();
  });

  test('returns weather for the user when hitting GET /api/weather/:id', async (done) => {
    const expectWeather = [{
      location: '',
      state_code: '',
      country_code: '',
      lat: '',
      lon: '',
      id: 2,
      user_id: 2
    }];
    const data = await fakeRequest(app)
      .get('/api/weather')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(data.body).toEqual(expectWeather);
    done();
  });

  test('delete a single weather item for the user when hitting DELETE /api/weather/:id', async (done) => {
    await fakeRequest(app)
      .delete('/api/weather/2')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    const data = await fakeRequest(app)
      .get('/api/weather/')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(data.body).toEqual([]);
    done();
  });

  test('returns weather for the user when hitting GET /api/search/', async (done) => {

    const expectWeather = {
      'location': 'Ashland',
      'country_code': 'US',
      'state_code': 'OR',
      'uv': 2.68429,
      'weather_description': 'Clear sky',
      'timezone': 'America/Los_Angeles',
      'temp': 24,
      'sunrise': '13:32',
      'sunset': '02:52',
      'lat': 42.19458,
      'lon': -122.70948
    };
    const data = await fakeRequest(app)
      .get('/api/search?key=b0dbcac67e29478a8215f76b13d1f54e&city=ashland&state=oregon&country=us')
      .set('Authorization', token)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(data.body).toEqual(expectWeather);
    done();
  });



});

