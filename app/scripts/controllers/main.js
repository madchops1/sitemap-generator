'use strict';

/**
 * @ngdoc function
 * @name sitemapGeneratorApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sitemapGeneratorApp
 */


/* Don't delete this it is the tracker script stuff...
<script type="text/javascript">
  window.setTimeout(function () {
    parent.postMessage("sitemapgeneratorbody:: "+JSON.stringify(window.document.body.innerHTML),"*");
  }, 3000);
  window.setTimeout(function () {
    parent.postMessage("sitemapgeneratorhead:: "+JSON.stringify(window.document.head.innerHTML),"*");
  }, 3000);
  //var _0xaea9=["sitemapgenerator:: ","innerHTML","body","document","stringify","*","postMessage","setTimeout"];window[_0xaea9[7]](function(){parent[_0xaea9[6]](_0xaea9[0]+JSON[_0xaea9[4]](window[_0xaea9[3]][_0xaea9[2]][_0xaea9[1]]),_0xaea9[5])},3000);
  //var _0xd5e5=["\x73\x69\x74\x65\x6D\x61\x70\x67\x65\x6E\x65\x72\x61\x74\x6F\x72\x3A\x3A\x20","\x69\x6E\x6E\x65\x72\x48\x54\x4D\x4C","\x62\x6F\x64\x79","\x64\x6F\x63\x75\x6D\x65\x6E\x74","\x73\x74\x72\x69\x6E\x67\x69\x66\x79","\x2A","\x70\x6F\x73\x74\x4D\x65\x73\x73\x61\x67\x65","\x73\x65\x74\x54\x69\x6D\x65\x6F\x75\x74"];window[_0xd5e5[7]](function(){parent[_0xd5e5[6]](_0xd5e5[0]+JSON[_0xd5e5[4]](window[_0xd5e5[3]][_0xd5e5[2]][_0xd5e5[1]]),_0xd5e5[5])},3000);
</script>
*/

