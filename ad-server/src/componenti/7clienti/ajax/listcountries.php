<?php
/**
 * get list of countries in json format
 */
header('Content-Type: application/json');

$root="../../../../";
include($root."src/_include/config.php");

$term = postget("term","");
$id = postget("id","0");

if($term!="") {
    $stmt = $conn->prepare("SELECT * FROM ".DB_PREFIX."countries WHERE CONCAT(name,' (',code,')') LIKE ?");
    $search = "%".$term."%";
    $stmt->bind_param("s", $search);
    $stmt->execute();
    $res = $stmt->get_result();
    $comuni = array();
    while($row = $res->fetch_array()) {
        $comuni[] = array("id"=>$row['id'],"value"=>$row['name']." (".$row['code'].")");
    }
    echo json_encode($comuni);
} else {

    if($id!="0") {
        echo json_encode(execute_scalar("SELECT CONCAT(name,' (',code,')') FROM ".DB_PREFIX."countries where id='$id'",""));
    }

}
