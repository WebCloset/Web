<?php
/*

	class to handle own data, extends MioProfilo

*/

class BANNER_MioProfilo extends Mioprofilo
{

	function __construct () {
		parent::__construct();
	}

    /**
     * show user logged own details. defines the additional fields to show
     * and implements call to parent object same function
     * 
     * @param array $params
     * 
     * @return string 0 | 1 | 2
     */
	function getDettaglio( $params = array() ) {

		global $session,$root;
        
        // define template
        // --------------------------------------------- 
        $params['template'] = 'template/BANNER_dettaglio.html';

        // retrieves details for advertiser user
        // ---------------------------------------------
        $clienteDati = execute_row("select * from ".DB_PREFIX."7banner_clienti where cd_utente='". $session->get("idutente") ."'");

        if(!isset($clienteDati['id_cliente'])) {
            $clienteDati['id_cliente']="";
            $clienteDati['de_nome']="";
            $clienteDati['de_address']="";
            $clienteDati['cd_country']="";
            $clienteDati['de_city']="";
            $clienteDati['de_phone']="";
            $clienteDati['de_clientemail']="";
            $clienteDati['de_clientweb']="";
            $clienteDati['de_vat']="";
            $clienteDati['de_SDI']="";
        }
        
        $id_cliente = new hidden("id_cliente",$clienteDati['id_cliente']);
    
        $de_nome = new testo("de_nome",$clienteDati["de_nome"],50,50);
        $de_nome->obbligatorio= $session->get("idprofilo")==5 ? 1 : 0;
        $de_nome->label="'{Company name}'";

        $de_address = new areatesto("de_address",(($clienteDati["de_address"])),3,50);
        $de_address->obbligatorio=0;
        $de_address->maxlimit=350;
        $de_address->label="'{Address}'";


        // retrieves details for webmaster user
        // ---------------------------------------------
        $extraUserData = execute_row("select de_payment_details from ".DB_PREFIX."frw_extrauserdata where cd_user='". $session->get("idutente") ."'");
        $de_payment_details = new areatesto("de_payment_details",$extraUserData["de_payment_details"] ?? '',5,80);
        $de_payment_details->obbligatorio=0;
        $de_payment_details->label="'{Payment details}'";
       
        $de_phone = new testo("de_phone",$clienteDati["de_phone"],20,20);
        $de_phone->obbligatorio=0;
        $de_phone->custom_check = "!testTelefono(de_phone, false)";
        $de_phone->custom_msg = "'{Not a valid Telephone, Es.: +39XXXXXX...}'";        
        $de_phone->label="'{Telephone}'";

        $cd_country = new autocomplete("cd_country",$clienteDati["cd_country"],150,50,"../7clienti/ajax/listcountries.php");
        $cd_country->label="'{Country}'";
        $cd_country->jscallback = "checkForSDI()";
        $cd_country->obbligatorio=0;
        // $objform->addControllo($cd_country);

        $de_city = new testo("de_city",$clienteDati["de_city"],150,50);
        $de_city->obbligatorio=0;
        $de_city->label="'{City}'";
        //$objform->addControllo($de_city);

        $de_vat = new testo("de_vat",$clienteDati["de_vat"],150,50);
        $de_vat->obbligatorio=0;
        $de_vat->label="'{VAT}'";
        $de_vat->custom_check = "!testPartitaIVACustom(de_vat, false)";
        $de_vat->custom_msg = "'{P.IVA not valid}'"; // just for italian (country = 110)
        
        $de_SDI = new testo("de_SDI",$clienteDati["de_SDI"],7,7);
        $de_SDI->obbligatorio=0;
        $de_SDI->label="'{SDI}'";
        $de_SDI->custom_check = "!testSDI(de_SDI, false)";
        $de_SDI->custom_msg = "'{SDI not valid}'";

        $de_clientemail = new email("de_clientemail",$clienteDati["de_clientemail"],150,50);
        $de_clientemail->obbligatorio=0;
        $de_clientemail->label="'{Email}'";

        $de_clientweb = new urllink("de_clientweb",$clienteDati["de_clientweb"],255,50);
        $de_clientweb->obbligatorio=0;
        $de_clientweb->label="'{Web}'";

        // send fields to parent object
        // ---------------------------------------------
        $params['fieldsObjects'] = array( $id_cliente, $de_nome, $de_address, $de_payment_details, $de_phone, $cd_country, $de_city, $de_vat, $de_SDI, $de_clientemail, $de_clientweb );




        return parent::getDettaglio($params);
	}


