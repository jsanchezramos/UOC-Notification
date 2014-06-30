/**
 * Created with JetBrains WebStorm.
 * User: Vincent Lemeunier
 * Date: 06/06/13
 * User: JuanFrasr
 * Update: 13/06/14
 * Time: 15:41
 */

var _ = require('lodash'),
    AppIdAcces = require('./AppIdAcces'),
    pushAssociations = require('./PushAssociations'),
    apnPusher = require('./APNPusher'),
    gcmPusher = require('./GCMPusher');


var send = function (pushAssociations, androidPayload, iosPayload, infoApp) {

    var androidTokens = _(pushAssociations).where({type: 'android'}).map('token').value();
    var iosTokens = _(pushAssociations).where({type: 'ios'}).map('token').value();

    if (androidPayload && androidTokens.length > 0) {
        var gcmPayload = gcmPusher.buildPayload(androidPayload);

        gcmPusher.push(androidTokens, gcmPayload,infoApp);
    }

    if (iosPayload && iosTokens.length > 0) {
        var apnPayload = apnPusher.buildPayload(iosPayload);
        
        apnPusher.push(iosTokens, apnPayload,infoApp);
    }
};

var subscribe = function (deviceInfo) {
    pushAssociations.add(deviceInfo.user, deviceInfo.type, deviceInfo.token, deviceInfo.appId);
};


var unsubscribeDevice = function (deviceToken) {
    pushAssociations.removeDevice(deviceToken);
};

var unsubscribeUser = function (user) {
    pushAssociations.removeForUser(user);
};

var addAppIdAcces = function(appInfo){
    AppIdAcces.add(appInfo.appId,appInfo.gcm,appInfo.cert,appInfo.key);
};

var removeAppIdAcces = function(appId){
    AppIdAcces.removeForAppId(appId);
};

var updateAppIdAccesGCM = function(appInfo){
    AppIdAcces.updateGCM(appInfo);
};

var updateAppIdAccesAPN = function(appInfo){
    AppIdAcces.updateAPN(appInfo);
};

var getCertToAppId = function(appId){
    pushAssociations.getAllForAppId(appId,function(err,res){
        console.log(res);
    });
};


module.exports = {
    send: send,
    subscribe: subscribe,
    unsubscribeDevice: unsubscribeDevice,
    unsubscribeUser: unsubscribeUser,
    addAppIdAcces: addAppIdAcces,
    removeAppIdAcces: removeAppIdAcces,
    updateAppIdAccesGCM: updateAppIdAccesGCM,
    updateAppIdAccesAPN: updateAppIdAccesAPN,
    getCertToAppId: getCertToAppId
};