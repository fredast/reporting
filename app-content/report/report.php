<?php
/**


*/

$page_path_level += 1;
$report_key = $page_path[$page_path_level];

if($report_key == 'misc'){
	require(ABSPATH . APPCONTENT . 'misc/misc.php');
}

page_header( 'Report', INCLUDE_REPORT);

require(ABSPATH . APPCONTENT . 'report/report-template.html');

//$all = (isset($_POST["showAll"]) && $_POST["showAll"]) ? "true" : "false";
$all = isset($_POST["showAll"]) ? ($_POST["showAll"] === True || $_POST["showAll"] == "true" ? "true" : '"'.$_POST["showAll"].'"' ) : "false";
//$team = (isset($_POST["showTeam"]) && $_POST["showTeam"]) ? "true" : "false";
$team = isset($_POST["showTeam"]) ? ($_POST["showTeam"] === True || $_POST["showTeam"] == "true" ? "true" : '"'.$_POST["showTeam"].'"' ) : "false";
$cameleon = (isset($_POST["cameleon"])) ? '"' . $_POST["cameleon"] . '"' : "false";
$script = '<script>' . PHP_EOL;
$script .= 'var report1 = new Report("' . APPURL . 'data/", "' . $report_key . '", ' . $all . ', ' . $team . ', ' . $cameleon . ');' . PHP_EOL;
$script .= '</script>' . PHP_EOL;
echo $script;

app_die();
