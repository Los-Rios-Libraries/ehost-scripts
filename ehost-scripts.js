(function() {
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

var smallScreen = (function()
{
	if (document.documentElement.clientWidth < 1024)
	{
		return true;
	}
	else
	{
		return false;
	}
}());
// show note when there are problems
var showNote = (function(fileName) {
	if (document.cookie.indexOf(fileName + '=hide') === -1) {
		var url = 'https://www.library.losrios.edu/resources/ehost-scripts/' + fileName + '.php'; // this file needs to be edited with current message
		$.get(url)
		.done(function(response) {
			if (response !== '') {
				$('<p id="problem-note" style="display:none;">' + response + '<button id="problem-note-dismiss" class="button" type="button">Hide this message</button></p>').prependTo('#header').slideDown('slow');
				$('#problem-note-dismiss').on('click', function() {
					$(this).parent().slideUp();
					var domain = (function() {
						var arr = location.host.split('.');
						var result = arr.slice(arr.length -2);
						return result.join('.');
						}());
					setCookie(fileName, 'hide', false, domain);
					});
				}
				})
		.fail(function(a, b, c) {
			console.log('problem note error: ' + c);
		});
		}
});
var jQCheck = setInterval(function() {
	if (typeof(jQuery) === 'function')  {
		clearInterval(jQCheck);
		var $ = jQuery;
		var pid = ep.clientData.pid.split('.');
		var custID = pid[0];
		var college = [{ // allow use of different API profiles for sake of stats
				'colName': 'American River College',
				'custID': 'amerriv',
				'abbr': 'arc',
				'homepage': 'http://www.arc.losriso.edu/arclibrary/',
			},
			{
				'colName': 'Folsom Lake College',
				'custID': 'ns015092',
				'abbr': 'flc',
				'homepage': 'https://www.flc.losrios.edu/libraries/',
			},
			{
				'colName': 'Cosumnes River College',
				'custID': 'cosum',
				'abbr': 'crc',
				'homepage': 'https://www.crc.losrios.edu/services/library/',
			},
			{
				'colName': 'Sacramento City College',
				'custID': 'sacram',
				'abbr': 'scc',
				'homepage': 'https://www.scc.losrios.edu/library/',
			}

		];
		var edsGW = '';
		var abbr;
		var currentCol;
		for (var i = 0; i < college.length; i++) { // set api profile
			if (college[i].custID === custID) {
				edsGW = college[i].edsGW;
				abbr = college[i].abbr;
				currentCol = college[i];
			}
		}
		var domain = 'ebscohost.com';
		if (location.hostname.indexOf('losrios.edu') > -1) {
			setCookie('onesearchDomain', 'proxy', false, 'losrios.edu');
			domain = 'losrios.edu';
		}
		setCookie('homeLibrary', abbr, 30, domain);
			
		//  var college = document.getElementById('collegeID');

		if (location.href.indexOf('/detail/') > -1) {
			(function()
			{
				// permalinks on detailed record pages
				$('.citation-title').after(
					'<dt>Permalink:</dt><dd id="lr-permalink-dd"><input id="lr-input-permalink" type="text" value="' + ep.clientData.plink + '"> <button id="lr-copy-permalink" type="button" class="button ">&#128279; Copy URL</button></dd>'

				);

				var input = $('#lr-input-permalink');
				input.on('click', function()
				{
					this.select();
				});
				if (typeof(document.execCommand) === 'function')
				{ // make sure browser is able to copy to clipboard

					$('#lr-copy-permalink').show().on('click', function()
					{

						input.select();
						document.execCommand('Copy');
						input.blur();
						if (!($('#lr-permalink-copied').length))
						{
							$('body').append('<div id="lr-permalink-copied" >Link copied to clipboard</div>');
						}
						var permCopied = $('#lr-permalink-copied');
						permCopied.dialog(
						{
							create: function()
							{
								permCopied.parent().attr('id', 'lr-permalink-dialog');
							},
							position:
							{
								my: 'right bottom',
								at: 'right top',
								of: $('#lr-copy-permalink')
							},
							minHeight: 20,
							hide:
							{
								effect: 'fadeOut'
							},
							show:
							{
								effect: 'fadeIn'
							},
							open: function()
							{
								setTimeout(function()
								{
									permCopied.dialog('close');

								}, 5000);

							}

						});

					});
				}



			}());

		}
		if (smallScreen)
		{
			$('#footerLinks').prepend('<li><a href="' + currentCol.homepage + '">' + currentCol.colName + ' Library</a></li>');

		}
			
		var ebDbs = [
			{
				abb: 'a9h',
				name: 'Academic Search Complete'
			},
			{
				abb: 'l0h',
				name: 'America: History and Life with Full Text'
			},
			{
				abb: 'bth',
				name: 'Business Source Complete'
			},
			{
				abb: 'rzh',
				name: 'CINAHL Plus with Full Text'
			},
			{
				abb: 'ufh',
				name: 'Communication & Mass Media Complete'
			},
			{
				abb: 'i3h',
				name: 'Criminal Justice Abstracts with Full Text'
			},
			{
				abb: 'e000xna',
				name: 'eBook Academic Collection'
			},
			{
				abb: 'nlebk',
				name: 'eBook Collection'
			},
			{
				abb: 'ehh',
				name: 'Education Research Complete'
			},
			{
				abb: 'eoah',
				name: 'E-Journals'
			},
			{
				abb: 'eih',
				name: 'Environment Complete'
			},
			{
				abb: 'eric',
				name: 'ERIC'
			},
			{
				abb: 'funk',
				name: 'Funk & Wagnalls New World Encyclopedia'
			},
			{
				abb: '8gh',
				name: 'GreenFILE'
			},
			{
				abb: 'hxh',
				name: 'Health Source - Consumer Edition'
			},
			{
				abb: 'hch',
				name: 'Health Source: Nursing/Academic Edition'
			},
			{
				abb: 'ibh',
				name: 'International Bibliography of Theatre & Dance with Full Text'
			},
			{
				abb: 'lxh',
				name: 'Library, Information Science & Technology Abstracts'
			},
			{
				abb: 'lkh',
				name: 'Literary Reference Center Plus'
			},
			{
				abb: 'ulh',
				name: 'MAS Ultra - School Edition'
			},
			{
				abb: 'f6h',
				name: 'MasterFILE Complete'
			},
			{
				abb: 'cmedm',
				name: 'MEDLINE'
			},
			{
				abb: 'mth',
				name: 'Military & Government Collection'
			},
			{
				abb: 'n5h',
				name: 'Newspaper Source Plus'
			},
			{
				abb: 'ddu',
				name: 'OpenDissertations'
			},
			{
				abb: 'poh',
				name: 'Political Science Complete'
			},
			{
				abb: 'prh',
				name: 'Primary Search'
			},
			{
				abb: 'pdh',
				name: 'Psychology and Behavioral Sciences Collection'
			},
			{
				abb: 'bwh',
				name: 'Regional Business News'
			},
			{
				abb: 'b9h',
				name: 'Small Business Reference Center'
			},
			{
				abb: 'sih',
				name: 'SocINDEX with Full Text'
			},
			{
				abb: 'trh',
				name: 'Teacher Reference Center'
			}



		];
		var currentDbName = (function()
		{
			if (ep.clientData.currentRecord)
			{
				var db = ep.clientData.currentRecord.Db;
				var dbName = '';
				for (var i = 0; i < ebDbs.length; i++)
				{
					if (ebDbs[i].abb === db)
					{
						dbName = ebDbs[i].name;
						break;
					}
				}
				return dbName;
			}


		}());

		// include content in subject line for emails
		var loadSubj = function(selector)
		{
			var title = $('h1').html();
			var arr = title.split(' ');
			var end = '';
			var limit = 8; // max number of words before subject line gets truncated
			if (arr.length > limit)
			{
				end = '...';
				arr = arr.slice(0, limit + 1);
			}
			var db = '';
			if (currentDbName !== '')
			{
				db = ' - ' + currentDbName;
			}
			var emailSubj = arr.join(' ') + end + db;
			var wait = setInterval(function()
			{
				if ($(selector).length)
				{
					clearInterval(wait);
					$(selector).val(emailSubj);
				}


			}, 100);
		};

		$('.email-link').on('click', function()
		{
			loadSubj('#DeliveryEmailSubject');
		});
		showNote('note');

		
		
	}



}, 100);
}());