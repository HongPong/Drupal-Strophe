/**
 * @file appends xmpp status updates
 * jquery selector #strophe-status
 * in D6 was poem.behaviors.append(function() {
 */

(function ($) {

Drupal.behaviors.Strophe.poem.behaviors.append = {
	
	var status = $("#strophe-status");
	var st = xmpp.show();
	var cpt = 0;
	$(status[0].options).each(function() {
		if(st == this.value) {
			status[0].selectedIndex = cpt;
		}
		cpt++;
	});
	status.change(function() {
		Drupal.behaviors.Strophe.xmpp.show(this.options[this.selectedIndex].value);
		Drupal.behaviors.Strophe.xmpp.presence();
	  Drupal.behaviors.Strophe.xmpp.flush();
	});
})(jQuery);
