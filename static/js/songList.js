'use strict';

var MongoClient = require('mongodb').MongoClient,
	settings = require('./config.js'),
	Guid = require('Guid');



var fullMongoUrl = settings.mongoConfig.serverUrl + settings.mongoConfig.database;
var exports = module.exports = {};


var data=[];//partid : { playlist}
//var data= {partyId:[], partyId2:[]};  return showSucc(data[partyId])
//datq=[][{}]
var newId = 1;
var stamp = function () {
	return newId++;
};

function showSucc(data){
    return {status: "success", msg: "ok" , "data": data};
}
function showError(msg){
    return {status: "error", "msg": msg};
}

// {"_id":"81fbbb11-2b10-1457-933b-6af2487d7122", "partyId":"zxco23", "partyName":"Christmas Party", "createdBy":"Sunny", "playList":[{"videoName":"Merry Christmas Every Body,"url":"https://www.youtube.com/watch?v=jx6DzaiV66Y","createdBy":"Sunny","watched":true}] "config":{"allowAnonymous": true "maxLimit": 100,"allowComment": true}



MongoClient.connect(fullMongoUrl)
    .then(function(db) {
        var partyCollection = db.collection("party");

        exports.createUser = function(username, encryptedPassword) {
        	emptyProfile = {firstName: "", lastName: "", hobby: "", petName: ""};
        	//console.log("good");
        	return userCollection.insertOne({ _id: Guid.create().toString(), username: username,
                encryptedPassword: encryptedPassword, currentSessionId: "", profile: emptyProfile });
        };


        exports.addParty = function(){
            return partyCollection.insertOne({"_id":"0001", "partyId":"Party1", "partyName":"Christmas Party", "createdBy":"Sunny", "playList":[{"videoName":"Merry Christmas Every Body","url":"https://www.youtube.com/watch?v=jx6DzaiV66Y","createdBy":"Sunny","watched":true}], "config":{"allowAnonymous": true, "maxLimit": 100,"allowComment": true}});
        };

        exports.addSongbyUrl = function(partyID, Url){
            // var songList = partyCollection.find({_id:partyId}).then(function(party){
            //     return party[0].playList;
            // });



            var newSong = {"videoName":"Merry Christmas Every Body",
                           "url":Url,
                           "createdBy":"Sunny",
                           "watched":true};
            var newSongList;
            return exports.findPartyByPartyID(partyID).then(function(party) {
                party.playList.push(newSong);
                newSongList = party.playList;
                return newSongList;
        	}).then(function(songList){
                return partyCollection.updateOne({ partyId: partyID},
                    { $set: {playList: songList} }).then(function(){
                        console.log(songList);
                        // return exports.findPartyByPartyID(partyID);
                    });
            });
        };


         exports.addSongById = function(partyID, videos){

            var newSongList;
            return exports.findPartyByPartyID(partyID).then(function(party) {
                for(var i =0; i<videos.length; i++){
                    var newSong = {"videoTitle":videos[i].title,
                                   "videoId":videos[i].videoId,
                                   "createdBy":"Sunny",
                                   "watched":false};
                    party.playList.push(newSong);
                }
                newSongList = party.playList;
                return newSongList;
        	}).then(function(songList){
                return partyCollection.updateOne({ partyId: partyID},
                    { $set: {playList: songList} }).then(function(){
                        console.log(songList);
                    });
            });
        };


        exports.findPartyByPartyID = function(partyId){
            return partyCollection.find({partyId: partyId}).limit(1).toArray().then(function(listOfParty) {
        		if(listOfParty.length === 0) {
        			return Promise.reject("Party doesn't exist!");
        		} else {
        			return listOfParty[0];
        		}
        	});
        };


    });


exports.get = function (partyId, id) {
        if(!partyId || !id || data[partyId] == undefined){
            throw Error("error get id :"+ id+ "or partyid:"+ partyId);
        }

		for (var i = 0, l = data[partyId].length; i < l; i++) {
			if (data[partyId][i].id == id) {
				return data[partyId][i];
			}
		}

        return showError("not found");
	}

	exports.create = function (partyId,songName,url,owner) {
		if(!partyId || !songName || !url || !owner){
            throw Error("one of ur param is null partyId: "+ partyId +" songName:"+songName +" url:"+url+" owner:"+owner);
        }

            var myData = {
				'id':stamp(),
				'partyId': partyId,
				'songName': songName,
				'url': url,
				'owner': owner
			};

			data[partyId].push(myData);
            console.log(data);
			return showSucc(myData);

	}

	exports.delete = function (partyId, id) {
        if(!partyId || !id || data[partyId] == undefined){
            throw Error("error get id :"+ id+ "or partyid:"+ partyId);
        }
		for (var i = 0, l = data[partyId].length; i < l; i++) {
			if (data[partyId][i].id == id) {
                var tmp = data[partyId][i];
				data[partyId].splice(i,1);
                console.log(data);
				return showSucc(tmp);
			}
		}

        return showError("not found");
	}
    exports.getAllByPartyId = function(partyId){
        //todo zhimeng
        return showSucc(data[partyId]);
    }
    exports.createParty =function (partyId) {
        //todo zhimeng
        data[partyId] = [];
        return showSucc(partyId);
    }