angular.module('sitemapGeneratorApp')
  .controller('MainCtrl', ['$scope', function ($scope) {
    //.controller('MainCtrl',[ '$scope', '$http', '$sce', function ($scope, $http, $sce) {

    $scope.inputUrl = '';
    $scope.robotsTxt = '';
    $scope.currentUrl = '';
    $scope.preview = '';
    $scope.crawling = false;
    $scope.script = [];
    $scope.links = [];
    $scope.statusIcon = 'glyphicon-ok';
    $scope.cncl = false;
    $scope.complete = false;
    $scope.error = false;
    $scope.mgs = '';
    $scope.robotsTxtFound = false;
    $scope.disallowedUrls = [];
    $scope.textSitemap = false;

    // kill console.log
    //console.log = function() {};

    // Create IE + others compatible event handler
    var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
    var eventer = window[eventMethod];
    var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";

    // Listen to message from child window
    eventer(messageEvent, function (e) {
      //console.log('parent received message!:  ',e.data);
      //console.log('parent received message!', $scope.currentUrl);
      if (e.data.indexOf('sitemapgenerator') !== -1) {

        // the script is there!
        $scope.script[$scope.currentUrl] = true;

        // get the links
        $scope.getLinks(e.data);


        //console.log('Links:', $scope.links);
        //$scope.$apply({});

      }

      /*if(e.data.indexOf('sitemapgeneratorhead::') !== -1) {
        if(!$scope.robotTextFound) {
          $scope.getRobotsText(e.data);
        }
      }*/

      // error no script
      else {
        // can't error here as other postMessage calls may execute first
        //console.log('ERROR 0002','you must include a script on your page');
      }
    }, false);




    $scope.go = function () {

      //
      if ($scope.inputUrl == '') { return false; }

      // format the input url
      // if trailing slash remove it
      if ($scope.inputUrl.substr(-1) === '/') {
        $scope.inputUrl = $scope.inputUrl.substr(0, $scope.inputUrl.length - 1);
      }

      console.log('go', $scope.inputUrl);

      // if no http
      if ($scope.inputUrl.substr(0, 7) !== 'http://' && $scope.inputUrl.substr(0, 8) !== 'https://') {
        $scope.inputUrl = 'http://' + $scope.inputUrl;
      }

      $scope.crawling = true;
      $scope.cncl = false;
      $scope.error = false;
      $scope.msg = '';

      $scope.pushToLinks($scope.inputUrl); // add the input url 

      // handle any robots txt
      if ($scope.robotsTxt !== '' && !$scope.robotTxtFound) {
        $scope.getDisallowedUrls();
        $scope.robotsTxtFound = true;
      }

      //$scope.links.push({ crawled : false, url : $scope.inputUrl });

      $scope.getPage($scope.inputUrl);

    };

    $scope.cancel = function () {
      $scope.cncl = true;
      $scope.crawling = false;
      $scope.links = [];
      $scope.complete = false;
      $scope.textSitemap = false;
    };

    $scope.getDisallowedUrls = function () {

      var lines = $scope.robotsTxt.split('\n');
      console.log('LINES', lines);

      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].toLowerCase();
        if (line.indexOf('disallow') > -1) {
          var lineArray = line.split(':');
          var url = lineArray[1].replace(/\s/g, '');
          console.log('DISALLOWED URL', url);
          if (url !== "") {
            $scope.disallowedUrls.push($scope.inputUrl + url);
          }
        }
      }



      /*var t;
      t = setTimeout(function () {

        console.log('getRobotsText', url, data);

        // errorhttps://shulkerbox.org/
        if($scope.script[url] == false) {
          // no script on page
          console.log('ERROR 0001','you must include a script on your page');
          $scope.pageError($scope.currentUrl);
        }

      }, 9000);*/

    }

    /*
      Generates an iFrame...
     */
    $scope.getPage = function (url) {
      if ($scope.cncl == true) { return false; }
      console.log('getPage', url);
      //console.log('Links',$scope.links);
      $scope.preview = '';
      $scope.script[url] = false;
      $scope.currentUrl = url;
      var s;
      s = setTimeout(function () {
        $scope.preview = '<iframe id="preview-frame" style="height:100%; width: 100%; border:0px;" src="' + url + '" />';
        $scope.$apply({});

        // scroller...
        //window.document.getElementById("preview-frame").onload = function () {
        //  console.log('iframeLoaded');
        //  this.contentWindow.scrollTo(0, 200);
        //};

      }, 1000);

      // wait 10 seconds after loading the page, and if we don't get a script postMessage then we can assume that the
      // script is not on the page
      var t;
      t = setTimeout(function () {

        console.log('script check timeout...', url, $scope.script);

        // error
        if ($scope.script[url] == false) {
          // no script on page
          console.log('ERROR 0001', 'you must include a script on your page');
          $scope.pageError($scope.currentUrl);
        }
      }, 9000);
    }

    $scope.getLinks = function (html) {


      console.log('OMEGA', html);
      var container = document.createElement("p");
      container.innerHTML = html;

      var anchors = container.getElementsByTagName("a");
      var list = [];
      var list = [];

      //console.log('ALPHA', anchors);

      for (var i = 0; i < anchors.length; i++) {
        if ($scope.cncl == true) { break; }

        //anchors[i] = anchors[i].replace(/\\"/g, '"');
        //var x = JSON.stringify(anchors[i]);
        //x = x.replace(/\\"/g, '"');
        //console.log(anchors[i], x);
        // replace the hostname
        //console.log(i, window.location);
        //console.log(i, anchors[i].href);
        //var href = anchors[i].href.replace(/\%22/g, '').replace('http://' + window.location.host + window.location.pathname, '');
        var href = anchors[i].href.replace(/\%22/g, '').replace('http://' + window.location.host + '/', '');

        // if trailing slash remove it
        if (href.substr(-1) === '/') {
          href = href.substr(0, href.length - 1);
        }

        // if there were two trailing slashes remove it
        if (href.substr(-1) === '/') {
          href = href.substr(0, href.length - 1);
        }

        // if there is a trailing back slash
        //if(href.substr(-1) === "\\") {
        //href = href.substr(0, href.length - 1);
        href = href.replace(/\\/g, '');
        href = href.replace(/%5C/g, '');

        //}
        // Remove trailing quote
        if (href.substr(-1) === '"') {
          href = href.substr(0, href.length - 1);
        }

        // Handle/Skip mailto:, javascript:, tel:
        if (href.indexOf('mailto:') !== -1 || href.indexOf('javascript:') !== -1 || href.indexOf('tel:') !== -1) {
          continue;
        }

        //console.log(i, href);

        // Handle remote urls
        // If there is a remote url
        if (href.substr(0, 7) === 'http://' || href.substr(0, 8) === 'https://' || href.substr(0, 2) === '//') {

          // and If the url is the same as the site being craled add it to links
          if (href.indexOf($scope.inputUrl) !== -1) {
            //$scope.links[href] = { crawled : false, url : href };
            //$scope.links.push({ crawled : false, url : href });
            $scope.pushToLinks(href);
          }

          // continue if http or // and not this website
          continue;
        }

        //console.log(i, href);

        // If it is an absolute path link
        if (href.substr(0, 1) === '/') {
          //$scope.links[$scope.inputUrl + href] = { crawled : false, url : $scope.inputUrl + href };
          //$scope.links.push({ crawled : false, url : $scope.inputUrl + href });
          $scope.pushToLinks($scope.inputUrl + href);
        } else {
          //$scope.links.push({ crawled : false, url : $scope.inputUrl + "/" + href });
          $scope.pushToLinks($scope.inputUrl + "/" + href);
        }

        //$scope.links.push('asdfasf');
        $scope.$apply({});
        //var text = anchors[i].textContent;

        //console.log('HREF', href);

        //if (text === undefined) {
        //  text = anchors[i].innerText;
        //}

        //list.push(['<a href="' + href + '">' + text + '</a>', href, text]);
      }


      // get next url

      //var nextUrl = $scope.getNextUrl();
      $scope.getNextUrl();

      //console.log('List:', list);
    }

    $scope.getNextUrl = function () {

      console.log('getNextUrl');

      // mark page crawled
      for (var i = $scope.links.length - 1; i > -1; i--) {
        if ($scope.links[i].url === $scope.currentUrl) {
          $scope.links[i].crawled = 1;
          var j = i + 1;


          // if there is another page
          if ($scope.links[j]) {
            console.log('THERE IS ANOTHER');
            $scope.getPage($scope.links[j].url);
            break;
          } else {
            console.log('THERE IS NOT');
            //$scope.crawling = false;
            $scope.currentUrl = '';
            $scope.complete = true;
            //$scope.links[i].crawled = 1;

            $scope.$apply({});
            break;
          }
        }
      }
    };


    $scope.pushToLinks = function (href) {
      //$scope.links = arr.filter(function (item) {
      //  return (item.name !== 'zipCode');
      //});

      //if($scope.disallowedUrls.indexOf(href) > -1) {
      //  return false;
      //}

      // remove trailing hash
      if (href.substr(-1) === '#') {
        href = href.substr(0, href.length - 1);
      }

      // remove trailing slash
      if (href.substr(-1) === '/') {
        href = href.substr(0, href.length - 1);
      }

      // Disallowed URLS
      //console.log('pushToLinks', $scope.disallowedUrls);
      for (var i = 0; i < $scope.disallowedUrls.length; i++) {
        console.log('TACO', href, $scope.disallowedUrls[i], href.indexOf($scope.disallowedUrls[i]));
        if (href.indexOf($scope.disallowedUrls[i]) > -1) {
          return false;
        }
      }

      //console.log('pushToLinks', href);

      var limit = 50000;

      if ($scope.links.length > limit - 1) { return false; }

      // prevent dupes
      for (var i = $scope.links.length - 1; i > -1; i--) {
        if ($scope.links[i].url === href) {
          return false;
        }
        //    array.splice(i, 1);
      }
      // push it
      $scope.links.push({ crawled: 0, url: href });

    };

    /* Page Class */
    $scope.pageClass = function (crawled, url) {
      if (crawled == 2) {
        return 'crawl-status-3';
      }
      else if ($scope.currentUrl == url) {
        return 'crawl-status-2';
      }
      else if (crawled == 0) {
        return 'crawl-status-0';
      }
      else if (crawled == 1) {
        return 'crawl-status-1';
      }
    };

    /* Page Icon */
    $scope.pageIcon = function (crawled, url) {
      //console.log('Page icon',crawled, url);
      if (crawled == 2) {
        return 'glyphicon-remove';
      }
      else if ($scope.currentUrl == url) {
        return 'glyphicon-cog glyphicon-spin';
      }
      // not crawled
      else if (crawled == 0) {
        return 'glyphicon-unchecked';
      }
      // crawled success
      else if (crawled == 1) {
        return 'glyphicon-ok';
      }
    };

    /* Page Error */
    $scope.pageError = function (url) {
      console.log('page error', url);
      for (var i = $scope.links.length - 1; i > -1; i--) {
        if ($scope.links[i].url === url) {
          console.log('ZED', i, url, $scope.inputUrl);

          $scope.links[i].crawled = 2;

          if (url == $scope.inputUrl) {
            $scope.error = true;
            $scope.msg = 'Your homepage URL does not have the script installed. See directions below.';
            $scope.cancel();
          }

          $scope.$apply({});
        }
      }
    }

    /* Download */
    $scope.__download = function (link) {


      console.log('download');


      var txt = '<?xml version="1.0" encoding="UTF-8"?>\n';
      txt = txt + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      angular.forEach($scope.links, function (value, key) {
        txt = txt + '<url><loc>' + value.url + '</loc><priority>0.5</priority></url>\n';
      });
      txt = txt + '</urlset>';

      $scope.textSitemap = txt;
      download(txt, "sitemap.xml", "text/xml");

      //document.open('data:text/xml;charset=utf-8,' + encodeURIComponent(txt), '_blank');

    };
  }]);

