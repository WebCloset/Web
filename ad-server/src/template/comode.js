/**
 * handle CTRL +, CTRL -, CTRL + 0 to handle font size zoom in and out
 * because with font based on vw the browser zooming functions don't work
 */
var initialFontSize = "";
document.addEventListener("keydown", function(event) {
  // Check if the CTRL key is pressed
  if(initialFontSize == "") {
  initialFontSize = (parseFloat(window.getComputedStyle(document.body).fontSize) / window.innerWidth) * 100;
  }
  if (event.ctrlKey) {
    // Check if the pressed key is either "+" or "-"
    if (event.key === "+" || event.key === "-") {
      // Prevent default behavior of the keys
      event.preventDefault();

      // Get the current font size of the body element in pixels
      var currentFontSizeInPixels = parseFloat(window.getComputedStyle(document.body).fontSize);

      // Convert the current font size from pixels to vw (viewport width) units
      var currentFontSizeInVw = (currentFontSizeInPixels / window.innerWidth) * 100;

      // Calculate the new font size based on the pressed key
      var newFontSizeInVw = event.key === "+" ? currentFontSizeInVw + 0.1 : currentFontSizeInVw - 0.1;


      if(newFontSizeInVw < initialFontSize * 2 && newFontSizeInVw > initialFontSize / 2) {
        // Convert the new font size from vw units to pixels
        // var newFontSizeInPixels = (newFontSizeInVw / 100) * window.innerWidth;

        // Update the font size of the body and html nodes
        document.body.style.fontSize = newFontSizeInVw + "vw";
        document.documentElement.style.fontSize = newFontSizeInVw + "vw";
      }
    }

    if (event.key === "0") {
      document.body.style.fontSize = initialFontSize + "vw";
      document.documentElement.style.fontSize = initialFontSize + "vw";
    }
  }
});







var t = document.location.href.split("/");
var PONSDIR = "";
for (var i=0; i<t.length; i++) { if (t[i]=="src") break; else PONSDIR += t[i] + "/"; }


var $lang = {};

function _e( $s ) {
	if(Object.keys($lang).length < 5) return $s;	// lang not yet loaded
	if($lang.hasOwnProperty($s)) return $lang[$s];
		else {
			return "{" + $s + "}";
		}
}
function copyElementText(obj) {
    var text = $(obj).text();
    var elem = document.createElement("textarea");
    document.body.appendChild(elem);
    elem.value = text;
    elem.select();
    document.execCommand("copy");
    document.body.removeChild(elem);
}

// show mini tooltips
function tooltips() {

	$('.icon-help-circled').on("click",function(){
		let a = this;
		$('.icon-help-circled').each(function(){
			if(this != a) {
				$(this).html("");
			}
		});
		if($(a).html() == "") {
			$(a).append("<span><i class='icon-cancel'></i> " + $(a).data("rel") + "</span>");
			
		} else {
			$(a).html("");
		}
	});	

}



