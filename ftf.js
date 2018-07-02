(function() {
	var getCookie = function(cname) {
		var name = cname + "=";
		var ca = document.cookie.split(';');
		for (var i = 0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') c = c.substring(1);
			if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
		}
		return "";
	};
	var waitForJQ = function(cb) {
		var retrieveJQ = setTimeout(function() { // if after 6 seconds jQuery has not been loaded, load it from remote source
			if (typeof(jQuery) === 'undefined') {
				var a = document.createElement('script');
				a.src = '//ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js';
				a.async = false;
				document.getElementsByTagName('head')[0].appendChild(a);
			}
		}, 6000);
		var jqCall = setInterval(function() { // ebsco warns that jquery may not be loaded initially
			if (typeof(jQuery) === 'function') {
				console.log('jquery found');
				clearTimeout(retrieveJQ);
				clearInterval(jqCall);
				console.log('timeout cleared');
				cb(jQuery);
			} else {
				console.log('no jQuery!');
			}
		}, 50);
	};

	waitForJQ(function($) {
		var a = $('.ftf-results .error');
		if (a.length) {
			if (a.text().indexOf('No results') > -1) {
				var college = getCookie('homeLibrary');
				if (college !== '') {
					college = college.toUpperCase() + ': ';
				}
				var citation = $('#header').text().trim();
				if (/\w/.test(citation) === true) { // only send event if a citation is present
					ga('send', 'event', 'full text finder', 'resource not found', college + citation);
				}
			}

		}
		else {
			if (getCookie('lrFTF') !== '1') {
					// send user on to first link if it is a full-text link - set cookie to allow back button to be used in case of error
			var firstLink = $('a[data-auto="menu-link"]:first');
			if (firstLink.closest('div').prev().text().indexOf('Full Text') > -1) {
				document.cookie = 'lrFTF=1';
				var url = location.protocol + '//' + location.hostname + firstLink.attr('href');
				location.href = url;
			}
				
			}
		
		}

	});

}());