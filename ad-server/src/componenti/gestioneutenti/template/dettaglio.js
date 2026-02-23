function checkConStato() {
	if(document.body.querySelector('.submitting')) return false;
	document.body.classList.add('submitting');
    checkForm();
	document.body.classList.remove('submitting');
}