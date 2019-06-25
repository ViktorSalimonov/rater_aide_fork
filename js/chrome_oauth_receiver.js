window.addEventListener('load',function() {
	var pageUrl = window.location.href;
	window.location.hash = '';
	chrome.runtime.sendMessage({method:'got-dropbox-auth-url',pageUrl:pageUrl});
});
