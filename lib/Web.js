var config = require('./Config');
var express = require('express');
var _ = require('lodash');
var pushAssociations = require('./PushAssociations');
var AppIdAcces = require('./AppIdAcces');
var push = require('./PushController');

var app = express();

// Middleware
app.use(express.compress());
app.use(express.bodyParser());

app.use(express.static(__dirname + '/../public'));

app.use(function(err, req, res, next) {
    res.status(500);
    res.render('error', { error: err });
});

app.post('/*', function (req, res, next) {
    if (req.is('application/json')) {
        next();
    } else {
        res.status(406).send();
    }
});

// Main API
app.post('/subscribe', function (req, res) {
    var deviceInfo = req.body;
    push.subscribe(deviceInfo);

    res.send();
});

app.post('/unsubscribe', function (req, res) {
    var data = req.body;

    if (data.user) {
        push.unsubscribeUser(data.user);
    } else if (data.token) {
        push.unsubscribeDevice(data.token);
    } else {
        return res.status(503).send();
    }
    res.send();
});

app.post('/send', function (req, res) {
    var notifs = [req.body];

    var notificationsValid = sendNotifications(notifs);

    res.status(notificationsValid ? 200 : 400).send();
});


app.post('/sendBatch', function (req, res) {
    var notifs = req.body.notifications;

    var notificationsValid = sendNotifications(notifs);

    res.status(notificationsValid ? 200 : 400).send();
});


app.post('/appId/add', function (req, res) {
    var data = req.body;
     if(data.appId){
         push.addAppIdAcces(data);
     }
    res.send();
});

app.post('/appId/updateGCM', function (req, res) {
    var data = req.body;
    if(data.appId && data.gcm){
        push.updateAppIdAccesGCM(data);
    }
    res.send();
});

app.post('/appId/updateAPN', function (req, res) {
    var data = req.body;
    if(data.appId && data.key && data.cert){
        push.updateAppIdAccesAPN(data);
    }
    res.send();
});


// Utils API

app.get('/appIds', function (req, res) {

    AppIdAcces.getAll(function (err, pushAss) {
        if (!err) {
            var appIds = _(pushAss).map('appId').unique().value();
            res.send({
                "appIds": appIds
            });
        } else {
            res.status(503).send()
        }
    });
});

app.get('/appId/:appId', function (req, res) {
    AppIdAcces.getForAppId(req.params.appId, function (err, item) {
        if (!err) {
            res.send({"appId": item});
        } else {
            res.status(503).send();
        }
    });
});

app.get('/users/:user/associations', function (req, res) {
    pushAssociations.getForUser(req.params.user, function (err, items) {
        if (!err) {
            res.send({"associations": items});
        } else {
            res.status(503).send();
        }
    });
});

app.get('/users', function (req, res) {
    pushAssociations.getAll(function (err, pushAss) {
        if (!err) {
            var users = _(pushAss).map('user').unique().value();
            res.send({
                "users": users
            });
        } else {
            res.status(503).send()
        }
    });
});

app.delete('/users/:user', function (req, res) {
    pushController.unsubscribeUser(req.params.user);
    res.send('ok');
});

app.delete('/appId/:idApp', function (req, res) {
    push.removeAppIdAcces(req.params.idApp);
    res.send('ok');
});


// Helpers
function sendNotifications(notifs) {

    var areNotificationsValid = _(notifs).map(validateNotification).min().value();

    if (!areNotificationsValid) return false;

    notifs.forEach(function (notif) {
        var users = notif.users,
            androidPayload = notif.android,
            iosPayload = notif.ios,
            appId = notif.appId,
            target;

        if (androidPayload && iosPayload) {
            target = 'all'
        } else if (iosPayload) {
            target = 'ios'
        } else if (androidPayload) {
            target = 'android';
        }


        if(appId){ //Fixme en caso de tener una app asociada miras la app y los usios de esa app o si es a todos.
                var fetchUserToAppId =  users ? pushAssociations.getUserForAppId:pushAssociations.getAllForAppId,
                callback = function (err, pushAssociations) {
                    if (err) return;

                    if (target !== 'all') {

                        // TODO: do it in mongo instead of here ...
                        pushAssociations = _.where(pushAssociations, {'type': target});
                    }

                    AppIdAcces.getForAppId(appId, function (err, item) {
                        if(err)console.log(err);
                        push.send(pushAssociations, androidPayload, iosPayload,item);
                    });


                },
                args = users ? [appId,users, callback] : [appId,callback];

            // TODO: optim. -> mutualise user fetching ?
            fetchUserToAppId.apply(null, args);

        }else{ // En caso de no tener una appId associada se carga  por defecto.
                var fetchUsers = users ? pushAssociations.getForUsers : pushAssociations.getAll, 
                callback = function (err, pushAssociations) {
                    if (err) return;

                    if (target !== 'all') {
                        // TODO: do it in mongo instead of here ...
                        pushAssociations = _.where(pushAssociations, {'type': target});
                    }
                
                    push.send(pushAssociations, androidPayload, iosPayload);
                },

                args = users ? [users, callback] : [callback];
        
        
            // TODO: optim. -> mutualise user fetching ?
            fetchUsers.apply(null, args);
        }
    });

    return true;
}

function validateNotification(notif) {
    var valid = true;

    valid = valid && (!!notif.ios || !!notif.android);
    // TODO: validate content

    return valid;
}

exports.start = function () {
    app.listen(config.get('webPort'));
    console.log('Listening on port ' + config.get('webPort') + "...");
};
