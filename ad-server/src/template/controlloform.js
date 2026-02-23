// form validation library
// ====================================================================================================

function contacaratteri(sid,maxlimit) {
	$('#'+sid).parent().width( $('#'+sid).outerWidth() );
	if ( $('#'+sid).val().length >= maxlimit) {
		$('#'+sid).val( $('#'+sid).val().substring(0,maxlimit) );
		$('#counter'+sid).html('<b>STOP!</b>');
	} else $('#counter'+sid).html( maxlimit - $('#'+sid).val().length );
}

function encodeTextAreas(form) {
	for(var i = 0; i<form.length ; i++) { 
		if(form[i].tagName.toLowerCase() == "textarea" || form[i].tagName.toLowerCase() == "input") {
			if (form[i].hasAttribute("rel") && form[i].getAttribute("rel")=="code") {
				form[i].value = form[i].value.replace(/</g,"(MIN)");
				form[i].value = form[i].value.replace(/>/g,"(MAG)");
				form[i].value = form[i].value.replace(/i/g,"(--I--)");
				form[i].value = form[i].value.replace(/\$/g,"(--D--)");
			}
		}
	}
}

function testNumericoIntPos(oggTextfield, boolObbligatorio) {
	oggTextfield.value = oggTextfield.value.replace(/\s+$|^\s+/g,"")
	if (oggTextfield.value == "") if (boolObbligatorio) return false; else return true;
	var re = /^\d+$/
	return(re.test(oggTextfield.value));
}

function testNumerico(oggTextfield, boolObbligatorio) {
	oggTextfield.value = oggTextfield.value.replace(/\s+$|^\s+/g,"")
	if (oggTextfield.value == "") if (boolObbligatorio) return false; else return true;
	var re = /^\-?[0-9]+$/
	return(re.test(oggTextfield.value));
}

function testNumericoDecimale(oggTextfield, boolObbligatorio, decimali) {
	oggTextfield.value = oggTextfield.value.replace(/\s+$|^\s+/g,"")
	if (oggTextfield.value == "") if (boolObbligatorio) return false; else return true;
	if (oggTextfield.value == "-") return false;
	var re = /^\-?\d*(\.\d+)?$/
	return (re.test(oggTextfield.value))
}

function parseFloatString (v,d) {
	var x = parseFloat( !v ? 0 : v.replace(/,/g, ''));
	x = parseFloat( Math.round(  x * Math.pow(10,d)  )  ) / Math.pow(10,d);
	y = x + "";
	if (y.indexOf(".")==-1) y = x + ".";
	var a = y.split(".");
	if (a[1].length<d) for(k=a[1].length;k<d;k++) a[1]+="0";
	y = a[0]+"."+a[1];
	return y;
}

function testDataAA(oggTextfield, boolObbligatorio) {
	oggTextfield.value = oggTextfield.value.replace(/\s+$|^\s+/g,"")
	if (oggTextfield.value == "") if (boolObbligatorio) return false; else return true;
	var re = /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/        // accetta anche 4/6/99
	if (!(re.test(oggTextfield.value))) return false
	var arrMatches = re.exec(oggTextfield.value)
	var giorno = parseInt(arrMatches[1],10)
	var mese = parseInt(arrMatches[2],10)
	var anno = parseInt(arrMatches[3],10)
	if (mese < 1 || mese > 12) return false
	var nGiorni;
	switch (mese) {
		case 4 : case 6 : case 9 : case 11 :
			nGiorni = 30
			break
		case 2 :
			if (anno % 4 == 0 && (anno % 1000 == 0 || anno % 100 != 0)) nGiorni = 29; else nGiorni = 28;
			break
		default :
			nGiorni = 31
	}
	if (giorno > nGiorni || giorno < 1) return false; else return true;
}

function testDataAAAAstr(stri) {
	stri = stri.replace(/\s+$|^\s+/g,"")
	var re = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/       // accetta anche 4/6/1999
	if (!(re.test(stri))) return false;
	var arrMatches = re.exec(stri)
	var giorno = parseInt(arrMatches[1],10)
	var mese = parseInt(arrMatches[2],10)
	var anno = parseInt(arrMatches[3],10)
	if (mese < 1 || mese > 12) return false;
	var nGiorni;
	switch (mese) {
		case 4 : case 6 : case 9 : case 11 :
			nGiorni = 30
			break
		case 2 :
			if (anno % 4 == 0 && (anno % 1000 == 0 || anno % 100 != 0)) nGiorni = 29; else nGiorni = 28;
			break
		default :
			nGiorni = 31
	}
	if (giorno > nGiorni || giorno < 1) return false; else return true;
}

