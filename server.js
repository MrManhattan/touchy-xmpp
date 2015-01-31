var GCM = require('node-gcm-ccs');

var fs = require('fs');
var conf = JSON.parse(fs.readFileSync('conf.json', 'utf8'));

var gcm = GCM(conf.gcProjectName, conf.apiKey);

gcm.on('message', function(messageId, from, category, data) {
    console.log('Message From: ', from);

    // incoming message - now we need to route this message
    // to it's target recipient
    var recipientId;
    if( data.to == 'staef' ){
        recipientId = conf.staefId;
        console.log('Sending message to staefy');
    }else{
        recipientId = conf.haempId;
        console.log('Sending message to haemp');
    }

    console.log('Sending to', recipientId);
    gcm.send(recipientId, { message: 'touch' });
});


gcm.on('connected', function(){
    console.log('Connected!');
})

gcm.on('receipt', function(messageId, from, category, data) {

});


var http = require('http');
var url = require('url');
http.createServer(function (req, res) {

    url = url.parse(req.url);
    var r = 'Nothing';
    switch(url.pathname){
        case '/send/staef':
            r = 'Sending to staef: ' +conf.staefId;
            gcm.send(conf.staefId, { message: 'touch' });
            break;

        case '/send/haemp':
            r = 'Sending to haemp' + conf.haempId;
            gcm.send(conf.haempId, { message: 'touch' });
            break;
    }

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(r);
}).listen(1337, '127.0.0.1');