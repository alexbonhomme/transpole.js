'use strict';

var http = require('http'),
    exec = require('child_process').exec,
    API_BASE = 'https://ws.socle-digital.keolis.com/cm-webservices/v2.0/timetable/';

function handleCurlResponse(error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);

    if (error !== null) {
        console.log('exec error: ' + error);
    }
}

http.createServer(function (req, res) {
    var headers = {};

    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Credentials"] = true;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept";

    // CORS
    if (req.method === 'OPTIONS') {

        // respond to the request
        res.writeHead(200, headers);
        res.end();
    } else {
        exec('curl "' + API_BASE + req.url + '"', function (error, stdout) {
            if (error) {
                console.error(error);
            }

            headers['Content-Type'] = 'application/json';

            res.writeHead(200, headers);
            res.write(stdout);
            res.end();
        });
    }
}).listen(8000);