if(typeof(jQuery)!=="undefined")
jQuery(document).ready(function($){
	

	

	//
	// MENU TOGGLE BEHAVIOUR
	var menuStatus="";
	if ($(window).width() >=768) {
		menuStatus= getCookie("menuStatus");
	}

	$('<a href="#" id="mobiletoggle"><span class="icon-menu"></span></a><div id="mainmenucontainer" class="'+menuStatus+'"><div id="mainmenu"></div></div>').appendTo("body");

	if ($(window).width() >=768) {
		if(menuStatus == "on") {
			$('#mainmenucontainer').addClass("on");
			$("#mobiletoggle").find("span").removeClass("icon-menu").addClass("icon-cancel");
			$(".panel,.corpo,.panel2").addClass("contract");
		} else {
			$('#mainmenucontainer').removeClass("on");
			$("#mobiletoggle").find("span").removeClass("icon-cancel").addClass("icon-menu");
			$(".panel,.corpo,.panel2").removeClass("contract");
		}
	}

	$('#mobiletoggle').on("click",function(e){
		e.preventDefault();
		var c= $(this).find("span").hasClass("icon-menu");
		if(c){
			setCookie("menuStatus", "on", 365);
			$(this).find("span").removeClass("icon-menu").addClass("icon-cancel");
			$('#mainmenucontainer').addClass("on");
			$(".panel,.corpo,.panel2").addClass("contract");
		} else {
			setCookie("menuStatus", "", 365);
			$(this).find("span").removeClass("icon-cancel").addClass("icon-menu");
			$('#mainmenucontainer').removeClass("on");
			$(".panel,.corpo,.panel2").removeClass("contract");
		}
	});

	if(typeof(NOTMENU) == "undefined") loadMenu();



	//
	// translations
	function loadLabels () {
		$.getJSON(PONSDIR + "src/_include/ajax.lang.php", function(result) {
			$lang = result[0];
		});
	}

	loadLabels();

	//
	// copy text to clipboard for elements with class "copy-text"
	$(".copy-text").on("click", function() {
	  copyElementText(this);
	  alert(_e("Text copied to clipboard"));
	});


	/*
	$('.panel h1 a.paneltoggle').on("click",function(e){
		e.preventDefault();
		if($(".panel").hasClass("open")) {
			$(".panel").removeClass("open");
		} else {
			$(".panel").addClass("open");
		}
	});
	*/

	
	// shortcut hasAttr (used?)
	$.fn.hasAttr = function(name) {  
	   return this.attr(name) !== undefined;
	};


	//
	// GRID


	gridOddEven();


	ajaxCheckboxes();


	// FORMS

	//
	// forms focus class
	$("input[type=text],input[type=password],textarea,select").focus(function(){
		$(this).addClass("focus");
	});
	$("input[type=text],input[type=password],textarea,select").blur(function(){
		$(this).removeClass("focus");
	});

	/*$("input[type=text]").each(function(){
		if($(this).attr("name").indexOf("_mm")!=-1) $(this).css("background-image","none");
		if($(this).attr("name").indexOf("_gg")!=-1) $(this).css("background-image","none");
		if($(this).attr("name").indexOf("_aaaa")!=-1) $(this).css("background-image","none");
	});*/

	// checkAll();
	//
	// ajax load for grids

	setupViewerThumbGallery();

	//
	// AJAX GRID
	ajaxGrid('.gridWrapper.ajaxmode');

	//
	// TOOLTIPS
	tooltips();

} );


// ----------------------------------------------------------------------------------------------




function loadMenu() {
	if($('#loginform').length==0) {
		// console.log($('.panel:first td').length);
		if($('.panel:first td').length>1) {
			$('.panel:first h1').prepend("<a href=\"javascript:;\" class=\"paneltoggle\"></a> ");
		}

		//
		// load menu
		$("#mainmenu").load(PONSDIR +"src/_include/ajax.menu.php", null, function(){
			//
			// open submenu
			$('.linkmenu0').each(function(){
				$(this).attr("href","javascript:;");
				let classe = getCookie($(this).attr("data-rel"));
				if(classe == "chiuso") {
					$("#" + $(this).attr("data-rel")).addClass("chiuso");
					$(this).addClass("chiuso");
				}
			});

			//
			// click behaviour
			$('.linkmenu0').on("click",function(e){
				e.preventDefault();
				if($("#" + $(this).attr("data-rel")).hasClass("chiuso")) {
					setCookie($(this).attr("data-rel"), "", 365);
					$("#" + $(this).attr("data-rel")).removeClass("chiuso");
					$(this).removeClass("chiuso");
				} else {
					setCookie($(this).attr("data-rel"), "chiuso", 365);
					$("#" + $(this).attr("data-rel")).addClass("chiuso");
					$(this).addClass("chiuso");
				}
				e.stopPropagation();
			});
		});
	}
}



//-----------------------------------------------------------------------------------------------
function gup( name ) { /* get parameterts from querystring */
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );
	if( results == null ) return ""; else return results[1];
}

