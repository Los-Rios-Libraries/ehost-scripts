jQuery(document).ready(function($) {
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
	$('head').append('<meta name=viewport content="width=device-width, initial-scale=1">');

	var a = $('.ftf-results .error');
	if (a.length)
	{
		if (a.text().indexOf('No results') > -1)
		{
			var college = getCookie('homeLibrary');
			if (college !== '')
			{
				college = college.toUpperCase() + ': ';
			}
			var citation = $('#header').text().trim();
			if (/\w/.test(citation) === true)
			{ // only send event if a citation is present
				ga('send', 'event', 'full text finder', 'resource not found', college + citation);
			}
		}

	}
	else
	{
		$('a').removeAttr('target'); // have articles open in same window; usually this page is arrived at as a new window
		var cookieID = 'lrFTF_' + encodeURIComponent($('.page-title').text().slice(0,20)); // need to set a unique id -- no accession number on page so use first bit of title
		if (getCookie(cookieID) !== '1') // if user hits back button, the following will not happen.
		{

			// send user on to first link if it is a full-text link - set cookie to allow back button to be used in case of error
			var firstLink = $('a[data-auto="menu-link"]:first'); // get first link
			if (firstLink.closest('.basic-list').prev().text().indexOf('Full Text') > -1) // our links are in categories--makes sure this is under the correct label
			{
				var destination = firstLink.attr('href');
				document.cookie = cookieID + '=1'; // set session-only cookie to allow back button to function
				firstLink.parent().append('<span style="display:none;" class="redirecting" role="alert">Redirecting... <img id="loader" alt="loading" src="//www.library.losrios.edu/resources/databases/loader.gif"></span>');
				$('.redirecting').fadeIn('slow');
				var url = location.protocol + '//' + location.hostname + destination; // href attribute includes relative path so need to construct full URL
				var fallBack = setTimeout(function() { // if for some reason image never loads
					location.href = url;
				}, 3000);
				$('#loader').on('load', function() { // appears to be the only way to get loader gif to show
					clearTimeout(fallBack);
					location.href = url;
				});
				
				
			}
		}
	}
	
	
});