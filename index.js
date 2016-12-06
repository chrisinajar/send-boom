var sendJson = require('send-data/json');
var Boom = require('boom');

module.exports = SendBoom;

function SendBoom (req, res, boom) {
  if (!boom.isBoom) {
    boom = Boom.wrap(boom);
  }
  if (boom.reformat) {
    boom.reformat();
  }
  sendJson(req, res, {
    statusCode: boom.output.statusCode,
    headers: boom.output.headers,
    body: boom.output.payload
  });
}
