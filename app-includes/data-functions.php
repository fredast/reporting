<?php
/**


*/

function get_data(){
	if(isset($_POST['type']) and isset($_POST['request'])){
		$type = $_POST['type'];
		$request = $_POST['request'];
	}
	else{
		echo 'Missing type/request!';
		die();
	}
	if($type == 'dashboard'){
		if($request == 'save'){
			da_save();
		}
		if($request == 'load'){
			da_load();
		}
	}
	if($type == 'report'){
		if($request == 'save'){
			report_save();
		}
		if($request == 'load'){
			report_load();
		}
	}
	if($type == 'userOptions'){
		if($request == 'save'){
			userOptions_save();
		}
	}

	app_die();
}

/*
	------------
	Dashboard
	------------
*/

function da_save(){
	global $appdb, $user_options;

	// Check if the user is admin
	if(!isset($user_options['json_private']->access) or array_search('ADMIN', $user_options['json_private']->access) == false){
		die();
	}

	if(isset($_POST['data'])){
		$data = $_POST['data'];
	}
	else{
		echo 'No data!';
		die();
	}

	foreach($data as &$entry){
		// New entry
		if(!isset($entry['dbId'])){
			$appdb->query_void('INSERT INTO ' . TABLE_DA_DATA . ' (json) VALUES (?)', array(json_encode(array())));
			$entry['dbId'] = $appdb->lastInsertId();
		}
		// Update entry
		unset($entry['modified']);
		$appdb->query_void('UPDATE ' . TABLE_DA_DATA . ' SET json = ? WHERE id = ?', array(json_encode($entry), $entry['dbId']));

		// Delete entry
		if(isset($entry['deleted']) and $entry['deleted']){
			$appdb->query_void('DELETE FROM ' . TABLE_DA_DATA . ' WHERE id = ?', array($entry['dbId']));
		}
	}

	echo 'Success!';
	app_die();
}

function da_load(){
	global $appdb, $user_options;
	//Query the database
	// DATA
	$req = $appdb->query_all('SELECT * FROM ' . TABLE_DA_DATA, array());
	$data = array();
	foreach($req as &$entry){
		$data[] = json_decode($entry['json']);
	}
	// ARG LIST
	$arg_list = $appdb->get_param('arg_list');
	foreach($arg_list as &$arg){
		$arg->listData = $appdb->get_param($arg->listName);
	}
	// TAG LIST
	$misc_param = $appdb->get_param('misc_param');
	$misc_param->tagsTypeahead = $appdb->get_param($misc_param->tagsTypeaheadList);
	// REPORT TYPE LIST
	$req = $appdb->query_all('SELECT * FROM ' . TABLE_REPORT_TYPE, array());
	$type_list = array();
	foreach($req as &$type){
		$type_list[] = json_decode($type['json']);
	}
	//Return the data
	$result = array('data' => $data, 'argList' => $arg_list, 'miscParam' => $misc_param, 'user' => $user_options['json_private'], 'userOptions' => $user_options['json_public'], 'reportTypeList' => $type_list);
	echo json_encode($result);
	app_die();
}

/*
	------------
	Report
	------------
*/

