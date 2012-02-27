/**
 * @namespace poem namespce
 * @todo for D7:
 * needs Drupal.behaviors.myModuleHeaders = { attach: function(context, settings) {
 */
var poem = {
	 /**
	 * simple logger
	 */
	log: function(what) {
		if(typeof console != 'undefined') {
			console.log(what);
		}
	},
	rawInput: function(data) {
		poem.log('RECV: ' + data);
	},
	rawOutput: function(data) {
		poem.log('SENT: ' + data);
	},
	/**
	 * append helper for Array class
	 * adding a method Array.protoype break silly code wich iterate over array
	 */
	append: function(haystack, needle) {
		haystack[haystack.length] = needle;
		return haystack;
	},
	/*
	 * available states for show
	 */
	AWAY: 'away',
	CHAT: 'chat',
	DND: 'dnd', 
	XA: 'xa',
	_status : {}
};
poem._status[Strophe.Status.CONNECTING] = 'connecting';
poem._status[Strophe.Status.CONNFAIL] = 'connfail';
poem._status[Strophe.Status.AUTHENTICATING] = 'authenticating';
poem._status[Strophe.Status.AUTHFAIL] = 'authfail';
poem._status[Strophe.Status.DISCONNECTING] = 'disconnecting';
poem._status[Strophe.Status.DISCONNECTED] = 'disconnected';
poem._status[Strophe.Status.CONNECTED] = 'connected';
poem._status[Strophe.Status.ATTACHED] = 'attached';

/**
 * Helper for connection status
 * return a name from a status
 */
poem.status = function(status) {
	return poem._status[status];
};

/**
 * @class Jabber InDentification
 * @constructor
 */
poem.Jid = function(txt) {
	this.domain = null;
	this.place = null;
	var t = txt.split('@');
	if(t.length == 1) {
		this.user = t;
	} else {
		this.user = t[0];
		t = t[1].split('/');
		this.domain = t[0];
		if(t.length > 0){
			this.place = t[1];
		}
	}
};
poem.Jid.prototype = {
	toString: function() {
		return this.user + '@' + this.domain + '/' + this.place;
	},
	isRoom: function() {
		//[TODO] un peu naïf?
		if( this.domain == null)
			return false;
		return this.domain.split('.')[0] == 'conference';
	},
	roomName: function() {
		return this.user + '@' + this.domain;
	}
};

/**
 * High level class wrapping strophe functionality
 * @class XMPP server
 * @constructor
 * @param service the BOSH url
 * @param login Login
 * @param passwd Password
 * @param nickname Nickname
 */
