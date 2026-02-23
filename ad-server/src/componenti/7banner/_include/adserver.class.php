<?php
/*

	class to group server functionalities

*/

class adserver {

    private $media_folder = '';
    private $empty_banner_code = '';

    public function __construct( $params = array() ) {
        
        if (isset($params['media_folder'])) $this->media_folder = $params['media_folder'];
        if (isset($params['empty_banner_code'])) $this->empty_banner_code = $params['empty_banner_code'];

    }

    public function getEmptyBannerCode() {
        return $this->empty_banner_code;
    }

    /**
     * function that outputs the code of the banner, an iframe or a image with a link
     * 
     * @param string $image
     * @param int $xx
     * @param int $yy
     * @param string $href
     * @param string $target
     * 
     * @return string
     */
    private function linkBanner($image,$xx=300,$yy=250,$href="",$target="_blank",$id_iframe="") { /*linka img. Usata nei banner*/

        if(preg_match("/\\.(zip|mp4)$/i",$image)) {
            //
            // HTML5 banner in a folder
            // output an iframe which call the index.html file inside the folder
            // it can be responsive iframe if xx=-1
            //

            $referer = rawurldecode($_SERVER['HTTP_REFERER'] ?? '');
            if($xx==-1) $xx="100%"; // else $xx=$xx."px";
            
            if(!isset($_GET['t'])) {
                //
                // fallback old installations without div target                
                //
                $html ="<iframe src=\"".$href."?id=".$id_iframe."&timestamp=".rand().".".time()."&ref=".urlencode($referer)."\" id='".$id_iframe."' style=\"border:0;display:block;margin:0 auto;overflow:hidden\" scrolling=\"no\" width=\"".$xx."\" height=\"".$yy."\" allow=\"autoplay\" allowfullscreen include></iframe>";
            
            } else {


                // debug log temporaneo
                $msg = "IFRAME SERVED";
                $log = sprintf("[%s] %s | IP: %s | UA: %s REF: %s\n",
                    date('Y-m-d H:i:s'),
                    $msg,
                    $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                    $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
                    $_SERVER['HTTP_REFERER'] ?? 'unknown'
                );
                global $root;
                $name = $root . 'data/logs/'.date('Y-m-d').'_debug.log'; 
                file_put_contents($name, $log, FILE_APPEND);



                // new correct version with target div by id and resizeIframe
                $html ="<iframe id='".$id_iframe."' src=\"".$href."?id=".$id_iframe."&timestamp=".rand().".".time()."&ref=".urlencode($referer)."\" style=\"border:0;display:block;margin:0 auto;overflow:hidden\" scrolling=\"no\" width=\"".$xx."\" allow=\"autoplay\" allowfullscreen include></iframe>";

            }
        } else {

            if($xx==-1) $d="width=\"100%\""; else $d="width=\"".$xx."\" height=\"".$yy."\"";
            $html="<a rel=\"nowfollow\" href=\"".$href."\"" . ($target ? " target=\"".$target."\" ":"").">".
                "<img src=\"".$image."\" ".$d." />".
                "</a>";
        }
        return $html;
    }




    /**
     * get the counted views of a banner
     * 
     * @param array $psc cookies array
     * @param int $idbanner id of the banner to search
     * 
     * @return int
     */
    private function get_psc($psc,$idbanner) {
        for($i=0;$i<count($psc);$i++) {
            if($i%2==0 && $psc[$i]==$idbanner) {
                return $psc[$i+1];
            }
        }
        return 0;
    }