function report_load(){
	global $appdb, $login, $user_options;
	$all = false;
	if(isset($_POST['all']) && $_POST['all'] == "true"){
		$all = true;
	}
	$team = false;
	if(isset($_POST['team']) && $_POST['team'] == "true"){
		$team = true;
	}
	# Cameleon mode
	if(isset($_POST['cameleon']) && $_POST['cameleon'] != "false"){
		$as_login = $_POST['cameleon'];
	}
	else{
		$as_login = $login;
	}

	if(!isset($_POST['dataType'])){
		echo 'No data type!';
		die();
	}

	# SUPERADMIN
	$superadmin = false;
	if(isset($user_options['json_private']->access) and array_search('SUPERADMIN', $user_options['json_private']->access)){
		$superadmin = true;
	}


	// Get the data type
	$req = $appdb->query_first('SELECT * FROM ' . TABLE_REPORT_TYPE . ' WHERE code = ?', array($_POST['dataType']));
	if($req == false){
		echo 'No data type!';
		die();
	}
	$data_type = json_decode($req['json']);
	foreach($data_type->columns as &$column){
		if(isset($column->sourceList)){
			$column->source = $appdb->get_param($column->sourceList);
		}
	}

	// Configure read / write for team
	if($team){
		if(isset($user_options['json_private']->teamRead)){
			$read = true;
			$teamRead = $user_options['json_private']->teamRead;
		}
		else{
			$read = false;
		}
		if(isset($user_options['json_private']->teamWrite)){
			$write = true;
			$teamWrite = $user_options['json_private']->teamWrite;
		}
		else{
			$write = false;
		}
	}

	//Query the database
	if($all || $team){
		$req = $appdb->query_all('SELECT * FROM ' . TABLE_REPORT_DATA . ' WHERE type = ? AND deleted = 0', array($data_type->code));
	}
	else{
		// $req = $appdb->query_all('SELECT * FROM ' . TABLE_REPORT_DATA . ' WHERE type = ? AND user = ? AND deleted = 0', array($data_type->code, $login));
		$req = $appdb->query_all('SELECT * FROM ' . TABLE_REPORT_DATA . ' WHERE type = ? AND deleted = 0', array($data_type->code));
	}

	//Get the last historical entry
	$data = array();
	foreach($req as &$entry){
		$histo = json_decode($entry['json']);
		$last_entry = end($histo);
		$add = true;
		if(!$all){
			// Check if the user is related to the entry
			$add = $entry['user'] == $as_login || (isset($last_entry->pricer) && $last_entry->pricer == $as_login) || (isset($last_entry->pricer2) && $last_entry->pricer2 == $as_login);
		}
		if(!$all && !$add && $team){
			if($read){
				$add = $add || (isset($last_entry->pricer) && (array_search($last_entry->pricer, $teamRead) !== false));
				$add = $add || (isset($last_entry->pricer2) && (array_search($last_entry->pricer2, $teamRead) !== false));
			}
			if($write){
				$add = $add || (isset($last_entry->pricer) && (array_search($last_entry->pricer, $teamWrite) !== false));
				$add = $add || (isset($last_entry->pricer2) && (array_search($last_entry->pricer2, $teamWrite) !== false));
			}
		}
		// Secret
		if(isset($last_entry->secret) && ($last_entry->secret === "true" || $last_entry->secret === true) && $login !== $entry['user']){
			if(!$superadmin){
				$add = false;
			}
		}
		// No longer check if the user can access
		if($add){
			$data[] = $last_entry;
		}
	}

	//Return the data
	if($login=='spark_script')
		$result = array('dataType' => $data_type, 'data' => $data);
	else
		$result = array('dataType' => $data_type, 'data' => $data, 'user' => $user_options['json_private'], 'userOptions' => $user_options['json_public']);
	echo json_encode($result);
}

