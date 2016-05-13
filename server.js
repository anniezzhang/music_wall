var express = require('express');
var bodyParser = require('body-parser');
var mySongList = require('./songList.js');
var myUser=require('./mongoData.js');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Guid = require('Guid');
var cookieParser = require('cookie-parser');
var partyData = require('./partydata.js');
var fs = require('fs');
var xss = require('xss');

app.set('view engine','ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets', express.static('static'));
app.use(cookieParser());


var base_url = "155.246.163.64:3000"

var testpid="";
 app.get("/party/:partyId", function (req,res) {
    var partyId = req.params.partyId;
    testpid = partyId;
    //check if the partyId in partList
    //if not show error
    io.on('connection', function(socket){
        socket.join(testpid);
     });
    mySongList.findPartyByPartyID(partyId).then(function(party){
        var videoIds = [];
        var playListString = JSON.stringify(party.playList);

	    res.render('pages/party',{party: party, videoInfos: playListString, base_url:base_url});
    }, function(error){
        console.log(error);
    });
});


app.use(function (request, response, next) {
    console.log("The request has all the following cookies:");
    console.log(request.cookies);
    next();
});

app.use(function (request, response, next) {

    response.locals.user  = undefined;
    var sessionId = request.cookies.currentSessionId;
    if(sessionId){
        myUser.findSessionId(sessionId).then(function(user) {
            if (user == "" || user == undefined) {
                console.log("SessionId not found in database");
                var expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 1);
                response.cookie("currentSessionId", "", { expires: expiresAt });
                response.clearCookie("currentSessionId");

                next();

            } else {
                response.locals.user = user;
                console.log("SessionId found!");
                next();
            }
        }, function (errorMessage) {
            console.log(errorMessage);
            next();
        });
    }else{
        next();
    }

});



app.get("/login", function (request, response) {
    if (response.locals.user) {
        response.redirect("/createparty");
    } else {
        response.render("pages/home", {
            error: null
        });
    }



});
app.post("/register", function (request, response) {
    myUser.createUser(request.body.username, request.body.password).then(function () {
        //response.redirect("/login");
        response.render("pages/home", {
            error: null
        });
        return true;
        },
        function (errorMessage) {
            response.status(500).json({
                error: errorMessage
            });
        });
});

app.post("/login", function (request, response) {
    try {
        console.log("You entered login parts");

        myUser.findByUsername(request.body.loginname, request.body.loginpw).then(function (result) {
            var sessionId = Guid.create().toString();

            myUser.addSessionId(request.body.loginname, sessionId).then(function () {
                //  console.log("sessionId", sessionId);
                response.cookie("currentSessionId", sessionId, {});
                response.locals.user = request.cookies.currentSessionId;
                response.redirect("/createparty");
            }, function (errorMessage) {
                response.status(500).json({
                    error: errorMessage
                });
            });
        }, function (errorMessage) {
            response.status(500).json({
                error: errorMessage
            });
        });
    } catch (e) {
        response.render("pages/home", {
            error: e
        });
    }

});


app.post("/logout", function (request, response) {
   myUser.removeSessionId(request.cookies.currentSessionId);
    var expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    response.cookie("currentSessionId", "", { expires: expiresAt });
    response.clearCookie("currentSessionId");

    response.render("pages/home", {
            error: ""
        });
});

app.get("/party/:partyId/playList", function(request, response) {

   mySongList.findPartyByPartyID(request.params.partyId).then(function(party) {
       try{

       var songs = [];
       for(var i=0; i<party.playList.length; i++){
            songs.push(party.playList[i].videoId);

       }}catch(err){
         console.log(err);
       }
       response.jsonp({songs: songs });
   });
});


var partyId = "";

 app.get("/party/addsong/:partyId", function(request, response) {
    partyId = request.params.partyId;

    //io.in(request.params.partyId).emit('chat message', 'helloooooooooooo');
    response.render("pages/songList",{partyId: request.params.partyId});
 });

app.post("/party/addsong/:partyId", function(request,response) {
    //todo zhimeng
      var partyId = request.params.partyId;

      var selectedPlayList = request.body.videos;
      var songs = [];
      for(var i=0; i<selectedPlayList.length; i++){
          //songs.push(selectedPlayList[i].videoId);
          songs.push(selectedPlayList[i]);
      }
      //console.log(songs);
	    io.in(partyId).emit('playlist', selectedPlayList);
      mySongList.addSongById(partyId, request.body.videos).then(function() {
    	response.render("pages/songList", {partyId: request.params.partyId});
    });
});


app.post("/party/addcomment/:partyId", function(request,response) {
    //todo Tenchi

    var partyId = request.params.partyId;

		  //comment color
		  var commentColor = request.body.commentColor;
		  //comment
		  var comment = xss(request.body.bulletInput);

		  var commentObj = {comment:comment,commentColor:commentColor };


	     io.in(partyId).emit('comment', commentObj)

    	response.render("pages/songList", {partyId: request.params.partyId});
});

app.post("/party", function(req,res) {
	var result = mySongList.createParty(req.body.partyId);
    partyId = req.body.partyId;//todo remember to remove this later no way to write like this
	res.json(result);
});

//index
app.get("/", function (req,res) {

	res.render("pages/home", {error: null});
});

//redirect to partyconfig
app.get("/createparty", function(request, response){
	if(!response.locals.user||response.locals.user==undefined){
	response.render("pages/home", {error: null});
}else{
	response.render("pages/partyconfig", {Inf: "please input your party information"});
}

});

//create party
app.post("/createparty", function(request, response){
if(!response.locals.user||response.locals.user==undefined){
	response.render("pages/home", {Inf: "please log in first!"});
}else{
	var partyId = request.body.partyId;
	var partyName = request.body.partyName;
	if(!response.locals.user||response.locals.user==undefined){
	var createdBy = "unknown user";
}
if (partyId == "" || partyId == undefined || partyName == "" || partyName == undefined) {
        response.render("pages/partyconfig", {
            Inf: "Missing input!"
        });
    } else if(!(/([A-Za-z0-9])\w*/g.test(partyId))||!(/([A-Za-z0-9])\w*/g.test(partyName))){
        response.render("pages/partyconfig", {
            Inf: "Only allow numbers or letters!"
        });

    }
else{
	var createdBy = response.locals.user; //todo tianchi
  }
	var playList = [];
	var config = {};
	partyData.getPartyById(partyId).then(function(partyList){
if(partyList.length>0){
    response.render("pages/partyconfig", {Inf: "party id existed"});
}else{
	partyData.createParty(partyId, partyName, createdBy, playList, config).then(function(theParty){
        response.redirect("/party/"+theParty[0].partyId);

    },function(error){
    	response.render("pages/partyconfig", {Inf: "error happened during the process"});
    });


}
});
}

	});




http.listen(3000, function () {
	console.log('Your server is now listening on port 3000! Navigate to http://localhost:3000 to access it');
})
