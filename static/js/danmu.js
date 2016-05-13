
    $(function () {
            $(".showBarrage,.s_close").click(function () {
                $(".barrage,.s_close").toggle("slow");
            });
          
        })
        
        
  var socket = io();
	socket.on('comment', function(msg){
		var text = msg.comment;
		var commentColor = msg.commentColor; 
        if (text == "") {
            return;
        };
        var _lable = $("<div style='right:20px;top:0px;opacity:1;position: relative;font-size:200%;color:" + getRandomColor(commentColor) + ";z-index:1;'>" + text + "</div>");
        $(".mask").append(_lable.show());
        init_barrage();
  });
        
        
    $(".send .s_btn").click(function () {
            var text = $(".s_text").val();
            if (text == "") {
                return;
            };
            var _lable = $("<div style='right:20px;top:0px;opacity:1;color:" + getRandomColor() + ";'>" + text + "</div>");
            $(".mask").append(_lable.show());
            init_barrage();
        })
       
    function init_barrage() {
        var _top = 0;
        $(".mask div").show().each(function () {
            var _left = 0; 
            var _height = $(window).height(); 
            _top += 50;
            if (_top >= (_height)) {
                _top = 0;
            }
            $(this).css({
                left: _left,
                top: _top,
                color: getRandomColor()
            });

            var time = 10000;
            if ($(this).index() % 2 == 0) {
                time = 9000;
            }
            $(this).animate({
                left: "-" + 2*$(window).width() + "px"
            }, time, function () {
                $(this).remove();
            });
        });
    }
    function getRandomColor(commentColor) {
        return commentColor;
    }

