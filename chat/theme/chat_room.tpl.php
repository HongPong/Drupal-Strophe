<?php
/**
 * @file chat room theme, submit for #discussion-doTchat
 *
 *
 */
$debug = (bool)variable_get('strophe_debug', '');
if ($debug) {
  drupal_set_message(t(filter_xss('chat_room tpl php with $other->name' . echo $other->name ' . ')));
}
?>
<h2>Discussion with <?php echo $other->name; ?></h2>

<form id="discussion-form">
	<input type="text" id="discussion-msg"/>
	<input type="submit" value="Tchat" id="discussion-doTchat"/>
</form>
<!--<a href="#" class="discussion-event">red</a><br/>
<a href="#" class="discussion-event">lime</a><br/>
<a href="#" class="discussion-event">white</a><br/>
<a href="#" class="discussion-event">navy</a><br/>-->
<div id="discussion" style="border: dotted thin black;height: 100px;overflow: auto;">
	
</div>
