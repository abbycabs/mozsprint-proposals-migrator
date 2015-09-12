var _ = require("underscore");
var request = require("request");

module.exports = function(options, userCreds, cb) {
  request(_.extend({
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "testing MozFest proposal migrators"
    },
    auth: {
      user: userCreds.username,
      pass: userCreds.password
    },
    json: true
  }, options), cb);
};
