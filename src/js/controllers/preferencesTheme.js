'use strict';
 
angular.module('copayApp.controllers').controller('preferencesThemeController',
  function($scope, configService, profileService, go) {
    var config = configService.getSync();
    this.themeOpts = [
 
      {
        name: 'DigiByte Gaming Default',
        url: 'url("./img/digibytedefault.jpg")',
      },
      {
        name: 'DigiByte Banner Other',
        url: 'url("./img/digibyteother.jpg")',
      },
      {
        name: 'League Of Legends - Blitzcrank',
        url: 'url("./img/lolblitzcrank.jpg")',
      },
      {
        name: 'League Of Legends - Ezreal',
        url: 'url("./img/lolezreal.jpg")',
      },
      {
        name: 'League Of Legends - Jayce',
        url: 'url("./img/loljayce.jpg")',
      },
      {
        name: 'League Of Legends - Lissandra',
        url: 'url("./img/lollissandra.jpg")',
      },
      {
        name: 'League Of Legends - Volibear',
        url: 'url("./img/lolvolibear.jpg")',
      },
      {
        name: 'Hearthstone: Heroes of Warcraft',
        url: 'url("./img/hearthstone.jpg")',
      },
      {
        name: 'Dota 2 ',
        url: 'url("./img/dota2.jpg")',
      },
      {
        name: 'Counter-Strike: Global Offensive',
        url: 'url("./img/csgo.jpg")',
      }    
    ];
 
    var fc = profileService.focusedClient;
    var walletId = fc.credentials.walletId;
 
    var config = configService.getSync();
    config.themeFor = config.themeFor || {};
    this.theme = config.themeFor[walletId] || 'url("./img/digibyteother.jpg")';
 
    this.save = function(theme) {
      var self = this;
      var opts = {
        themeFor: {
          themeName: theme.name,
          themeUrl: theme.url,
        }
      };
      this.themeName =  theme.name;
      opts.themeFor[walletId] = theme;
 
      configService.set(opts, function(err) {
        if (err) {
          $scope.$emit('Local/DeviceError', err);
          return;
        }
        self.theme = theme;
        $scope.$emit('Local/ThemeUpdated');
      });
 
    };
  });