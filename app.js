var express = require("express");
var app = express();
var mkdirp = require("mkdirp");
var fs = require("fs");
var chalk = require("chalk");
var GoogleSpreadsheet = require("google-spreadsheet");
var moment = require("moment");
var generateIssue = require("./generate-github-issue");
var githubRequest = require("./github-request");
var bodyParser = require('body-parser')

var Habitat = require("habitat");
Habitat.load(".env");
var env = new Habitat("", {
  port: 5000
});

var GITHUB_API_ISSUES_ENDPOINT = "https://api.github.com/repos/" + env.get("GITHUB_REPO") + "/issues"
var ROW_NUMBER_TO_START = 51; // this is the row # you want to fetch proposal data from. e.g., 2 means you want to fetch data from the first submitted proposal (Row#2)
var TOTAL_ROWS_TO_FETCH = 1;
var POST_TO_GITHUB_DELAY_SECS = 2;
var LOG_DIR_PATH = "./export-log";

app.set("port", env.get("port"));
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({   // to support URL-encoded bodies
  extended: true
}));

app.get("/", function(req, res) {
  res.send("Hello World :D");
});

var allProposals = [];
var numProposals = 0;
var numFetched = 0;
var fetchOptions = {
  start: ROW_NUMBER_TO_START-1, // minus 1 to offset the GoogleSpreadsheet default config, do not chnage this
  num: TOTAL_ROWS_TO_FETCH
};
var postLog = {
  numMigrated: 0,
  numFailed: 0,
  numIgnored: 0,
  rowsFailed: [],
  rowsIgnored: []
};
var logFileContent = "";


app.post('/submit', function(req, res) {
  ROW_NUMBER_TO_START = req.body.rowId;
  fetchOptions.start = ROW_NUMBER_TO_START-1;
  fetchDataFromSpreadsheet(env.get("GOOGLE_SPREADSHEET_ID"), fetchOptions, function(rows) {
    allProposals = rows;
    numProposals = allProposals.length;
    postToGitHubWithDelay(
      {proposals: allProposals, count: numProposals}
    );
    res.send("Posted row #" + (fetchOptions.start+1));
  });
});

function postToGitHubWithDelay(options) {
  var fetched = 0;
  setTimeout(function(){
    if ( fetched < options.count ){
      var proposal = options.proposals[0+fetched];
      var rowNum = ROW_NUMBER_TO_START + fetched;
      fetched++;
      if (proposal.dontmigrate) {
        var ignoredMsg = "Row #" + rowNum + " was ignored";
        postLog.numIgnored++;
        postLog.rowsIgnored.push(rowNum);
        console.log(chalk.yellow(ignoredMsg));
        printCurrentReport(ignoredMsg);
      } else {
        postIssue( generateIssue(proposal, rowNum), function(error, successMsg) {
          if (error) {
            postLog.numFailed++;
            postLog.rowsFailed.push(rowNum);
            console.log(chalk.red(error));
            printCurrentReport(error);
          } else {
            postLog.numMigrated++;
            console.log(chalk.green(successMsg));
            printCurrentReport(successMsg);
          }
        });
      }
    } else {
      // done posting, print out the final result
      var timestamp = moment(Date.now()).format("YYYYMMD-hh.mm.ssA");
      printFinalReport( generateFinalReport(timestamp) );
      writeToLogFile( generateFinalReport(timestamp) );
    }
  }, POST_TO_GITHUB_DELAY_SECS*1000);
}

function fetchDataFromSpreadsheet(spreadsheetID, options, cb) {
  var doc = new GoogleSpreadsheet(spreadsheetID);
  var my_sheet;
  doc.getInfo(function(err, info){
    console.log('Loaded doc: '+info.title+' by '+info.author.email);
    my_sheet = info.worksheets[0];
    my_sheet.getRows({offset: options.start,
      limit: options.num,
      orderby: 'col2'}, function(err, rows){
      // console.log(Object.keys(rows[0]));
      if(err) {
        console.error(err);
      }
      cb(rows);
    })
  })
}

function postIssue(issue, cb) {
  var options = {
    method: "POST",
    url: GITHUB_API_ISSUES_ENDPOINT,
    body: {
      title: issue.title,
      body: issue.body
    }
  };
  var userCreds = {
    username: env.get("GITHUB_USERNAME"),
    password: env.get("GITHUB_PASSWORD")
  };

  githubRequest(options, userCreds, function(error, response, body) {
    if (error) {
      cb(error);
    }

    if (response.statusCode != 200 && response.statusCode != 201) {
      cb(new Error("Response status HTTP " + response.statusCode + ", Github error message: " + response.body.message));
    } else {
      cb(null, "Successfully migrated '" + issue.title + "' (Issue #" + body.number + ")");
    }
    // console.log("\n\n response", response);
  });
}

function generateCurrentReport() {
  return  "numFetched = " + numFetched + "\n" +
          "  numMigrated: " + postLog.numMigrated + "\n" +
          "  numFailed: " + postLog.numFailed + "\n" +
          "  numIgnored: " + postLog.numIgnored + "\n";
}

function generateFinalReport(timestamp) {
  return  {
    header: "\n\n////////// Batch Posting Done //////////",
    timestamp: timestamp,
    detail: "Starts from Rows #" + ROW_NUMBER_TO_START + "\n" +
            "Total Rows Fetched: " + numFetched + " (Expected: " + TOTAL_ROWS_TO_FETCH + ")" + "\n" +
            "  numMigrated: " + postLog.numMigrated + "\n" +
            "  numFailed: " + postLog.numFailed + " (Rows #" + postLog.rowsFailed.join(", ") + ")" + "\n" +
            "  numIgnored: " + postLog.numIgnored + " (Rows #" + postLog.rowsIgnored.join(", ") + ")",
    footer: "////////////////////////////////////////\n\n"
  }
}

function printCurrentReport(addtionalMsg) {
  var currentReport = generateCurrentReport();
  console.log(currentReport);
  logFileContent += addtionalMsg + "\n" + currentReport + "\n";
}

function printFinalReport(finalReport) {
  console.log( chalk.bgMagenta.bold(finalReport.header) );
  console.log( chalk.magenta(finalReport.timestamp) );
  console.log( "--------------------");
  console.log( chalk.magenta(finalReport.detail) );
  console.log( chalk.bgMagenta.bold(finalReport.footer) );
}

function writeToLogFile(finalReport) {
  var fileContent = logFileContent + "\n\n\n" +
                    finalReport.header + "\n" +
                    finalReport.timestamp + "\n" +
                    finalReport.detail + "\n" +
                    finalReport.footer + "\n\n" +
                    "Issues have been posted to https://github.com/" + env.get("GITHUB_REPO") + "/issues" + "\n" +
                    "(data exported from Google Spreadsheet ID: " + env.get("GOOGLE_SPREADSHEET_ID") + ")";

  mkdirp(LOG_DIR_PATH, function (err) {
    if (err) {
      console.error(err);
    }
    else {
      var filePath = LOG_DIR_PATH + "/" + finalReport.timestamp + ".txt";
      fs.writeFile(filePath, fileContent, function(err) {
        if(err) {
          console.log(err);
        }
        console.log(filePath + " was saved!");
      });
    }
  });
}


app.listen(app.get("port"), function() {
  console.log(chalk.cyan("Server listening on port %d...\n"), app.get("port"));
});