function testDataAAAA(oggTextfield, boolObbligatorio) {
	oggTextfield.value = oggTextfield.value.replace(/\s+$|^\s+/g,"")
	if (oggTextfield.value == "") if (boolObbligatorio) return false; else return true;
	var re = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/       // accetta anche 4/6/1999
	if (!(re.test(oggTextfield.value))) return false;
	var arrMatches = re.exec(oggTextfield.value)
	var giorno = parseInt(arrMatches[1],10)
	var mese = parseInt(arrMatches[2],10)
	var anno = parseInt(arrMatches[3],10)
	if (mese < 1 || mese > 12) return false;
	var nGiorni;
	switch (mese) {
		case 4 : case 6 : case 9 : case 11 :
			nGiorni = 30
			break
		case 2 :
			if (anno % 4 == 0 && (anno % 1000 == 0 || anno % 100 != 0)) nGiorni = 29; else nGiorni = 28;
			break
		default :
			nGiorni = 31
	}
	if (giorno > nGiorni || giorno < 1) return false; else return true;
}

function testData(o,b,formato) {
if(o.value == '--') o.value = "";
	if( isNaN(new Date(o.value)) && o.value != "") return false;
	if (formato=="gg-mm-aaaa") return testDataGgMmAaaa(o,b);
	if (formato=="aaaa-mm-gg") return testDataAaaaMmGg(o,b);
	return false;
}

function testDataOra(o,b,formato) {
if(o.value == '-- :') o.value = "";
	if( o.value != "" && isNaN(new Date(o.value))) {
		return false;
	}
	if (formato=="gg-mm-aaaa") return testDataGgMmAaaaHHii(o,b);
	if (formato=="aaaa-mm-gg") return testDataAaaaMmGgHHii(o,b);
	return false;
}
function testOrario(o,b) {
	o.value = o.value.replace(/\s+$|^\s+/g,"")
	if (o.value == "") if (b) return false; else return true;
	var re = /^(\d{2}):(\d{2})$/;
	if (!(re.test(o.value))) return false;
	var arrMatches = re.exec(o.value)
	var ore = parseInt(arrMatches[1],10)
	var minu = parseInt(arrMatches[2],10)
	if (ore < 0 || ore > 23) return false;
	if (minu < 0 || minu > 59) return false;
	if(o.value == ':') o.value = "";
	return true;
}
function testDataGgMmAaaa(oggTextfield, boolObbligatorio) {
	oggTextfield.value = oggTextfield.value.replace(/\s+$|^\s+/g,"")
	if (oggTextfield.value == "") if (boolObbligatorio) return false; else return true;
	var re = /^(\d{1,2})\-(\d{1,2})\-(\d{4})$/       // accetta anche 4-6-1999
	if (!(re.test(oggTextfield.value))) return false
	var arrMatches = re.exec(oggTextfield.value);
	var giorno = parseInt(arrMatches[1],10)
	var mese = parseInt(arrMatches[2],10)
	var anno = parseInt(arrMatches[3],10)

	//aggiunta la possibilit� di mettere date con 0 nei mesi e nei giorni
	if (mese < 0 || mese > 12) return false
	var nGiorni;
	switch (mese) {
		case 4 : case 6 : case 9 : case 11 :
			nGiorni = 30
			break
		case 2 :
			if (anno % 4 == 0 && (anno % 1000 == 0 || anno % 100 != 0)) nGiorni = 29; else nGiorni = 28;
			break
		default :
			nGiorni = 31
	}

	if (giorno > nGiorni || giorno < 0) return false;
	else{
		oggTextfield.value = (
				( (giorno<10) ? '0' + giorno : giorno ) + '-' + 
				( (mese<10) ? '0' + mese : mese) + '-' + 
				( anno )
			)
		return true
	}
}

