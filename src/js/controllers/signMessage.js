'use strict';

angular.module('copayApp.controllers').controller('signMessageController',
  function($scope, $timeout, profileService, storageService) {
    var base = 'xpub';
    var fc = profileService.focusedClient;
    var c = fc.credentials;

    this.init = function() {
      var self = this;

      $scope.loading = true;

      storageService.getDigiID(function(err, digiID){
        if(err) return;

        if(!digiID || digiID === 'null'){
          return self.getMainAddresses(function(err, addressArray){
            if(err) return;

            $scope.addrs = addressArray;
            $scope.signAddress = addressArray[0];
            $scope.loading = false;
          });
        }

        $scope.digiID = JSON.parse(digiID);
        $scope.loading = false;

      });
    };

    this.getMainAddresses = function(cb){
      $scope.addrs = null;

      fc.getMainAddresses({
        doNotVerify: true
      }, function(err, addrs) {
        if (err) {
          $log.warn(err);
          return;
        };
        var addresses = [],
          i = 0,
          e = addrs.pop();
        while (i++ < 20 && e) {
          e.path = base + e.path.substring(1);
          addresses.push(e);
          e = addrs.pop();
        }
        return cb(null, addresses);

      });
    };

    this.setDigiIDAddress = function(addr){

      $scope.digiID = { 
        address: addr.address, 
        path: addr.path.slice(4)
      };

      storageService.setDigiID(JSON.stringify($scope.digiID), function(err){
        if(err){
          $log.debug(err);
        }

        return;
      });
    };

    this.setNewDigiID = function(){
      var self = this;

      $scope.digiID = null;
      $scope.signature = null;
      $scope.loading = true;

      storageService.setDigiID($scope.digiID, function(err){
        if(err){
          $log.debug(err);
        }

        self.getMainAddresses(function(err, addressArray){
          if(err) return;

          $scope.addrs = addressArray;
          $scope.signAddress = addressArray[0];
          $scope.loading = false;
        });
      });
    }

    this.sign = function(){
      $scope.signature = profileService.Utils.signDigibyteMessage($scope.message, $scope.digiID.path, c.xPrivKey);
    };


  });