poem.XMPP = function(service, login, passwd, nickname) {
	this.jid = new poem.Jid(login);
	this.login = login;
	this.passwd = passwd;
	this.nickname = nickname;
	this.tryingAttach = false;
	this._status = $.cookie('strophe.status');
	this._show = $.cookie('strophe.show');
	if(this._show == null) {
		this._show = '';
	}

	this.connection = new Strophe.Connection(service);
	this.connection.rawInput = poem.rawInput;
	this.connection.rawOutput = poem.rawOutput;
	var __iq = function(iq) {
		var query = iq.getElementsByTagName('query')[0];
		poem.log(['iq', iq, query.getAttribute('xmlns')]);
		var handlers = this._onIQ[query.getAttribute('xmlns')];
		poem.log(this._onIQ);
		if(handlers != null) {
			poem.log(handlers);
			for(var j=0; j < handlers.length; j++) {
				handlers[j](iq, query);
			}
		}
		
		/*var children = iq.childNodes;
		for(var i=0; i < children.length; i++) {
			var handlers = this._onIQ[children[i].nodeName];
			if(handlers != null) {
				for(var j=0; j < handlers.length; j++) {
					handlers[j](iq, children[i]);
				}
			}
		}*/
		return true;
	};
	var __presence = function(pres) {
		poem.log(['_presence', pres]);
		var from = pres.getAttribute('from');
		var to = pres.getAttribute('to');
		var type = pres.getAttribute('type');
		var status = pres.getElementsByTagName('status');
		var show = pres.getElementsByTagName('show');
		var p = {
			from: from,
			jid: new poem.Jid(from),
			type: (type == null) ? 'available' : type,
			status: (status.length > 0) ? Strophe.getText(status[0]) : null,
			show: (show.length > 0) ? Strophe.getText(show[0]) : null,
			raw: pres
		};
		poem.log(['p',p]);
		for(var i=0; i < this._onPresence.length; i++) {
			this._onPresence[i](p);
		}
		return true;
	};
	var __message = function(msg) {
		//this == Strophe.Connection
		var to = msg.getAttribute('to');
		var from = msg.getAttribute('from');
		var type = msg.getAttribute('type');
		var body = msg.getElementsByTagName('body');
		var nick = msg.getElementsByTagName('nick');
		var subject = msg.getElementsByTagName('subject');
		subject = (subject.length > 0) ? Strophe.getText(subject[0]) : null;
		nick = (nick.length > 0) ? Strophe.getText(nick[0]) : null;
		body = (body.length > 0) ? Strophe.getText(body[0]) : null;
		var m = {
			msg:      msg,
			to:       to,
			type:     type,
			from:     from,
			from_jid: new poem.Jid(from),
			subject:  subject,
			nick:     nick,
			body:     body
		};
		poem.log([from, type, body]);
		var i;
		if(type == 'headline') {
			var childs = msg.childNodes;
			for(i=0; i < childs.length; i++){
				var child = childs[i];
				for(i=0; i < this._onHeadline[child.localName].length; i++) {
					this._onHeadline[child.localName][i](m, child);
				}
			}
		}
		if(body != null) {
			if(type == 'groupchat' || type == 'chat') {
				for(i=0; i < this._onAnyChat.length; i++) {
					this._onAnyChat[i](m);
				}
			}
			if(type == 'groupchat') {
				for(i=0; i < this._onGroupChat.length; i++) {
					this._onGroupChat[i](m);
				}
			}
			if(type == 'chat') {
				for(i=0; i < this._onChat.length; i++) {
					this._onChat[i](m);
				}
			}
			poem.log(this.jid);
			if(from == this.jid.domain) {
				for(i=0; i < this._onServerMessage.length; i++) {
					this._onServerMessage[i](m);
				}
			}
		}
		return true;
	};

	this.connection.addHandler(__message.bind(this),  null, 'message',  null, null, null); 
	this.connection.addHandler(__iq.bind(this),       null, 'iq',       null, null, null);
	this.connection.addHandler(__presence.bind(this), null, 'presence', null, null, null);

	this._room = {};
	this._presence = {};
	this._onConnect = [];
	this._onPresence = [];
	this._onChat = [];
	this._onGroupChat = [];
	this._onAnyChat = [];
	this._onServerMessage = [];
	this._onHeadline= [];
	this._onIQ = [];
	this._preConnect = [];
	this._alterPresence = [];

	this.handlePresence(function(pres) {
		poem.log(["prez", pres]);
		if(pres.jid.isRoom()) {
			this._room[pres.jid.roomName()].triggerPresence(pres);
		}
		//poem.log(['the rooms', pres.jid.isRoom(), pres.jid.roomName(), pres.jid, this._room, this._room[pres.jid.roomName()]]);
		this._presence[pres.from] = pres;
	});
	this.handleConnect(function(status) {
		if(Strophe.Status.ATTACHED == status) {
			poem.log('Attached');
		}
		if(Strophe.Status.CONNECTED == status || Strophe.Status.ATTACHED == status) {
			$.cookie('strophe.jsr', this.connection.jid + '::' + this.connection.sid + '::' + this.connection.rid);
			this.presence();
			//poem.log(['rooms', this._room]);
			for(r in this._room) {
				var room = this._room[r];
				//poem.log(['room presence', room.room]);
				if(room.autopresence) {
					room.presence();
				}
			}
		}
		if(Strophe.Status.DISCONNECTED == status) {
			poem.log('REconnection');
			this.connect();
		}
		return true;
	});
	this.handleGroupChat(function(message) {
		if(message.from_jid.isRoom()) {
			this._room[message.from_jid.roomName()].triggerMessage(message);
		}
	});
	this.alterPresence(function(presence) {
		var status = this.status();
		if(status != null) {
			presence.c('status', {}).t(status);
			//p.up();
		}
		var show = this.show();
		if(show != null) {
			presence.c('show', {}).t(show);
			//p.up();
		}
		presence.up();
		return presence;
	});
	this.alterPresence(function(presence) {
		presence.c('drupal', {}).t('plop');
		return presence;
	});
};

/**
 * Build an iq result from an iq answer
 * @argument iq iq xml stanza
 */
function $iqr(iq) {
	return $iq({id : iq.getAttribute('id'), to: iq.getAttribute('from'), type: 'result'});
}

