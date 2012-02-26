<?php 
/**
 *
 * @file themes chatroom from $chatroom->room 
 */
$debug = (bool)variable_get('strophe_debug', '');
if ($debug) {  
        drupal_set_message('theme strophe_muc_room tpl php');
      }
?>

<h3><?php echo $chatroom->room; ?></h3>
<div id="info"></div>

<div id="tchat"></div>

<form id="muc-form">
<input type="text" name="tchat" id="muc-msg"/>
<input type="submit" value="Tchat" id="muc-doGroup"/>
</form>

<!--<a href="#" id="event">event</a>-->
