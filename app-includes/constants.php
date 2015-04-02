<?php
/**

*/

# Names
define( 'APP_NAME', 'Reporting');

# Folders
define( 'APPCONTENT', 'app-content/' );
define ( 'LIB', APPURL . '/app-includes/lib/');
#define ( 'BOOTSTRAPPATH', APPURL . APPINC . 'bootstrap-2.3.2/' );

# Path
define( 'SAVE_KEY', 'save' );
define( 'DATA_KEY', 'data' );
define( 'SAVE_FILTER_KEY', 'save-filter' );

# Standard pages
define( 'PAGE_LOGIN', 'login.php' );
define( 'PAGE_ERROR', ABSPATH . APPCONTENT . 'error.php' );

# Database tables
define( 'TABLE_DATA_TYPE', 'app_data_type' );
define( 'TABLE_DATA_FIELD', 'app_data_field' );
define( 'TABLE_DATA_FIELD_META', 'app_data_field_meta' );
define( 'TABLE_DATA_ENTRY', 'app_data_entry' );
define( 'TABLE_DATA_ENTRY_META', 'app_data_entry_meta' );
define( 'TABLE_USER_META', 'app_user_meta' );
define( 'TABLE_DA_DATA', 'app_da_data' );
define( 'TABLE_PARAM', 'app_param' );
define( 'TABLE_REPORT_TYPE', 'app_report_type' );
define( 'TABLE_REPORT_DATA', 'app_report_data' );
define( 'TABLE_USER', 'app_user' );

define( 'REPORT_MAX_HISTORY', 5 );

# Widgets list
$widget_include = '<script src="' . APPURL . APPINC . 'js/widgets.js?rand=' . time() . '"></script>' . PHP_EOL;
$widget_include .= '<script src="' . APPURL . APPINC . 'js/widgets/widget-report-number.js?rand=' . time() . '"></script>' . PHP_EOL;
$widget_include .= '<script src="' . APPURL . APPINC . 'js/widgets/widget-report-datatable.js?rand=' . time() . '"></script>' . PHP_EOL;
$widget_include .= '<script src="' . APPURL . APPINC . 'js/widgets/widget-report-chart.js?rand=' . time() . '"></script>' . PHP_EOL;
$widget_include .= '<script src="' . APPURL . APPINC . 'js/widgets/widget-report-filter.js?rand=' . time() . '"></script>' . PHP_EOL;
$widget_include .= '<script src="' . APPURL . APPINC . 'js/widgets/widget-empty.js?rand=' . time() . '"></script>' . PHP_EOL;


# Headers
$include_report = '<script src="' . LIB . 'zeroclipboard-2.2.0/ZeroClipboard.js"></script>' . PHP_EOL;
$include_report .= '<link rel="stylesheet" media="screen" href="' . APPURL . APPINC . 'css/handsontable.full.css">' . PHP_EOL;
$include_report .= '<link rel="stylesheet" media="screen" href="' . APPURL . APPINC . 'css/pikaday.css">' . PHP_EOL;
$include_report .= '<link rel="stylesheet" media="screen" href="' . APPURL . APPINC . 'css/report-css.css?rand=' . time() . '">' . PHP_EOL;
$include_report .= '<script src="' . APPURL . APPINC . 'js/marked.min.js"></script>' . PHP_EOL;
$include_report .= '<script src="' . APPURL . APPINC . 'js/pikaday.js?rand=' . time() . '"></script>' . PHP_EOL;
$include_report .= "<script>reportMarkdown = " . file_get_contents(ABSPATH."report-markdown.json") . ";</script>" . PHP_EOL;
$include_report .= '<script src="' . APPURL . APPINC . 'js/handsontable.full.js?rand=' . time() . '"></script>' . PHP_EOL;
$include_report .= '<script src="' . APPURL . APPINC . 'js/column.js?rand=' . time() . '"></script>' . PHP_EOL;
$include_report .= '<script src="' . APPURL . APPINC . 'js/report.js?rand=' . time() . '"></script>' . PHP_EOL;
define( 'INCLUDE_REPORT', $include_report );

