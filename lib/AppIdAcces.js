/**
 * Created by juanfrasr on 13/06/14.
 */

var mongoose = require('mongoose');
var config = require('./Config');
var _ = require('lodash');

var AppIdAcces ;

var initialize = _.once(function () {
    var db = mongoose.connect(config.get('mongodbUrl'));
    mongoose.connection.on('error', errorHandler);

    var AppIdSchema = new db.Schema({
        appId: {
            type: 'String',
            required: true
        },
        gcm: {
            type: 'String',
            required: true
        },
        apn_cert: {
            type: 'String',
            required: true
        },
        apn_key: {
            type: 'String',
            required: true
        }
    });

    // I must ensure uniqueness accross the two properties because two users can have the same token (ex: in apn, 1 token === 1 device)
    AppIdSchema.index({ user: 1, token: 1, appId: 1 }, { unique: true });

    AppIdAcces = db.model('AppIdAcces', AppIdSchema);

    return module.exports;
});


var add = function (appId, gcm, apn_cert, apn_key) {
    var pushItem = new AppIdAcces({appId: appId, gcm: gcm, apn_cert: apn_cert, apn_key: apn_key});

    pushItem.save();
};

var updateGCM = function (gcmUpdate) {
    AppIdAcces.findOneAndUpdate({appId: gcmUpdate.appId}, {gcm: gcmUpdate.gcm}, function (err) {
        if (err) console.error(err);
    });
};

var updateAPN = function (apnUpdate) {
    AppIdAcces.findOneAndUpdate({appId: apnUpdate.appId}, {apn_key: apnUpdate.key, apn_cert: apnUpdate.cert}, function (err) {
        if (err) console.error(err);
    });
};
var getAll = function (callback) {

    var wrappedCallback = outputFilterWrapper(callback);

    AppIdAcces.find(wrappedCallback);
};

var getForAppId = function (appId, callback) {
    var wrappedCallback = outputFilterWrapper(callback);

    AppIdAcces.find({appId: appId}, wrappedCallback);
};

var removeForAppId = function (appId) {
    AppIdAcces.remove({appId: appId}, function (err) {
        if (err) console.dir(err);
    });
};

var outputFilterWrapper = function (callback) {
    return function (err, pushItems) {
        if (err) return callback(err, null);

        var items = _.map(pushItems, function (pushItem) {

            return _.pick(pushItem, ['appId', 'gcm', 'apn_cert', 'apn_key'])
        });
        return callback(null, items);
    }
};

var initWrapper = function (object) {
    return _.transform(object, function (newObject, func, funcName) {
        if(!_.isFunction(func)) return newObject[funcName] = func;

        newObject[funcName] = function () {
            if (_.isUndefined(AppIdAcces)) {
                initialize();
            }
            return func.apply(null, arguments);
        };
    });
};

var errorHandler = function(error) {
    console.error('ERROR: ' + error);
};

module.exports = initWrapper({
    add: add,
    updateGCM: updateGCM,
    updateAPN: updateAPN,
    getAll: getAll,
    getForAppId: getForAppId,
    removeForAppId: removeForAppId
});