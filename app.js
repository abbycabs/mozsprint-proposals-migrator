var _ = require("underscore");
var express = require("express");
var app = express();
var request = require("request");
var chalk = require("chalk");
var GoogleSpreadsheet = require("google-spreadsheet");
var generateIssue = require('./generate-github-issue');

var Habitat = require("habitat");
Habitat.load(".env");
var env = new Habitat("", {
  port: 5000
});

var GITHUB_API_ENDPOINT = "https://api.github.com";

app.set("port", env.get("port"));

app.get("/", function(req, res) {
  res.send("Hello World :D");
});

app.get("/migrate-issues", function(req, res) {
  var numMigrated = 0;
  var numFailed = 0;
  var numIgnored = 0;
  var rowsFailed = [];
  var rowsIgnored = [];
  var options = {
    start: 1, // starts from Row x+1
    num: 1
  };

  fetchDataFromSpreadsheet(env.get("GOOGLE_SPREADSHEET_ID"), options, function(rows) {
    res.send("Visit https://github.com/" + env.get("GITHUB_REPO") + "/issues" + " to see your migrated issues." );

    rows.forEach(function(row, i) {
      var rowNum = options.start + i + 1; // proposal data starts from row 1, not row 0
      if (row.dontmigrate) {
        numIgnored++;
        rowsIgnored.push(rowNum);
        console.log(chalk.yellow("Row #" + rowNum + " ignored\n"));
      } else {
        // console.log(row.title);
        // console.log(rowNum);
        // console.log(row.sessionname + "\n");

        postIssue( generateIssue(row, rowNum), function(error, successMsg) {
          if (error) {
            console.log(chalk.red(error));
            numFailed++;
            rowsFailed.push(rowNum);
          } else {
            console.log(chalk.green(successMsg));
            numMigrated++;
          }

          console.log("  numMigrated: ", numMigrated);
          console.log("  numFailed: ", numFailed);
          console.log("  numIgnored: ", numIgnored);

          // print out the final result
          if ( (numMigrated+numFailed+numIgnored) == options.num ) {
            console.log(chalk.bgMagenta.bold("\n\n///// Batch Posting Done /////"));
            console.log("Starts from Rows #" + (options.start+1));
            console.log("Total rows fetched: " + options.num);
            console.log("  numMigrated: " + numMigrated );
            console.log("  numFailed: " + numFailed + " (Rows #" + rowsFailed.join(", ") + ")");
            console.log("  numIgnored: " + numIgnored + " (Rows #" + rowsIgnored.join(", ") + ")");
            console.log(chalk.bgMagenta.bold("//////////////////////////////"));
            console.log("\n\n");
          }
        });
      }
    })
  });
});

function fetchDataFromSpreadsheet(spreadsheetID, options, cb) {
  var my_sheet = new GoogleSpreadsheet(spreadsheetID);
  my_sheet.getRows(1, options, function(err, rows){
    console.log(Object.keys(rows[0]));
    cb(rows);
  })
}

function postIssue(issue, cb) {
  githubRequest({
    method: "POST",
    url: GITHUB_API_ENDPOINT + "/repos/" + env.get("GITHUB_REPO") + "/issues",
    body: {
      title: issue.title,
      body: issue.body
    }
  }, function(error, response, body) {
    if (error) {
      cb(err);
    } 

    if (response.statusCode != 200 && response.statusCode != 201) {
      cb(new Error("Response status HTTP " + response.statusCode + ", Github error message: " + response.body.message));
    } else {
      cb(null, "\nSuccessfully migrated '" + issue.title + "' (Issue #" + body.number + ")");
    }
  });
}

function githubRequest(options, cb) {
  request(_.extend({
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "testing MozFest proposal migrators"
    },
    auth: {
      user: env.get("GITHUB_USERNAME"),
      pass: env.get("GITHUB_PASSWORD")
    },
    json: true
  }, options), cb);
}

app.listen(app.get("port"), function() {
  console.log("Server listening on port %d...\n", app.get("port"));
});
