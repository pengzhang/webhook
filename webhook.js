var express = require('express');
var bodyParser = require('body-parser');
var process = require('child_process');
var router = express.Router();
var http = require('http');
var fs = require('fs');

var app = express();

var data = fs.readFileSync('./webhook.conf','utf-8');
var conf = JSON.parse(data);
var port = parseInt(conf.bind,10) || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

router.post('/', function(req, res, next) {
    console.log('print', req.body);
    console.log('token', req.body["token"]);

    var branch = req.body['ref'];
    var repository = req.body['repository'];
    if(branch && repository){
        conf.items.forEach(function(value,index,array){
            if(value.repo == repository.web_url  && ('refs/heads/'+value.branch) == branch){
                process.exec('sh '+value.script,{cwd:'.'}, function (error, stdout, stderr) {
                    console.log('stdout========================\n' + stdout);
                    console.log('stderr========================\n' + stderr);
                    if (error) {
                       console.log(error);
                    }
                })
            }
        })
    }
    res.send('<pre>done</pre>');
})

app.use('/', router);
app.set('port', port);
var server = http.createServer(app);
server.listen(port);