$include_dashboard_admin = '<link rel="stylesheet" media="screen" href="' . LIB . '/bootstrap-tagsinput-0.5.0/bootstrap-tagsinput.css">' . PHP_EOL;
$include_dashboard_admin .= '<script src="' . LIB . '/bootstrap-tagsinput-0.5.0/bootstrap-tagsinput.min.js"></script>' . PHP_EOL;
$include_dashboard_admin .= '<script src="' . LIB . '/bootstrap3-typeahead-3.1.0/bootstrap3-typeahead.min.js"></script>' . PHP_EOL;
$include_dashboard_admin .= '<script src="' . LIB . '/packery-1.3.2/packery.pkgd.min.js"></script>' . PHP_EOL;
$include_dashboard_admin .= '<script src="' . APPURL . APPINC . 'js/draggabilly.pkgd.min.js"></script>' . PHP_EOL;
$include_dashboard_admin .= $widget_include;
$include_dashboard_admin .= '<script src="' . APPURL . APPINC . 'js/dashboard-admin.js?rand=' . time() . '"></script>' . PHP_EOL;
define( 'INCLUDE_DASHBOARD_ADMIN', $include_dashboard_admin );

$include_dashboard = '<link rel="stylesheet" media="screen" href="' . APPURL . APPINC . 'css/handsontable.full.css">' . PHP_EOL;
$include_dashboard .= '<script src="' . APPURL . APPINC . 'js/handsontable.full.js?rand=' . time() . '"></script>' . PHP_EOL;
$include_dashboard .= '<script src="' . LIB . '/bootstrap3-typeahead-3.1.0/bootstrap3-typeahead.min.js"></script>' . PHP_EOL;
$include_dashboard .= '<script src="' . LIB . '/packery-1.3.2/packery.pkgd.min.js"></script>' . PHP_EOL;
$include_dashboard .= '<script src="' . LIB . '/datatables-1.10.5/jquery.dataTables.min.js"></script>' . PHP_EOL;
$include_dashboard .= '<script src="' . LIB . '/datatables-1.10.5/tabletools/js/dataTables.tableTools.min.js"></script>' . PHP_EOL;
$include_dashboard .= '<script src="' . LIB . '/datatables-1.10.5/bootstrap/dataTables.bootstrap.min.js"></script>' . PHP_EOL;
$include_dashboard .= '<script src="' . LIB . '/highcharts-4.1.1/highcharts.js"></script>' . PHP_EOL;
$include_dashboard .= '<script src="' . LIB . '/highcharts-4.1.1/modules/exporting.js"></script>' . PHP_EOL;
$include_dashboard .= '<script src="' . LIB . '/highcharts-4.1.1/modules/canvas-tools.js"></script>' . PHP_EOL;
$include_dashboard .= '<script src="' . LIB . '/jspdf-1.0.272/jspdf.min.js"></script>' . PHP_EOL;
$include_dashboard .= '<script src="' . LIB . '/highcharts-4.1.1/non-official-modules/export-csv.js"></script>' . PHP_EOL;
$include_dashboard .= '<script src="' . LIB . '/highcharts-4.1.1/non-official-modules/highcharts-export-clientside.js?rand=' . time() . '"></script>' . PHP_EOL;
$include_dashboard .= $widget_include;
$include_dashboard .= '<script src="' . APPURL . APPINC . 'js/column.js?rand=' . time() . '"></script>' . PHP_EOL;
$include_dashboard .= '<script src="' . APPURL . APPINC . 'js/dashboard.js?rand=' . time() . '"></script>' . PHP_EOL;
$include_dashboard .= '<script src="' . APPURL . APPINC . 'js/datasource.js?rand=' . time() . '"></script>' . PHP_EOL;
define( 'INCLUDE_DASHBOARD', $include_dashboard );
