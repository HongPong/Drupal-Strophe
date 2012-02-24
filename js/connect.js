/* @file anonymous callback function for poem.behaviors trigger() xmpp.connect()
 *
 */
$(function() {
	//poem.log(['xmpp', xmpp]);
	//poem.log(['room', muc_room]);
	poem.behaviors.trigger();
	xmpp.connect();
});