poem.XMPP.prototype = {
	handleConnect: function(h) {
		this._onConnect = poem.append(this._onConnect, h.bind(this));
	},
	/**
	 * Before connection
	 */
	handlePreConnect: function(h) {
		this._preConnect = poem.append(this._preConnect, h.bind(this));
	},
	handlePresence: function(h) {
		this._onPresence = poem.append(this._onPresence, h.bind(this));
	},
	handleChat: function(h) {
		this._onChat = poem.append(this._onChat, h.bind(this));
	},
	handleGroupChat: function(h) {
		this._onGroupChat = poem.append(this._onGroupChat, h.bind(this));
	},
	handleAnyChat: function(h) {
		this._onAnyChat = poem.append(this._onAnyChat, h.bind(this));
	},
	handleServerMessage: function(h) {
		this._onServerMessage = poem.append(this._onServerMessage, h.bind(this));
	},
	handleHeadline: function(node, handler) {
		if(this._onHeadline[node] == null) {
			this._onHeadline[node] = [];
		}
		this._onHeadline[node] = poem.append(this._onHeadline[node], handler.bind(this));
	},
	handleNSHeadline: function(namespace, node, handler) {
		//[TODO]
	},
	handleNSIQ: function(namespace, node, handler) {
		//[TODO]
	},
	handleIQ: function(xmlns, handler) {
		if(this._onIQ[xmlns] == null) {
			this._onIQ[xmlns] = [];
		}
		this._onIQ[xmlns].push(handler.bind(this));
	},
	/**
	 * Alter presence stanza
	 * you provide a function like this :
	 * function(presence) {
	 *  presence.c('plop', {}).t('toto');
	 *  presence.up();
	 *  return presence;
	 * }
	 * Presence object is a pseudo xml from strophe library.
	 * You have to handle up if you add a block, and return the object
	 */
	alterPresence: function(presence) {
		this._alterPresence = poem.append(this._alterPresence, presence.bind(this));
	},
	connect: function() {
		/*for(var i=0; i < this._preConnect.length; i++) {
			this._preConnect[i]();
		}*/
		var that = this;
		var callback = function(status, error) {
			poem.log(["status", status]);
			poem.log('Strophe is ' + poem.status(status) + ((error != null) ? '(' + error + ')' : ''));
			for(var j=0; j < that._onConnect.length; j++) {
				var stat = that._onConnect[j](status);
			}
			return true;
		};
		var jsr = $.cookie('strophe.jsr');
		//if(jsr == null || this.tryingAttach) {
			this.connection.connect(this.login, this.passwd, callback);
		/*} else {
			jsr = jsr.split('::');
			this.tryingAttach = true;
			this.connection.attach(jsr[0], jsr[1], parseInt(jsr[2], 10), callback);
		}*/
	},
	/*connect_status: function(status) {
		poem.log("Status: " +status);
	},*/
	/**
	 * Get a room, build it if needed
	 */
	room: function(room) {
		if(this._room[room] == null) {
			this._room[room] = new poem.Room(this, room, this.nickname);
		}
		return this._room[room];
	},
	/**
	 * talk to someone
	 */
	chat: function(to, blabla) {
		var msg = $msg({
				to: to,
				type: 'chat'});
		msg.c('body',{}).t(blabla);
		poem.log(msg);
		//poem.log(this.connection);
		this.connection.send(msg.tree());
	},
	/**
	 * @deprecated
	 */
	event: function(to, blabla) {
		this.connection.send(
			$msg({type:'headline', to:to})
				.c('event',{})
				.t(blabla).tree()
		);
	},
	/**
	 * Send presence
	 */
	presence: function() {
		var that = this;
		var _onePresence = function(to) {
			poem.log(['connection presence', to]);
			var pres = (typeof to == 'undefined') ? {} : {to:to};//from:this.jid.toString,
			var p = $pres(pres);
			for(var i=0; i < that._alterPresence.length; i++) {
				p = that._alterPresence[i](p);
			}
			poem.log(p.tree());
			that.connection.send(p.tree());
			var thaat = that;
			pres.type = "unavailable";
			$(window).unload(function(evt) {
				thaat.connection.send(
					$pres(pres)
					.c('status').t('logged out')
					.tree());
				thaat.connection.flush();
				return true;
			});
		};
		_onePresence();
		for(var r in this._room){
			_onePresence(r + '/' + this.nickname);
		}
	},
	/**
	 * show or set status
	 */
	status: function(msg) {
		if(typeof msg == 'undefined') {
			return this._status;
		} else {
			this._status = msg;
			return $.cookie('strophe.satus', msg);
		}
	},
	/**
	 * Show or set show
	 * available states are poem.AWAY, poem.CHAT, poem.DND, poem.XA
	 */
	show: function(state) {
		if(typeof state == 'undefined') {
			return this._show;
		} else {
			this._show = state;
			return $.cookie('strophe.show', state);
		}
	},
	/**
	 * @deprecated
	 */
	roster: function() {
		this.connection.sendIQ(
			$iq({type: 'get'}).c('query', {xmlns:Strophe.NS.ROSTER}).tree(),
			function(iq) {//success
				poem.log(['roster', iq]);
			},
			function(data) {//error
				poem.log(['roster error', iq]);
			},
			10000);
	},
	vcard: function(name) {
		/*
		<iq type="set" id="aacca" >
		<vCard xmlns="vcard-temp" version="2.0" prodid="-//HandGen//NONSGML vGen v1.0//EN" >
		<FN>Mathieu</FN>
		*/
		this.connection.sendIQ(
			$iq({type: 'set'})
				.c('vCard', {xmlns: 'vcard-temp', version: "2.0", prodid: "-//HandGen//NONSGML vGen v1.0//EN"})
				.c('FN').t(name).tree(),
			function(iq) {//success
				poem.log(['vcard', iq]);
			},
			function(data) {//error
				poem.log(['vcard error', iq]);
			},
			10000
		);
	},
	flush: function() {
		this.connection.flush();
	}
};

