/**
 * @file init.js initializes for multi user chat init
 * D6 was Drupal.behaviors._muc_init = function(context) {
 * For D7 moved into Drupal.behaviors.Strophe context
 *
 *
 */

var xmpp;

(function ($) {

Drupal.behaviors.Strophe._muc_init = {
	attach: function(context) {
	  xmpp = new poem.XMPP(
		  Drupal.settings.xmpp.bosh_service,
		  Drupal.settings.xmpp.jid,
		  Drupal.settings.xmpp.passwd,
		  Drupal.settings.xmpp.nickname
	  );
  }
})(jQuery);

