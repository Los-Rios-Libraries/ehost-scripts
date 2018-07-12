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
	var cookieID = 'lrFTF_' + encodeURIComponent($('.page-title').text().slice(0,20)); // need to set a unique id -- no accession number on page so use first bit of title
	$('head').append('<meta name=viewport content="width=device-width, initial-scale=1">');
	var getAllUrlParams = (function(url)
	{ // reference: https://www.sitepoint.com/get-url-parameters-with-javascript/

		// get query string from url (optional) or window
		var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

		// we'll store the parameters here
		var obj = {};

		// if query string exists
		if (queryString)
		{

			// stuff after # is not part of query string, so get rid of it
			queryString = queryString.split('#')[0];

			// split our query string into its component parts
			var arr = queryString.split('&');

			for (var i = 0; i < arr.length; i++)
			{
				// separate the keys and the values
				var a = arr[i].split('=');

				// in case params look like: list[]=thing1&list[]=thing2
				var paramNum = undefined;
				var paramName = a[0].replace(/\[\d*\]/, function(v)
				{
					paramNum = v.slice(1, -1);
					return '';
				});

				// set parameter value (use 'true' if empty)
				var paramValue = typeof(a[1]) === 'undefined' ? 'true' : a[1];

				// (optional) keep case consistent
				//    paramName = paramName.toLowerCase();
				//    paramValue = paramValue.toLowerCase();

				// if parameter name already exists
				if (obj[paramName])
				{
					// convert value to array (if still string)
					if (typeof obj[paramName] === 'string')
					{
						obj[paramName] = [obj[paramName]];
					}
					// if no array index number specified...
					if (typeof paramNum === 'undefined')
					{
						// put the value on the end of the array
						obj[paramName].push(paramValue);
					}
					// if array index number specified...
					else
					{
						// put the value at that index number
						obj[paramName][paramNum] = paramValue;
					}
				}
				// if param name doesn't exist yet, set it
				else
				{
					obj[paramName] = paramValue;
				}
			}
		}

		return obj;
	}(location.href));
	var oaDOI = function(cb)
	{
		var doiParam = getAllUrlParams.id; // EBSCO puts doi in "id" parameter, url encoded
		if (doiParam)
		{
			if (/^DOI/.test(doiParam)) // seems to eb sent in form id=DOI:[then the doi]
			{
				var arr = decodeURIComponent(doiParam).split(':');
				if (arr.length === 2)
				{
					if (arr[1] !== '') // if doi is absent, EBSCO generally sends empty parameter to ftf
					{

						var email = 'karlsej@scc.losrios.edu'; // supposed to append this to query url to help them track usage
						var apiURL = 'https://api.unpaywall.org/v2/' + arr[1] + '?email=' + email;
						$.getJSON(apiURL).done(function(data)
						{
							//         console.log('oadoi url: ' + url);
							if (data.best_oa_location !== null)
							{
								console.log('OA doi found');
								var oaURL = data.best_oa_location.url;
								var oaMarkup = '<li id="oa-item"><a class="oadoi-link" href="' + oaURL + '"><img alt="open-access article" src="//www.library.losrios.edu/resources/link-icons/oa.png"><span>Access this full-text article</span></a></li>';
								cb(oaMarkup, oaURL);
							}
							else {
								cb(null);
							}

						}).fail(function(a, b, c)
						{
							ga('send', 'event', 'oadoi check', 'error', c);
						}).always(function() {
							ga('send', 'event', 'oadoi', 'call');
						});

					}

				}

			}
		}

	};
	var redirect = function(obj)
	{

		document.cookie = cookieID + '=1'; // set session-only cookie to allow back button to function
		obj.el.append('<span style="display:none;" class="redirecting" role="alert">Redirecting... <img id="loader" alt="loading" src="//www.library.losrios.edu/resources/databases/loader.gif"></span>');
		$('.redirecting').fadeIn('slow');
		var fallBack = setTimeout(function()
		{ // if for some reason image never loads
			location.href = obj.url;
		}, 3000);
		$('#loader').on('load', function()
		{ // appears to be the only way to get loader gif to show
			clearTimeout(fallBack);
			location.href = obj.url;
		});
	};
	var fullTextStr = 'Full Text'; // used in label denoting direct full-text links rather than "browse journal" links - needs to be matched to EBSCOadmin setting
			
	var a = $('.ftf-results .error');
	if (a.length)
	{ // this is when EBSCO shows no results at all
		if (a.text().indexOf('No results') > -1)
		{
			oaDOI(function(markup, oaUrl)
			{
				if (markup !== null)
				{
					a.remove(); // remove the "no results" message, replace it with the link
					$('.ftf-results').append('<div><h4 class="h4">Full Text Content Links</h4><ul class="basic-list">' + markup + '</ul></div>');
					if (getCookie(cookieID) !== '1')
					{
						redirect(
						{
							url: oaUrl,
							el: $('#oa-item')
						});
					}

				}
				else
				{ // if there's really no result, log to Google Analytics. Maybe not necessary to do this, reevaluate later
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

			});


		}

	}
	else
	{
		$('a').removeAttr('target'); // have articles open in same window; usually this page is arrived at as a new window


		// send user on to first link if it is a full-text link - set cookie to allow back button to be used in case of error
		var firstLink = $('a[data-auto="menu-link"]:first'); // get first link
		if (firstLink.closest('.basic-list').prev().text().indexOf(fullTextStr) > -1) // our links are in categories--makes sure this is under the correct label
		{
			if (getCookie(cookieID) !== '1') // if user hits back button, the following will not happen.
			{
				redirect(
				{
					url: location.protocol + '//' + location.hostname + firstLink.attr('href'),
					el: firstLink.parent()
				});




			}
		}
		else
		{ // if only publication-level links appear, check for oadoi
			oaDOI(function(markup, oaUrl)
			{
				if (markup !== null)
				{
					$('.h3').after('<div><h4 class="h4">Full Text Content Links</h4><ul class="basic-list">' + markup + '</ul></div>');
					if (getCookie(cookieID) !== '1')
					{
						redirect(
						{
							url: oaUrl,
							el: $('#oa-item')
						});
					}

				}
			});


		}
	}	
});