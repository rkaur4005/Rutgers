/*global define, angular, $, Modernizr, console, localforage, sessionStorage, localStorage*/
(function (angular) {
    'use strict';
    angular
        .module('egyanApp.account', [])
        .service('Auth', [function () {
            return {
                logout: function () {
                    sessionStorage.clear();
                    localStorage.clear();
                    localStorage.isloggedin = sessionStorage.isloggedin = false;
                    localStorage.fname = sessionStorage.fname = 'Guest';
                    sessionStorage.isloggedin = false;
                    sessionStorage.fname = 'Guest';
                    sessionStorage.user_type = 0;
                },
                setUser: function (data) {
                    localStorage.user = sessionStorage.user = JSON.stringify(data);
                    localStorage.token = sessionStorage.token = data.token;
                    localStorage.fname = sessionStorage.fname = data.fname;
                    localStorage.lname = sessionStorage.lname = data.lname;
                    localStorage.email = sessionStorage.email = data.email || '';
                    localStorage.phonenumber = sessionStorage.phonenumber = data.phone || '';
                    localStorage.gender = sessionStorage.gender = data.gender || 'Unknown';
                    localStorage.picture = sessionStorage.picture = data.profilePicture || 'http://placehold.it/100x100';
                    localStorage.isloggedin = sessionStorage.isloggedin = true;
                    localStorage.user_type = sessionStorage.user_type = data.usertype; //type 3 is teacher type 5 is student
                    localStorage.internalid = sessionStorage.internalid = data.internalid;
                },
                authorize: function (access) {
                    var isloggedin = sessionStorage.isloggedin;
                    if (!isloggedin) {
                        isloggedin = localStorage.isloggedin;
                    }
                    if (access[0] !== 'V' && isloggedin === 'true') {
                        return true;
                    } else if (access[0] === 'V') {
                        return true;
                    } else {
                        return false;
                    }
                },
                isLoggedin: function () {
                    var isloggedin = sessionStorage.isloggedin;
                    if (!isloggedin) {
                        isloggedin = localStorage.isloggedin;
                    }
                    return (isloggedin && isloggedin === 'true') ? true : false;
                },
                getName: function () {
                    var fullname = '';
                    if (sessionStorage.fname || sessionStorage.lname) {
                        fullname = sessionStorage.fname + ' ' + sessionStorage.lname;
                        return $.trim(fullname);
                    }
                    if (localStorage.fname || localStorage.lname) {
                        fullname = localStorage.fname + ' ' + localStorage.lname;
                        return $.trim(fullname);
                    }
                    return 'Guest';
                },
                getFname: function () {
                    var fname = sessionStorage.fname;
                    if (!fname) {
                        fname = localStorage.fname;
                    }
                    return fname;
                },
                getLname: function () {
                    var lname = sessionStorage.lname;
                    if (!lname) {
                        lname = localStorage.lname;
                    }
                    return lname;
                },
                getUserId: function () {
                    var userid = sessionStorage.userid;
                    if (!userid) {
                        userid = localStorage.userid;
                    }
                    return userid;
                },
                getToken: function () {
                    var token = sessionStorage.token;
                    if (!token) {
                        token = localStorage.token;
                    }
                    return token;
                },
                getUserType: function () {
                    var user_type = sessionStorage.user_type;
                    if (!user_type) {
                        user_type = localStorage.user_type;
                    }
                    //console.log('User_type ' + user_type + typeof (user_type));
                    return user_type;
                },
                getEmail: function () {
                    var email = sessionStorage.email;
                    if (!email) {
                        email = localStorage.email;
                    }
                    return email;
                },
               getPhonenumber: function () {
                    var phonenumber = sessionStorage.phonenumber;
                    if (!phonenumber) {
                        phonenumber = localStorage.phonenumber;
                    }
                    return phonenumber;
                },
                getGender: function () {
                    var gender = sessionStorage.gender;
                    if (!gender) {
                        gender = localStorage.gender;
                    }
                    return gender;
                },
                getProfilePicture: function () {
                    var profilePicture = sessionStorage.picture;
                    if (!profilePicture) {
                        profilePicture = localStorage.picture;
                    }
                    return profilePicture;
                },
                getInternalId: function () {
                    var internalid = sessionStorage.internalid;
                    if (!internalid) {
                        internalid = localStorage.internalid;
                    }
                    return internalid;
                }
            };
        }])
        .controller('AccCtrl', ['$window', '$scope', '$rootScope', '$route', '$routeParams', '$timeout', '$location', '$http', 'globalConfig', 'Auth', 'NavItems', function ($window, $scope, $rootScope, $route, $routeParams, $timeout, $location, $http, globalConfig, Auth, NavItems) {
            NavItems.navitems.nav = {login: $location.path() !== '/account/login'};

            $scope.isloggedin = Auth.isLoggedin();

            if ($scope.isloggedin === true) {
                $scope.name = Auth.getName();
            }

            $scope.login = function () {
                var params = {username: $scope.username, password: $scope.password,
                              client_id: globalConfig.client_id,
                              client_secret: globalConfig.client_secret,
                              response_type: 'token',
                              grant_type: 'password',
                              state: 'state',
                              redirect_uri: globalConfig.baseUrl
                             };
                //Autofill workaround start
                if (!params.username || !params.password) {
                    params.username = $.trim($('#username').val());
                    params.password = $.trim($('#password').val());
                }
                //Autofill workaround end
                $http.post(globalConfig.service.auth, $.param(params)).then(function (data) {
                    if (data.data.isSuccess === false) {
                        NavItems.errmsg = data.data.msg;
                    } else if (data.data.isSuccess) {
                        Auth.setUser(data.data);
                        $rootScope.$broadcast('userstate', {});
                        /*$timeout(function () {
                            if (!data.data.tandc) {
                                $location.path('/page/terms');
                            } else {
                                $location.path('/');
                            }
                        }, 500);*/
                        $location.path('/');
                    } else {
                        NavItems.errmsg = 'Error logging user in';
                    }
                });
            };
            $scope.logout = function () {
                $rootScope.$broadcast('logout', {});
            };

            $rootScope.$on('userstate', function () {
                $scope.isloggedin = Auth.isLoggedin();
                $scope.name = Auth.getName();
            });

        }])
        .controller('ProfileCtrl', ['$window', '$scope', '$rootScope', '$route', '$routeParams', '$timeout', '$location', '$http', 'globalConfig', 'Auth', 'NavItems', function ($window, $scope, $rootScope, $route, $routeParams, $timeout, $location, $http, globalConfig, Auth, NavItems) {
            $scope.profile = {
                internalid: Auth.getInternalId(),
                fname: Auth.getFname(),
                lname: Auth.getLname(),
                gender:Auth.getGender(),
                email: Auth.getEmail(),
                phone: Auth.getPhonenumber(),
                profilePicture: Auth.getProfilePicture()
            };
            $scope.updateprofile = function () {
                var fd = new FormData();
                fd.append('internalid', $scope.profile.internalid);
                fd.append('email', $scope.profile.email);
                fd.append('fname', $scope.profile.fname);
                fd.append('lname', $scope.profile.lname);
                fd.append('gender', $scope.profile.gender);
                fd.append('phone', $scope.profile.phone);
                fd.append('picture', $scope.picture);
                $http.post(globalConfig.service.elearning + globalConfig.service.profile, fd, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                }).then(function (data) {
                    if (data.data && data.data.success) {
                        $scope.profile.profilePicture = data.data.profilepicture + '?_=' + Math.random();
                        $scope.profile.token = Auth.getToken();
                        $scope.profile.usertype = Auth.getUserType();
                        Auth.setUser($scope.profile);
                        NavItems.errmsg = data.data.message;
                    } else {
                        NavItems.errmsg = 'Error creating profile';
                    }
                }, function () {
                    NavItems.errmsg = 'Error creating profile.';
                });
            };
        }]);
}(angular));
