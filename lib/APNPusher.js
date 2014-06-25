/**
 * Created with JetBrains WebStorm.
 * User: smile
 * Date: 13/06/13
 * Time: 16:42
 * To change this template use File | Settings | File Templates.
 */


var config = require('./Config');
var _ = require('lodash');
var apn = require('apn');
var pushAssociations = require('./PushAssociations')

var push = function (tokens, payload, infoApp) {
    if(infoApp) {
        apnSender(infoApp).pushNotification(payload, tokens);
    }
};

var buildPayload = function (options) {
    var notif = new apn.Notification(options.payload);

    notif.expiry = options.expiry || 0;
    notif.alert = options.alert;
    notif.badge = options.badge;
    notif.sound = options.sound;

    return notif;
};

var apnSender = _.once(function (infoApp) {

    var apnConnection = new apn.Connection(config.get('apn').connection);
    apnConnection.cert = infoApp.apn_cert;
    apnConnection.key = infoApp.apn_key;

    apnConnection.on('transmissionError', onTransmissionError);
    initAppFeedback(infoApp);


    return apnConnection;
});

var onTransmissionError = function (errorCode, notification, recipient) {
    console.error('Error while pushing to APN: ' + errorCode);
    // Invalid token => remove device
    if (errorCode === 8) {
        var token = recipient.token.toString('hex').toUpperCase();

        console.log('Invalid token: removing device ' + token);
        pushAssociations.removeDevice(token);
    }
};

var onFeedback = function (deviceInfos) {
    console.log('Feedback service, number of devices to remove: ' + deviceInfos.length);

    pushAssociations.removeDevices(deviceInfos.map(function (deviceInfo) {
        return deviceInfo.token.toString('hex').toUpperCase();
    }));
};

var initAppFeedback = function (infoApp) {
    var apnFeedback = new apn.Feedback(config.get('apn').feedback);

    apnFeedback.cert = infoApp.apn_cert;
    apnFeedback.key = infoApp.apn_key;

    apnFeedback.on('feedback', onFeedback);
};

module.exports = {
    push: push,
    buildPayload: buildPayload
}