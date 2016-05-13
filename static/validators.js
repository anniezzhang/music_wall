(function ($) {
    $(document).ready(function () {
        var Button1 = $("#button1");
        var Button2 = $("#button2");
        var attemptimes=0;

        function isValid(str) {
            return /([A-Za-z0-9])\w*/g.test(str);
        }

        Button1.on('click', function (event) {
            try {

                var input1 = $("#form1 input[name=\"loginname\"]").val(),
                    input2 = $("#form1 input[name=\"loginpw\"]").val();

                if (input1 === undefined || input1 === "" || input1 === null) {
                    event.preventDefault();
                    throw "Please input username.";
                } else if (!isValid(input1)) {
                    event.preventDefault();
                    throw "Username should only contain letters or numbers.";
                } else if (input2 === undefined || input2 === "" || input2 === null) {
                    event.preventDefault();
                    throw "Please input password.";
                } else if (!isValid(input2)) {
                    event.preventDefault();
                    throw "Password should only contain letters or numbers.";
                } else {
                    
                    $.ajax({
                        type: "POST",
                        url: "/login",
                        contentType: 'application/json',
                        data: JSON.stringify({
                            loginname: input1,
                            loginpw: input2
                        }),
                        success: function (msg) {
                            console.log("correct");
                            $("#form1").submit();
                        },
                        error: function (msg) {
                            attemptimes+=1;
                            
                            console.log(msg);
                            var msg1 = JSON.parse(msg.responseText);
                            var msg2 = msg1.error;
                            console.log(msg1);
                            var attemptmsg=" You've tried "+ attemptimes + " times!"
                            if(attemptimes>5)attemptmsg= "You've tried more than 5 times! Account locked. Contact Customer Service!";
                            event.preventDefault();
                            if (!($("#error").length)) {
                                Button1.after("<p id=\"error\"></p>");
                                $("#error").css({
                                    "color": "red",
                                    "font-family": "sans-serif",
                                    "font-style": "italic"
                                });
                                $("#error").text(msg2+attemptmsg);
                            } else {
                                $("#error").text(msg2+attemptmsg);
                            }
                            return false;
                        }
                    });

                }
            } catch (err) {
                event.preventDefault();
                if (!($("#error").length)) {
                    Button1.after("<p id=\"error\"></p>");
                    $("#error").css({
                        "color": "red",
                        "font-family": "sans-serif",
                        "font-style": "italic"
                    });
                    $("#error").text(err);
                } else {
                    $("#error").text(err);
                }
                return false;
            }
        });

        ////////////////////////////////////////////////////////////////////////////////////////////       



        Button2.on('click', function (event) {
            try {
                var input1 = $("#form2 input[name=\"username\"]").val(),
                    input2 = $("#form2 input[name=\"password\"]").val();

                if (input1 === undefined || input1 === "" || input1 === null) {
                    throw "Please input username.";
                } else if (!isValid(input1)) {
                    throw "Username should only contain letters or numbers.";
                }
                if (input2 === undefined || input2 === "" || input2 === null) {
                    throw "Please input password.";
                } else if (!isValid(input2)) {
                    throw "Password should only contain letters or numbers.";
                } else if (input1.length<6 || input2.length<6 ){
                    event.preventDefault();
                    throw "Password/Username should have more than 6 characters.";   
                }else {
                    $.ajax({
                        type: "POST",
                        url: "/register",
                        contentType: 'application/json',
                        data: JSON.stringify({
                            username: input1,
                            password: input2
                        }),
                        success: function (msg) {
                            console.log("correct");
                            window.location= "/login";
                        },
                        error: function (msg) {
                            console.log(msg);
                            var msg1 = JSON.parse(msg.responseText);
                            var msg2 = msg1.error;
                            console.log(msg1);
                            event.preventDefault();
                            if (!($("#error2").length)) {
                                Button2.after("<p id=\"error2\"></p>");
                                $("#error2").css({
                                    "color": "red",
                                    "font-family": "sans-serif",
                                    "font-style": "italic"
                                });
                                $("#error2").text(msg2);
                            } else {
                                $("#error2").text(msg2);
                            }
                            return false;
                        }
                    });

                }

            } catch (err) {
                if (!($("#error2").length)) {
                    Button2.after("<p id=\"error2\"></p>");
                    $("#error2").css({
                        "color": "red",
                        "font-family": "sans-serif",
                        "font-style": "italic"
                    });
                    $("#error2").text(err);
                } else {
                    $("#error2").text(err);
                }
                return false;
            }
        });







    });
})(jQuery);
// jQuery is exported as $ and jQuery