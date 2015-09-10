var fs = require('fs');
var _ = require('underscore');

var template = _.template(fs.readFileSync(__dirname + '/issue-template.md','utf-8'));

module.exports = function(proposal, rowNum) {
  var issue = {
    title: proposal["sessionname"],
    body: template({
      rowNum: rowNum,
      title: proposal["sessionname"],
      facilitator: proposal["firstname"] + " " + proposal["surname"],
      description: proposal["description"],
      agenda: proposal["agenda"],
      participants: proposal["participants"],
      outcome: proposal["outcome"]
    })
  };
  return issue;
};
