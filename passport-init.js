var mongoose = require('mongoose');
var User = mongoose.model('User');
var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport){

    passport.serializeUser(function(user, done) {

        console.log('Serializing user: ', user.username);
        return done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {

        User.findById(id, function (err, user) {
            console.log('Deserializing user: ', user.username);
            return done(err, user);
        });
    });

    passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {

            User.findOne({ 'username' :  username }, 
                function(err, user) {

                    var msg = '';

                    if (err){
                        console.log('Error on Login: ' + err);
                        return done(err);
                    }

                    if (!user){
                        msg = 'User Not Found with username: ' + username;
                        console.log(msg);
                        return done(msg, false);
                    }

                    if (!isValidPassword(user, password)){
                        msg = 'Invalid password for: ' + user.username;
                        console.log(msg);
                        return done(msg, false);
                    }

                    // User and password both match,
                    // return user from done() method,
                    // which will be treated like success
                    msg = 'Sucessfully authenticated: ' + username;
                    console.log(msg);
                    return done(null, user);
                }
            );
        }
    ));

    passport.use('signup', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {

            User.findOne({ 'username' :  username }, 
                function(err, user) {

                    var msg = '';

                    if (err){
                        console.log('Error in SignUp: ' + err);
                        return done(err);
                    }

                    if (user) {
                        msg = 'User already exists with username: ' + username;
                        console.log(msg);
                        return done(msg, false);
                    }

                    // if there is no user, create the user
                    var newUser = new User();

                    // set the user's local credentials
                    newUser.username = username;
                    newUser.password = createHash(password);

                    // save the user
                    newUser.save(function(err) {
                        
                        if (err){
                            console.log('Error in Saving user: ' + err);  
                            throw err;  
                        }

                        console.log('Registration successful for: ' + newUser.username);
                        return done(null, newUser);
                    });
            });
        })
    );

    var isValidPassword = function(user, password){

        return bCrypt.compareSync(password, user.password);
    };

    var createHash = function(password){

        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };
};
