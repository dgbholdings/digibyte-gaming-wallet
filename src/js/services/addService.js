'use strict';

angular.module('copayApp.services').factory('addService', function($http, $q, $sce) {
  var root = {};

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

  return root;
});