/**
 * @class A chat room
 * @constructor
 */
poem.Room = function(tchat, room, pseudo) {
	this.tchat = tchat;
	this.connection = tchat.connection;
	this.room = room;
	this.pseudo = pseudo;
	this.autopresence = true;
	this.buddies = {};
	this._presence = [];
	this._available = [];
	this._notAvailable = [];
	this._message = [];
	this.handlePresence(function(pres){
		poem.log(["presence", pres.type, pres.from, pres.show]);
		var i;
		if(pres.type == 'available') {
			for(i=0; i < this._available.length; i++) {
				this._available[i](pres);
			}
		} else {
			poem.log(['not available', pres.from]);
			for(i=0; i < this._notAvailable.length; i++) {
				this._notAvailable[i](pres);
			}
		}
	});
	this.handleAvailable(function(pres) {
		this.buddies = poem.append(this.buddies, pres.from);
	});
	//[TODO] handle remove
};

poem.Room.prototype = {
	/** Send presence to that room*/
	presence: function() {
		var that = this;
		$(window).unload(function(evt) {
			that.connection.send(
				$pres({to: that.room + '/' + that.pseudo, type: "unavailable"})
				.c('x', {xmlns:"http://jabber.org/protocol/muc"})
				.up()
				.c('status').t('logged out')
				.tree());
			that.connection.flush();
			return true;
		});
		this.tchat.presence();//this.room + '/' + this.pseudo);
		/*this.connection.send(
			$pres({to: this.room + '/' + this.pseudo})
//			.c('x', {xmlns:"http://jabber.org/protocol/muc"})
//			.up()
//			.c('status').t('available')
			.tree());*/
		poem.log(this.room + ' is here');
	},
	/** send message to that room */
	message: function(blabla) {
		var msg = $msg({
				to: this.room,
				type: 'groupchat'})
			.c('body',{}).t(blabla);
		//	poem.log(msg);*/
		this.connection.send(msg.tree());
	},
	/**
	 * send an arbitrary event to that room 
	 * @deprecated
	 */
	event: function(blabla) {
		this.connection.send($msg({
				type:'headline',
				to:this.room})
			.c('event',{})
			.t(blabla).tree());
	},
	/** register a new presence handler for that room 
	 * the handler will receive the presence object
	*/
	handlePresence: function(handler) {
		this._presence = poem.append(this._presence, handler.bind(this));
	},
	triggerPresence: function(pres) {
		for(var i=0; i < this._presence.length; i++) {
			this._presence[i](pres);
		}
	},
	handleAvailable: function(handler) {
		this._available = poem.append(this._available, handler.bind(this));
	},
	handleNotAvailable: function(handler) {
		this._notAvailable = poem.append(this._notAvailable, handler.bind(this));
	},
	handleMessage: function(handler) {
		this._message = poem.append(this._message, handler.bind(this));
	},
	triggerMessage: function(message) {
		for(var i=0; i < this._message.length; i++) {
			this._message[i](message);
		}
	}
};

poem.Behaviors = function(){
	this.behaviors = [];
};
poem.Behaviors.prototype = {
	/**
	 * Append a new behaviors to the poem stack
	 */
	append: function(behavior) {
		this.behaviors[this.behaviors.length] = behavior;
	},
	trigger: function() {
		for(var i=0; i<this.behaviors.length; i++) {
			this.behaviors[i]();
		}
	}
};
/**
 * all behaviors will be triggered, juste before connection
 */
poem.behaviors = new poem.Behaviors();
