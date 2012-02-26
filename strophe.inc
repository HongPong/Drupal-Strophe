<?php
/**
 * @file strophe_jid($user), builder strophe_user. Uses strophe_place, strophe_domain system variables
 * Depends on ejabberd_auth drupalAuth.inc file.
 */

include_once DRUPAL_ROOT . '/' . drupal_get_path('module', 'ejabberd_auth') . '/drupalAuth.inc';

class strophe_user {
  
  function __construct($user) {
    $debug = (bool)variable_get('strophe_debug', '');
    if ($debug) {drupal_set_message('strophe.inc constructing strophe $user '. echo $user->name);}

    $this->jid = strophe_jid($user);
    $this->nickname = $user->name;
  }
}

/**
 * strophe_jid($user)
 * Build a jabber id from a drupal user
 * @return string 
 * Uses strophe_place, strophe_domain system variables
 */
function strophe_jid($user) {
  $debug = (bool)variable_get('strophe_debug', '');
  if ($debug) {drupal_set_message('strophe.inc strophe_jid for $user '. echo $user->name);}

  return is_string($user) ? $user : $user->name . '@'
		. variable_get('strophe_domain', 'jabber.org') . '/'
		. variable_get('strophe_place', 'Drupal_Strophe_Client');
}


