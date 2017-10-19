function getDOI(db, an, container, edsGW)
{ // get doi from api. This is better than getting it from page because many records do not show it on the page but the info is there in the API. 
  //     console.log('getDOI running');
  var doi = '';
  if (edsGW !== '')
  {
    console.log(edsGW);
    var URL = 'https://widgets.ebscohost.com/prod/encryptedkey/eds/eds.php?k=' + edsGW + '&s=0,1,1,0,0,0&q=';
    var query = 'retrieve?dbid=' + db + '&an=' + an;
    var retrieveURL = URL + encodeURIComponent(query);
    jQuery.getJSON(retrieveURL).done(function (data)
    {
      //              console.log(data);
      var identifiers = data.Record.RecordInfo.BibRecord.BibEntity.Identifiers;
      if (identifiers)
      {
        jQuery.each(identifiers, function (i)
        {
          if (identifiers[i].Type === 'doi')
          {
            doi = identifiers[i].Value;
            //                      console.log(doi);
            getOADoi(doi, container);
          }
        });
      }
    }).fail(function (a, b, c)
    {
      console.log('eds api lookup failed, error: ' + c);
    });
  }
}

function getOADoi(doi, container)
{ // use oadoi api to look for free full text.
  if (doi !== '')
  {
    var apiURL = 'https://api.oadoi.org/' + doi;
    jQuery.getJSON(apiURL).done(function (data)
    {
      var url = data.results[0].free_fulltext_url;
      //         console.log('oadoi url: ' + url);
      if (url !== null)
      {
        console.log('OA doi found');
        appendOALink(url, container);
      }
    }).fail(function (a, b, c)
    {
      console.log('error: ', c);
    });
  }
}

function appendOALink(url, container)
{
  //     console.log(container);
  var el;
  if (container.hasClass('display-info'))
  {
    el = jQuery('<div />');
  }
  else if (container.hasClass('format-control'))
  {
    el = jQuery('<li />');
  }
  //     console.log(el);
  el.css('border', 'none').addClass('custom-link-item').html('<span class="custom-link"><a target="_blank" href="' + url + '"><img class="icon-image" src="//www.library.losrios.edu/resources/link-icons/oa.png" alt="">View Full Text (open access)</a></span>').appendTo(container);
}

function getItemData(type, el)
{
  var info;
  if (type === 'detail')
  {
    return {
      db: ep.clientData.currentRecord.Db,
      an: ep.clientData.currentRecord.Term
    };
  }
  else if (type === 'result')
  {
    info = el.find('em.preview-hover').data('hoverpreviewjson');
    if (info)
    {
      //            console.log(info);
      return {
        db: info.db,
        an: info.term
      };
      //           console.log('Result ' + (i + 1) + ': db is ' + db + '  and AN is ' + an);
    }
    else
    {
      return undefined;
    }
  }
  else
  {
    return undefined;
  }
}
var jQCheck = setInterval(function ()
{
  if (typeof (jQuery) !== 'function')
  {}
  else
  {
    clearInterval(jQCheck);
    var college = document.getElementById('collegeID');
    if (college)
    {
      var edsGW = '';
      switch (college.innerHTML)
      {
      case 'arc':
        edsGW = 'eyJjdCI6IllDeGlaa21JbEU2VlRmU1FIUmk3XC94Nk9ZNnN4RHRkXC9Hb2NKbXJ4OVo0bz0iLCJpdiI6IjZiZDA4YWI4N2IwYjgwOWIxMTI0ZmEwNDYzYWQxOGQ0IiwicyI6ImE4MGQ5MDk4ZjZmYjM5MjMifQ==&p=YW1lcnJpdi5tYWluLndzYXBp';
        break;
      case 'scc':
        edsGW = 'eyJjdCI6Im9GbVUzeldxZzg3ZzhXelNKYktRbmc9PSIsIml2IjoiYzg3NWRhOWRhOTQ5ZjkxMGIxZGFiOTAwZDJkZmJhYTUiLCJzIjoiZTAxZTQzYmZhOTViYjJlZSJ9&p=c2FjcmFtLm1haW4ud3NhcGk=';
        break;
      case 'crc':
        edsGW = 'eyJjdCI6IjNLNXdlQ0I2V09TWDdBUkYzT3cyaVE9PSIsIml2IjoiOTJkYzAwNzNhN2M4MWE1NDY1ZTg4ZjEzNTFmNjdiYjQiLCJzIjoiZThjNzZmYWE3NDc4ZTM2MiJ9&p=Y29zdW0ubWFpbi53c2FwaQ==';
        break;
      case 'flc':
        edsGW = 'eyJjdCI6InVmNWlcL2tIU3BkNFJWXC9iaU9LTTlhSW1sUmtDR0lUbjBBWTczampFdjFsZz0iLCJpdiI6IjliMjBmMGNmODk5NjJiY2Q1ZTdiZTExMjVlN2QzMmZmIiwicyI6ImIwNzk5OWNiYTI1NTU1NmMifQ==&p=bnMwMTUwOTIubWFpbi53c2FwaQ==';
        break;
      default:
        edsGW = '';
      }
      if (location.href.indexOf('/results?') > -1)
    {
      jQuery('.result-list-record').each(function ()
      { // initiate oadoi search
        var a = jQuery(this);
        if (a.find('.pubtype-icon').attr('title') === 'Academic Journal')
        {
          var custLinks = a.find('.externalLinks');
          var linkText = custLinks.text();
          if (linkText.indexOf('Full Text') > -1)
          {}
          else
          {
            var info = getItemData('result', a);
            if (info)
            {
              // console.log(info.db);
              // console.log(info.an);
              getDOI(info.db, info.an, jQuery(this).find('.display-info'), edsGW);
            }
          }
        }
      });
    }
    else if (location.href.indexOf('/detail/') > -1)
    {
      var info = getItemData('detail', null);
      var db = info.db;
      var an = info.an;
      if (!(jQuery('.custom-link-item a:contains("Full Text")').length))
      { // look for free full text via oadoi
        //      console.log('db: ' + db + ', an: ' + an);
        getDOI(db, an, jQuery('.format-control:first-of-type'), edsGW);
      }
    }
    }
    
  }
  document.cookie = 'oneSearchDomain=proxy;domain=.losrios.edu'; // set proxy cookie
}, 100);