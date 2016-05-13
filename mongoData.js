var MongoClient = require('mongodb').MongoClient,
    settings = require('./config.js'),
    Guid = require('Guid'),
    bcrypt = require("bcrypt-nodejs");

var fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;
var exports = module.exports = {};

MongoClient.connect(fullMongoUrl)
    .then(function (db) {
            var myCollection = db.collection("users");

            // setup your exports!


            exports.createUser = function (userName, password) {
                if (!userName || !password) return Promise.reject("You must provide a username and a password");
                var plainTextPassword = password;
                var hashPassword = bcrypt.hashSync(plainTextPassword);
                return myCollection.find({
                    username: userName
                }).toArray().then(function (listOfUsers) {
                    if (listOfUsers.length === 0)
                        return myCollection.insertOne({
                            _id: Guid.create().toString(),
                            username: userName,
                            encryptedPassword: hashPassword,
                            email: "",
                            currentSessionId: "",
                        }).then(function (newDoc) {
                            return true;
                        });
                   else {
                       return Promise.reject("Username has already existed")};
                })
            };


            exports.createUserbyEmail = function (email) {
                if (!email) return Promise.reject("You must provide an email");
                var plainTextPassword = email;
                var hashPassword = bcrypt.hashSync(plainTextPassword);
                return myCollection.find({
                    username: email
                }).toArray().then(function (listOfUsers) {
                    if (listOfUsers.length === 0)
                        return myCollection.insertOne({
                            _id: Guid.create().toString(),
                            username: email,
                            encryptedPassword: hashPassword,
                            email: email,
                            currentSessionId: "",
                        }).then(function (newDoc) {
                            return newDoc.insertedId;
                        });
                    return Promise.reject("Username has already existed");
                })
            };
            exports.findByEmail = function (email) {
                if (!email) return Promise.reject("You must provide an email");

                return myCollection.find({
                    "email": email
                }).toArray().then(function (result) {
                    if (result.length === 0) return false;
                    return true;

                });
            };
                exports.addSessionId = function (username, newSessionId) {
                    if (username === undefined) return Promise.reject("No username provided");
                    if (newSessionId === undefined) return Promise.reject("no newSessionId provided");
                    return myCollection.update({
                        username: username
                    }, {
                        $set: {
                            "currentSessionId": newSessionId
                        }
                    }).then(function () {
                        return true;
                    });
                };

                exports.removeSessionId = function (SessionId) {
                    if (SessionId === undefined) return Promise.reject("No SessionId provided");
                    return myCollection.update({
                        currentSessionId: SessionId
                    }, {
                        $set: {
                            "currentSessionId": ""
                        }
                    }).then(function () {
                        return true;
                    });
                };



                exports.findSessionId = function (currentSessionId) {
                    if (!currentSessionId) return Promise.reject("You must provide a currentSessionId");


                    return myCollection.find({
                        "currentSessionId": currentSessionId
                    }).toArray().then(function (result) {
                        if (result.length === 0) return undefined;
                        return result[0].username
                    });
                };
                exports.findByUsername = function (username, password) {
                    if (!username) return Promise.reject("You must provide a username");
                    if (!password) return Promise.reject("You must give encryptedPassword");
                    return myCollection.find({
                        "username": username
                    }).toArray().then(function (result) {
                        if (result.length === 0) return Promise.reject("User doesn't exist.");
                        var pw = result[0].encryptedPassword;
                        if (bcrypt.compareSync(password, pw)) return true;
                        return Promise.reject("Wrong password.");
                    });
                };
            });
