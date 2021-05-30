const supertest = require('supertest');
const app = require('../app');

jest.setTimeout(15000);

describe('integration - vendors', function() {    
    describe('vendor sets the status(isOnline) of their van to true', function() {

        test('check if the status set successfully', async function() {
            // test POST vendor/account
            await supertest(app)
                .post('/vendor/park')
                .send({ "userId": "60b287fda745ad00153f0421",
                        "isOnline": true,
                        "location": [144.9614 ,-37.7963],
                        "textAddress": "Stop 5"
                }).then( (res) => {
                    expect(res.statusCode).toBe(200)
                    expect(res.body.updatedVendor.isOnline).toEqual(true)
                });
        })
    })

    describe('vendor sets the status(isOnline) of their van to false', function() {
        test('check if the status set successfully', async function() {
            // test POST vendor/account
            await supertest(app)
                .post('/vendor/park')
                .send({ "userId": "60b287fda745ad00153f0421",
                        "isOnline": false
                }).then( (res) => {
                    expect(res.statusCode).toBe(200)
                    expect(res.body.updatedVendor.isOnline).toEqual(false)
                });
        })
        
    })
})