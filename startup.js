var MongoClient = require('mongodb').MongoClient,
    settings = require('./config.js'),
    Guid = require('Guid');

var fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;

function runSetup() {
    return MongoClient.connect(fullMongoUrl)
        .then(function(db) {
            return db.createCollection("party");
        }).then(function(partyCollection) {

            return partyCollection.count().then(function(theCount) {
                // the result of find() is a cursor to MongoDB, and we can call toArray() on it
                if (theCount > 0) return partyCollection.find().toArray();

                return partyCollection.insertOne({_id: Guid.create().toString(), partyId: "RunxiD", partyName: "Runxi1st", createdBy: "Runxi_Ding", playList: [], config: {}}).then(function(newDoc) {
                    return newDoc;
                }).then(function() {
                    return partyCollection.insertOne({_id: Guid.create().toString(), partyId: "TianchiTim", partyName: "Tianchi1st", createdBy: "Tianchi_Liu", playList: [], config: {}});
                }).then(function() {
                    return partyCollection.insertOne({_id: Guid.create().toString(), partyId: "ZhiDream", partyName: "Meng1st", createdBy: "Meng_Zhi", playList: [], config: {}});
                }).then(function() {
                    return partyCollection.insertOne({_id: Guid.create().toString(), partyId: "XibeiziM", partyName: "Xibeizi1st", createdBy: "Xibeizi_Ma", playList: [], config: {}});
                }).then(function() {
                    return partyCollection.insertOne({_id: Guid.create().toString(), partyId: "XinyuZ", partyName: "Xinyu1st", createdBy: "Xinyu_Zhang", playList: [], config: {}});
                }).then(function() {
                    return partyCollection.find().toArray();
                });
            });
        });
}

// By exporting a function, we can run 
var exports = module.exports = runSetup;