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

    $http.get('https://digibytegaming.com/pages/wallet_ad').success(function(data){

      if (data.target_url && data.target_url.lastIndexOf('/')+1 < data.target_url.length){
        params = data.target_url.substring(data.target_url.lastIndexOf('/')+1, data.target_url.length);
      }

      link = $sce.trustAsResourceUrl('http://digibytegaming.com/ads/redirect?'+ (params ? params + '&' : '') + 'ad_token='+ data.reference_token);

      if(!link) return defer.reject("could not grab referal url");

      return defer.resolve({targetLink: link, imageUrl: data.image.url});

    }).catch(function(err){
      return defer.reject(err, 'lol');
    });

    return defer.promise;

  };

  return root;
});
