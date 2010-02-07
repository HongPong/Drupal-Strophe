
poem.behaviors.append(function(){
	var other = Drupal.settings.strophe.chat.other;
	xmpp.handleHeadline('event', function(message, event){
		poem.log(event.textContent);
		$('#discussion').css('background-color', event.textContent);
	});
	xmpp.handleServerMessage(function(msg){
		poem.log(msg);
		alert(msg.body.textContent);
	});
	function post(who, what) {
		$('#discussion').append(
			$('<li>')
				.append($('<b>').text(who))
				.append(': ' + what)
		);
		
	}
	xmpp.handleChat(function(msg){
		poem.log('je recois un message');
		poem.log(msg);
		post((msg.nick != null) ? msg.nick : msg.from.split('@')[0], msg.body);
	});
	xmpp.handleConnect(function(status){
		if(Strophe.Status.CONNECTED == status){
			this.presence(other);
		}
	});

	$('#discussion-form').submit(function(){
		var msg = $('#discussion-msg').get(0).value;
		post(xmpp.nickname, msg);
		xmpp.chat(other, msg);
		$('#discussion-msg').get(0).value = "";
		return false;
	});
	$('.discussion-event').click(function(){
		poem.log("j'envois un event à " + other);
		poem.log($(this).text());
		xmpp.event(other, $(this).text() );
		return false;
	});
});
