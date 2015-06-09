### chirp.mean

This is my own step-by-step implementation of the Chirp app.

#### notes on Module-2:
express installation (local) needed: `npm install express --save`

command to start: `node app.js`


#### notes on Module-3:
typos in both *README* and *Finished*, causing the particular posts API not working (no errors, just `undefined`):
`req.param.id` - must be `req.params.id`

Tests console log:

-- signup
```
Registration successful for: sash
Serializing user: sash
POST /auth/signup 302 698.669 ms - 47
Deserializing user: sash
GET /auth/success 200 18.152 ms - 120

Response we get:
```
{
    state: "success"
    user: {
        username: "sash"
        password: "$2a$10$LpWW..."
    }
}

-- signout
```
Deserializing user: sash
GET /auth/signout 302 6.280 ms - 35
GET / 304 5.930 ms - -

-- login
```
Sucessfully authenticated: sash
Serializing user: sash
POST /auth/login 302 621.706 ms - 47
Deserializing user: sash
GET /auth/success 304 2.906 ms - -