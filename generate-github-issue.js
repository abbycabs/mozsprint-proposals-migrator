var fs = require('fs');
var _ = require('underscore');

var template = _.template(fs.readFileSync(__dirname + '/issue-template.md','utf-8'));

module.exports = function(proposal, rowNum) {
  var issue = {
    title: proposal["projectname"],
    body: template({
      rowNum: rowNum,
      title: proposal["projectname"],
      facilitator: proposal["projectleadgithub"],
      description: proposal["projectdescription"],
      level: proposal["projectlevel"],
      track: proposal["selectoneormoretracksforyourproject"],
      githubrepo: proposal["projectrepoifapplicable"],
      collaborate: proposal["isyourprojectlistedonmozillasciencelabswebsiteseehttpsmozillascience.orgcollaborate"]
    })
  };
  return issue;
};
