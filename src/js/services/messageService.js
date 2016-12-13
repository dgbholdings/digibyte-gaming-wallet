'use strict';
angular.module('copayApp.services')
  .factory('messageService', function($log, profileService, storageService) {
    var base = 'xpub';
    var fc = profileService.focusedClient;
    var c = fc.credentials;
    var root = {
      digid: null,
      addrs: null,
      signAddress: null
    };


    root.init = function(cb){
      var self = this;

      storageService.getDigiID(function(err, digiID){
        if(err) return;

        if(!digiID || digiID === 'null'){
          return self.getMainAddresses(function(err, addressArray){
            if(err) return;

            self.addrs = addressArray;
            self.signAddress = addressArray[0];
          });
        }

        self.digiID = JSON.parse(digiID);
        return cb();

      });      
    };

    root.getMainAddresses = function(cb){

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

    root.setDigiIDAddress = function(addr){
      var self = this;

      self.digiID = { 
        address: addr.address, 
        path: addr.path.slice(4)
      };

      storageService.setDigiID(JSON.stringify(self.digiID), function(err){
        if(err){
          $log.debug(err);
        }

        return;
      });
    };

    root.setNewDigiID = function(){
      var self = this;

      self.digiID = null;
      self.signature = null;

      storageService.setDigiID(self.digiID, function(err){
        if(err){
          $log.debug(err);
        }

        self.getMainAddresses(function(err, addressArray){
          if(err) return;

          self.addrs = addressArray;
          self.signAddress = addressArray[0];
        });
      });
    };

    root.sign = function(message){
      var self = this;
      return profileService.Utils.signDigibyteMessage(message, self.digiID.path, c.xPrivKey);
    };

    return root;
  });