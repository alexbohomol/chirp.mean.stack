var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');

//temporary data store
var users = {};

module.exports = function(passport){

    passport.serializeUser(function(user, done) {

        console.log('Serializing user:', user.username);
        return done(null, user.username);
    });

    passport.deserializeUser(function(username, done) {

        console.log('Deserializing user:', username);
        return done(null, users[username]);
    });

    passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {

            var msg = '';

            if(!users[username]){
                msg = 'User Not Found with username: ' + username;
                console.log(msg);
                return done(msg, false);
            }

            if(!isValidPassword(users[username], password)){
                msg = 'Invalid password for: ' + username;
                console.log(msg);
                return done(msg, false);
            }

            msg = 'Sucessfully authenticated: ' + username;
            console.log(msg);
            return done(null, users[username]);
        }
    ));

    passport.use('signup', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {

            var msg = '';

            if (users[username]){
                msg = 'User already exists with username: ' + username;
                console.log(msg);
                return done(msg, false);
            }

            //store user in memory
            users[username] = {
                username: username,
                password: createHash(password)
            }

            msg = 'Registration successful for: ' + username;
            console.log(msg);
            return done(null, users[username]);
        })
    );

    var isValidPassword = function(user, password){

        return bCrypt.compareSync(password, user.password);
    };

    var createHash = function(password){

        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };
};
