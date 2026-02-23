var mod = '';
var pri = 0;
var daiv = 0;
var daic = 0;


var constrain_x = -1;
var constrain_y = -1;
var constrain_str = "";

function beforeSaveAndLoad(){
	if(!checkImageSize()) return;
	if(!checkRedux()) return;
	saveAndLoad();	
}

function beforeSave(){
	if(!checkImageSize()) return;
	if(!checkRedux()) return;
	checkConStato();
}

function checkRedux() {
	if( parseInt($('#nu_redux').val()) < 0 && parseInt($('#nu_maxtot').val()) == 0 ) {
		alert(_e("You can't apply auto reduction if you don't have a limit on total impressions."));
		return false;
	}
	return true;
}

/**
 * check image file size of banner selected before uploading
 * @returns {Boolean}
 */
function checkImageSize() {
	if($('#file').val() == "") return true;
	if($('#html5').prop("checked")) return true; // HTML5 files aren't controlled
	if($('#video').prop("checked") && $('#file').val().indexOf(".mp4") == $('#file').val().length-4) return true; // video .mp4 files are not controlled
	if( (constrain_x > 0 && parseInt($('#file').data("x")) != constrain_x ) ||
		(constrain_y > 0 && parseInt($('#file').data("y")) != constrain_y )) {
		alert(_e("Please respect file dimensions.") +  "<br>" + constrain_str);
		return false;
	}
	return true;
}

function showSpuntaDependencies( spunta ){
	// simplify ui in creation
	if($('#id').val() == "") {
		$('#tr_id,#tr_clicktag').css("display","none");
	}

	// empty file
	$('#file').val(""); $('#file_val').val("");

	// fix tr display type on mobile
	$('#tr_clicktag').css("display", $(window).width() > 768 ? "table-row" : "flex" );
	
	if(spunta.attr("id")=="html5") {
		$('#scriptbox').addClass("close");
		$('#tr_clicktag').show();
		$('#infoformats').html( _e("Allowed file types: zip"));			
		$('#file').attr("accept",".zip" );
		$('#infobox td:last p').html(_e("Upload your ZIP file with HTML5 banner. See documentation on how to build it."));
		$('#videoaudiotoggle').hide();
	} else if(spunta.attr("id")=="video") { 	
		$('#scriptbox').addClass("close");
		$('#tr_clicktag').hide();
		$('#infoformats').html( _e("Allowed file types: mp4 and images"));			
		$('#file').attr("accept",".jpg,.gif,.png,.webp,.jpeg,.mp4" );
		$('#infobox td:last p').html(_e("Upload an MP4 file, a poster JPG image same aspect ratio and put destination link to create a video banner."));
		$('#videoaudiotoggle').show();
	} else if(spunta.attr("id")=="basico") { 
		$('#scriptbox').addClass("close");
		$('#tr_clicktag').hide();
		$('#infoformats').html( _e("Allowed file types: gif, jpg, png, webp;"));
		$('#file').attr("accept",".jpg,.gif,.png,.webp,.jpeg" );
		$('#infobox td:last p').html(_e("Upload an image and put a link to create a basic banner."))	;
		$('#videoaudiotoggle').hide();
	} else if(spunta.attr("id")=="scripted") { 
		$('#scriptbox').removeClass("close");
		$('#tr_clicktag').show();
		$('#infoformats').html( _e("Allowed file types: gif, jpg, png, webp;"));
		$('#file').attr("accept",".jpg,.gif,.png,.webp,.jpeg" );
		$('#infobox td:last p').html(_e("Insert a script or pick a template. You can use css, js and html. Use shortcodes to use images and clicktag. See documentation."))	;
		$('#videoaudiotoggle').hide();
	}

	spunta.prop("checked",true).parent().addClass("selected");

	// class of the parent
	$('.bannertype input').each(function(){
		if($(this).prop("checked")) $(this).parent().addClass("selected"); else $(this).parent().removeClass("selected");
	});


}


