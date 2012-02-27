/**
 * @file poem.behaviors.append MUC chat
 * 
 * 
 * xmpp.handleConnect, muc_room.handleMessage, tchat.scrollTop, 
 * jQuery selectors #info, #muc-form, #muc-msg, #event, #tchat
 */

poem.behaviors.append(function(){
  var info = $("#info");
  xmpp.handleConnect(function(status) {
		poem.log(['room connect', Strophe.Status.CONNECTED == status]);
      if(Strophe.Status.CONNECTED == status) {
        info.empty();
      }
      else {
        info.text(poem.Tchat.status(status));
      }
      return true;
    });
  /*
   * multi-user chat handleMessage (msg)
   */
  muc_room.handleMessage(function(msg) {
    poem.log(msg);
    tchat.append(
      $("<li>")
      .append($("<b>").text((msg.nick != null) ? msg.nick : msg.from_jid.place))
      .append(": " + msg.body)
    );
  tchat.scrollTop(tchat.attr('scrollHeight'));
  });

  var tchat = $('#tchat');
  poem.log(['muc-form',$('#muc-form')]);
  $('#muc-form').submit(function() {
    muc_room.message($('#muc-msg').val());
    $('#muc-msg').val("");
    return false;
  });
  $('#event').click(function(){
    room.event('admin@tchat.tld', 'carotte');
    return false;
  });
});