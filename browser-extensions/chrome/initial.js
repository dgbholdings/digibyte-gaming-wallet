chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    'bounds': {
      'width': 400,
      'height': 600
    },
    'resizable': false
  });

  // Check whether new version is installed
  chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
      console.log("Installed");
    } else if (details.reason == "update") {
      console.log('Chrome Update');
      var thisVersion = chrome.runtime.getManifest().version;
      console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
      var _config = null;
      var _local = chrome.storage.local.get('config', function(items) {
        if(!items || !items.config) return;
        _config = JSON.parse(items.config);
        console.log(_config);
        if (_config && !_config.bwsUpdated) {
          if (_config.bwsFor) Object.keys(_config.bwsFor).forEach(function(key) {
            _config.bwsFor[key] = "https://wallet1.digibytegaming.com:3232/bws/api"
          });
        }
        else _config.bwsUpdated = false;

        chrome.storage.local.set({
          config: JSON.stringify(_config)
        }, function(callback) {
          chrome.storage.local.get('config', function(items) {
            if (!items || !items.config) return;
            console.log(JSON.parse(items.config));
          });
        });
      });
    }
  });
});
