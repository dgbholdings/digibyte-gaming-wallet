'use strict';

angular.module('copayApp.services').factory('addService', function($http, $q, $sce, $log, txFormatService) {
  var root = {};

  var isNullOrEmpty = function(object) {
    return (object == null || angular.equals({}, object));
  }

  var format_op_return = function(op_return) {
    var content = '';
    if (op_return) {
      for (var i = 3; i < op_return.length; i++) {
        content += op_return[i];
      }
    }
    return content;
  }


  root.getSponsor = function(content, cb) {
    $log.debug('addService: getSponsor');
    $log.debug('Message Token: ' + content);
    var endpoint = "https://digibytegaming.com/sponsors/" + content;
    $http.get(endpoint).success(function(data) {
        $log.debug('Data: ' + JSON.stringify(data));
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
    $log.debug('addService: getSponsorMessage');
    $log.debug('Message Token: ' + content);
    var endpoint = "https://digibytegaming.com/sponsors/msg/" + content;
    $http.get(endpoint).success(function(data) {
        $log.debug('Data: ' + JSON.stringify(data));
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
    $log.debug('addService: getOpReturn');
    $log.debug('Transaction ID: ' + txid);
    $http.get('http://digiexplorer.info/api/tx/' + txid)
      .success(function(data) {
        for(var i in data.vout) {
          if(data.vout[i].scriptPubKey.asm.indexOf("OP_RETURN") > -1){
            op_return_message = txFormatService.formatOP_RETURN(data.vout[i].scriptPubKey.asm)
          }
        }
        return cb(format_op_return(op_return_message));
      })
      .catch(function(err){
        return cb(err);
      });
  };

  return root;
});