function testDataGgMmAaaaHHii(oggTextfield, boolObbligatorio) {
	oggTextfield.value = oggTextfield.value.replace(/\s+$|^\s+/g,"")
	if (oggTextfield.value == "") if (boolObbligatorio) return false; else return true;
	var re = /^(\d{1,2})\-(\d{1,2})\-(\d{4}) (\d{1,2}):(\d{1,2})$/       // accetta anche 4-6-1999
	if (!(re.test(oggTextfield.value))) return false;
	var arrMatches = re.exec(oggTextfield.value)
	var giorno = parseInt(arrMatches[1],10)
	var mese = parseInt(arrMatches[2],10)
	var anno = parseInt(arrMatches[3],10)
	var ore = parseInt(arrMatches[4],10)
	var minu = parseInt(arrMatches[5],10)

	if (mese < 0 || mese > 12) return false;
	if (ore < 0 || ore > 23) return false;
	if (minu < 0 || minu > 59) return false;
	var nGiorni;
	switch (mese) {
		case 4 : case 6 : case 9 : case 11 :
			nGiorni = 30
			break
		case 2 :
			if (anno % 4 == 0 && (anno % 1000 == 0 || anno % 100 != 0)) nGiorni = 29; else nGiorni = 28;
			break
		default :
			nGiorni = 31
	}

	if (giorno > nGiorni || giorno < 0) return false;
	else{
		oggTextfield.value = (
				( (giorno<10) ? '0' + giorno : giorno ) + '-' + 
				( (mese<10) ? '0' + mese : mese) + '-' + 
				( anno ) + ' '  +
				( (ore<10) ? '0' + ore : ore) + ':' + 
				( (minu<10) ? '0' + minu: minu )
			)
		return true
	}
}



function testDataAaaaMmGg(oggTextfield, boolObbligatorio) {
	oggTextfield.value = oggTextfield.value.replace(/\s+$|^\s+/g,"")
	if (oggTextfield.value == "") if (boolObbligatorio) return false; else return true;
	var re = /^(\d{4})\-(\d{1,2})\-(\d{1,2})$/       // accetta anche 4-6-1999
	if (!(re.test(oggTextfield.value))) return false;
	var arrMatches = re.exec(oggTextfield.value)
	var giorno = parseInt(arrMatches[3],10)
	var mese = parseInt(arrMatches[2],10)
	var anno = parseInt(arrMatches[1],10)

	if (mese < 0 || mese > 12) return false;

	var nGiorni;

	switch (mese) {
		case 4 : case 6 : case 9 : case 11 :
			nGiorni = 30
			break
		case 2 :
			if (anno % 4 == 0 && (anno % 1000 == 0 || anno % 100 != 0)) nGiorni = 29; else nGiorni = 28;
			break
		default :
			nGiorni = 31
	}

	if (giorno > nGiorni || giorno < 0) return false;
	else {
		oggTextfield.value = (
			( anno ) + '-' + 
			( (mese<10) ? '0' + mese : mese) + '-' + 
			( (giorno<10) ? '0' + giorno : giorno )
		)
		return true
	}
		
}

function testDataAaaaMmGgHHii(oggTextfield, boolObbligatorio) {
	oggTextfield.value = oggTextfield.value.replace(/\s+$|^\s+/g,"")

	console.log("oggTextfield.value: " + oggTextfield.value);
	console.log("boolObbligatorio: " + boolObbligatorio);
	if (oggTextfield.value == "") if (boolObbligatorio) return false; else return true;
	var re = /^(\d{4})\-(\d{1,2})\-(\d{1,2}) (\d{1,2}):(\d{1,2})$/       // accetta anche 4-6-1999
	if (!(re.test(oggTextfield.value))) return false;
	var arrMatches = re.exec(oggTextfield.value)
	var giorno = parseInt(arrMatches[3],10)
	var mese = parseInt(arrMatches[2],10)
	var anno = parseInt(arrMatches[1],10)
	var ore = parseInt(arrMatches[4],10)
	var minu = parseInt(arrMatches[5],10)

	if (mese < 0 || mese > 12) return false;
	if (ore < 0 || ore > 23) return false;
	if (minu < 0 || minu > 59) return false;
	var nGiorni;
	switch (mese) {
		case 4 : case 6 : case 9 : case 11 :
			nGiorni = 30
			break
		case 2 :
			if (anno % 4 == 0 && (anno % 1000 == 0 || anno % 100 != 0)) nGiorni = 29; else nGiorni = 28;
			break
		default :
			nGiorni = 31
	}

	if (giorno > nGiorni || giorno < 0) return false;
	else {
		oggTextfield.value = (
			( anno ) + '-' + 
			( (mese<10) ? '0' + mese : mese) + '-' + 
			( (giorno<10) ? '0' + giorno : giorno ) + ' ' +
			( (ore<10) ? '0' + ore : ore) + ':' + 
			( (minu<10) ? '0' + minu: minu )
		)
		return true
	}
}


