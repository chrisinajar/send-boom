# send-boom
Send a Boom error over http.

## Installation
```
npm install --save send-boom
```

## Usage
```js
var http = require('http');
var Boom = require('boom');
var sendBoom = require('send-boom');

http.createServer(function (req, res) {
  var err = Boom.badRequest('Some error!');

  sendBoom(req, res, err);
}).listen(8080);
```

## Contributing
```
npm run test
```

# License
MIT
