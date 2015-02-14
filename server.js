// Dependencies requirements, Express 4
var express = require('express');
var session = require('express-session');
var https = require('https');
var fs = require('fs');


var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

var api = require('./api');

var app = express();

app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}));

app.use(express.static(__dirname + '/assets'));
app.use(morgan('dev'));
app.use(methodOverride());

app.use(session({
    secret: 'elegir',
    resave: false,
    saveUninitialized: true
}));

api.locals.start(function(err) {
    if (err) {
        console.info('problem starting server: ' + err);
    }
    else {
        var port = process.env.PORT || 3000;
        app.use('/api/v01/', api);

        var options = {
            key: fs.readFileSync('server.key'),
            cert: fs.readFileSync('server.crt'),
            requestCert: false,
            rejectUnauthorized: false
        };

        //https.createServer(options, app).listen(port);
        app.listen(port);
        console.info('started at: ' + port);
    }
});
