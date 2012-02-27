 /**
  * @file muc event hook
  * was Drupal.behaviors.muc = function(context){
  */

var muc_room;

(function ($) {

Drupal.behaviors.Strophe.muc = {
  attach: function (context, settings) {
    muc_room = xmpp.room(Drupal.settings.strophe.room);
    xmpp.handleHeadline('event', function(message, event) {
      poem.log(event.textContent);
    });
    xmpp.handleServerMessage(function(msg) {
      poem.log(msg);
      alert(msg.body.textContent);
    });
  }
})(jQuery);

/* old D6 version:
Drupal.behaviors.muc = function(context){
    muc_room = xmpp.room(Drupal.settings.strophe.room);
    xmpp.handleHeadline('event', function(message, event) {
        poem.log(event.textContent);
    });
    xmpp.handleServerMessage(function(msg) {
        poem.log(msg);
        alert(msg.body.textContent);
    });
};*/
