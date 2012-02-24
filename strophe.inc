<?php
/**
 * @file strophe_jid($user), builder strophe_user. Uses strophe_place, strophe_domain system variables
 * Depends on ejabberd_auth drupalAuth.inc file.
 */

include_once DRUPAL_ROOT . '/' . drupal_get_path('module', 'ejabberd_auth') . '/drupalAuth.inc';

/**
 * strophe_jid($user)
 * Build a jabber id from a drupal user
 * @return string 
 * Uses strophe_place, strophe_domain system variables
 */
function strophe_jid($user) {
  return is_string($user) ? $user : $user->name . '@'
		. variable_get('strophe_domain', 'jabber.org') . '/'
		. variable_get('strophe_place', 'Drupal_Strophe_Client');
}


class strophe_user {
  function __construct($user) {
    $this->jid = strophe_jid($user);
    $this->nickname = $user->name;
  }
}
