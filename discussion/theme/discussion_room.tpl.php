<script type="text/javascript">
	$(function(){
		var other = '<?php echo $other->jid;?>';
		poem.log('xmpp', other);
		var discussion = new <?php echo $chatroom->tchat(); ?>;
		discussion.handleEvent(function(event){
			poem.log(event.textContent);
		});
		discussion.handleServerMessage(function(msg){
			poem.log(msg);
			alert(msg.body.textContent)
		});
		function post(who, what) {
			$('#discussion').append(
				$('<li>')
					.append($('<b>').text(who))
					.append(': ' + what)
			);
			
		}
		discussion.handleChat(function(msg){
			poem.log('je recois un message');
			poem.log(msg);
			post((msg.nick != null) ? msg.nick : msg.from.split('@')[0], msg.body);
		});
		poem.log(discussion._onChat);
		discussion.handleEvent(function(event){
			poem.log(event.textContent);
			$('#discussion').toggle();
		});
		discussion.connect();
		$('#discussion-form').submit(function(){
			var msg = $('#discussion-msg').get(0).value;
			post(discussion.nickname, msg);
			discussion.chat(other, msg);
			$('#discussion-msg').get(0).value = "";
			return false;
		});
		$('#discussion-event').click(function(){
			poem.log("j'envois un event à " + other);
			discussion.connection.send(poem.buildEvent(other, 'carotte from ' + discussion.nickname).tree());
			return false;
		});
	});
</script>

<h2>Discussion with <?php echo $other->nickname; ?></h2>

<form id="discussion-form">
	<input type="text" id="discussion-msg"/>
	<input type="submit" value="Tchat" id="discussion-doTchat"/>
</form>
<a href="#" id="discussion-event">Event</a>
<div id="discussion" style="border: dotted thin black;height: 100px;overflow: auto;">
	
</div>