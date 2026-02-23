<?php
/*
    generic class for c.r.u.d. behaviour
*/

class CrudBase {

	var $tbdb;	//table
	var $chiave;//key field
	var $seskey;//session key

	var $start;	// start from...
	var $omode;	// order mode asc|desc
	var $oby;	// order by field
	var $ps;	// page size

	var $gestore;

	protected Ambiente $ambiente;	// ambiente object for output

	function __construct ($tbdb,$ps,$oby,$omode,$start,$chiave="",$autoInstallSQLAr=[]) {
        global $session;
		$this->gestore = $_SERVER["PHP_SELF"];
		$this->tbdb = $tbdb; // table in the database
		$this->seskey = $tbdb;
		$this->chiave = $chiave;

		if(!empty($autoInstallSQLAr) && !table_exists(DB_PREFIX.$this->tbdb)) {
			// try to run autonistall if sql provided
			global $conn;
			$ar = array();
			foreach ($autoInstallSQLAr as $sql) { 
				$conn->query($sql) or die("Error executing query: <pre><code>$sql</code></pre>.<br><br>Error:<br><br><b>".$conn->error."</b>");
			}
		}

		$this->start = (int)getVar("gridStart",[$start,null,$this->seskey]);
		$this->omode= getVar("gridOrderMode",[$omode,["asc","desc"],$this->seskey]);
		$this->oby= getVar("gridOrderBy",[$oby,null,$this->seskey]);;
		$this->ps = (int)getVar("gridPageSize",[$ps,null,$this->seskey]);

		// save values in session
		if( gridResetStartPage($_GET) ) {
			if(isset($_GET['combotipo'])) $session->set($this->seskey."combotipo",$_GET['combotipo']);
			if(isset($_GET['keyword'])) $session->set($this->seskey."keyword",$_GET['keyword']);
		}
	}

	public function setAmbiente($ambiente) {
		$this->ambiente = $ambiente;
	}

	/**
	 * get the html code for the filter combo
	 * @param string $selectedValue default value
	 * @param string $fieldName field name
	 * @param string $sqlSelect sql select
	 * @return string     html code
	 */
	public function getHtmlcomboFilter($selectedValue, $fieldName,$sqlSelect = "", $optionZero = array("-999"=>"All")) {
		global $conn;
		//------------------------------------------------
		//combo filter
		$sql = "select {$fieldName}, count(*) as c from ".DB_PREFIX.$this->tbdb." where {$fieldName} is not null group by {$fieldName}";
		if ( $sqlSelect != "" ) $sql = $sqlSelect;

		$rs = $conn->query($sql) or trigger_error($conn->error);
		$arFiltri = $optionZero;
		while($riga = $rs->fetch_array()) {
			$arFiltri[$riga[$fieldName]]= "{".$riga[$fieldName]."}" ." (".$riga['c'].")";
		}
		//------------------------------------------------
		$out = "";
		foreach ($arFiltri as $k => $v) { $out.="<option value='{$k}' ".(($k."x"==$selectedValue."x")?"selected":"").">{$v}</option>"; }
		return "<label><select onchange='aggiornaGriglia()' name='combo{$fieldName}' id='combo{$fieldName}' class='filter'>{$out}</select></label>";
	}

	
	public function getArDati( $id ) {
		return execute_row("SELECT * from ".DB_PREFIX.$this->tbdb." where ".$this->chiave."='".(int)$id."'");
	}
}