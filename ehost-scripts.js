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
				colName: 'American River College',
				custID: 'amerriv',
				abbr: 'arc',
				homepage : 'https://arc.losrios.edu/student-resources/library',
				libchatHash : 'd05703ccd4c26fdae51ae0d0f5df25e1',
				libchatImage: 'https://libapps.s3.amazonaws.com/customers/932/images/Chat_wLibrarian__002_.png',
				imgHeight: '100px'
			},
			{
				colName: 'Folsom Lake College',
				custID: 'ns015092',
				abbr: 'flc',
				homepage: 'https://flc.losrios.edu/student-resources/library',
				libchatHash: '7470fe5975ab434abfdbef6de53f6206',
				libchatImage: 'https://flc.losrios.edu/flc/main/img/Body-Office-UniversalDetail-940x529/Library/Graphics/ask-librarian.svg',
				imgHeight: '75px'
			},
			{
				colName: 'Cosumnes River College',
				custID: 'cosum',
				abbr: 'crc',
				homepage: 'https://crc.losrios.edu/student-resources/library',
				libchatHash: '46725c6c901e366cccd1c3598f4ece18',
				libchatImage: 'https://libapps.s3.amazonaws.com/accounts/109656/images/ask-a-librarian_orangebubble-paths.png',
				imgHeight: '75px'
			},
			{
				colName: 'Sacramento City College',
				custID: 'sacram',
				abbr: 'scc',
				homepage: 'https://scc.losrios.edu/library/',
				libchatHash: '3ed10430124d950ef2b216a68e1b18ba',
				libchatImage: 'https://libapps.s3.amazonaws.com/accounts/816/images/ask-a-librarian.png" alt="Ask a Librarian',
				imgHeight: '80px'
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
				imgHeight = college[i].imgHeight;
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
			if (ep.clientData.pid.indexOf('.ebooks') > -1) {
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

			}, 100);
		};

		$('.email-link').on('click', function()
		{
			loadSubj('#DeliveryEmailSubject');
		});
		// add problem report button
		if ($('.format-control').length) {
			$('#Column1Content').append('<button class="button" type="button" id="lr-problem-reporter">Report a problem</button>');
			$('#lr-problem-reporter').on('click', function() {
				var w = 600;
				var h = 600;
				var left = (screen.width - w) / 2;
				var top = (screen.height - h) / 4;
				var refUrl = ep.clientData.plink || '';
				var itemID = ep.clientData.currentRecord.Term || '';
				window.open('https://library.losrios.edu/utilities/problem-reporter/?url=' + encodeURIComponent(refUrl) + '&recordid=' + itemID + '&college=' + currentCol.abbr + '&source=ebsco', 'Problem reporter', 'toolbar=no, location=no, menubar=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);


			});
		}
		
		showNote('note');
		(function() { // load libchat
			var div = document.createElement('div');
			div.id = 'libchat_' + libchatHash;
			document.getElementsByTagName('body')[0].appendChild(div);
			var chatWinWidth = 300;
			var chatWinHeight = 340;
			var chatUrl = 'https://answers.library.losrios.edu/chat/widget/' + libchatHash + '?referer=' + encodeURIComponent(permalink);
			$(div).append('<a id="libchat-popup" href="' + chatUrl + '"><img style="height:' + imgHeight + ';" class="libchat_btn_img"  src="' + libchatImage + '" alt="Ask a Librarian"></a>');
			$('#libchat-popup').on('click', function(e) {
				e.preventDefault();
				window.open(chatUrl, 'libchat', 'height=340,width=300,menubar=no,statusbar=no,left=' + ($(window).width() - chatWinWidth - 20) + ',top=' + ($(window).height() - chatWinHeight - 150));
			});
		}());		
	}
}, 100);
	
}());