    /**
     * get the banner from db, update rotation and count views
     * 
     * @param string $posizione   id or null
     * @param string $conta       yes|no
     * @param int $id             id for direct banner
     * @param string $psc         cookies
     * 
     */
    private function getAndRotateBanner($posizione,$conta='yes',$id=0,$psc="") {
        $d = date( "Y-m-d");
        global $conn;
        $cookiname = "";
        
        if($posizione && !$id) {
            /*
                normal behaviour, banner called by position, not by id
            */
            $sql="SELECT * FROM ".DB_PREFIX."7banner WHERE (fl_stato='L' OR fl_stato='A') AND (dt_giorno1<='{$d}') AND (cd_posizione='{$posizione}') ORDER BY id_banner DESC";
        } elseif( $id) {
            /*
                old beahvaiour, banner called by id
            */
            $sql="SELECT * FROM ".DB_PREFIX."7banner WHERE  id_banner='".$id."'";
        }
        //
        // extract the banner to show
        //
        $result=$conn->query($sql) or die($conn->error."sql='$sql'<br>");
        if ($result->num_rows == 0) return array("","");
        
        $l=0; // counter for banners with L flag (last shown)
        $primo = null;
        $vecchio = null;
        $esce = null;
        while ($r=$result->fetch_array()) {


            if($id ==0 && $r['nu_maxday']>0 && $r['dt_maxday_date']==date("Y-m-d") && $r['nu_maxday_count']>$r['nu_maxday']) {
                /*
                    if daily views completed skip
                */


            } else {

                $keep=true;

                if ($id==0) {
                    
                    /* if geoip configuration check with geo ip database */
                    if($r['de_city']=="-" || $r['de_city']=="ALL") $r['de_city'] = "";
                    if($r['de_country']=="-" || $r['de_country']=="ALL") $r['de_country'] = "";
                    if($r['de_region']=="-" || $r['de_region']=="ALL") $r['de_region'] = "";
                    if( $r['de_city']!="" || $r['de_country']!="" || $r['de_region']!="") {
        
                        $row = getIP2LocationRow( getIP() );
                        $keep = false;
                        if(is_array($row) && !empty($row)) {
                            // 0. convert old records to country code (not countryu name) and same encoding utf8_bin
                            // 1. check if country has a comma separated list of country codes
                            // 2. explode by , and check if current country is in the list
                            // 3. if is DB1LITE use only countries, and could remove the region and city fields in the form 
                            //    and check here
                            // 4. there are 2 differetnt ways of work... contry-region-city and countries
                            // 5. need to test both paths

                            if ( $r['de_city'] !="" && $r['de_city']==$row['city_name'] && $r['de_region']==$row['region_name']) $keep = true; 
                            if ( $r['de_city'] =="" && $r['de_region'] !="" && $r['de_region']==$row['region_name'] && $r['de_country']==$row['country_code']) $keep = true; 
                            if ( $r['de_region'] =="" && $r['de_country'] !="" && $r['de_country']==$row['country_code']) $keep = true; 
                            if ( $r['de_country'] != "") {
                                $arCountries = explode(",",$r['de_country']);
                                if(in_array($row['country_code'],$arCountries)) $keep = true;
                            }
                        }
                    }
        
        
                    /* if redux factgor apply it*/
                    if($keep == true) {
                        // echo "F";
                        // negative values are dinamically calculated
                        // 0 no reduction
                        
                        if($r['nu_redux']<0) {
                            $dailyInfo = $this->getDailyViews($r['cd_posizione']);
                            $keep = true;
                            $v = ( $dailyInfo['v'] / 7 ) / $dailyInfo['q'];	// average views per day per banner on that position
                            
                            $days = $r['dt_giorno2']!="2099-12-31" ? (GetTimeStamp($r['dt_giorno2']) - GetTimeStamp($r['dt_giorno1'])) / 86400 : 1;
                            $viewsPerDay = $r['nu_maxtot'] / $days;
        
                            // echo "// $viewsPerDay / $v < 1 ?\n";
        
                            if ( $viewsPerDay / $v < 1) {
                                $newRedux = (int) ( - min ( (1 - ( $viewsPerDay / $v ) ) * 100, 98) );
                                // echo "// $newRedux %" . "\n";
                                if($newRedux != $r['nu_redux']) {
                                    $r['nu_redux'] = $newRedux;
                                    $sqlR="UPDATE ".DB_PREFIX."7banner SET nu_redux='" . $newRedux ."' WHERE id_banner='".$r["id_banner"]."'";
                                    $resR=$conn->query($sqlR) or die($conn->error."sqlR='$sqlR'<br>");
                                }
                            }
                        }
                        if($r['nu_redux']!=0) {
                            if( rand(0,98) < abs( $r['nu_redux'] ) ) {
                                $keep = false;
                            }
                        }
                    
                    }
        
                    /* device limitation  */
                    if($keep == true) {
                        if($r['nu_mobileflag']>0) {
                            $mobile = is_mobile();
                            if( ( $r['nu_mobileflag']==2 && !$mobile ) || ( $r['nu_mobileflag']==1 && $mobile ) ) {
                                $keep = false;
                            }
                        }
                    }
        
                    /* os limitation  */
                    if($keep == true) {
                        if($r['se_os']) {
                            $os = is_os( explode(",",$r['se_os']) );
                            if( !$os ) {
                                $keep = false;
                            }
                        }
                    }
        
                    /* frequency cap limitation */
                    if($keep == true && $r['nu_cap']>0) {
        
                            // it's a banner limited by frequency nu_cap times per user per day
                            $contatore = $this->get_psc( $psc, $r['id_banner']);
            
                            if($r['nu_cap'] > (integer)$contatore) {
                                $keep=true;
                            } else {
                                $keep=false;
                            }
        
                    }

                    /* referer limitation */
                    if($keep == true && $r['de_limit_referer']!="") {
            
                        if( stristr($_SERVER["HTTP_REFERER"] ?? '', $r['de_limit_referer']) ) {
                            $keep=true;
                        } else {
                            $keep=false;
                        }
        
                    }

                } 


                if($keep) {

                    if (!$primo) $primo=$r;							// the first record extracted
                    if ($vecchio && !$esce) $esce=$r;				// found the last one
                                                                    // set this one to be shown
                    if ($r["fl_stato"]=='L') {$vecchio=$r; $l++;}	// the last viewed, count how many has L flag
                    
                }

            }
        }
        $result->free();
        if (!$esce) $esce=$primo;		/* "esce" is the first after L, if it doesn't exists take "primo" */
        if (!$vecchio) $vecchio=$esce;  /* if there isn't the last viewed, then the last one it's "esce" */

        if(!$esce) return array("","");

        if($esce['nu_cap']>0) {
            // it's a banner limited by nu_cap times parameter
            $cookiname = "adcapban" . $esce['id_banner'];
        }

        // FIX L
        $fl='A';


        $gio=GetTimeStamp($vecchio["dt_giorno2"])-GetTimeStamp($d);
        if ($gio<0) $fl='S';

        if($vecchio['nu_maxtot']>0 && $vecchio['nu_maxtot']<=$vecchio['nu_pageviews']) $fl='S';
        if($vecchio['nu_maxclick']>0 && $vecchio['nu_maxclick']<=$vecchio['nu_clicks']) $fl='S';

        if(!$id) {
            /* flag rotation and count views */

            $sql1="UPDATE ".DB_PREFIX."7banner SET fl_stato='$fl' WHERE id_banner='".$vecchio["id_banner"]."'";
            $res1=$conn->query($sql1) or die($conn->error."sql1='$sql1'<br>");

            if ($fl=='S') {
                $sql11="UPDATE ".DB_PREFIX."7banner SET dt_giorno2=now() WHERE id_banner='".$vecchio["id_banner"]."'";
                $res11=$conn->query($sql11) or die($conn->error."sql11='$sql11'<br>");
            }
            if (($vecchio["id_banner"]!=$esce["id_banner"])or($l==0)) {
                if($esce["id_banner"]) {
                    $fl='L';
                    $sql2="UPDATE ".DB_PREFIX."7banner SET fl_stato='$fl' WHERE id_banner=".$esce["id_banner"];
                    $conn->query($sql2) or die($conn->error."sql2='$sql2'<br>");
                }
            }

            if($conta=='yes') {
                if($esce["id_banner"]) {
                    $sql2b="UPDATE ".DB_PREFIX."7banner SET ";
                    if($esce['dt_maxday_date']!=date("Y-m-d")) $sql2b.="dt_maxday_date='".date("Y-m-d")."',nu_maxday_count=0,";
                    $sql2b.="
                        nu_pageviews = nu_pageviews + 1,
                        nu_maxday_count = nu_maxday_count + 1
                        WHERE id_banner=".$esce["id_banner"];

                    $conn->query($sql2b) or die($conn->error."sql2b='$sql2b'<br>");
                }
            }

            $id = $esce["id_banner"];

        } else {
            /*
                if there is id, count directly and don't rotate
            */
            if($conta=='yes') {
                $sql2c="UPDATE ".DB_PREFIX."7banner SET ";
                if($esce['dt_maxday_date']!=date("Y-m-d")) $sql2c.="dt_maxday_date='".date("Y-m-d")."',nu_maxday_count=0,";
                $sql2c.="
                    nu_pageviews = nu_pageviews + 1,
                    nu_maxday_count = nu_maxday_count + 1
                    WHERE id_banner='".$id."'";
                $conn->query($sql2c) or die($conn->error."sql2c='$sql2c'<br>");
            }
            $posizione = $esce['cd_posizione'];

        }


        // save stats data on 7banner_stats
        // ----------------------------------------------------------------------
        // get referrer to filter data in new dashboard a
        if(isset($_SERVER['HTTP_REFERER'])){
            $parsed_url = parse_url($_SERVER['HTTP_REFERER']);
            $host = isset($parsed_url['host']) ? $parsed_url['host'] : '';
        } else $host ='';
        $q = execute_scalar("SELECT id_day FROM ".DB_PREFIX."7banner_stats WHERE id_day='".$d."' AND cd_banner='".$id."' AND de_referrer='".addslashes($host)."' AND cd_posizione='".$posizione."' limit 0,1");
        if($q==$d) $conn->query("UPDATE ".DB_PREFIX."7banner_stats SET nu_pageviews=nu_pageviews+1 WHERE id_day='".$d."' 
            AND cd_banner='".$id."'
            AND cd_posizione='".$posizione."'
            AND de_referrer='".addslashes($host)."'");
        else $conn->query("INSERT IGNORE INTO ".DB_PREFIX."7banner_stats (id_day,nu_pageviews,nu_click,cd_banner,cd_posizione,de_referrer) VALUES ('$d',1,0,'".$id."','".$posizione."','".addslashes($host)."')");
        // ----------------------------------------------------------------------

        return array( $esce, $cookiname);
    }



    private function safeName($n) {
        return preg_replace("/[^A-Za-z0-9_]/","_",$n);
    }

    public function showBanner($posizione,$conta='yes',$id=0, $psc=array()) {
        // if $conta='yes' then increase views counter
        // else don't. It's used in old codes and can be used to see if there
        // is a banner available without showing it. 
        //
        // TO BE CHECKED: maybe it's used in overlay banners (05/05/2021)
        //

        if(!$id) {
            $arf=$this->getAndRotateBanner($posizione,$conta, null, $psc);
            $f = $arf[0];
            $fcookie = $arf[1];

        } else {

            $arf=$this->getAndRotateBanner(null,$conta,$id, $psc);
            $f = $arf[0];
            $fcookie = $arf[1];

        }

        // can be used to create a personalized AD BLOCK and distinguish between a really empty banenr position or a blocked one
        if (!is_array($f) || $f[0]=="") {
            // fallback
            // ---------------------
            // if there are no banners available for this position look for the banner specified in 7posizioni.cd_fallback
            // and force a view with that code.
            $sql = "SELECT cd_fallback FROM ".DB_PREFIX."7banner_posizioni WHERE id_posizione='".$posizione."'";
            $id = execute_scalar($sql);
            if($id > 0) {
                $arf=$this->getAndRotateBanner($posizione,"yes",$id, array());
                $f = $arf[0];
                $fcookie = $arf[1];
                if($f=="") return array($this->empty_banner_code,"","");
            } else {
                return array($this->empty_banner_code,"","");
            }
        }

        $dir = $this->media_folder."/";
        $pics = $this->loadbannerfile($dir,$f['id_banner'].'_', array('gif','png','jpg','zip','jpeg','mp4','webp'));
        
        // the iframe name if needed
        $unique_id_safe = "";

        $encoded_link = $this->encrypt_bannerlink($f['id_banner']);

        $s3d = "";
        if ($f['de_3dparty_code']) {    
            $s3d = str_replace("[TIMESTAMP]",date("YmdHis"),$f['de_3dparty_code']);
            $s3d = preg_replace("/ src=/"," data-src=",$s3d);
        }


        if ($f['de_codicescript']) {
            //
            // if script make some replaces and output code
            //
            $s = str_replace("[TIMESTAMP]",date("YmdHis"),$f['de_codicescript']);
            $s = str_replace("[RANDOM]",rand(10000,99999).date("YmdHis"),$s);
            $s = str_replace("[ID]",$f['id_banner'],$s);
            $s = str_replace("[LINK]",trim($f['de_url']),$s);
            $s = str_replace("[TITOLO]",htmlspecialchars(trim($f['de_nome'])),$s);						 // BACK COMPATIBILY
            $s = str_replace("[TITLE]",htmlspecialchars(trim($f['de_nome'])),$s);
            $s = str_replace("[TARGET]",htmlspecialchars(trim($f['de_target'])),$s);
            $s = str_replace("[TRACKLINK]",htmlspecialchars( $encoded_link ),$s);  // BACK COMPATIBILY
            $s = str_replace("[CLICKTAG]",htmlspecialchars( $encoded_link ),$s);

            $bannerurl = $encoded_link;

            for($i=0;$i<count($pics);$i++) $s = str_replace("[IMG".$i."]",WEBURL . "/" . $pics[$i],$s);

            $n = "banner_".$f['id_banner'];


        } else {

            $n = end( $pics );
            $n = WEBURL . "/" .$n;
            $fileZipMp4 = current(array_filter($pics, fn($v) => preg_match('/\.(mp4|zip)$/i', $v))) ?? '';

            // if(preg_match("/\.zip$/i",$n)) {
            if( $fileZipMp4) {
                // ZIP HTML5 banner and video
                $bannerurl = WEBURL."/data/dbimg/media/".$f['id_banner']."/index.html";
                $n = $fileZipMp4;
                $unique_id_safe = $this->safeName($n)."_".rand(1000,9999);
            } else {
                $bannerurl =  $encoded_link;
            }

            if ($n!="") {
                $s = $this->linkBanner(
                    $n,
                    $f['nu_width'],$f['nu_height'],
                    $bannerurl,
                    $f['de_target'],
                    $unique_id_safe
                );

                $s = str_replace( ["\n", "\r" ], '', $s);
            } else {
                $s = "";
            }
        }
        return array(
            $s . $s3d,          // script + third party script
            $fcookie, 
            $unique_id_safe,
            $bannerurl
        );
    }

    private function loadbannerfile($dir,$prenome,$arext) {
        $c = 0;
        $a=array();
        if (is_dir($dir) && $dh = opendir($dir)) {
            while (($file = readdir($dh)) !== false) {
                $ext = substr(strrchr($file, '.'), 1);
                if(in_array($ext,$arext)) {
                    if(strpos(" ".$file,$prenome)==1) {
                        $a[$c]['nome']=$dir.$file;
                        $p = (integer)preg_replace("/[^0-9]/","",stristr($file,"_"));
                        $a[$c]['posizione']=$p;
                        $c++;
                    }
                }
            }
            closedir($dh);
        }
        $a = array_key_multi_sort($a);
        $b = array();
        for($i=0;$i<count($a);$i++) $b[$i]=$a[$i]['nome'];
        return $b;
    }

    /**
     * get the daily views of a banner to limit the frequency cap and avoid
     * to show all the views in a single day
     */
    private function getDailyViews($cd_posizione) : array {
        $daily = execute_row("SELECT SUM(nu_pageviews) as v, COUNT(DISTINCT cd_banner) as q FROM `".DB_PREFIX."7banner_stats` WHERE cd_posizione='".$cd_posizione."' and id_day>'".date("Y-m-d",strtotime("-7 days"))."'", false);
        if($daily) return $daily;
        return ['v'=>1,'q'=>1];
    }


    public function printJavascript( $arCommands, $iframeid = "") {
        // the original source is on dev server in js-originale.php
        $out = "";
        foreach($arCommands as $command) {
            if($command=="autorefresh") {
                $timer = 8000;

                $code = 'if ("function" != typeof amb_autorefresh) {

                    window.arTimers = window.arTimers || {};
                    
                    function amb_autorefresh(wherediv,idpos, flag) {

                        if (!flag && !window.arTimers[wherediv+"_"+idpos] || flag === 1) {
                            // è la prima
                            window.arTimers[wherediv+"_"+idpos] = 1;

                            // console.log("timer not exists for "+wherediv+"_"+idpos+" => create the timeout");
                            
                            setTimeout(function(){
                                
                                var y = document.getElementById( wherediv );
                                var dx=y.offsetWidth;
                                var dy=y.offsetHeight;
                                y.style.minWidth=dx+"px";
                                y.style.minHeight=dy+"px";
                                y.innerHTML="";
                                var p = "RF" + Math.floor(Math.random() * 1000);
                                var x = document.createElement("div");
                                x.id=p;
                                x.style="line-height:0";
                                y.appendChild(x);
                                
                                var ts=Math.random()+"_"+Date.now(),k=decodeURIComponent(document.cookie),ca=k.split(";"),psc="";for(var i=0;i<ca.length;i++){var c=ca[i];while(c.charAt(0)==" ") c=c.substring(1);if (c.indexOf("adcapban")==0)psc+=(psc==""?"":",")+c.replace("adcapban","").replace("=",",");}
                                var s = document.createElement("script");s.src="'.WEBURL.'/ser.php?t="+wherediv+String.fromCharCode(38)+"f="+idpos+String.fromCharCode(38)+"psc="+psc+String.fromCharCode(38)+"ts="+ts;
                                y.appendChild(s);
                                
                                amb_autorefresh(wherediv,idpos, 1);
                                
                            }, '.$timer.');
                        } else {

                            // console.log("timer ALREADY exists for "+wherediv+"_"+idpos+" => can t run the timeout");
                        }


                    }

                };';


                $minified = 'if("function"!=typeof amb_autorefresh){function amb_autorefresh(e,t,r){(r||window.arTimers[e+"_"+t])&&1!==r||(window.arTimers[e+"_"+t]=1,setTimeout((function(){var r=document.getElementById(e),a=r.offsetWidth,n=r.offsetHeight;r.style.minWidth=a+"px",r.style.minHeight=n+"px",r.innerHTML="";var o="RF"+Math.floor(1e3*Math.random()),i=document.createElement("div");i.id=o,i.style="line-height:0",r.appendChild(i);for(var d=Math.random()+"_"+Date.now(),m=decodeURIComponent(document.cookie).split(";"),s="",f=0;f<m.length;f++){for(var h=m[f];" "==h.charAt(0);)h=h.substring(1);0==h.indexOf("adcapban")&&(s+=(""==s?"":",")+h.replace("adcapban","").replace("=",","))}var c=document.createElement("script");c.src="'.WEBURL.'/ser.php?t="+e+String.fromCharCode(38)+"f="+t+String.fromCharCode(38)+"psc="+s+String.fromCharCode(38)+"ts="+d,r.appendChild(c),amb_autorefresh(e,t,1)}),'.$timer.'))}window.arTimers=window.arTimers||{}};';

                $out.= $minified;

            }

            if ($command=="iframe tricks" && $iframeid!="") {

                
                

                // funz per visibilita iframe e invio messaggio ad iframe
                // $code = 'if("function"!=typeof amb_isInViewport) {
                //         function amb_isInViewport(el) {
                //             if (!el) return false;
                //             const rect = el.getBoundingClientRect();
                //             return (
                //                 rect.top < window.innerHeight &&
                //                 rect.bottom > 0 &&
                //                 rect.left < window.innerWidth &&
                //                 rect.right > 0
                //             );
                //         }
                //         function amb_sendMessageWhenInView(iframeId) {
                //             const iframe = document.getElementById(iframeId);
                //             if (!iframe) return;
                //             const checkInterval = setInterval(() => {
                //                 if (amb_isInViewport(iframe)) {
                //                     iframe.contentWindow.postMessage("visible", "*");
                //                     clearInterval(checkInterval);
                //                 }
                //             }, 500);
                //         }
                //     }
                // ';

                // code minified
                $minified = 'if("function"!=typeof amb_isInViewport){function amb_isInViewport(el){if(!el)return!1;const rect=el.getBoundingClientRect();return(rect.top<window.innerHeight&&rect.bottom>0&&rect.left<window.innerWidth&&rect.right>0)}function amb_sendMessageWhenInView(iframeId){const iframe=document.getElementById(iframeId);if(!iframe)return;const checkInterval=setInterval(()=>{if(amb_isInViewport(iframe)){iframe.contentWindow.postMessage("visible","*");clearInterval(checkInterval)}},500)}};';
                $out.= $minified;



                // messaggi per resize e iframe size
                // $code='window.addEventListener("message",function(e) {
                //     if(e.data.me == "'.$iframeid.'") {
                //         document.getElementById("'.$iframeid.'").style.height = e.data.nh + "px";
                //     }
                // });
                // window.addEventListener("resize",function(){
                //     var e=document.getElementById("'.$iframeid.'");
                //     e.contentWindow.postMessage({resized:e.offsetWidth,me:"'.$iframeid.'"},"*");
                // });';
                $minified = 'window.addEventListener("message",function(e){if(e.data.me=="'.$iframeid.'"){document.getElementById("'.$iframeid.'").style.height=e.data.nh+"px"}});window.addEventListener("resize",function(){var e=document.getElementById("'.$iframeid.'");e.contentWindow.postMessage({resized:e.offsetWidth,me:"'.$iframeid.'"},"*")});';
                $out.= $minified;
                
                // messaggi per visibilità nella viewport
                // $code='window.addEventListener("load", function() {
                //     amb_sendMessageWhenInView("'.$iframeid.'");
                // });';
                $minified = 'window.addEventListener("load",()=>{amb_sendMessageWhenInView("'.$iframeid.'")});';
                $out.= $minified;
                


            }
            if ($command=="set get cookie") {
                // returns the set and get cookie functions used to count impressions and limit by cap : amb_sC , amb_gC
                // 

                $code = 'if ("function" != typeof amb_sC) {

                    // set a cookie
                    // e = cookie name
                    // t = cookie value
                    // n = days
                    function amb_sC(e, t, n) {
                        var o = new Date;
                        o.setTime(o.getTime() + 24 * n * 60 * 60 * 1e3);
                        var r = "expires=" + o.toUTCString();
                        document.cookie = e + "=" + t + ";" + r + ";path=/"
                    }

                    // get a cookie
                    // e = cookie name
                    function amb_gC(e) {
                        for (var t = e + "=", n = decodeURIComponent(document.cookie).split(";"), o = 0; o < n.length; o++) {
                            for (var r = n[o]; " " == r.charAt(0); )
                                r = r.substring(1);
                            if (0 == r.indexOf(t))
                                return parseInt(r.substring(t.length, r.length), 10)
                        }
                        return ""
                    }
                }';
                
                
                // minified version of $code for fast output, made by hand and written here
                $minified = 'if("function"!=typeof amb_sC){function amb_sC(e,t,n){var o=new Date;o.setTime(o.getTime()+24*n*60*60*1e3);var r="expires="+o.toUTCString();document.cookie=e+"="+t+";"+r+";path=/"}function amb_gC(e){for(var t=e+"=",n=decodeURIComponent(document.cookie).split(";"),o=0;o<n.length;o++){for(var r=n[o];" "==r.charAt(0);)r=r.substring(1);if(0==r.indexOf(t))return parseInt(r.substring(t.length,r.length),10)}return""}};';

                $out.= $minified;

            }

            if ($command=="set HTML") {
                // return the set HTML function : amb_sH

                $code = 'if ("function" != typeof amb_sH)
                            function amb_sH(e, n, t) {
                                t && (e.innerHTML = "");
                                var i = document.createElement("div");
                                if (i.innerHTML = n,
                                0 !== i.children.length)
                                    for (var r = 0; r < i.children.length; r++) {
                                        for (var a = i.children[r], l = document.createElement(a.nodeName), d = 0; d < a.attributes.length; d++)
                                            l.setAttribute(a.attributes[d].nodeName, a.attributes[d].nodeValue);
                                        if (0 == a.children.length)
                                            switch (a.nodeName) {
                                            case "SCRIPT":
                                                a.text && (l.text = a.text);
                                                break;
                                            default:
                                                a.innerHTML && (l.innerHTML = a.innerHTML)
                                            }
                                        else
                                            amb_sH(l, a.innerHTML, !1);
                                        e.appendChild(l)
                                    }
                                else
                                    e.innerHTML = n
                            }';


                // minified version
                $minified ='if("function"!=typeof amb_sH)function amb_sH(e,n,t){t&&(e.innerHTML="");var i=document.createElement("div");if(i.innerHTML=n,0!==i.children.length)for(var r=0;r<i.children.length;r++){for(var a=i.children[r],l=document.createElement(a.nodeName),d=0;d<a.attributes.length;d++)l.setAttribute(a.attributes[d].nodeName,a.attributes[d].nodeValue);if(0==a.children.length)switch(a.nodeName){case"SCRIPT":a.text&&(l.text=a.text);break;default:a.innerHTML&&(l.innerHTML=a.innerHTML)}else amb_sH(l,a.innerHTML,!1);e.appendChild(l)}else e.innerHTML=n};';

                $out.= $minified;
            }

            if ($command=="cookie reader") {
                // return the code that read all the adadmin cookie with the counters of the view
                $code = 'for (var k = decodeURIComponent(document.cookie), z = k.split(";"), psc = "", i = 0; i < z.length; i++) {
                    for (var c = z[i]; " " == c.charAt(0); )
                        c = c.substring(1);
                    0 == c.indexOf("adcapban") && (psc += ("" == psc ? "" : ",") + c.replace("adcapban", "").replace("=", ","))
                }';

                $minified ='for(var k=decodeURIComponent(document.cookie),z=k.split(";"),psc="",i=0;i<z.length;i++){for(var c=z[i];" "==c.charAt(0);)c=c.substring(1);0==c.indexOf("adcapban")&&(psc+=(""==psc?"":",")+c.replace("adcapban","").replace("=",","))};';

                $out.= $minified;
            }