function testUrl(oggTextfield, boolObbligatorio) {
	oggTextfield.value = oggTextfield.value.replace(/\s+$|^\s+/g,"")
	if (oggTextfield.value == "") if (boolObbligatorio) return false; else return true;
	var re = /^https?://///g
	return(re.test(oggTextfield.value))
}


function testEmail(oggTextfield, boolObbligatorio) {
	oggTextfield.value = oggTextfield.value.replace(/\s+$|^\s+/g,"")
	if (oggTextfield.value == "") if (boolObbligatorio) return false; else return true;
	var rex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	var risultato = rex.test(oggTextfield.value);
	return risultato
}

function testRadio(oggRadio, boolObbligatorio) {
	for (var i=0; i<oggRadio.length; i++) if (oggRadio[i].checked) return true;
	if (boolObbligatorio) return false; else return true;
}

function testCheckbox(oggCheckbox, boolObbligatorio) {
	if ((!oggCheckbox.checked) && boolObbligatorio) return false; else return true;
}

function testCAP(oggTextfield, boolObbligatorio) {
	oggTextfield.value = oggTextfield.value.replace(/\s+$|^\s+/g,"");
	if (oggTextfield.value == "") if (boolObbligatorio) return false; else return true;
	var re = /^\d{5}$/;
	return(re.test(oggTextfield.value));
}

function testTelefono(oggTextfield, boolObbligatorio) {
	oggTextfield.value = oggTextfield.value.replace(/\s+$|^\s+/g,"");
	if (oggTextfield.value == "") {
		if (boolObbligatorio) return false; else return true;
	}
	var re = /^\+\d[\d ]{6,}$/;
	return(re.test(oggTextfield.value));
}
function testSDI(oggTextfield, boolObbligatorio) {
	oggTextfield.value = oggTextfield.value.replace(/\s+$|^\s+/g,"");
	if (oggTextfield.value == "") {
		if (boolObbligatorio) return false; else return true;
	}
	var re = /^[0-9A-Z]{7}$/;

	return(re.test(oggTextfield.value));
}
function testPartitaIVA(oggTextfield, boolObbligatorio) {
	oggTextfield.value = oggTextfield.value.toUpperCase().replace(/\s+$|^\s+/g,"");
	if (oggTextfield.value == "") if (boolObbligatorio) return false; else return true;
	var re = /^[0-9]{11}$/;
	return(re.test(oggTextfield.value));
}
function testCodiceFiscale(oggTextfield, boolObbligatorio) {
	oggTextfield.value = oggTextfield.value.toUpperCase().replace(/\s+$|^\s+/g,"");
	if (oggTextfield.value == "") if (boolObbligatorio) return false; else return true;
	var re = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
	return(re.test(oggTextfield.value));
}

function testAlfanumerico(oggTextfield, boolObbligatorio) {
	oggTextfield.value = oggTextfield.value.replace(/\s+$|^\s+/g,"");
	if (oggTextfield.value == "") if (boolObbligatorio) return false; else return true; 
	var re = /^[a-zA-Z0-9]+$/;
	return(re.test(oggTextfield.value));
}

function testCampoTesto(oggTextfield, boolObbligatorio) {
	oggTextfield.value = oggTextfield.value.replace(/\s+$|^\s+/g,"");
	if (oggTextfield.value == "") if (boolObbligatorio) return false; else return true; 
	return true;
}

function testSerieDiCheckbox(oggCheckbox, boolObbligatorio) {
	for (var i=0; i<oggCheckbox.length; i++) { if (oggCheckbox[i].checked) return true;	}
	if (boolObbligatorio) return false; else return true;
}

function testCombobox(oggComboBox, boolObbligatorio) {
	var valore = oggComboBox.options.length > 0 ? oggComboBox.options[oggComboBox.selectedIndex].value : !boolObbligatorio;
	if ((valore == "") && boolObbligatorio) return false; else return true;
}

function testComboboxMultiple(oggComboBox, boolObbligatorio) {
	if ((oggComboBox.selectedIndex == -1) && boolObbligatorio) return false; else return true;
}

function trim(str) { /* anche interno */
	return str.replace(/\s+/g," ").replace(/^\s+/,"").replace(/\s+$/,"");
}