function urlencode(strText) {
	var isObj;
	var trimReg;
	if( typeof(strText) == "string" ) {
		if( strText != null ) {
			trimReg = /(^\s+)|(\s+$)/g;
			strText = strText.replace( trimReg, '');
			for(i=32;i<256;i++) {
				strText = strText.replace(String.fromCharCode(i),escape(String.fromCharCode(i)));
			}
		}
	}
	return strText;
}


/* show and hide a div, toggle */
function show(nomediv) { 
	if(typeof($)=="undefined") {
		// console.log(document.getElementById(nomediv).style.display);
		if(document.getElementById(nomediv).style.display == "block" ||
			document.getElementById(nomediv).style.display == "") document.getElementById(nomediv).style.display = 'none';
			else document.getElementById(nomediv).style.display='block';
	} else {
		if($('#'+nomediv).is(":visible")) $('#'+nomediv).addClass("chiudo"); else $('#'+nomediv).removeClass("chiudo")
		$('#'+nomediv).toggle("slow");
		
	}
}
/* show and hide a div, toggle */
function showfade(nomediv) { show(nomediv); }


//--------------------------------------------------------------------------------
// this function is needed to work around 
// a bug in IE related to element attributes
// (used?)
function hasClass(obj) {
	var result = false;
	if (obj.getAttributeNode("class") != null) {
	result = obj.getAttributeNode("class").value;
	}
	return result;
}



//
// submit on enter in forms
function submitonenter(formname,evt,thisObj) {
	evt = (evt) ? evt : ((window.event) ? window.event : "")
	if (evt) {
		if ( evt.keyCode==13 || evt.which==13 ) {
			thisObj.blur();
			if ($('#'+formname).find("#combotiporeset").length == 0) {
				$('#'+formname).append('<input type="hidden" name="combotiporeset" id="combotiporeset" value="reset">');
			} else {
				$('#combotiporeset').val('reset'); // work like a reset
			}
			$('#'+formname).submit();
		}
	}
}



//--------------------------------------------------------------------------------------------







// over-ride the alert method only if this a newer browser.
// Older browser will see standard alerts
if(document.getElementById) {
	window.oldalert = window.alert;	// keep calling old alert with "oldalert" function
	window.alert = function(txt,fx,titlewindow,closelabel) {
		createCustomAlert(txt,fx,titlewindow,closelabel);
	}
	window.gconfirm = function(txt,fx,labelok,labelcancel,fxcancel,titlewindow) {
		createCustomConfirm(txt,fx,labelok,labelcancel,fxcancel,titlewindow);
	}
}

// freeze layer to block interactions
function freeze($txt,$link) {
	createCustomAlert($txt);
	if($link=="") document.getElementById("closeBtn").style.display = 'none';
	document.getElementById("closeBtn").onclick=function() { 
		if($link!="") document.location.href=$link; 
		else {
			
		}
	};
}

// Handle closing the alert with ESC
function handleKeyDown(event) {
	document.addEventListener('keydown', function(event) {
		if (event.key === 'Escape') {
			removeCustomAlert();
		}
	});
}

// removes the custom alert from the DOM
function removeCustomAlert() {
	document.removeEventListener('keydown', handleKeyDown);
	if(document.getElementById("modalContainer")) document.getElementsByTagName("body")[0].removeChild(document.getElementById("modalContainer"));
	if(document.getElementById("modalContainer0")) document.getElementsByTagName("body")[0].removeChild(document.getElementById("modalContainer0"));
}