            if ($command == "forward") {
                // return the code that forward the parameters in the window to the clicktag

                $code = 'if ("function" != typeof amb_forward) {

                    function amb_forward(target) {
                        console.log("forwarding to:", target);
                        let links = document.querySelectorAll("#" + target + " a");
                        links.forEach((el) => {
                            console.log("el=", el);
                            // if el is <a> link with an "href" which has a "b" parameter, then append "amb_forward=1" and params
                            let link = el.getAttribute("href");
                            console.log("link=", link);
                            if (link && link.indexOf("b=") != -1) {
                                let params = window.location.search.substring(1); 
                                el.setAttribute("href", link + (link.indexOf("?") == -1 ? "?" : "&") + "amb_forward=1&" + params);
                            }
                        })
                    }
                    
                };
                ';

                $minified = 'if("function"!=typeof amb_forward)function amb_forward(e){document.querySelectorAll("#"+e+" a").forEach((e=>{let t=e.getAttribute("href");if(t&&-1!=t.indexOf("b=")){let r=window.location.search.substring(1);e.setAttribute("href",t+(-1==t.indexOf("?")?"?":"&")+"amb_forward=1&"+r)}}))};';

                $out.=$minified;
                            
            }
        }
        return $out;

    }

    /**
     * Encrypt a banner identifier to mask the id so users can't guess different ids and change urls
     * Uses the ENCRIPTYON KEY defined in pons.settings.php
     * 
     * @param integer $id
     */
    public function encrypt_bannerlink($id) {
        //
        // script for tracking url
        // used by ser.php and banner.class.php
        $encoded_link = WEBURL . "/tra.php?b=".$id;
        if(DEFINED("ENCRYPTIONKEY")) {
            $encoded_link .= "&c=".md5($id . "-".ENCRYPTIONKEY);
        }
        return $encoded_link;
    }


}

?>