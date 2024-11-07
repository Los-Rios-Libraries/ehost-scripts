<?php

// allow file to be retrieved via AJAX on remote server
$http_origin = $_SERVER['HTTP_ORIGIN'];

// if (strpos($http_origin, 'ebscohost.com') > -1)
// {  
    header('Access-Control-Allow-Origin: ' . $http_origin);
// }
// header("Content-Type: text/plain");
$note = '';
//$note = 'Films on Demand is currently down (Oct 9 2018 10:45 am)';

// edit and then uncomment the line below. include date/time of posting

 $note = 'EBSCO is changing in January 2025. Personal folders will <em>not</em> be transferred to the new layout. <a href="https://connect.ebsco.com/s/article/New-EBSCOhost-Quick-Start-Guide?language=en_US" target="_blank">More about the new EBSCOhost</a>';

echo $note;

