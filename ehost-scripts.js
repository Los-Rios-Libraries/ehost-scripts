function getDOI(db, an, container, edsGW) { // get doi from api. This is better than getting it from page because many records do not show it on the page but the info is there in the API. 
	//     console.log('getDOI running');
	if (db !== '') {
		var doi = '';
		var URL = 'https://widgets.ebscohost.com/prod/encryptedkey/eds/eds.php?k=' + edsGW + '&s=0,1,1,0,0,0&q=';
		var query = 'retrieve?dbid=' + db + '&an=' + an;
		var retrieveURL = URL + encodeURIComponent(query);
		jQuery.getJSON(retrieveURL)
			.done(function(data) {
				//              console.log(data);
				var identifiers = data.Record.RecordInfo.BibRecord.BibEntity.Identifiers;
				if (identifiers) {
					jQuery.each(identifiers, function(i) {
						if (identifiers[i].Type === 'doi') {
							doi = identifiers[i].Value;
							//                      console.log(doi);
							getOADoi(doi, container);
						}
					});
				}
			})
			.fail(function(a, b, c) {
				console.log('eds api lookup failed, error: ' + c);
			});

	}
};

var getOADoi = function(doi, container) { // use oadoi api to look for free full text.
	if (doi !== '') {
		var email = 'karlsej@scc.losrios.edu'; // supposed to append this to query url to help them track usage
		var apiURL = 'https://api.unpaywall.org/v2/' + doi + '?email=' + email;
		jQuery.getJSON(apiURL).done(function(data) {
			var isOA = data.best_oa_location;
			//         console.log('oadoi url: ' + url);
			if (isOA !== null) {
				console.log('OA doi found');
				var url = isOA.url;
				appendOALink(url, container);
			}

		}).fail(function(a, b, c) {
			console.log('oadoi link error: '+ c);
		});
	}

};

var appendOALink = function(url, container) {
	//     console.log(container);
	var el;
	if (container.hasClass('display-info')) {
		el = jQuery('<div />');
	} else if (container.hasClass('format-control')) {
		el = jQuery('<li />');
	}
	//     console.log(el);
	el.css('border', 'none').addClass('custom-link-item').html('<span class="custom-link"><a target="_blank" href="' + url + '"><img class="icon-image" src="//www.library.losrios.edu/resources/link-icons/oa.png" alt="">View Full Text (open access)</a></span>').appendTo(container);
};

