/* @file anonymous callback function for poem.behaviors trigger() xmpp.connect()
 *
 * was $(function() {
 */
/*$(document).ready(function() {
	//poem.log(['xmpp', xmpp]);
	//poem.log(['room', muc_room]);
	poem.behaviors.trigger();
	xmpp.connect();
});*/


/* beejeebus method */
/*
(function ($) {
	//poem.log(['xmpp', xmpp]);
	//poem.log(['room', muc_room]);
	poem.behaviors.trigger();
	Drupal.behaviors.Strophe.xmpp.connect();
})(jQuery);*/

(function ($) {
Drupal.behaviors.Strophe = {
  attach: function (context, settings) {
    Drupal.behaviors.Strophe.poem.behaviors.trigger();
	  Drupal.behaviors.Strophe.xmpp.connect();
  }
})(jQuery);