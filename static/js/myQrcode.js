(function($){

	var my_url = $("#partyId");
	var base_url =$("#base_url");

	var mm = my_url.val();
	var nn = base_url.val();
	jQuery('#my_qr').qrcode({width:130, height:130, text: nn+"/party/addsong/"+mm});

})(jQuery);
