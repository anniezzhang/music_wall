         $(function() {
    
             $('form#searchForm').submit(function(){
                 alert("sds");
                 $('#searchButton').click();
                 return false;
             });
    
              $('#submitButton').click(function() {
                  var checkedBoxes = $(".videoId:checked");
                  if(checkedBoxes.length == 0){
                      alert('what ghost?');
                  }
                  var videos = [];
                  for(var i=0; i<checkedBoxes.length; i++){
                      videos.push({title: $(checkedBoxes[i]).data('title'), videoId: checkedBoxes[i].value});
                  }
    
    
                 // console.log(searchInput);
                 $.ajax({
                     method: "POST",
                     url: "/party/addsong/"+partyId,
                     dataType: "jsonp",
                     data: {videos: videos},
                     jsonp: "callback",
                     jsonpCallback: "mycallback",
                     success: function(data) {
                     }
                 });
              });
    
             $('#searchButton').click(function() {
                 var searchInput = $('#searchInput').val();
                 console.log(searchInput);
                 $.ajax({
                     method: "GET",
                     url: "https://www.googleapis.com/youtube/v3/search?sortorder=descending&search?&orderby=relevance&callback=YoutubeSearch&maxResults=25&part=snippet&q="
                     +searchInput+"&type=video&key=AIzaSyA-s--TP_Xbc-7Qo55-x9_8uuEkGRS93HU",
                     dataType: "jsonp",
                     jsonp: "callback",
                     jsonpCallback: "YoutubeSearch",
                     success: function(data) {
                         if (data.items.length == 0 || data.items.length == undefined) {
                             alert("Sorry, not found");
                         }else {
                             var i=0;
                             var search_results = $('#search_results');
                             search_results.empty();
                             var videoIds = [];
                             $.each(data.items, function(){
                                 // console.log(data.items.id);
                                 var videoId = data.items[i].id.videoId;
                                 var videoTitle = data.items[i].snippet.title;
                                 var videoDescription = data.items[i].snippet.description;
                                 var videoImage = data.items[i].snippet.thumbnails.default.url;
                                 videoIds.push(videoId);
                                 // console.log(data.items[i].snippet.thumbnails.default.url);
                                 //console.log(videoId);
                                 var myhtml = '<label class="forEachResult">';
                                     myhtml += '<div class="result">';
                                     myhtml += '<input class="videoId" name="videoId[]" type="checkbox" data-title="'+ videoTitle +'" value="'+ videoId +'"/>';
                                     myhtml += '<img src="'+ videoImage +'" alt=""/>';
                                     myhtml += '<div class="desc">';
                                     myhtml += '<p class="title">'+ videoTitle +'</p>';
                                     myhtml += '<p class="description" id="desc-'+ videoId +'"></p>';
                                     myhtml += '</div>';
                                     myhtml += '</div>';
                                     myhtml += '</label>';
    
                                 search_results.append(myhtml);
                                 i++;
                             });
    
    
    
    
                              $.ajax({
                                 method: "GET",
                                 url: "https://www.googleapis.com/youtube/v3/videos?id="
                                 +videoIds.join()+"&key=AIzaSyDYwPzLevXauI-kTSVXTLroLyHEONuF9Rw&part=snippet,contentDetails",
                                 dataType: "json",
                                 success: function(data){
                                     for( var i=0; i< data.items.length; i++){
                                         var duration = data.items[i].contentDetails.duration;
    
                                         var formattedTime = duration.replace("PT","").replace("H",":").replace("M",":").replace("S","");
                                         if(duration.search("S") == -1){
                                             formattedTime = formattedTime+"00";
                                         }
                                         var videoDuration = formattedTime;
    
                                         // console.log(videoDuration);
                                         var resultDuration = $("#desc-"+data.items[i].id);
                                         resultDuration.append(videoDuration.toString());
    
                                     }
    
                                 }
    
                             });
                         }
                     }
                 });
             });
    
    
    
    
     });
