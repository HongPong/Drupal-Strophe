<?php
/**
 *
 * @file builder strophe_user. strophe_jid($user),
 * Uses system variables strophe_place, strophe_domain
 * Depends on ejabberd_auth drupalAuth.inc file.
 *
 * strophe_jid($user):
 * @return string user@strophe_domain.strophe_place
 */

include_once DRUPAL_ROOT . '/' . drupal_get_path('module', 'ejabberd_auth') . '/drupalAuth.inc';

class strophe_user {
  /**
   * constructor makes $user with $this->jid and $this->nickname
   *
   */
  function __construct($user) {
    $debug = (bool)variable_get('strophe_debug', '');
    if ($debug) {
      drupal_set_message('strophe.inc constructing strophe $user ' . $user->name);
    }
    if (0 != $user->uid) {
      $this->jid = strophe_jid($user);
      $this->nickname = $user->name;
    }
    else {
      drupal_set_message('strophe.inc tried to build strophe_user for anon UID 0 oops');
    }
  }
}

/**
 * strophe_jid($user)
 * Build a jabber id from a drupal user
 * @return string user@strophe_domain.strophe_place
 * Uses strophe_place, strophe_domain system variables
 */
function strophe_jid($user) {
  $debug = (bool)variable_get('strophe_debug', '');
  if ($debug) {
    drupal_set_message('strophe.inc strophe_jid for $user ' . $user->name);
  }

  return is_string($user) ? $user : $user->name . '@'
  . variable_get('strophe_domain', 'jabber.org') . '/'
	. variable_get('strophe_place', 'Drupal_Strophe_Client');
}