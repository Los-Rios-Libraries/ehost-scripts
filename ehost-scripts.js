(() => {
	const setCookie = (cname, cvalue, exdays, domain) => {
		let expires; // set exdays to false for session-only cookie
		if (exdays !== false) {
			const d = new Date();
			d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
			expires = ' expires=' + d.toUTCString() + ';';
			} else {
				expires = '';
			}
		document.cookie = `${cname}=${cvalue};${expires} path=/; domain = ${domain}`;
	};

const smallScreen = (() =>
{
	if (document.documentElement.clientWidth < 1024)
	{
		return true;
	}
	else
	{
		return false;
	}
})();
// show note when there are problems
const showNote = (fileName) => {
	if (document.cookie.indexOf(`${fileName}=hide`) === -1) {
		const url = `https://library.losrios.edu/resources/ehost-scripts/${fileName}.php`; // this file needs to be edited with current message
		$.get(url)
		.done(function(response) {
			if (response !== '') {
				$(`<p id="problem-note" style="display:none;">${response}<button id="problem-note-dismiss" class="button" type="button">Hide this message</button></p>`).prependTo('#header').slideDown('slow');
				const domain = (() => {
					const arr = location.host.split('.');
					const result = arr.slice(arr.length -2);
					return result.join('.');
					})();
				$('#problem-note-dismiss').on('click', function() {
					$(this).parent().slideUp();
					setCookie(fileName, 'hide', false, domain);
					});
				}
				})
		.fail(function(a, b, c) {
			console.log('problem note error: ' + c);
		});
		}
};
const jQCheck = setInterval(() => {
	if (typeof(jQuery) === 'function')  {
		clearInterval(jQCheck);
		const $ = jQuery;
		const pid = ep.clientData.pid.split('.');
		const custID = pid[0];
		const colleges = [{ // allow use of different API profiles for sake of stats
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
		let abbr;
		let currentCol;
		let libchatHash;
		let libchatImage = '';
		for (let col of colleges) { // set api profile
			if (col.custID === custID) {
				abbr = col.abbr;
				currentCol = col;
				libchatHash = col.libchatHash;
				libchatImage = col.libchatImage;
				imgHeight = col.imgHeight;
			}
		}
		let domain = 'ebscohost.com';
		if (location.hostname.indexOf('losrios.edu') > -1) {
			setCookie('onesearchDomain', 'proxy', false, 'losrios.edu');
			domain = 'losrios.edu';
		}
		setCookie('homeLibrary', abbr, 30, domain);
		const proxy = `https://${abbr}losrios.idm.oclc.org/login?url=`;
		const homePage = `${proxy}https://search.ebscohost.com/login.aspx?authtype=cookie,ip,uid&profile=${ep.interfaceId}&defaultdb=${ep.clientData.db[0]}`;
		let permalink = '';
		let pageType = '';
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
		} else if (location.href.indexOf('ehost/detail') > -1) {
			permalink = ep.clientData.plink;
			pageType = 'detailedRecord';
		} else if (location.href.indexOf('/advanced') > -1) {
			permalink = homePage;
			pageType = 'advanced';
		}
			
		//  var college = document.getElementById('collegeID');
		if (pageType === 'detailedRecord') {
			
			(() =>
			{
				// permalinks on detailed record pages
				$('.citation-title').after(
					`<dt>Permalink:</dt><dd id="lr-permalink-dd"><input id="lr-input-permalink" type="text" value="${permalink}"> <button id="lr-copy-permalink" type="button" class="button ">&#128279; Copy URL</button></dd>`

				);

				const input = document.getElementById('lr-input-permalink');
				if (input) {
					$(input).on('click', function()
						{
							this.select();
					});
					$('#lr-copy-permalink').show().on('click', function()
					{

						input.select();
						input.setSelectionRange(0, 99999); // For mobile devices
						// Copy the text inside the text field
						navigator.clipboard.writeText(input.value);

						input.blur();
						if (!($('#lr-permalink-copied').length))
						{
							$('body').append('<div id="lr-permalink-copied" >Link copied to clipboard</div>');
						}
						const permCopied = $('#lr-permalink-copied');
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
				
			})();

		}
		if (smallScreen)
		{
			$('#footerLinks').prepend(`<li><a href="${currentCol.homepage}">${currentCol.colName} Library</a></li>`);

		}
		// add link to new UI
		if (pageType === 'basic') {
			const startPageSearch = $('#findFieldOuter');
			if (startPageSearch.length) {
				const previewDiv = $(
					'<div style="width:80%;"><p style="float:right;"><a class="button" style="font-size:90%;" href="' + proxy + 'https://research.ebsco.com/">Preview the new EBSCOhost</a></p></div>'
				);
				startPageSearch.append(previewDiv);
			}
		}
		

		
		// add problem report button
		if ($('.format-control').length) {
			$('#Column1Content').append('<button class="button" type="button" id="lr-problem-reporter">Report a problem</button>');
			$('#lr-problem-reporter').on('click', function() {
				const w = 600;
				const h = 600;
				const left = (screen.width - w) / 2;
				const top = (screen.height - h) / 4;
				const refUrl = ep.clientData.plink || '';
				const itemID = ep.clientData.currentRecord.Term || '';
				window.open(`https://library.losrios.edu/utilities/problem-reporter/?url=${encodeURIComponent(refUrl)}&recordid=${itemID}&college=${currentCol.abbr}&source=ebsco`, 'Problem reporter', 'toolbar=no, location=no, menubar=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);


			});
		}
		
		showNote('note');
		(() => { // load libchat
			const div = document.createElement('div');
			div.id = 'libchat_' + libchatHash;
			document.getElementsByTagName('body')[0].appendChild(div);
			const chatWinWidth = 300;
			const chatWinHeight = 340;
			const chatUrl = `https://answers.library.losrios.edu/chat/widget/${libchatHash}?referer=${encodeURIComponent(permalink)}`;
			$(div).append(`<a id="libchat-popup" href="${chatUrl}"><img style="height:${imgHeight};" class="libchat_btn_img"  src="${libchatImage}" alt="Ask a Librarian"></a>`);
			$('#libchat-popup').on('click', function(e) {
				e.preventDefault();
				window.open(chatUrl, 'libchat', 'height=340,width=300,menubar=no,statusbar=no,left=' + ($(window).width() - chatWinWidth - 20) + ',top=' + ($(window).height() - chatWinHeight - 150));
			});
		})();		
	}
}, 100);
	
})();