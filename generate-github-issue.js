var fs = require('fs');
var _ = require('underscore');

var template = _.template(fs.readFileSync(__dirname + '/issue-template.md','utf-8'));
var trackMap = {
  "Open Innovation" : "Open Innovation",
  "Digital Inclusion" : "Digital Inclusion",
  "Privacy + Security" : "Privacy + Security",
  "Decentralization" : "Decentralization",
  "Web Literacy" : "Web Literacy"
}

function formatGitHubId(id) {
  id.split("/")[-1];
  id.split("@")[-1];
  return "@" + id;
}

module.exports = function(proposal, rowNum) {
  console.log(proposal);
  var labels = proposal["selectoneormoretracksforyourproject"].split(', ');
  labels = labels.map(function(obj){
    return trackMap[obj] || obj;
  });
  var hub = proposal["isyourprojectconnectedtoamozillacommunityorprogram"];
  labels.push(hub);
  var facilitator = formatGitHubId(proposal["githubid"]) || proposal["name"];


  var issue = {
    title: proposal["projecttitle"],
    body: template({
      rowNum: rowNum,
      title: proposal["projecttitle"],
      facilitator: facilitator,
      description: proposal["projectdescription"],
      track: proposal["selectoneormoretracksforyourproject"],
      hub: hub,
      location: proposal["whatisyourphysicallocationandtimezone"],
      course: proposal["haveyoutakentheshort1-houronlinecourseopenleadership101"],
      link: proposal["projectlink"]
    })
  };
  if(labels.length > 0){
    issue.labels = labels;
  }
  return issue;
};