function createCustomAlert(txt,callback,alertTitle="NOTICE",closeButtonText="Close") {
	// shortcut reference to the document object
	d = document;	

	// if the modalContainer object already exists in the DOM, bail out.
	if(d.getElementById("modalContainer")) return;
	
	// create the modalContainer div as a child of the BODY element
	mObj0 = d.getElementsByTagName("body")[0].appendChild(d.createElement("div"));
	mObj0.id = "modalContainer0";
	// make sure its as tall as it needs to be to overlay all the content on the page
	mObj0.style.height = document.documentElement.scrollHeight + "px";

	// create the modalContainer div as a child of the BODY element
	mObj = d.getElementsByTagName("body")[0].appendChild(d.createElement("div"));
	mObj.id = "modalContainer";
	// make sure its as tall as it needs to be to overlay all the content on the page
	mObj.style.height = document.documentElement.scrollHeight + "px";

	// create the DIV that will be the alert 
	alertObj = mObj.appendChild(d.createElement("div"));
	alertObj.id = "alertBox";
	// MSIE doesnt treat position:fixed correctly, so this compensates for positioning the alert
//	if(d.all && !window.opera) alertObj.style.top = document.documentElement.scrollTop + "px";
	// center the alert box
//	alertObj.style.left = (d.documentElement.scrollWidth - alertObj.offsetWidth)/2 + "px";

	// create an H1 element as the title bar
	h1 = alertObj.appendChild(d.createElement("h1"));
	h1.appendChild(d.createTextNode(_e( alertTitle )));

	// create a paragraph element to contain the txt argument
	msg = alertObj.appendChild(d.createElement("p"));
	msg.innerHTML = txt;

	// create an anchor element to use as the confirmation button.
	btn = alertObj.appendChild(d.createElement("a"));
	btn.id = "closeBtn";
	btn.appendChild(d.createTextNode(_e(closeButtonText)));
	btn.href = "#";
	btn.className = "btn";
	
	// set up the onclick event to remove the alert when the anchor is clicked
	btn.onclick = function() { removeCustomAlert();
		if(typeof(callback)==="function") { callback(); }
	return false; }

	// Escape close the pop up
	document.removeEventListener('keydown', handleKeyDown);
	document.addEventListener('keydown', handleKeyDown);
}


function createCustomConfirm(txt,fx,labelok,labelcancel,fxcancel,titlewindow = "NOTICE") {
	// shortcut reference to the document object
	d = document;

	// if the modalContainer object already exists in the DOM, bail out.
	if(d.getElementById("modalContainer")) return;

	// create the modalContainer div as a child of the BODY element
	mObj0 = d.getElementsByTagName("body")[0].appendChild(d.createElement("div"));
	mObj0.id = "modalContainer0";
	// make sure its as tall as it needs to be to overlay all the content on the page
	mObj0.style.height = document.documentElement.scrollHeight + "px";

	// create the modalContainer div as a child of the BODY element
	mObj = d.getElementsByTagName("body")[0].appendChild(d.createElement("div"));
	mObj.id = "modalContainer";
	// make sure its as tall as it needs to be to overlay all the content on the page
	mObj.style.height = document.documentElement.scrollHeight + "px";

	// create the DIV that will be the alert 
	alertObj = mObj.appendChild(d.createElement("div"));
	alertObj.id = "confirmBox";
	// MSIE doesnt treat position:fixed correctly, so this compensates for positioning the alert
//	if(d.all && !window.opera) alertObj.style.top = document.documentElement.scrollTop + "px";
	// center the alert box
//	alertObj.style.left = (d.documentElement.scrollWidth - alertObj.offsetWidth)/2 + "px";

	// create an H1 element as the title bar
	h1 = alertObj.appendChild(d.createElement("h1"));
	titlewindow = _e( titlewindow );
	h1.appendChild(d.createTextNode(titlewindow));

	// create a paragraph element to contain the txt argument
	msg = alertObj.appendChild(d.createElement("p"));
	msg.innerHTML = txt;

	// create an anchor element to use as the confirmation button.
	btn = alertObj.appendChild(d.createElement("a"));
	btn.id = "closeBtnOK";

	if(typeof(labelok)=="undefined") labelok = _e("OK");
	if(typeof(labelcancel)=="undefined") labelcancel = _e("CANCEL");

	btn.appendChild(d.createTextNode(labelok));
	btn.href = "#";
	btn.className = "btn";
	// set up the onclick event to remove the alert when the anchor is clicked
	btn.onclick = function(event) {
			if (event) event.preventDefault();
			if(typeof fx == "string") eval(fx); 
			// if the callback returns a false, prevent the closing of the popUp
			// I hope this doesn't break anything
			let exitPopUp = true;
			if(typeof fx == "function") {
				let temp = fx();
				console.log("temp",temp);
				exitPopUp = temp === false ? false : true; 
			}
			console.log("exitPopUp",exitPopUp);
			if(exitPopUp === true) removeCustomAlert();
			return true;
		}
	// create an anchor element to use as the confirmation button.
	btn = alertObj.appendChild(d.createElement("a"));
	btn.id = "closeBtnKO";
	btn.className = "btn";
	btn.appendChild(d.createTextNode(labelcancel));
	btn.href = "#";

	if(typeof(fxcancel)!="function") fxcancel = function(){};
	
	// set up the onclick event to remove the alert when the anchor is clicked
	btn.onclick = function() { removeCustomAlert(); fxcancel(); return false; }
	
	// Escape close the pop up
	document.removeEventListener('keydown', handleKeyDown);
	document.addEventListener('keydown', handleKeyDown);
}