var getItemData = function(type, el) {
	var info;
	if (type === 'detail') {
		return {
			db: ep.clientData.currentRecord.Db,
			an: ep.clientData.currentRecord.Term
		};
	} else if (type === 'result') {
		info = el.find('em.preview-hover').data('hoverpreviewjson');
		if (info !== undefined) {
			return {
				db: info.db,
				an: info.term
			};
			//           console.log('Result ' + (i + 1) + ': db is ' + db + '  and AN is ' + an);

		} else {
			return {
				db: '',
				an: ''
			};
		}
	} else {
		return undefined;
	}
}
if (location.hostname.indexOf('losrios.edu') > -1) {
  document.cookie = 'oneSearchDomain=proxy;domain=.losrios.edu'; // set proxy cookie
}
var jQCheck = setInterval(function() {
	if (typeof(jQuery) !== 'function') {} else {
		clearInterval(jQCheck);
		var $ = jQuery;
		var pid = ep.clientData.pid.split('.');
		var custID = pid[0];
		var college = [{ // allow use of different API profiles for sake of stats
				'custID': 'amerriv',
				'abbr': 'arc',
				'edsGW': 'eyJjdCI6IllDeGlaa21JbEU2VlRmU1FIUmk3XC94Nk9ZNnN4RHRkXC9Hb2NKbXJ4OVo0bz0iLCJpdiI6IjZiZDA4YWI4N2IwYjgwOWIxMTI0ZmEwNDYzYWQxOGQ0IiwicyI6ImE4MGQ5MDk4ZjZmYjM5MjMifQ==&p=YW1lcnJpdi5tYWluLndzYXBp'
			},
			{
				'custID': 'ns015092',
				'abbr': 'flc',
				'edsGW': 'eyJjdCI6InVmNWlcL2tIU3BkNFJWXC9iaU9LTTlhSW1sUmtDR0lUbjBBWTczampFdjFsZz0iLCJpdiI6IjliMjBmMGNmODk5NjJiY2Q1ZTdiZTExMjVlN2QzMmZmIiwicyI6ImIwNzk5OWNiYTI1NTU1NmMifQ==&p=bnMwMTUwOTIubWFpbi53c2FwaQ=='
			},
			{
				'custID': 'cosum',
				'abbr': 'crc',
				'edsGW': 'eyJjdCI6IjNLNXdlQ0I2V09TWDdBUkYzT3cyaVE9PSIsIml2IjoiOTJkYzAwNzNhN2M4MWE1NDY1ZTg4ZjEzNTFmNjdiYjQiLCJzIjoiZThjNzZmYWE3NDc4ZTM2MiJ9&p=Y29zdW0ubWFpbi53c2FwaQ=='
			},
			{
				'custID': 'sacram',
				'abbr': 'scc',
				'edsGW': 'eyJjdCI6Im9GbVUzeldxZzg3ZzhXelNKYktRbmc9PSIsIml2IjoiYzg3NWRhOWRhOTQ5ZjkxMGIxZGFiOTAwZDJkZmJhYTUiLCJzIjoiZTAxZTQzYmZhOTViYjJlZSJ9&p=c2FjcmFtLm1haW4ud3NhcGk='
			}

		];
		var edsGW = '';
		var abbr;
		for (var i = 0; i < college.length; i++) { // set api profile
			if (college[i].custID === custID) {
				edsGW = college[i].edsGW;
				abbr = college[i].abbr;
			}
		}
		var setCookie = function(cname, cvalue, exdays, domain) {
			var expires; // set exdays to false for session-only cookie
			if (exdays !== false) {
				var d = new Date();
				d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
				expires = ' expires=' + d.toUTCString() + ';';
			} else {
				expires = '';
			}
			document.cookie = cname + '=' + cvalue + ';' + expires + ' path=/; domain = ' + domain;
		};
		var domain = 'ebscohost.com';
		if (location.hostname.indexOf('losrios.edu') > -1) {
			domain = 'losrios.edu';
		}
		setCookie('homeLibrary', abbr, 30, domain);
			
		//  var college = document.getElementById('collegeID');

		if (location.href.indexOf('/results?') > -1) {
			$('.result-list-record').each(function() { // initiate oadoi search
				var a = $(this);
				if (a.find('.pubtype-icon').attr('title') === 'Academic Journal') {
					var custLinks = a.find('.externalLinks');
					var linkText = custLinks.text();
					if (linkText.indexOf('Full Text') > -1) {} else {
						var info = getItemData('result', a);
						if (info) {
							// console.log(info.db);
							// console.log(info.an);
							getDOI(info.db, info.an, $(this).find('.display-info'), edsGW);
						}
					}
				}
			});
		} else if (location.href.indexOf('/detail/') > -1) {
			var info = getItemData('detail', null);
			var db = info.db;
			var an = info.an;
			var article = false;
			var pubType = $('dt:contains("Publication Type")');
			var docType = $('dt:contains("Document Type")');
			if (pubType.length) {
				if (pubType.next().text().indexOf('Journal') > -1) {
					article = true;
				}
			} else if ((docType).length) {
				if (docType.next().text().indexOf('Article') > -1) {
					article = true;
				}
			}
			if (article === true) {
				if (!($('.custom-link-item a:contains("Full Text")').length)) { // look for free full text via oadoi
					//      console.log('db: ' + db + ', an: ' + an);
					getDOI(db, an, $('.format-control:first-of-type'), edsGW);
				}
			}

		}
	}
}, 100);