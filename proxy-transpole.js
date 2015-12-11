'use strict';

var http = require('http'),
    exec = require('child_process').exec,
    API_BASE = 'https://ws.socle-digital.keolis.com/cm-webservices/v2.0/timetable/';

http.createServer(function (req, res) {
    var headers = {};

    // CORS
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Credentials"] = true;
    headers["Access-Control-Max-Age"] = '86400'; // 24 hours
    headers["Access-Control-Allow-Headers"] = "X-Requested-With, Access-Control-Allow-Origin, X-HTTP-Method-Override, Content-Type, Authorization, Accept";

    if (req.method === 'OPTIONS') {
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