/**
 * @file Anonymous functions for adding to chat
 *
 * Logs "Now, I'm cool when things are cool"
 * TIMING: animation speed variable, [default 500ms]
 *
 * poem.behaviors.append controls adding received events to chat window
 * xmpp.handleHeadline, xmpp.handleServerMessage, 
 *
 * post(who, what): appends li b styled who, what to chat update
 * xmpp.handleConnect: trigger this.presence(other) upon connected
 * submit: post sends post(xmpp.nickname, msg), xmpp.chat(other.msg)
 * discussion-event: click logs event xmpp.event(other, $(this).text() )
 * Jquery selectors: #discussion
 *   #discussion-msg, #discussion-form, .discussion-event
 *
 */

var __cool = true;
var waitAlittle = function() {
	__cool = true;
	poem.log("Now, I'm cool");
}

//poem.behaviors.append adds chats
//var head the default div style
//var timing 500ms animation
poem.behaviors.append(function(){
	var other = Drupal.settings.strophe.chat.other;
	var head = $('<div style="font-size: 36px;position: relative; z-index:20;">☠</div>');
	var TIMING = 500; // timing is stepping of animation

	//call XMPP handleHeadline to process message/event
	xmpp.handleHeadline('event', function(message, event){
		poem.log(event.textContent);
		//$('#discussion').css('background-color', event.textContent);
		var t = event.textContent.split(':');
		//log to console
		console.log({left: parseInt(t[0], 10), top: parseInt(t[1], 10)});
		//animate append 
		head.animate({
			left: parseInt(t[0], 10),
			top: parseInt(t[1], 10)
		}, TIMING, function() {});
		/*head
			.css('left', parseInt(t[0], 10))
			.css('top',parseInt(t[1], 10));*/
	});

	// xmpp.handleServerMessage logs and alerts msg.body.textContent
	xmpp.handleServerMessage(function(msg){
		poem.log(msg);
		alert(msg.body.textContent);
	});

	// post(who, what): appends li b styled who, what to chat update
	function post(who, what) {
		$('#discussion').append(
			$('<li>')
				.append($('<b>').text(who))
				.append(': ' + what)
		);
	}

	// xmpp.handleChat: log you have received a message
	xmpp.handleChat(function(msg){
		poem.log('je recois un message');
		poem.log(msg);
		// if msg.nick is not null parse msg.nick, msg.body
		post((msg.nick != null) ? msg.nick : msg.from.split('@')[0], msg.body);
	});

	//xmpp.handleConnect: trigger this.presence(other) upon connected
	xmpp.handleConnect(function(status){
		if(Strophe.Status.CONNECTED == status){
			this.presence(other);
		}
	});

	// discussion_poz: offset of #discussion ID
	var discussion_poz = $('#discussion').offset();

	//timing loop thing?
	$('#discussion').before(head).mousemove(function(evt) {
		poem.log(__cool);
		if(__cool) {
			__cool = false;
			xmpp.event(other, (evt.pageX - discussion_poz.left) + ":" + (evt.pageY - discussion_poz.top));
			setTimeout("waitAlittle()", TIMING);
		}
	});

  //submit: post sends post(xmpp.nickname, msg), xmpp.chat(other.msg)
	$('#discussion-form').submit(function(){
		var msg = $('#discussion-msg').get(0).value;
		post(xmpp.nickname, msg);
		xmpp.chat(other, msg);
		$('#discussion-msg').get(0).value = "";
		return false;
	});

	//discussion-event: click logs event xmpp.event(other, $(this).text() ),
	// @return FALSE
	$('.discussion-event').click(function(){
		poem.log("j'envois un event à " + other);
		poem.log($(this).text());
		xmpp.event(other, $(this).text() );
		return false;
	});
});
