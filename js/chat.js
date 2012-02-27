/**
 * @file chat.js implements Strophe.js to drive XMPP chat
 *
 * Implementation of XMPP user chat over Strophe JS https://github.com/metajack/strophejs
 * Experimental adaptation for Drupal 7.x by Dan Feidt (hongpong)
 *
 * Original code & comments for Drupal-Strophe by Mathieu Lecarme
 * dans des messages :
 * <composing xmlns="http://jabber.org/protocol/chatstates"/>
 * <paused xmlns="http://jabber.org/protocol/chatstates"/>
 * http://xmpp.org/extensions/xep-0045.html#enter
 */

/**
 * JS functions here define debug, Chatter, Room, Chat & methods.
 * Chatter.chats, rooms, roaster, presence, connect, onConnect, handleConnect, _splitId,
 * onPresence, onMessage, chat, groupchat. Room: room.prototype, message, handleMessage,
 * presence, chat, exit. Chat: Chat.prototype, message, HandleMessage, chat.
 * Activities are logged to console.
 */

debug = function(what) {
	console.log(what);
}

/** 
 * Chatter
 * Properties: nickname, status, connection, chats, rooms, roaster.
 * Functions: presence, connect(login, password), onConnect(status), handleConnect,
 * _splitId, onPresence, handlePresence, onMessage, chat, groupchat
 *
 */
Chatter = {
	nickname: "plop",
	status: "Strophe rulez",
	connection: null,
	chats: {},
	rooms: {},
	roaster: {},

	//send presence
	presence: function() {
		this.connection.send($pres().tree());
		//[TODO] send presence to rooms
	},

	//connection to the server
	connect: function(login, password) {
		this.login = login;
		this.connection.addHandler(this.onMessage, null, 'message', null, null, null);
		this.connection.addHandler(this.onPresence, null, 'presence', null, null, null);
		this.connection.connect(login, password, this.onConnect);
	},

  //onConnect 
	onConnect: function(status) {
		console.log('chatter', this);
		if (status == Strophe.Status.CONNECTING) {
			debug('Strophe is connecting.');

		} else if (status == Strophe.Status.CONNFAIL) {
			debug('Strophe failed to connect.');
			//$('#connect').get(0).value = 'connect';

		} else if (status == Strophe.Status.DISCONNECTING) {
			debug('Strophe is disconnecting.');

		} else if (status == Strophe.Status.DISCONNECTED) {
			debug('Strophe is disconnected.');
			//$('#connect').get(0).value = 'connect';

		} else if (status == Strophe.Status.CONNECTED) {
			debug('Strophe is connected.');

			Chatter.presence();
			//connection.disconnect();
		}

		Chatter.handleConnect(status);
	},

	//handleConnect handles ?
	handleConnect: function(status) { },

	_splitId: function(id) {
		var at = id.indexOf('@');
		var slash = id.indexOf('/');
		return {
			user: id.substring(0, at -1),
			domain: id.substring(at +1, slash -1),
			machine: id.substring(slash +1)
		}
	},
	
	//onPresence calls handlePresence
	onPresence: function(msg) {
		var to = msg.getAttribute('to');
		var from = msg.getAttribute('from');
		var type = msg.getAttribute('type');

		if(type == "unavailable")
			Chatter.roaster[from] = null;
		else
			Chatter.roaster[from] = {};
		console.log('presence', Chatter.roaster);

		Chatter.handlePresence(to, from, type);
	},

	//handlePresence
	handlePresence: function(to, from, type) { },

	//onMessage: message received - to, from, type, body. chat or groupchat
	onMessage: function(msg) {
		var to = msg.getAttribute('to');
		var from = msg.getAttribute('from');
		var type = msg.getAttribute('type');
		var elems = msg.getElementsByTagName('body');

		if(elems.length > 0) {
			var body = elems[0];
			var slash = from.indexOf('/');
			var simpleFrom = from.substring(0, slash -1);
			debug('I got a message from ' + from + ': ' + Strophe.getText(body));
			if(type == "chat") {
				if(Chatter.chats[simpleFrom] == null)
					Chatter.chats[simpleFrom] = new Chat(simpleFrom);
				Chatter.chats[simpleFrom].message(from, to, type, body);
			} else if (type == "groupchat") {
				var room = simpleFrom;
				if(Chatter.rooms[room] == null)
					Chatter.rooms[room] = new Room(simpleFrom);
				Chatter.rooms[room].message(from, to, type, body);
			}
		}
		// we must return true to keep the handler alive.  
		// returning false would remove it after it finishes.
		return true;
	},

	//chat: send a chat message to Chatter.chats[dest].chat(msg)
	// creates new Chat if [dest] is null
	chat: function(to, msg) {
		var slash = to.indexOf('/');
		var dest = null;
		if(slash != -1)
			dest = to.substring(0, slash -1);
		else
			dest = to;
		if(Chatter.chats[dest] == null)
		// creates the new Chat(dest)
			Chatter.chats[dest] = new Chat(dest);
		Chatter.chats[dest].chat(msg);
	},

	// groupchat: send a group chat to Chatter.rooms[dest]
	// creates new Room if [dest] is null
	groupchat: function(to, msg) {
		var slash = to.indexOf('/');
		var dest = null;
		if(slash != -1)
			dest = to.substring(0, slash -1);
		else
			dest = to;
		if(Chatter.rooms[dest] == null){
			Chatter.rooms[dest] = new Room(dest);
			Chatter.rooms[dest].presence();
		} else
		Chatter.rooms[dest].chat(msg);
	}
};