function report_save(){
	global $appdb, $login, $user_options;
	if(isset($_POST['data'])){
		$data = $_POST['data'];
	}
	else{
		echo 'No data!';
		die();
	}
	if(!isset($_POST['dataType'])){
		echo 'No data type!';
		die();
	}

	//Cameleon
	if(isset($_POST['cameleon']) && $_POST['cameleon'] != "false"){
		$as_login = $_POST['cameleon'];
	}
	else{
		$as_login = $login;
	}

	//Get access data
	if(isset($user_options['json_private']->access)){
		$is_access = true;
		$access = $user_options['json_private']->access;
	}
	else{
		$write = false;
	}
	if(isset($user_options['json_private']->teamWrite)){
		$write = true;
		$teamWrite = $user_options['json_private']->teamWrite;
	}
	else{
		$write = false;
	}


	foreach($data as &$entry){
		// New entry
		if(!isset($entry['dbId']) || $entry['dbId'] == "null" || $entry['dbId'] == null){
			$appdb->query_void('INSERT INTO ' . TABLE_REPORT_DATA . ' (json, user, type) VALUES (?, ?, ?)', array(json_encode(array()), $as_login, $_POST['dataType']));
			$entry['dbId'] = $appdb->lastInsertId();
			$entry['createdUser'] = $login;
			$entry['createdTime'] = time();
		}
		// Query the entry history
		$req = $appdb->query_first('SELECT * FROM ' . TABLE_REPORT_DATA . ' WHERE id = ?', array($entry['dbId']));
		if($req == false){
			continue;
		}
		$data_array = json_decode($req['json']);
		while(count($data_array) > REPORT_MAX_HISTORY){
			reset($data_array);
			unset($data_array[key($data_array)]);
			$data_array = array_values($data_array);
		}
		$last_entry = end($data_array);
		//Add meta to the entry
		$entry['updatedUser'] = $login;
		$entry['updatedTime'] = time();
		unset($entry['modified']);

		// Check if the user can edit
		$allowed = ($req["user"] == $login) || ($last_entry->pricer == $login) || ($last_entry->pricer2 == $login);
		if(!$allowed){
			if($is_access){
				$allowed = $allowed || (array_search("ADMIN", $access) !== false) || (array_search("SUPERVIEWER", $access) !== false);
			}
			if($write){
				$allowed = $allowed || (isset($last_entry->pricer) && (array_search($last_entry->pricer, $teamWrite) !== false));
				$allowed = $allowed || (isset($last_entry->pricer2) && (array_search($last_entry->pricer2, $teamWrite) !== false));
			}
		}
		if($allowed){
			// Add the entry to the history
			$data_array[] = $entry;
			$appdb->query_void('UPDATE ' . TABLE_REPORT_DATA . ' SET json = ? WHERE id = ?', array(json_encode($data_array), $entry['dbId']));
			// Mark the entry as deleted if necessary
			if(isset($entry['deleted']) && $entry['deleted']){
				$appdb->query_void('UPDATE ' . TABLE_REPORT_DATA . ' SET deleted = 1 WHERE id = ?', array($entry['dbId']));
			}
		}
	}

	echo 'Done!';
}

function save_data_spark(){
	global $appdb;
	if(isset($_POST['data'])){
		$data = $_POST['data'];
	}
	else{
		echo 'No data!';
		die();
	}
	if(isset($data['ref'])){
		$ref = $data['ref'];
	}
	else{
		echo 'No data!';
		die();
	}

	// Query the database
	$deals_code = 'deals';
	$req = $appdb->query_all('SELECT * FROM ' . TABLE_REPORT_DATA . ' WHERE type = ? AND deleted = 0', array($deals_code));

	// Check if already exist and had been modified by a user
	$edit = false;
	foreach($req as &$entry){
		//Get the last historical entry
		$histo = json_decode($entry['json']);
		$last_entry = end($histo);

		if(property_exists($last_entry,'ref') && $last_entry->ref == $ref){
			if($last_entry->updatedUser == 'spark_script'){
				$edit = true;
				$data['dbId'] = $last_entry->dbId;
				break;
			}
			echo 'KO : Already exist';
			die();
		}
	}

	// Add to the database
	if(!$edit){
		$appdb->query_void('INSERT INTO ' . TABLE_REPORT_DATA . ' (json, user, type) VALUES (?, ?, ?)', array(json_encode(array()), $data['user'], $deals_code));
		$data['dbId'] = $appdb->lastInsertId();
	}
	$data['createdUser'] = 'spark_script';
	$data['createdTime'] = time();
	$data['updatedUser'] = 'spark_script';
	$data['updatedTime'] = time();
	$appdb->query_void('UPDATE ' . TABLE_REPORT_DATA . ' SET json = ? WHERE id = ?', array(json_encode(array($data)), $data['dbId']));
	echo 'OK';
}

/*
	------------
	UserOptions
	------------
*/

function userOptions_save(){
	global $user_options;
	if(isset($_POST['data'])){
		$data = $_POST['data'];
	}
	else{
		echo 'No data!';
		die();
	}

	user_save_public_options($data);

	echo 'Options saved!';
}
