'use strict';

angular.module('copayApp.services').factory('addService', function($http, $q, $sce) {
  var root = {};

  var isNullOrEmpty = function(object) {
    return (object == null || angular.equals({}, object));
  };

  var hex_to_ascii = function(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  };

  var ascii_to_hex = function(str) {
    var arr = [];
    for (var i = 0, l = str.length; i < l; i ++) {
      var hex = Number(str.charCodeAt(i)).toString(16);
      arr.push(hex);
    }
    return arr.join('');
  };

  var format_op_return = function(op_return) {
    //$log.debug('OP_RETURN Unformatted: ' + op_return);
    var content = '';
    if (op_return && op_return.indexOf("OP_RETURN") > -1) {
      var op_string = new String(op_return);
      content = op_string.substring(op_string.lastIndexOf("OP_RETURN") + 9, op_string.length).trim();
    } else if (op_return) {
      var op_string = hex_to_ascii(op_return);
      for (var i = 3; i < op_string.length; i++) {
        content += op_string[i];
      }
    }
    //$log.debug('OP_RETURN Formatted: ' + content);
    return content;
  };


  root.getSponsor = function(content, cb) {
    //$log.debug('addService: getSponsor');
    //$log.debug('Message Token: ' + content);
    var endpoint = "https://digibytegaming.com/sponsors/" + content;
    $http.get(endpoint).success(function(data) {
        //$log.debug('Data: ' + JSON.stringify(data));
        if (data.success) {
          console.log('Sponsor: ' + JSON.stringify(data.sponsor));
          return cb(!isNullOrEmpty(data.sponsor), data.sponsor);
        }
        return cb(false, 'Cannot fetch Sponsor Information');
      })
      .catch(function(err) {
        return cb(false, err);
      });
  }

  root.getSponsorMessage = function(content, cb) {
    //$log.debug('addService: getSponsorMessage');
    //$log.debug('Message Token: ' + content);
    var endpoint = "https://digibytegaming.com/sponsors/msg/" + content;
    $http.get(endpoint).success(function(data) {
        //$log.debug('Data: ' + JSON.stringify(data));
        if (data.success==true) {
          return cb(data.message.content, data.message.image.url);
        }
        return cb(null, 'Cannot fetch Sponsor Message');
      })
      .catch(function(err) {
        return cb(err);
      });
  }

  root.getNews = function(){
    var defer = $q.defer();

    $http.get('https://digidbs.herokuapp.com/api/news')
    .success(function(resp){
      return defer.resolve(resp.latestNews);
    }).catch(function(err){
      console.log(err);
      return defer.reject(err);
    });
    return defer.promise;
  };

  root.getTx = function(txid){
    var defer = $q.defer();

    $http.get('https://digidbs.herokuapp.com/api/txs/' + txid)
    .success(function(resp){
      return defer.resolve(resp);
    }).catch(function(err){
      return defer.reject(err);
    });
    return defer.promise;
  };

  root.getImgUrl = function(){
    var defer = $q.defer();
    var params = null;
    var link = null;
    var WALLET_AD_URL = 'https://digibytegaming.com/ads/wallet_ad';
    // TEST: WALLET_AD_URL = 'http://localhost:3000/ads/wallet_ad';
    $http.get(WALLET_AD_URL).success(function(data) {
      var redirect_url = data.target_url;
      if (redirect_url)  {
        var param_index = redirect_url.lastIndexOf('/') > redirect_url.lastIndexOf('?') ? redirect_url.lastIndexOf('/') + 1 : redirect_url.lastIndexOf('?') + 1;
        if (redirect_url && param_index < redirect_url.length){
          params = redirect_url.substring(param_index, redirect_url.length);
        }
      }
      link = $sce.trustAsResourceUrl('https://digibytegaming.com/ads/' + data.reference_token);
      // TEST: link = $sce.trustAsResourceUrl('http://localhost:3000/ads/' + data.reference_token);
      if(!link) return defer.reject("could not grab referal url");
      return defer.resolve({targetLink: link, imageUrl: data.image.url});

    }).catch(function(err){
      return defer.reject(err, 'lol');
    });

    return defer.promise;
  };


  root.getOpReturn= function(txid, cb) {
    var op_return_message = null;
    //$log.debug('addService: getOpReturn');
    //$log.debug('Transaction ID: ' + txid);
    $http.get('http://digiexplorer.info/api/tx/' + txid)
      .success(function(data) {
        //$log.debug('Data: ' + JSON.stringify(data));
        angular.forEach(data.vout, function(output, index) {
          //$log.debug("Output: " + JSON.stringify(output.scriptPubKey));
          if(output.scriptPubKey.asm.indexOf("OP_RETURN") > -1) {
            //$log.debug("OP_RETURN Found: " + output.scriptPubKey.asm);
            op_return_message = output.scriptPubKey.asm;
          }
        })
        return cb(format_op_return(op_return_message));
      })
      .catch(function(err){
        return cb(err);
      });
  };

  return root;
});