jQuery(document).ready(function($) {

	//
	// show payment process
	if($('#payment_process').data("rel")=="yes") {
		if($('body').hasClass("advertiser")) {
			$('fieldset').addClass("locked");
			$('#repeatbannerid').show();
			$('#instructions').show();
		}
		$('#payment_process').removeClass("locked").show();
	}

	//
	// missing campaign alert.
	if( $("#cd_campagna option").length==1 && $("#cd_campagna option").val() == "") {
		if(gconfirm(_e("First you need to create a campaign. Press OK to create a campaign."),function(){
			document.location.href="../7campagne/index.php?op=aggiungi";
		}));
	}

	//
	// alternative script banner templates
	$('#template').html("");
	var s= "<option>--"+ _e("choose") + "--</option>";
	Object.keys(templates).forEach(function(currentValue, index ){
		var item = templates[currentValue];
		s = s + "<option value='" + currentValue + "'>" + item[0] + " " + "</option>";
	});
	$('#template').html(s);
	$('#template').on("change",function(){
		var v = $(this).val();
		Object.keys(templates).forEach(function(currentValue, index ){
			if( currentValue  == v ) {
				var item = templates[currentValue];
				var o = "";
				$ar = ['ID','CLICKTAG','TARGET','IMG0','IMG1','TITLE'];
				if (item[2]!="")
					var changes = item[2].match(/\[(.*?)\]/g).map(function(val){
						val = val.replace("[","").replace("]","");
                        // check if a string has only numbers
                        if (!val.match(/^[0-9]+$/)) {
                            if(!$ar.includes(val)) {
                                o += "<input type='text' id=\"tempfield_" + val + "\" value=\"" + val + "\" class=\"tempfield\" />";
                                $ar.push(val);	
                            }
                        }
					});

				gconfirm(  _e("Instructions") +": <b>" + item[0] + "</b><br><br>" + item[1] + o, function() {
					
					if (item[2]!="")
						var changes = item[2].match(/\[(.*?)\]/g).map(function(val){
							val = val.replace("[","").replace("]","");
							if($('#tempfield_' + val).length > 0) {
								// console.log($('#tempfield_' + val).val());
								item[2] = item[2].replace("[" + val + "]", $('#tempfield_' + val).val());
							}
						});
					
					$('#de_codicescript').val( item[2] );



				});
				
			}	

		});
	});

	//
	// geoip
	if($('#de_country option').length>1) {
		// hide the advice that tells to config geoip to use geolocation
		$('#geofieldset .note').hide();
	}
	function fixMultiCountry(){
		if ($('#de_country').attr("multiple")=="multiple") {
			$('#de_country').attr("name","de_country[]");
			$('#de_country').css("height","12rem");
			$('#de_country').css("min-width","200px");
			$('#de_country').removeAttr("size");
			$('#regiontr').hide();
			$('#citytr').hide();
		} else {
			$('#de_country').attr("name","de_country");
			$('#de_country').attr("size","1");
			$('#de_country').css("height","2.5rem");
			if( GEOIPDB == "DB3LITE") {
				$('#regiontr').show();
				$('#citytr').show();
			} else {
				$('#regiontr').hide();
				$('#citytr').hide();
			}
		}
	}
	$('#multicountry').on("click",function(e){
		e.preventDefault();
		if ($('#de_country').attr("multiple")=="multiple") {
			$('#de_country').removeAttr("multiple");			
		} else {
			$('#de_country').attr("multiple","multiple");
		}
		fixMultiCountry();
	});
	fixMultiCountry();

	$('#de_country').on("change",function(){
		var v = $(this).val();
		$("#de_region").load("ajax.jobs.php?op=region&country=" + encodeURIComponent(v), function(responseTxt, statusTxt, xhr){
		$("#de_city").html("<option value='ALL'>--" + _e("all") +"--</option>");
	  });
	});
	$('#de_region').on("change",function(){
		var v = $(this).val();
		var c = $('#de_country').val();
		$("#de_city").load("ajax.jobs.php?op=city&country=" + encodeURIComponent(c)+"&region=" + encodeURIComponent(v), function(responseTxt, statusTxt, xhr){
	  });
	});

	//
	// save and reopen (to pick another file)
	$('input[name=file]').on("change",function(){
		if($(this).val()!="") {
			$(".reopen").css("display","inline-block");
		} else {
			$(".reopen").hide();
		}
	});


	//
	// HTML5 and basic html allow only 1 file
	$('input[name=file]').on("click",function(e){
		let q = $(this).parent().parent().find('.thumbscontainer .divthumbs').length;
		if ($('#html5').prop("checked") && q>0) {
			e.preventDefault();
			alert(_e("File already selected. Remove it to choose another file."));
		}
		if ($('#basico').prop("checked") && q>0) {
			e.preventDefault();
			alert(_e("File already selected. Remove it to choose another file."));
		}
	});

	//
	// hide thumbs container if there aren't
	$('.thumbscontainer').each(function(){
		if($(this).find(".divthumbs").length == 0) $(this).hide();
		});


	var mobileChange = (o) => {
		if(typeof(o)=="undefined") $('#nu_mobileflag').on("change",function(){	mobileChange(this); });
		
		$('.checkbox').show();
		if($('#nu_mobileflag').val() == "1" ) {
			var ar = ['iPhone','iPad','iPod','Android','BlackBerry'];
			ar.forEach(a => {
				// console.log(a);
				ar.forEach(a => $('.checkbox').find('input[type=checkbox][value="' + a +'"]').prop('checked', false).parent().removeClass("selected").hide() );
			});
		}
		if($('#nu_mobileflag').val() == "2" ) {
			var ar = ['Linux','CrOs','Mac OS X','Windows','Ubuntu'];
			ar.forEach(a => $('.checkbox').find('input[type=checkbox][value="' + a +'"]').prop('checked', false).parent().removeClass("selected").hide() );
		}
	};
	mobileChange();


	//
	// change banner type, change rules
	// (banner type isn't a field, it's deducted by the compiled fields)
	var stdFormats = _e("Allowed file types: gif, jpg, png, webp;");
	$('#scripted,#basico,#html5,#video').on("click",function(e){
		var spunta = $(this);
		$('.bannertype input').prop("checked", false);
		spunta.prop("checked",true);

		// block changing to zip
		if(spunta.attr("id")!="html5" && $('.thumbscontainer .zip').length > 0 ) {
			alert( _e("Remove ZIP file to change banner type.") );
			spunta.prop("checked",false);
			$('#html5').prop("checked",true);
			return;
		}
		// block changing to mp4
		if(spunta.attr("id")!="video" && $('.thumbscontainer .mp4').length > 0 ) {
			alert( _e("Remove mp4 file to change banner type.") );
			spunta.prop("checked",false);
			$('#video').prop("checked",true);
			return;
		}
		// block changing to scripted
		if(spunta.attr("id")!="scripted" && $('#de_codicescript').val()!="" ) {
			alert( _e("Remove code inserted to change banner type.") );
			spunta.prop("checked",false);
			$('#scripted').prop("checked",true);
			return;
		} // delete label "Delete code/template inserted?" from lang

		showSpuntaDependencies(spunta);

	});


	let spunta = '';
	//
	// detect banner type rules on start based on filled fields
	if($('#de_codicescript').val()!="") { 
		spunta = $('#scripted');
	} else {
		if($('.thumbscontainer .zip').length > 0) {
			spunta = $('#html5');
		} else if($('.thumbscontainer .mp4').length > 0) {
			spunta = $('#video');
		} else {
			spunta = $('#basico');
		}
	}

	showSpuntaDependencies(spunta);

	// only basic limitation
	if(onlybasic==1) {
		$('#bannertypetr').hide();
	}
	
	if($('#fl_stato').val() == "D") {
		if($('body').hasClass("advertiser")) $('#span_status').css("display","none");
	}

	if($('body').hasClass("advertiser")) {
		$('.panel.bottom a.salva').text( " " + _e("Save draft") );
	}


	// paymodel
	$('#cd_posizione').on("change",function(){

		$.get("ajax.jobs.php?op=posizione&id=" + $("#cd_posizione").val(), function(responseTxt, statusTxt, xhr){
			var ar = responseTxt.split("|");  /* 
				0   1         2 345   6
				cpm|50,000.00|1|||500|300 
			*/
			if(ar[0] == "" || ar[2] == "0") {
				// not available, or not sellable
				if($('body').hasClass("advertiser")) $('#limitationfieldset').css("display","none");
				$('#paycontainercopy').html("");
			} else {
				if($('#payment_process').data("rel")!="yes")
					$('#limitationfieldset').css("display","block");
				mod = ar[0].toUpperCase();
				pri = ar[1].replace(/,/g, '');
				daiv = ar[3];
				daic = ar[4];
				$('#paymodel').html( mod );
				$('#paymodelprice').html( money + pri);
				$('#paycontainercopy').html( $('#paycontainer').text() );
			}
	
			//
			// if these values are available consider these
			// as suggestions info and then as required
			constrain_x = -1;
			constrain_y = -1;
			if(ar[5]!="" && ar[6]!="") {
				let w = ar[5];
				let h = ar[6];
				constrain_str = _e("Banner suggested size: %1x%2 pixels, max %3");
				if (w=="-1") w = _e("(Any size)");
				constrain_str = constrain_str.replace("%1",w);
				constrain_str = constrain_str.replace("%2",h);
				constrain_str = constrain_str.replace("%3",maxkb);
				$('#picsize').html(constrain_str);
				if(w > 0) constrain_x = w;
				if(h > 0 && w > 0) constrain_y = h;
			}

			if($('body').hasClass("advertiser"))  {
				
				$('.noadvertiser').css("display","none");
				// lock fields and bind rules
				if(mod.toLowerCase()=="cpm") {
					$('#tr_maxclick').css("display","none");
					$('#tr_giorno2').css("display","none");
					$('#tr_maximpressiontotal').css("display","");
					$('#approxto').css("display","");
				}
				if(mod.toLowerCase()=="cpc") {
					$('#tr_maximpressiontotal').css("display","none");
					$('#tr_giorno2').css("display","none");
					$('#tr_maxclick').css("display","");
					$('#approxto').css("display","");
				}
				if(mod.toLowerCase()=="cpd") {
					$('#tr_maxclick').css("display","none");
					$('#tr_maximpressiontotal').css("display","none");
					$('#tr_giorno2').css("display","");
					$('#tr_giorno2 .ui-datepicker-trigger').css("display","none");
					$('#approxto').css("display","none");
				}
				$('#tr_giorno2 input').prop("readonly",true);
				$('#tr_maximpressiontotal input').prop("readonly",true);
				$('#tr_maxclick input').prop("readonly",true);

			}

			calcFromPrice ();

		});

	});
	$('#cd_posizione').trigger("change");

	function dateToYMD(date) {
		var d = date.getDate();
		var m = date.getMonth() + 1; //Month from 0 to 11
		var y = date.getFullYear();
		return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
	}

	
	function calcFromPrice () {
		if (pri == 0 && mod !="") {
			alert( _e("There is a wrong setting in Position and the system can't calculate the price, please contact support.") );
			return;
		}        
		var AprroxString = _e("Approximately %s days");
		// console.log(AprroxString);
		if(mod.toLowerCase()=="cpm") {
			var v = Math.round( $('#nu_price').val() * 1000 / pri );
			$('#nu_maxtot').val( v ).addClass("look");
			setTimeout(function(){$('#nu_maxtot').removeClass("look")}, 500);
			if(daiv > 0) {
				$('#approxto').html ( AprroxString.replace( "%s",Math.round( v / daiv ) ) );
			} else {
				$('#approxto').html ( "" );
			}
			var ddd = datafutura.split("-");
			// console.log(ddd);
			var date2 = new Date(parseInt(ddd[0],10),parseInt(ddd[1],10)-1,parseInt(ddd[2],10)); // data futura avanti avanti
			$('#dt_giorno2').val( dateToYMD( date2 ) );
			$('#dt_giorno2').trigger("change");
		}

		if(mod.toLowerCase()=="cpc") {
			var v = Math.round( $('#nu_price').val() / pri );
			$('#nu_maxclick').val( v ).addClass("look");
			setTimeout(function(){$('#nu_maxclick').removeClass("look")}, 500);
			if(daic > 0) {
				$('#approxto').html ( AprroxString.replace( "%s",Math.round( v / daic )  ) ) ;
			} else {
				$('#approxto').html ( "" );
			}
			var ddd = datafutura.split("-");
			// console.log(ddd);
			var date2 = new Date(parseInt(ddd[0],10),parseInt(ddd[1],10)-1,parseInt(ddd[2],10)); // data futura avanti avanti
			$('#dt_giorno2').val( dateToYMD( date2 ) );
			$('#dt_giorno2').trigger("change");
		}

		if(mod.toLowerCase()=="cpd") {
			var v = Math.round( $('#nu_price').val() / pri );
			var date2 = new Date( $('#dt_giorno1').val() );
			date2.setDate(date2.getDate() + v);
			$('#dt_giorno2').val( dateToYMD( date2 ) );
			$('#dt_giorno2').trigger("change");

			$('#dt_giorno2 input').addClass("look");
			setTimeout(function(){$('#dt_giorno2 input').removeClass("look")}, 500);


		}

	}

	$('#nu_price,#dt_giorno1').on("keyup change", function() {
		calcFromPrice ();
	});


	// modifico l'interfaccia per advertiser
	if($('body').hasClass("advertiser")) {
		if($('#de_country option').length <=1) {
			$('#geofieldset').css("display","none");
		}
		$('#tr_redux,#tr_maximpressiondaily').css("display","none");

		$('#addtokart').on("click",function(e){
			e.preventDefault();

			//
			// check for files before going to checkout
			// --------------------------------
			let q = $("#Datiprincipali2").find('.thumbscontainer .divthumbs').length;
			if (
				($('#html5').prop("checked") && q==0 && $('#file').val()=="" ) || 
				($('#basico').prop("checked") && q==0 && $('#file').val()=="")
			 ) {
				alert(_e("Missing file in media section."));
				return;
			}
			if ($('#scripted').prop("checked")) {
					str = $('#de_codicescript').val();
					if($('#file').val()!="") q++;
					const regex = /\[IMG[0-4]\]/g;
					const matches = str.match(regex);
					if (!matches) q2 = 0;
					const uniqueMatches = {};
					for (const match of matches) uniqueMatches[match] = true;
					q2 = Object.keys(uniqueMatches).length;
					if( q<q2) {
						alert(_e("Missing file in media section."));
						return;
					}
			}
			// --------------------------------

			if ($('#op').val()=='modificaStep2') $('#op').val("modificaStep2checkout");
			if ($('#op').val()=='aggiungiStep2') $('#op').val("aggiungiStep2checkout");

			// CHECK FILE DIMENSIONS
			if(!checkImageSize()) return;

			checkForm();					

		});
	} else {
		$('#addcarrello').css("display","none");
	}



	var _URL = window.URL || window.webkitURL;
	$("#file").change(function (e) {
		// if (!$('#html5').prop("checked")) {
			var file, img;
			if ((file = this.files[0]) && file.type.match('image.*')) {
				img = new Image();
				var objectUrl = _URL.createObjectURL(file);
				img.onload = function () {
					$("#file").data("x",this.width);
					$("#file").data("y",this.height);
					// console.log(this.width + "x" + this.height);
					_URL.revokeObjectURL(objectUrl);
				};
				img.src = objectUrl;
			}
		// }
	});

	setupViewerThumbGallery();
} );
