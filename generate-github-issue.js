var fs = require('fs');
var _ = require('underscore');

var template = _.template(fs.readFileSync(__dirname + '/issue-template.md','utf-8'));
var labelMap = {
  "Tools: you are building a tool others can help you build" : "[Track]+Tools",
  "Open Educational Resource: you're collaborating on curriculum or other educational resources" : "[Track]+Open+Educational+Resources",
  "Citizen Science: you're looking for participants in your citizen science project" : "[Track]+Citizen+Science",
  "Open Data: you have data others can use and play with during the sprint" : "[Track]+Open+Data"
}
module.exports = function(proposal, rowNum) {
  var labels = proposal["selectoneormoretracksforyourproject"].split(', ');
  labels = labels.map(function(obj){
    return labelMap[obj];
  });
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
  if(labels.length > 0){
    issue.labels = labels;
  }
  return issue;
};
