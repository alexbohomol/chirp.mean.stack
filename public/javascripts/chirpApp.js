var app = angular.module('chirpApp', ['ngRoute', 'ngResource', 'ngCookies']).run(function ($http, $rootScope, AuthService) {

    $rootScope.userContext = AuthService.currentContext();

    AuthService.signout(function (resp) {
        
        $rootScope.userContext = AuthService.currentContext();
    });
});

app.factory('AuthService', function ($http, $cookieStore) {
    
    return {

        signin: function (credentials, callback) {
            
            $http.post('/auth/login', credentials).success(function (resp) {
                
                if (resp.state == 'success') {
                    $cookieStore.put('usercontext', resp);
                    callback(resp);
                } else {
                    $cookieStore.remove('usercontext');
                    callback(resp);
                };
            });
        },

        signup: function (credentials, callback) {
            
            $http.post('/auth/signup', credentials).success(function (resp) {
                
                if (resp.state == 'success') {
                    $cookieStore.put('usercontext', resp);
                    callback(resp);
                } else {
                    $cookieStore.remove('usercontext');
                    callback(resp);
                };
            });
        },

        signout: function (callback) {
            
            $http.get('/auth/signout').success(function (resp) {

                $cookieStore.remove('usercontext');
                callback(resp);
            });
        },

        currentContext: function () {

            var stored = $cookieStore.get('usercontext');

            console.log(stored);

            if (stored) {

                return {
                    authenticated: true,
                    username: stored.user.username
                };
            }

            return {
                authenticated: false,
                username: ''
            };
        }
    };
});

app.config(function($routeProvider){
    $routeProvider
        .when('/', {
            templateUrl: 'main.html',
            controller: 'mainController'
        })
        .when('/login', {
            templateUrl: 'login.html',
            controller: 'authController'
        })
        .when('/register', {
            templateUrl: 'register.html',
            controller: 'authController'
        });
});

app.factory('postService', function ($resource) {
    
    return $resource('/api/posts/:id');
});

app.controller('mainController', function($scope, postService, $rootScope){

    $scope.posts = postService.query();
    $scope.newPost = {created_by: '', text: '', created_at: ''};

    $scope.post = function(){

        $scope.newPost.created_by = $rootScope.userContext.username;
        $scope.newPost.created_at = Date.now();
        
        postService.save($scope.newPost, function () {
            
            $scope.posts = postService.query();
            $scope.newPost = {created_by: '', text: '', created_at: ''};
        });
    };
});

app.controller('authController', function($scope, $rootScope, $location, AuthService){

    $scope.user = { username: '', password: '' };
    $scope.error_message = '';

    $scope.login = function() {

        AuthService.signin($scope.user, function (resp) {

            if (resp.state == 'success') {
                $rootScope.userContext = AuthService.currentContext();
                $location.path('/');
            } else {
                $scope.error_message = resp.message;
            };
        });
    };

    $scope.register = function() {

        AuthService.signup($scope.user, function (resp) {

            if (resp.state == 'success') {
                $rootScope.userContext = AuthService.currentContext();
                $location.path('/');
            } else {
                $scope.error_message = resp.message;
            };
        });
    };
});