function checkPasswordStrength(password, defaultStrength = 0) {
	// Initialize variables
	var strength = 0;
	var tips = "";
  
	// Check password length
	if (password.length < 8) {
	  tips += _e("Make the password longer.") + " ";
	} else {
	  strength += 1;
	}
  
	// Check for mixed case
	if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
	  strength += 1;
	} else {
	  tips += _e("Use both lowercase and uppercase letters.") + " ";
	}
	
	// Check for numbers
	if (password.match(/\d/)) {
	  strength += 1;
	} else {
	  tips += _e("Include at least one number.") + " ";
	}
  
	// Check for special characters
	if (password.match(/[^a-zA-Z\d]/)) {
	  strength += 1;
	} else {
	  tips += _e("Include at least one special character.") + " ";
	}
  
	return strength >= defaultStrength ? true : tips;

	// Return results
	/*
	if (strength < 2) {
	  return "{Easy to guess.} " + tips;
	} else if (strength === 2) {
	  return "{Medium difficulty.} " + tips;
	} else if (strength === 3) {
	  return "{Difficult.} " + tips;
	} else {
	  return "{Extremely difficult.} " + tips;
	}
	*/
  }

$(document).ready(function() {

	//
	// COLOR SELECTOR
	//
	$(".colors .radiobutton").removeClass("selected");
	$('.radiobutton').each(function(){
		$(this).css("background-color", $(this).text());
		$(this).on("click", function(e){
			
			$(".colors .radiobutton").removeClass("selected");
			
			
			$(this).addClass("selected");
			console.log($(this).text());
		});
		if($(this).find("input").is(":checked")) {
			$(this).addClass("selected");
		}
	});

	//
	// CHECKBOX LIST CONTAINER
	//
	var checkboxBehaveOnClick = (o) => {
		if(typeof(o)=="undefined") {
			$('.checkboxListContainer').each(function(){
				$(this).find('label.checkbox input').on("click",function(){checkboxBehaveOnClick(this)});
				o = $(this).find('label.checkbox:first input');
				$(o).parent().parent().find("label input").each(function(){
					if($(this).prop("checked")) $(this).parent().addClass("selected"); else $(this).parent().removeClass("selected");
				});				
			});
		} else {
			$(o).parent().parent().find("label input").each(function(){
				if($(this).prop("checked")) $(this).parent().addClass("selected"); else $(this).parent().removeClass("selected");
			});				
		}

	};
	checkboxBehaveOnClick();

	//
	// FILE
	//
	$('.file_container input[type=file]').on("change",function(){
		$(this).parent().parent().find('.file_name').text($(this)[0].files.length + " files selected");
	});
	

});




/* Italian initialisation for the jQuery UI date picker plugin. */
/* Written by Antonello Pasella (antonello.pasella@gmail.com). */
jQuery(function($){
	
	$.datepicker.regional['it'] = {
		closeText: 'Chiudi',
		prevText: '&#x3c;Prec',
		nextText: 'Succ&#x3e;',
		currentText: 'Oggi',
		monthNames: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
			'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
		monthNamesShort: ['Gen','Feb','Mar','Apr','Mag','Giu',
			'Lug','Ago','Set','Ott','Nov','Dic'],
		dayNames: ['Domenica','Luned&#236','Marted&#236','Mercoled&#236','Gioved&#236','Venerd&#236','Sabato'],
		dayNamesShort: ['Dom','Lun','Mar','Mer','Gio','Ven','Sab'],
		dayNamesMin: ['Do','Lu','Ma','Me','Gi','Ve','Sa'],
		weekHeader: 'Sm',
		dateFormat: 'dd/mm/yy',
		firstDay: 1,
		isRTL: false,
		showMonthAfterYear: false,
		yearSuffix: ''};

	$.datepicker.regional['en'] = {
		closeText: 'Done',
		prevText: 'Prev',
		nextText: 'Next',
		currentText: 'Today',
		monthNames: ['January','February','March','April','May','June',
		'July','August','September','October','November','December'],
		monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
		'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
		dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
		dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		dayNamesMin: ['Su','Mo','Tu','We','Th','Fr','Sa'],
		weekHeader: 'Wk',
		dateFormat: 'dd/mm/yy',
		firstDay: 1,
		isRTL: false,
		showMonthAfterYear: false,
		yearSuffix: ''};


});





