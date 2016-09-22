'use strict';

angular.module('copayApp.controllers').controller('signMessageController',
  function($scope, $timeout, profileService) {
    var base = 'xpub';
    var fc = profileService.focusedClient;
    var c = fc.credentials;

    console.log(c)

    this.init = function() {
      var basePath = c.getBaseAddressDerivationPath();

      $scope.addrs = null;

      fc.getMainAddresses({
        doNotVerify: true
      }, function(err, addrs) {
        if (err) {
          $log.warn(err);
          return;
        };
        var last10 = [],
          i = 0,
          e = addrs.pop();
        while (i++ < 30 && e) {
          e.path = base + e.path.substring(1);
          last10.push(e);
          e = addrs.pop();
        }
        $scope.addrs = last10;
        $scope.signAddress = $scope.addrs[0];
        var test = profileService.Utils.signDigibyteMessage('bitid://digusign.com/auth/bitid/callback?x=da579bdad95e7a56', $scope.signAddress.path.slice(4));
        $timeout(function() {
          $scope.$apply();
        });

      });
    };

    this.sign = function(){
      $scope.signature = profileService.Utils.signDigibyteMessage($scope.message, $scope.signAddress.path.slice(4), c.xPrivKey);
    };

    this.onQrCodeScanned = function(data){
      $scope.signature = profileService.Utils.signDigibyteMessage(data, $scope.signAddress.path.slice(4), c.xPrivKey);
    }


  });