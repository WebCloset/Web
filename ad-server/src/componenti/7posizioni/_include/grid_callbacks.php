<?php
/*
    function for grid list
*/

function show_position_name($v,$id) {
    global $obj;
    $link = str_replace("##id_posizione##",$id,$obj->linkmodifica);
    return '<a href="'. $link.'" title="{Edit}"><u>'.$v.'</u></a>';
 }

 function link_activeNow($v,$id) {
    global $obj;
    $link = "../7banner/index.php?combotipo={$id}%7CA&combotiporeset=reset&comboclient=-999&combocampaign=-999&keyword=";
    return '<a href="'. $link.'" title="{View}"><u>'.$v.'</u></a>';
 }