/* ---------------------- functions to page table list and details ------------------------- */


// ------------------------------------------------------------------------------------
// 
function elimina(s,div,i, callback) {
	gconfirm(_e('Are you sure to delete the file now?'),function() {
		// ajax call to delete and move files
		$.ajax({	'type' : 'GET',
			'url' : '../frwvars/ajax.deleteimg.php?f='+btoa(s)+"&div0="+btoa(div),
			'success' : function( $response ) { 
				if ($response.indexOf("ok")==0) { 
					divnuovo = $response.split("|");
					$("#" + div+ (i ? i : "")).parent().html(divnuovo[1]);
					if ( callback ) callback();
				 } },
			'error' : function () { alert("errore"); }
		});
	
	});
}

function movefromto(da,a,div,i, callback) {
		// ajax calls to re-order gallery items

		let data = $("#" + div+ (i ? i : "")).data('loadthumbgallery');

		$.ajax({	'type' : 'GET',
			'url' : '../frwvars/ajax.moveimg.php?da='+btoa(da)+'&a='+btoa(a)+"&div0="+btoa(div)+"&data="+ JSON.stringify(data),
			'success' : function( $response ) { 
				if ($response.indexOf("ok")==0) { 
					divnuovo = $response.split("|");
					$("#" + div+ (i ? i : "")).parent().html(divnuovo[1]);
					if ( callback ) callback();
				 } },
			'error' : function () { alert("errore"); }
		});
}

var g = null;

function setupViewerThumbGallery() {
    function viewClick(e){
		console.log( e );
        const index = jQuery(this).parents('.divthumbs').index(); // Finds the index of the parent element with class 'divthumbs'
		jQuery(this).parents(".thumbscontainer")[0]._viewer.view(index).show();
    }
    function preventClick(e){e.preventDefault();}
    
    // https://github.com/fengyuanchen/viewerjs
    jQuery('.thumbscontainer').each(function(){

        if (!jQuery(this)[0]._viewer) {

        } else {
            jQuery(this)[0]._viewer.destroy();
            jQuery(this).find('a.pic').off('click',preventClick);
            jQuery(this).find('a.pic').off('click',viewClick);
        }
        jQuery(this).find('a.pic').on('click',preventClick);

        jQuery(this)[0]._viewer = new Viewer(jQuery(this)[0], {
            movable: false,
            transition: false,
            navbar: false,
            toolbar: {
                zoomIn: 0,
                zoomOut: 0,
                oneToOne: 0,
                reset: 0,
                prev: 0,
                play: 0,
                next: 0,
                rotateLeft: 0,
                rotateRight: 0,
                flipHorizontal: 0,
                flipVertical: 0,
              },
          });
          jQuery(this).find('.icon-search').on('click',viewClick);

    });
}



// for checkbox confirmations message on delete
function confermaDelete(id) {
	if (gconfirm(_e("Do you confirm to delete the item?"),"document.location.href = 'index.php?op=elimina&id="+id+"'")) {}
}

