<?php
/**


*/
if (empty($_POST) && $_SERVER['REQUEST_METHOD']=='POST' && $_SERVER['CONTENT_TYPE']=='application/json; charset=UTF-8'){
	$_POST=json_decode(file_get_contents('php://input'),TRUE);
}

# TEST ZONE

# Initialise
require( dirname( __FILE__ ) . '/app-config.php' );

# Get page
require( ABSPATH . APPINC . 'page-loader.php' );