<?php
/**
 * Class to log errors and to generically handle logging
 */
class logger {
	private $logfile;
	private $errorTemplate = "";
	private $counter = 0; // the counter of the errors displayed to avoid overlapping
	private $errorMsgs = "";
	private $calledByErrorHandler = false;

	function __construct( $logfile = "") {
		if ($logfile!="") $this->setLogFile($logfile);
		$this->errorTemplate="<div class='errore' id='##IDDUMP##' style='##POS##'><a class='closeme' href=\"javascript:show('##IDDUMP##')\">X</a> ##msg##</div>";
		set_error_handler(array(&$this,'handle_error'));
	}

	function setLogFile($logfile) {
		$this->logfile = $logfile;
	}

	function addlog($description="",$currentFile="") {
		global $root;
		if(!defined("LOGS_FILENAME")) return; // log file not defined yet, doesn't log anything
		if(!isset($this->logfile)) $this->logfile = $root.LOGS_FILENAME;
		if ($currentFile=="") $currentFile=$_SERVER["PHP_SELF"];
		if ($this->calledByErrorHandler) {
			$log_string=date('d/m/y h:i:s')." ".$currentFile." ".$description." ".($_SERVER['REMOTE_ADDR']??"")." Browser:".($_SERVER['HTTP_USER_AGENT']??"")."\n";
		} else {
			$log_string=$description."\n";
		}
		if (!file_exists($this->logfile)) {
			if (@touch($this->logfile) === false) {
				trigger_error("Unable to create the file " . $this->logfile, E_USER_WARNING);
				return;
			}
		}
		if (!is_writable($this->logfile)) {
			if ($this->calledByErrorHandler) {
				die("Please make the file " . $this->logfile . " writable.");
			} else {
				trigger_error("Please make the file " . $this->logfile . " writable.", E_USER_WARNING);
			}
			return;
		}
		error_log($log_string, 3, $this->logfile);
	}

	function logsize() {
		global $root;
		if(!defined("LOGS_FILENAME")) return;
		if(!isset($this->logfile)) $this->logfile = $root.LOGS_FILENAME;
		if(!file_exists($this->logfile)) return "n.d.";
		return number_format(filesize($this->logfile)/1024,0,',','.') . " Kbyte";

	}
	function displayLog(){
		global $root;
		if(!defined("LOGS_FILENAME")) return;
		if(!isset($this->logfile)) $this->logfile = $root.LOGS_FILENAME;
		return nl2br(loadTemplate($this->logfile));
	}

	function deleteLog(){
		global $root;
		if(!defined("LOGS_FILENAME")) return;
		if(!isset($this->logfile)) $this->logfile = $root.LOGS_FILENAME;
		if (file_exists($this->logfile)) {
			unlink($this->logfile);
			echo $this->logfile." rimosso.";
		} else {
			echo $this->logfile." non trovato.";
		}
		return "";
	}

	function handle_error ($errno, $errstr, $errfile, $errline) {
		global $session,$root,$defaultReplace;

		// Prevent duplicate error messages from being processed
		if(stristr($this->errorMsgs,$errstr)) return;
		$this->errorMsgs.=", ".$errstr;
		
		/*
			if here withoug these variables, there is an error in login
		*/
		if(!defined('SEND_ERRORS_MAIL')) define("SEND_ERRORS_MAIL","");
		if(!defined('SHOW_ERRORS')) define("SHOW_ERRORS",true);
		if(!defined('STOP_ON_ERROR')) define("STOP_ON_ERROR",false);
		
	
		/*
			log errors
		*/
		$this->calledByErrorHandler = true;
		$this->addlog("Error number: $errno, error is: $errstr - File: $errfile, Linea: $errline - Main file: ".$_SERVER['PHP_SELF']);
		$this->calledByErrorHandler = false;

		$IDDUMP = "dump_".rand(1,111111);

		$support_link ="";
		if(hasModule("BANNER") && $errno!=256) {
			$support_link ="<a href='https://codecanyon.net/item/adadmin-easy-adv-server/12710605/support' target='_blank'><u>Need support?</u></a>";
		}

		$text = "<link href=\"".$root."src/template/stile.css\" type=\"text/css\" rel=\"stylesheet\">
			<script language=\"JavaScript\" src=\"".$root."src/template/comode.js?z\"></script>
			<b>$errstr</b><p>".(SEND_ERRORS_MAIL ? "I've sent a notice to the System Administrator." : "").
			" ".$support_link;
		if($errno!=256) {
			// hide details on wrong email errors
			$text.="<div>#<b>".$errno."</b>; Line:  <b>$errline</b>; $errfile;<br>Main file: ".$_SERVER['PHP_SELF']."<br><span>PHP ver. ".phpversion()." Framework ver. ".(isset($defaultReplace["##VER##"])?$defaultReplace["##VER##"]:"")."</span></div>";
		}
		$text=str_replace("##msg##",$text, $this->errorTemplate);
		$text=str_replace("##IDDUMP##",$IDDUMP, $text);
		$text=str_replace("##POS##","top:".($this->counter * 210)."px", $text);

		$this->counter++;

		if (SEND_ERRORS_MAIL) {
			//
			// if error mail sender active send email with errors
			//
			mail_utf8(SEND_ERRORS_MAIL, "Error on [".DOMINIODEFAULT."] user ".$session->get("username"), $text);
		}
		if (SHOW_ERRORS == true || !defined("SHOW_ERRORS")) echo $text;
		if (STOP_ON_ERROR == true || !defined("STOP_ON_ERROR")) die();
		/* Don't execute PHP internal error handler */
		return true;

	}

	function dump_array($s,$sep=",") {
		$o="";
		if (is_array($s)) 
			foreach($s as $key=>$value) {
				$o .= htmlspecialchars($key);
				$o .= " = ";
				if (is_array($value)) $o.="Array(".$this->dump_array($value).")"; else
					$o .= htmlspecialchars($value);
				$o .= $sep;
			}
		else return $s;
		return $o;
	}

	function dump_info(){
		$o = "";
		$o .= "<h2>Vars in _SESSION:</h2>";
		$o .= isset($_SESSION) ? $this->dump_array($_SESSION,"<br>") : "nulla.";
		$o .= "<h2>Vars in _GET:</h2>";
		$o .= $this->dump_array($_GET,"<br>");
		$o .= "<h2>Vars in _POST:</h2>";
		$o .= $this->dump_array($_POST,"<br>");
		$o .= "<h2>Vars in _SERVER:</h2>";
		$o .= $this->dump_array($_SERVER,"<br>");
		$o .= "<h2>Classes declared:</h2>";
		$o .= $this->dump_array(get_declared_classes(),"<br>");
		return $o;
	}
}
?>