/* Room constructor
 *  message(from, to, type, body); handleMessage, presence, chat, 
 * presence: Strophe send presence role="participant" message to chatroom
 * chat: compose & send Strophe groupchat message to this.room
 */
Room = function(room) {
	this.room = room;
};

//Room.prototype: message(from, to, type, body); handleMessage, presence, chat, 
Room.prototype = {
	message: function(from, to, type, body) {
		debug({ 
			from: from,
			to: to,
			type: type,
			body: body
		});
		this.handleMessage(from, to, type, body);
	},

  //handleMessage
	handleMessage: function(from, to, type, body) { },

	//presence: Strophe send presence role="participant" message to chatroom
	presence: function() {
		Chatter.connection.send($pres({
			to: this.room + '/' + Chatter.nickname,
		})
		.t('<x xmlns="http://jabber.org/protocol/muc#user"><item affiliation="none" role="participant"/></x>')
		.cnode(Strophe.xmlElement('status', null, Chatter.status))
		.tree());
	},

	//chat: compose & send Strophe groupchat message to this.room
	chat: function(msg) {
		Chatter.connection.send($msg({
			to: this.room,
			//from: Chatter.login,
			type: 'groupchat',
		})
		.t('<nick xmlns="http://jabber.org/protocol/nick">Mathieu Lecarme</nick>')
		.cnode(Strophe.xmlElement('body', null, msg))
		.tree());
	},

	//exit 
	exit: function() {
		Chatter.connection.send($pres({
			to: this.room + '/' + Chatter.nickname,
			from: Chatter.login,
			type: 'unavailable'
		}).tree());
	}
}

/* Chat: Single user chat constructor. Chat.prototype, message, handleMessage, 
 * $msg to, from: Chatter.login, type: 'chat', body.
 */

Chat = function(to) {
	this.to = to;
};

Chat.prototype = {
	message: function(from, to, type, body) {
		debug({
			from: from,
			to: to,
			type: type,
			body: body
		});

		this.handleMessage(from, to, type, body);
	},

	handleMessage: function(from, to, type, body) { },

	chat: function(msg) {
		var m = $msg({
			to: this.to,
			from: Chatter.login,
			type: 'chat'
		}).cnode(Strophe.xmlElement('body', null, msg));
	Chatter.connection.send(m.tree());
	}
}