function checkConStato() {
	if(document.body.querySelector('.submitting')) return false;
	document.body.classList.add('submitting');
    checkForm();
	document.body.classList.remove('submitting');
}
const checkForSDI = () => {
	if($("#cd_country").val() == 110) { 
		// Italy, activati de_SDI field
		$("#italy_sdicode").show();
	} else {
		$("#italy_sdicode").hide();
	}
}
function testPartitaIVACustom(oggTextfield, boolObbligatorio) {
	// test only for Italy
	if($("#cd_country").val() == 110) { 
		return testPartitaIVA(oggTextfield, boolObbligatorio);
	}
	return true;
}
jQuery(document).ready(function($) {
	checkForSDI();
	$('#de_SDI').on("keyup", function(e) {
		$(this).val($(this).val().toUpperCase());
	});
})
