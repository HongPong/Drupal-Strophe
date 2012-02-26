<?php
/*
 * @file strophe status form template generator #strophe-status
 * 
 * prints a status select menu #strophe-status, away, "", chat as options
 */
 
 $debug = (bool)variable_get('strophe_debug', '');
if ($debug) {  
        drupal_set_message('tpl strophe_status tpl php ');
      } ?>
<form>
	<select name="status" id="strophe-status">
		<option value="away"><?php print t('Away');?></option>
		<option value=""><?php print t('Available');?></option>
		<option value="chat"><?php print t('Free for chat');?></option>
	</select>
</form>