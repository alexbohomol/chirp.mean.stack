### chirp.mean

This is my own step-by-step implementation of the Chirp app.

#### notes on Module-2:
express installation (local) needed: `npm install express --save`

command to start: `node app.js`


#### notes on Module-3:

typos in both *README* and *Finished*, causing the particular posts API not working (no errors, just `undefined`):
`req.param.id` - must be `req.params.id`

Tests console log:

##### signup

```
Registration successful for: sash
Serializing user: sash
POST /auth/signup 302 698.669 ms - 47
Deserializing user: sash
GET /auth/success 200 18.152 ms - 120
```

Response we get:

```
{
    state: "success"
    user: {
        username: "sash"
        password: "$2a$10$LpWW..."
    }
}
```

##### signout

```
Deserializing user: sash
GET /auth/signout 302 6.280 ms - 35
GET / 304 5.930 ms - -
```

##### login

```
Sucessfully authenticated: sash
Serializing user: sash
POST /auth/login 302 621.706 ms - 47
Deserializing user: sash
GET /auth/success 304 2.906 ms - -
```

#### notes on Module-4:

##### Authenticate: Signup || Login

```
POST http://localhost:3000/auth/signup
POST http://localhost:3000/auth/login
{
    state: "success"
    user: {
        _id: "5574885061ed8bbc0ecca392"
        password: "$2a$10$u....."
        username: "alex"
        __v: 0
        created_at: "2015-06-07T18:07:12.684Z"
    }
}
```

##### Posts API

Create a new post

```
POST http://localhost:3000/api/posts
{
    __v: 0
    created_by: "5574885061ed8bbc0ecca392"
    text: "Hi there!"
    _id: "55748d5a61ed8bbc0ecca393"
    created_at: "2015-06-07T18:28:42.099Z"
}
```

Update the existing post

```
PUT http://localhost:3000/api/posts/55748d5a61ed8bbc0ecca393
{
    _id: "55748d5a61ed8bbc0ecca393"
    created_by: "5574885061ed8bbc0ecca392"
    text: "Hi there! Let's chirp!"
    __v: 0
    created_at: "2015-06-07T18:28:42.099Z"
}
```

Get the posts collection

```
GET http://localhost:3000/api/posts
[
    {
        _id: "55748d5a61ed8bbc0ecca393",
        created_by: "5574885061ed8bbc0ecca392",
        text: "Hi there! Let's chirp!",
        __v: 0,
        created_at: "2015-06-07T18:28:42.099Z"
    },
    {
        _id: "5574901c61ed8bbc0ecca394",
        created_by: "5574885061ed8bbc0ecca392",
        text: "Chirp on! :)",
        __v: 0,
        created_at: "2015-06-07T18:40:28.729Z"
    }
]
```

Get the particular post

```
GET http://localhost:3000/api/posts/5574901c61ed8bbc0ecca394
{
    _id: "5574901c61ed8bbc0ecca394",
    created_by: "5574885061ed8bbc0ecca392",
    text: "Chirp on! :)",
    __v: 0,
    created_at: "2015-06-07T18:40:28.729Z"
}
```
