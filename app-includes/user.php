<?php
if(MODE == MODE_SOCGEN){
	require_once(dirname(dirname(dirname(__FILE__))) . '/login/markeng_session_check.php');
}

/* Check is the user is logged in, redirect  */
function user_check_login() {
	global $login, $appdb;
	// Exception Spark Script
	if(isset($_POST['spark']) and $_POST['spark'] == SPARK_PASSWORD){
		$login='spark_script';
	}
	else{
		/* Version Fred */
		if(MODE == MODE_FRED){
			$login='olivier.borderies';
			#$login='raphaelle.jacquemin';
		}
		/* Version SESAME */
		if(MODE == MODE_SOCGEN){
			$thisApp='Reporting';
			$login=CheckSSO($thisApp);
			if($login == 'olivier.borderies'){
				$login = 'olivier.borderies';
			}
		}
		get_user_options();
		give_admin_rights();
	}
}

function get_user_options(){
	global $appdb, $login, $user_options;
	$req = $appdb->query_first('SELECT * FROM ' . TABLE_USER . ' WHERE user = ?', array($login));
	// Enter the user in the database if he/she doesn't exist
	if($req == false){
		// Add the user
		$appdb->query_void('INSERT INTO ' . TABLE_USER . ' (user, json_public, json_private) VALUES (?, ?, ?)', array($login, '{}', '{}'));
		$req = $appdb->query_first('SELECT * FROM ' . TABLE_USER . ' WHERE user = ?', array($login));
	}
	$req['json_public'] = json_decode($req['json_public']);
	$req['json_private'] = json_decode($req['json_private']);
	// Update the user
	$req['json_private']->last_visit = time();	
	$appdb->query_void('UPDATE ' . TABLE_USER . ' SET json_private = ? WHERE user = ?', array(json_encode($req['json_private']), $login));
	// Save the user options as a global variable
	$user_options = $req;
}

function give_admin_rights(){
	global $appdb, $user_options;
	if(isset($user_options['json_private']->access) and (array_search('ADMIN', $user_options['json_private']->access) == true or 
		array_search('SUPERVIEWER', $user_options['json_private']->access) == true)){
		$req = $appdb->query_all('SELECT user FROM ' . TABLE_USER, array());
		$user_list = array();
		foreach($req as &$entry){
			$user_list[] = $entry["user"];
		}
		$user_options['json_private']->teamWrite = $user_list;
	}
}

function user_save_public_options($options){
	global $appdb, $login, $user_options;
	
	// Modify the options
	foreach($options as $key => &$option){
		$user_options['json_public']->{$key} = $option;
	}
	// Save the options
	$appdb->query_void('UPDATE ' . TABLE_USER . ' SET json_public = ? WHERE user = ?', array(json_encode($user_options['json_public']), $login));
}
