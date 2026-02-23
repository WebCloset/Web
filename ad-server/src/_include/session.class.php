<?php
/*
  Session class
  it's a level above the native PHP session management
  ans uses _SESSION
*/
class Session
{
	public $prefix = "";

	public function __construct ($blockOtherFolders = "si") {

        $cookietime = 3600*24*30; //cookie life time seconds
		if($blockOtherFolders=="si") {
			$this->prefix = md5(WEBURL);
		}

		try{session_cache_expire($cookietime / 60); } catch (Exception $e) {}
		try{ini_set("session.gc_maxlifetime", $cookietime );} catch (Exception $e) {}
		try{ini_set("session.cookie_lifetime", $cookietime );} catch (Exception $e) {}
		try{ini_set("session.cache_expire", $cookietime );} catch (Exception $e) {}
		try{ini_set("url_rewriter.tags","");} catch (Exception $e) {}
		try{ini_set("session.use_trans_sid", false);} catch (Exception $e) {}
		try{session_start();} catch (Exception $e) {}

	}
	
	/* ------------------------------------------- */
	/* save vars in cookies or session             */
	/* ------------------------------------------- */
	public function register($var,$value) {
		// back compatibility
		$this->set($var,$value);
	}
	public function set($var,$value) {
		$_SESSION[$this->prefix.$var]=$value;
	}

	/* ------------------------------------------- */
	/* get variables back from cookies crypted or  */
	/* not, or directly from session               */
	/* ------------------------------------------- */
	public function get($var) {
		return isset($_SESSION[$this->prefix.$var]) ? $_SESSION[$this->prefix.$var] : "";
	}

	/* ------------------------------------------- */
	/* empty session or cookies                    */
	/* ------------------------------------------- */
	public function finish() {

		$_SESSION = array();

	}

}

?>