function confermaDeleteCheckMsg(theForm,$msg) {
	if (theForm) {
		var c = 0;
		for (var i = 0; i < theForm.elements['gridcheck[]'].length; i++) {
			if (theForm.elements['gridcheck[]'][i].checked) c=1;
		}
		if (c==0) {
			if (theForm.elements['gridcheck[]'].length==undefined) {
				if (theForm.elements['gridcheck[]'].checked==false) {
					alert (_e("You don't have selected any item to delete."));
					return;
				}
			} else {
				alert ( _e("You don't have selected any item to delete."));
				return;
			}
		}
		if (theForm.name) {
			if (gconfirm($msg,"document.forms['"+theForm.name+"'].op.value='eliminaSelezionati';document.forms['"+theForm.name+"'].submit();",_e("YES"),_e("NO"))) {}
		} else {
			if (confirm($msg)) {
				theForm.op.value='eliminaSelezionati';theForm.submit();
			}
		}
	} else {
		alert(_e("You don't have selected any item to delete."));
	}
}

function confermaDeleteCheck(theForm) {
	confermaDeleteCheckMsg(theForm, _e("Do you confirm to delete the selected items?"));
}


/**
 * submit the form if checkForm is ok, checkForm is generared by
 * the class that handles forms.
 * prevent double submit with a class on the body
 * @returns {undefined}
 */
function saveAndLoad() {
	if(document.body.querySelector('.submitting')) return false;
	document.body.classList.add('submitting');
    var opEl = document.getElementById('op');
    if (opEl.value === 'modificaStep2') opEl.value = 'modificaStep2reload';
    if (opEl.value === 'aggiungiStep2') opEl.value = 'aggiungiStep2reload';
	checkForm();
	document.body.classList.remove('submitting');
}
/**
 * submit the form if checkForm is ok, checkForm is generared by
 * the class that handles forms.
 * prevent double submit with a class on the body
 * change the value of the op value to force reload of the page
 * @returns {undefined}
 */