    /**
     * handles the form for sign in, using the parent object and adding a field for profile
     * 
     * @param array $params
     * 
     * @return string
     */
	function getDettaglioSignIn($params=array()) {
		global $session;

        // define template
        $params['template'] = 'template/BANNER_signin.html';

        // define fields
        $cd_profilo = new optionlist("cd_profilo",5,array(
            5=>"{Advertiser}",
            10=>"{Webmaster}"
        ));
       
        // send fields to parent object
        $params['fieldsObjects'] = array( $cd_profilo );

        return parent::getDettaglioSignIn($params);
	}

    /**
     * handle the updates posted by the dettaglio form using the parent object
     * and implementing the update of the additional fields.
     * 
     * @param array $arDati
     * @param array $files
     * 
     * @return string
     */
	function update($arDati, $files) {
        global $session, $conn;

        // update with parent
        $result = parent::update($arDati, $files);

        // update additional fields
        if($result == "") {
            
            if($session->get("idprofilo")==5) {

                $arDati["cd_country"] = (integer)$arDati["cd_country"] ?? 0;
                if($arDati["cd_country"] == 0) $arDati["de_SDI"]="";
          
                if ($arDati["id_cliente"]!="") {
                    //Modify some data on client table
                    $sql="UPDATE ".DB_PREFIX."7banner_clienti set de_nome='##de_nome##',de_address='##de_address##',
                    cd_country='##cd_country##',de_city='##de_city##',de_vat='##de_vat##',de_SDI='##de_SDI##',de_phone='##de_phone##',de_clientemail='##de_clientemail##',de_clientweb='##de_clientweb##' where id_cliente='##id_cliente##'";
                    $sql= str_replace("##de_nome##",$arDati["de_nome"],$sql);
                    $sql= str_replace("##de_address##",$arDati["de_address"],$sql);
                    $sql= str_replace("##id_cliente##",$arDati["id_cliente"],$sql);
                    $sql= str_replace("'##cd_country##'",$arDati["cd_country"] > 0 ? "'".$arDati["cd_country"]."'" : "NULL",$sql);
                    $sql= str_replace("##de_city##",$arDati["de_city"],$sql);
                    $sql= str_replace("##de_vat##",$arDati["de_vat"],$sql);
                    $sql= str_replace("##de_SDI##",$arDati["de_SDI"],$sql);
                    $sql= str_replace("##de_clientemail##",$arDati["de_clientemail"],$sql);
                    $sql= str_replace("##de_clientweb##",$arDati["de_clientweb"],$sql);
                    $sql= str_replace("##de_phone##",$arDati["de_phone"],$sql);
                    $conn->query($sql) or trigger_error($conn->error."sql='$sql'<br>");

                } else {
                    //create record on client table if not exists
                    $sql="INSERT into ".DB_PREFIX."7banner_clienti (de_nome,de_address,cd_utente,cd_country,de_city,de_vat,de_SDI,de_clientemail,de_clientweb,de_phone) values('##de_nome##','##de_address##','##cd_utente##','##cd_country##','##de_city##','##de_vat##','##de_SDI##','##de_clientemail##','##de_clientweb##','##de_phone##')";
                    $sql= str_replace("##de_nome##",$arDati["de_nome"],$sql);
                    $sql= str_replace("##de_address##",$arDati["de_address"],$sql);
                    $sql= str_replace("##cd_utente##",$session->get("idutente"),$sql);
                    $sql= str_replace("'##cd_country##'",$arDati["cd_country"] > 0 ? "'".$arDati["cd_country"]."'" : "NULL",$sql);
                    $sql= str_replace("##de_city##",$arDati["de_city"],$sql);
                    $sql= str_replace("##de_vat##",$arDati["de_vat"],$sql);
                    $sql= str_replace("##de_SDI##",$arDati["de_SDI"],$sql);
                    $sql= str_replace("##de_clientemail##",$arDati["de_clientemail"],$sql);
                    $sql= str_replace("##de_clientweb##",$arDati["de_clientweb"],$sql);
                    $sql= str_replace("##de_phone##",$arDati["de_phone"],$sql);
                    $conn->query($sql) or trigger_error($conn->error."sql='$sql'<br>");
                }
                
            }
            
            if($session->get("idprofilo")==10) {
                // update payment details for webmaster

                $sql="UPDATE ".DB_PREFIX."frw_extrauserdata set de_payment_details='##de_payment_details##' where cd_user='##id_user##'";
                $sql= str_replace("##de_payment_details##",$arDati["de_payment_details"],$sql);
                $sql= str_replace("##id_user##", $session->get("idutente"),$sql);              
                $conn->query($sql) or trigger_error($conn->error."sql='$sql'<br>");

            }

        }

		return $result;
	}



}
