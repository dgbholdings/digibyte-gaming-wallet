'use strict';

angular.module('copayApp.services').factory('txFormatService', function($http, profileService, rateService, configService, lodash, $log) {
  var root = {};

  var formatAmountStr = function(amount) {
    if (!amount) return;
    var config = configService.getSync().wallet.settings;
    return profileService.formatAmount(amount) + ' ' + config.unitName;
  };

  var formatAlternativeStr = function(amount) {
    if (!amount) return;
    var config = configService.getSync().wallet.settings;
    return (rateService.toFiat(amount, config.alternativeIsoCode) ? rateService.toFiat(amount, config.alternativeIsoCode).toFixed(2) : 'N/A') + ' ' + config.alternativeIsoCode;
  };

  var formatFeeStr = function(fee) {
    if (!fee) return;
    var config = configService.getSync().wallet.settings;
    return profileService.formatAmount(fee) + ' ' + config.unitName;
  };

  root.formatOP_RETURN = function(data) {
      var hex = data.toString();//force conversion
      var str = '';
      for (var i = 0; i < hex.length; i += 2)
          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      return str.substring(2);    
  }

  root.processTx = function(tx) {
    $log.debug('txFormatService: processTx');
    $log.debug('Transaction :' + (tx) ? JSON.stringify(tx) : '');
    if (!tx) return;

    var outputs = lodash.isArray(tx.outputs) ? tx.outputs.length : 0;
    if (outputs && tx.action != 'received') {
      if ((tx.type && tx.type == 'multiple_output') || (tx.proposalType && tx.proposalType == 'multiple_output')) {
        tx.hasMultiplesOutputs = true;
        tx.recipientCount = outputs;
      }
      tx.amount = lodash.reduce(tx.outputs, function(total, o) {
        o.amountStr = formatAmountStr(o.amount);
        o.alternativeAmountStr = formatAlternativeStr(o.amount);
        return total + o.amount;
      }, 0);
    }

    tx.amountStr = formatAmountStr(tx.amount);
    tx.alternativeAmountStr = formatAlternativeStr(tx.amount);
    tx.feeStr = formatFeeStr(tx.fee || tx.fees);

    return tx;
  };

  root.checkSponsor = function(txid, cb){
    $log.debug('txFormatService: checkSponsor');
    $log.debug('Transaction ID: ' + txid);

    var op_return_message = null;

    $http.get('http://digiexplorer.info/api/tx/' + txid)
      .success(function(data){
        for(var i in data.vout){
          if(data.vout[i].scriptPubKey.asm.indexOf("OP_RETURN") > -1){
            op_return_message = formatOP_RETURN(data.vout[i].scriptPubKey.asm)
          }
        }
        getSponsorList(op_return_message, function(err, link, logo){
          return cb(null, link, logo)
        })
        //return cb(null, op_return_message)
      })
      .catch(function(err){
        return cb(err);
      });
  };

  return root;
});
