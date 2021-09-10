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
				'homepage': 'https://arc.losrios.edu/student-resources/library',
				'libchatHash' : 'd05703ccd4c26fdae51ae0d0f5df25e1',
				'libchatImage': 'https://libapps.s3.amazonaws.com/customers/932/images/Chat_wLibrarian__002_.png',
			},
			{
				'colName': 'Folsom Lake College',
				'custID': 'ns015092',
				'abbr': 'flc',
				'homepage': 'https://flc.losrios.edu/student-resources/library',
				'libchatHash': '7470fe5975ab434abfdbef6de53f6206',
				'libchatImage': 'https://flc.losrios.edu/flc/main/img/Body-Office-UniversalDetail-940x529/Library/Graphics/ask-librarian.svg'
			},
			{
				'colName': 'Cosumnes River College',
				'custID': 'cosum',
				'abbr': 'crc',
				'homepage': 'https://crc.losrios.edu/student-resources/library',
				'libchatHash': '46725c6c901e366cccd1c3598f4ece18',
				'libchatImage': ''
			},
			{
				'colName': 'Sacramento City College',
				'custID': 'sacram',
				'abbr': 'scc',
				'homepage': 'https://scc.losrios.edu/library/',
				'libchatHash': '3ed10430124d950ef2b216a68e1b18ba',
				'libchatImage': 'https://libapps.s3.amazonaws.com/accounts/816/images/ask-a-librarian.png" alt="Ask a Librarian'
			}

		];
		var abbr;
		var currentCol;
		var libchatHash;
		var libchatImage = '';
		for (var i = 0; i < college.length; i++) { // set api profile
			if (college[i].custID === custID) {
				abbr = college[i].abbr;
				currentCol = college[i];
				libchatHash = college[i].libchatHash;
				libchatImage = college[i].libchatImage;
			}
		}
		var domain = 'ebscohost.com';
		if (location.hostname.indexOf('losrios.edu') > -1) {
			setCookie('onesearchDomain', 'proxy', false, 'losrios.edu');
			domain = 'losrios.edu';
		}
		setCookie('homeLibrary', abbr, 30, domain);
		var proxy = 'https://ezproxy.losrios.edu/login?url=';
		var homePage = proxy + 'search.ebscohost.com/login.aspx?authtype=cookie,ip,uid&profile=' + ep.interfaceId + '&defaultdb=' + ep.clientData.db[0];
		var permalink = '';
		var pageType = '';
		if (location.href.indexOf('/basic') > -1) {
			permalink = homePage;
			pageType = 'basic';
		} else if (location.href.indexOf('/results') > -1) {
			// issue with ebooks profile
			if (ep.cliendData.pid.indexOf('.ebooks') > -1) {
				permalink = $('#pLink').val() + '&profile=ebooks';
			} else {
				permalink = $('#pLink').val();
			}
			pageType = 'result';
		} else if (location.href.indexOf('/detail/') > -1) {
			permalink = ep.clientData.plink;
			pageType = 'detailedRecord';
		} else if (location.href.indexOf('/advanced') > -1) {
			permalink = homePage;
			pageType = 'advanced';
		}
			
		//  var college = document.getElementById('collegeID');
		if (pageType === 'detailedRecord') {
			
			(function()
			{
				// permalinks on detailed record pages
				$('.citation-title').after(
					'<dt>Permalink:</dt><dd id="lr-permalink-dd"><input id="lr-input-permalink" type="text" value="' + permalink + '"> <button id="lr-copy-permalink" type="button" class="button ">&#128279; Copy URL</button></dd>'

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
				abb: 'lxh',
				name: 'Library, Information Science & Technology Abstracts'
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
		(function() { // load libchat
			var div = document.createElement('div');
			div.id = 'libchat_' + libchatHash;
			document.getElementsByTagName('body')[0].appendChild(div);
			if (abbr === 'crc') {
				var scr = document.createElement('script');
				scr.src = 'https://v2.libanswers.com/load_chat.php?hash=' + libchatHash;
				setTimeout(function() {
					document.getElementsByTagName('body')[0].appendChild(scr);
					$('#content').append(div);
				}, 2000);
			}
			else {
				var chatWinWidth = 300;
				var chatWinHeight = 340;
				var chatUrl = 'https://answers.library.losrios.edu/chat/widget/' + libchatHash + '?referer=' + encodeURIComponent(permalink);
				$(div).append('<a id="libchat-popup" href="' + chatUrl +'"><img style="height:100px;" class="libchat_btn_img"  src="' + libchatImage +'" alt="Ask a Librarian"></a>');
				$('#libchat-popup').on('click', function(e) {
					e.preventDefault();
					window.open(chatUrl, 'libchat', 'height=340,width=300,menubar=no,statusbar=no,left=' + ($(window).width() - chatWinWidth - 20)+',top='+ ($(window).height() - chatWinHeight - 150));
				});
			}
			
		}());		
	}

}, 100);
	
}());