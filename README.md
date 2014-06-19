# UOC Notification

Fork to https://github.com/Smile-SA/node-pushserver.

## Getting started

### 1 - Database


See MongoDB ([MongoDB Download page](http://www.mongodb.org/downloads)).


### 2 - Install service push

+ From git:

```shell
$ git clone git://github.com/jsanchezramos/UOC-Notification
$ cd UOC-Notification
$ npm install 
```

### 3 - Configuration

If you checked out this project from github, you can find a configuration file example named 'example.config.json'.


```js
{
	"webPort": 8000,

    "mongodbUrl": "mongodb://username:password@localhost/database",

    "gcm": {
        "apiKey": "YOUR_API_KEY_HERE"
    },

    "apn": {
        "connection": {
            "gateway": "gateway.sandbox.push.apple.com",
            "cert": "/path/to/cert.pem",
            "key": "/path/to/key.pem"
        },
        "feedback": {
            "address": "feedback.sandbox.push.apple.com",
            "cert": "/path/to/cert.pem",
            "key": "/path/to/key.pem",
            "interval": 43200,
            "batchFeedback": true
        }
    }
}

```

+ Checkout [GCM documentation](http://developer.android.com/guide/google/gcm/gs.html) to get your API key.

+  Read [Apple's Notification guide](https://developer.apple.com/library/ios/#documentation/NetworkingInternet/Conceptual/RemoteNotificationsPG/Introduction.html) to know how to get your certificates for APN.

+ Please refer to node-apn's [documentation](https://github.com/argon/node-apn) to see all the available parameters and find how to convert your certificates into the expected format. 


### 4 - Start server

```shell
$ node bin/uocnotification.js -c config.json 
```

### 5 - Enjoy!



## Usage
### Web Interface
You can easily send push messages using the web interface available at `http://domain:port/`.

### Web API

#### Send a push
```
http://domain:port/send (POST)
```
+ The content-type must be 'application/json'.
+ Format : 

```json
{
  "users": ["user1"],
  "android": {
    "collapseKey": "optional",
    "data": {
      "message": "Your message here"
    }
  },
  "ios": {
    "badge": 0,
    "alert": "Your message here",
    "sound": "soundName"
  }
}
```

+ "users" is optionnal, but must be an array if set. If not defined, the push message will be sent to every user (filtered by target).
+ You can send push messages to Android or iOS devices, or both, by using the "android" and "ios" fields with appropriate options. See GCM and APN documentation to find the available options. 


#### Send a push to appId
```
http://domain:port/send (POST)
```
+ The content-type must be 'application/json'.
+ Format : 

```json
{
  "users": ["user1"],
  "appId": ["appId"],
  "android": {
    "collapseKey": "optional",
    "data": {
      "message": "Your message here"
    }
  },
  "ios": {
    "badge": 0,
    "alert": "Your message here",
    "sound": "soundName"
  }
}
```

+ "users" is optionnal, but must be an array if set. If not defined, the push message will be sent to every user to appId associaton (filtered by target).
+ You can send push messages to Android or iOS devices, or both, by using the "android" and "ios" fields with appropriate options. See GCM and APN documentation to find the available options. 

#### Send push notifications
```
http://domain:port/sendBatch (POST)
```
+ The content-type must be 'application/json'.
+ Format : 

```json
{
  "notifications": [{
      "users": ["user1", "user2"],
      "android": {
        "collapseKey": "optional",
        "data": {
          "message": "Your message here"
        }
      },
      "ios": {
        "badge": 0,
        "alert": "Foo bar",
        "sound": "soundName"
      }
    },{
      "users": ["user4"],
      "android": {
        "collapseKey": "optional",
        "data": {
          "message": "Your other message here"
        }
      }
    }
  ]
}
```

#### new appId
```
http://domain:port/appId/add (POST)
```
+ The content-type must be 'application/json'.
+ Format:
```js
{
  "appId":"appAula",
  "gcm":"api key google",
  "cet":"cert path",
  "key":"key path"
}
```
+ All field are required
+ Add new appId to use gcm & apn certs

#### delete appId
```
http://domain:port/appId/:idApp (DELETE)
```
+ Delete appId 

#### update appId gcm
```
http://domain:port/appId/updateGCM (POST)
```
+ The content-type must be 'application/json'.
+ Format:
```js
{
  "appId":"appAula",
  "gcm":"api key google"
}
```
+ All field are required
+ Add new appId to use gcm to update

#### update appId apn
```
http://domain:port/appId/updateAPN (POST)
```
+ The content-type must be 'application/json'.
+ Format:
```js
{
  "appId":"appAula",
  "cert":"cert.pem",
  "key":"key.pem"
}
```
+ All field are required
+ Add new appId to use apn(key,cert) to update

#### List appIds
```
http://domain:port/appIds (GET)
```
+ Response format: 
```js
{
    "appIds": [
        "AulaApp"
    ]
}
```

#### get info appId
```
http://domain:port/appId/{appId} (GET)
```
+ Response format

```js
{
    "appId": [
        {
            "appId": "AulaAPP",
            "gcm":"api key google",
            "cet":"cert path",
            "key":"key path"
        }
    ]
}
```

#### Subscribe
```
http://domain:port/subscribe (POST)
```
+ The content-type must be 'application/json'.
+ Format:
```js
{
  "user":"user1",
  "type":"android",
  "token":"CAFEBABE",
  "appId":"ID TO APP"
}
```
+ All field are required
+ "type" can be either "android" or "ios"
+ A user can be linked to several devices and a device can be linked to serveral users.

#### Unsubscribe
```
http://domain:port/unsubscribe (POST)
```
+ The content-type must be 'application/json'.
+ Format:
```js
{
  "token":"CAFEBABE"
}
```
or
```js
{
  "user":"user1"
}
```

+ You can unsubscribe either a particular device, or all the devices for one user

#### List Users
```
http://domain:port/users (GET)
```
+ Response format: 
```js
{
    "users": [
        "vilem"
    ]
}
```

#### List user's associations
```
http://domain:port/users/{user}/associations (GET)
```
+ Response format

```js
{
    "associations": [
        {
            "user": "vilem",
            "type": "ios",
            "token": "06546b81450fc50fb3e26e513081f54642d7af3dedb57d9a4c557cc36a81dd252"
        }
    ]
}
```


## Dependencies

  * [node-apn](https://github.com/argon/node-apn)
  * [node-gcm](https://github.com/ToothlessGear/node-gcm)
  * [express](https://github.com/visionmedia/express)
  * [mongoose](https://github.com/LearnBoost/mongoose)
  * [lodash](https://github.com/bestiejs/lodash.git )
  * [commander](https://github.com/visionmedia/commander.js)

## Tags
[UOC Notification tags](https://github.com/jsanchezramos/UOC-Notification/tags).

## History/Changelog

Take a look at the [history](https://github.com/jsanchezramos/UOC-Notification/blob/master/HISTORY.md).

## License

MIT :

Copyright (C) 2014 Universitat Oberta de Catalunya

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
