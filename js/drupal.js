function log(what) {
	console.log(what);
}

function rawInput(data) {
	log('RECV: ' + data);
}

function rawOutput(data) {
	log('SENT: ' + data);
}

Array.prototype.append = function(a) {
	this[this.length] = a;
}

var Tchat = function(service, login, passwd) {
	this.login = login;
	this.passwd = passwd;
	this.connection = new Strophe.Connection(service);
	this.connection.rawInput = rawInput;
	this.connection.rawOutput = rawOutput;
	this.connection.tchat = this;
	this._room = {};
};

Tchat.prototype.connect__presence = function() {
	this.connection.send($pres().tree());
}

Tchat.prototype._doConnect = function() {
	for(var m in this) {
		if(m.slice(0,9) == "connect__") {
			log("Trigger: " + m);
			this[m]();
		}
	}
}

Tchat.prototype.connect = function() {
	log(this);
	this.connection.connect(this.login, this.passwd, Tchat_onConnect);
};

Tchat.prototype.connect_status = function(status) {
	log("Status: " +status);
}

Tchat.prototype.room = function(room) {
	if(this._room[room] == null) {
		this._room[room] = new Room(this.connection, room, 'Robert');
		this._room[room].presence();
	}
	return this._room[room];
}

Tchat_onConnect = function(status) {
	//this == Strophe.Connection
	if (status == Strophe.Status.CONNECTING) {
		log('Strophe is connecting.');
	} else if (status == Strophe.Status.CONNFAIL) {
		log('Strophe failed to connect.');
		this.tchat.connect_status('connect');
	} else if (status == Strophe.Status.DISCONNECTING) {
		log('Strophe is disconnecting.');
	} else if (status == Strophe.Status.DISCONNECTED) {
		log('Strophe is disconnected.');
		this.tchat.connect_status('disconnect');
	} else if (status == Strophe.Status.CONNECTED) {
		log('Strophe is connected.');
		this.addHandler(Tchat_onMessage, null, 'message', null, null,  null); 
		//this.send($pres().tree());
		this.tchat._doConnect();
	}
};

Tchat_onMessage = function(msg) {
	//this == Strophe.Connection
		var to = msg.getAttribute('to');
		var from = msg.getAttribute('from');
		var type = msg.getAttribute('type');
		var elems = msg.getElementsByTagName('body');
		log("Message, Type: " + type);
		if (type == "chat" && elems.length > 0) {
			var body = elems[0];
			log('DRUPALBOT: I got a message from ' + from + ': ' + 
			Strophe.getText(body));
		}
	};

	
Tchat.prototype.handleMessage = function(from, to, type, body) {
	tchat.append('<p><b>' + from + '</b> : ' + body + '</p>');
	return this;
};

var Room = function(connection, room, pseudo) {
	this.connection = connection;
	this.room = room;
	this.pseudo = pseudo;
}

Room.prototype = {
	presence: function() {
		this.connection.send($pres({
			to: this.room + '/' + this.pseudo}).tree());
	},
	message: function(blabla) {
		var msg = $msg({
				to: this.room,
				type: 'groupchat'});
		msg.c('body',{}).t(blabla);
		this.connection.send(msg.tree());
	}
}