function checkConStato() {
	if(document.querySelector('.submitting')) return false;
	document.body.classList.add('submitting');
    var opEl = document.getElementById('op');
    if (opEl.value === 'modificaStep2reload') opEl.value = 'modificaStep2';
    if (opEl.value === 'aggiungiStep2reload') opEl.value = 'aggiungiStep2';
	checkForm();
	if(document.querySelectorAll('form .error').length > 0) document.body.classList.remove('submitting');
}
function aggiornaGriglia(formname = "filtri", resetFields = {'keyword':''} ) {
	if ($('#'+formname).find("#combotiporeset").length == 0) {
		$('#'+formname).append('<input type="hidden" name="combotiporeset" id="combotiporeset" value="reset">');
	} else {
		$('#combotiporeset').val('reset'); // work like a reset
	}
	if (Object.keys(resetFields).length > 0) {
		for (var k in resetFields) {
			$('#'+formname).find("#"+k).val(resetFields[k]);
		}
	}
	document.getElementById( formname ).submit();
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function ajaxGrid (selector) {
	jQuery(selector).each(function(){
		var grid_id = $(this).attr('id');
		// console.log(grid_id);
		jQuery(this).find('a.ajax').on('click',function(e){
			jQuery('#' + grid_id).addClass("loading");
			e.preventDefault();
			var url = $(this).attr('href');
			jQuery('body').append('<div id="tempdati' + grid_id+ '" style="display:none;"></div>');
			// console.log('#tempdati' + grid_id);
			jQuery('#tempdati' + grid_id).load(url + ' #'+grid_id+'>div:first',function(){
				jQuery('#tempdati' + grid_id + ' tr').each(function(){
					var tr_id = jQuery(this).attr('id');
					var html = jQuery(this).html();
					jQuery('#'+grid_id+' #'+tr_id).html(html);
				});
				jQuery('#'+grid_id+' tr').each(function(){
					var tr_id = jQuery(this).attr('id');
					if(jQuery('#tempdati' + grid_id + ' #'+tr_id).length>0) {
						var html = jQuery('#tempdati' + grid_id + ' #'+tr_id).html();
						jQuery('#'+grid_id+' #'+tr_id).html(html);
					} else {
						$(this).remove();
					}
				});
				jQuery('#tempdati'+grid_id+' tr').each(function(){
					var tr_id = jQuery(this).attr('id');
					// console.log('#' + grid_id + ' #'+tr_id +" ----> " + jQuery('#'+grid_id+' #'+tr_id).length);
					if(jQuery('#' + grid_id + ' #'+tr_id).length>0) {
						// console.log('skip ' + tr_id);
					} else {
						// console.log('copy ' + '#tempdati' + grid_id + ' #'+tr_id);
						var html = jQuery('#tempdati' + grid_id + ' #'+tr_id).html();
						jQuery('#'+grid_id+' table tbody').append('<tr id="'+tr_id+'">'+html+'</tr>');
					}
				});				


				var controls = jQuery('#tempdati' + grid_id + ' .first').html();
				jQuery('#'+grid_id+' .first').html(controls);

				jQuery('#tempdati' + grid_id).remove()
				jQuery('#' + grid_id).removeClass("loading");;
				ajaxGrid('#'+grid_id);
				gridOddEven();
				ajaxCheckboxes();
				// checkAll();
			});
			
		});

	});
	return;
}
function checkAll(obj) {
			
	if(jQuery(obj).find('span').hasClass('icon-check-1')){
		jQuery(obj).find('span').removeClass('icon-check-1').addClass('icon-check-empty');
	} else {
		jQuery(obj).find('span').removeClass('icon-check-empty').addClass('icon-check-1');
	}

	field = jQuery(obj).parents('form').find('input[type=checkbox]');

	var v = !field[0].checked;
	if (field.length==undefined) field.checked = v;
	for (i = 0; i < field.length; i++) field[i].checked = v ;
	return false;
}
	//
	// grid odd/even classes
	function gridOddEven() {
        jQuery("table.griglia tbody tr").removeClass("odd").removeClass("even");
		jQuery("table.griglia tbody tr:nth-child(odd)").addClass("odd");
		jQuery("table.griglia tbody tr:nth-child(even)").addClass("even");
	}	
	//
	// control for checkboxes in grids to disable the delete button
	function ajaxCheckboxes() {
		if($('.checkall').length > 0) {
			$('.panel2 .elimina,.panel2 .toggable').addClass("disabled");
			$('.checkall,table.griglia td input[type=checkbox]').on("change click", function() {
				let q = 0;
				$('table.griglia td input[type=checkbox]').each(function(){
					if($(this).is(':checked')) q++;
				})
				if(q>0) $('.panel2 .elimina,.panel2 .toggable').removeClass("disabled");
					else $('.panel2 .elimina,.panel2 .toggable').addClass("disabled");
			});
		}
	}


/**
 * on document ready add smartBack action to all the
 * .titlecontainer > .annulla elements
 */
document.addEventListener("DOMContentLoaded", function() {
	const backButtons = document.querySelectorAll('.titlecontainer > .annulla');
	backButtons.forEach(function(button) {
		button.addEventListener('click', function(e) {
			smartBack(e, this);
		});
	});
});

/**
 * THis function solve the problem of going back to the previous page
 * when arriving in detail page from different components
 * usage: <a href="##gestore##" onclick="smartBack(event, this)" ....>
 * 
 * @param {event} e 
 * @param {element} obj 
 */
function smartBack(e, obj) {
	e.preventDefault();
	let action = function(){
		const ref = document.referrer;
		const sameOrigin = ref && new URL(ref).hostname === location.hostname;
		if (sameOrigin) {
			history.back();
		} else {
			window.location.href = obj.getAttribute('href'); // fallback
		}
	}
	if (isDirty) {
		if (gconfirm(_e('There are unsaved changes, do you want to exit this page?'),function(){
			action();
		})) {}
		return;
	}
	action();	
}

/**
 * insert a flag to know if the page has been modified and prevent losing data on back
 */
let isDirty = false;
document.addEventListener("DOMContentLoaded", function() {
	document.querySelectorAll('input, select, textarea').forEach(el => {
		// console.log(el);
		if(el.dataset.isdirty !== "disabled") {
			el.addEventListener('input',  () => isDirty = true);
			el.addEventListener('change', () => isDirty = true);
		}
	});
});


