var GCM = require('node-gcm-ccs');

var fs = require('fs');
var q = require('q');
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
var qs = require('querystring');
var server = http.createServer(function (req, res) {

    res.writeHead(200, {'Content-Type': 'text/plain'});
    url = url.parse(req.url);
    var r = 'Nothing';
    switch(url.pathname){
        case '/send/staef':
            r = 'Sending to staef: ' +conf.staefId;
            gcm.send(conf.staefId, { message: 'touch' });
            res.end(r);
            break;

        case '/send/haemp':
            r = 'Sending to haemp' + conf.haempId;
            gcm.send(conf.haempId, { message: 'touch' });
            res.end(r);
            break;

        case '/userlist':
            var db;

            // #1 Get db
            getDB().then(function(_db){
                db = _db;

                var query = qs.parse(url.query);
                var username = query.username;

                // check if user is registered
                if(!db.users[username]){

                    // #2.a Register
                    console.log('User is NOT registered');
                    
                    return registerUser(query.username, query.registerId)
                }else{
                    console.log('User is registered');
                }

                // #2.b skip register
                return true;

            }, function(err){
                console.log('Error while registering', err);

            }).then(function(){

                // #3 return users
                console.log('Sending response');
                
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(db.users));
            })

            break;
        default:
            fs.readFile(__dirname + '/index.html', function (err, data) {
                if (err) {
                    res.writeHead(500);
                    return res.end('Error loading index.html');
                }

                res.writeHead(200);
                res.end(data);
            });
            break;

    }


})
var io = require('socket.io')(server);

server.listen(80);

console.log('Starting up socketIO');

// establish socket io connection
io.on('connection', function (socket) {

    console.log('Someone connected!');
    
    
    /**
     * data.clientId
     */
    socket.on('Poke.ready', function(data){
        console.log(data.from, 'Is Ready');

        io.emit('Poke.ready', data)
    })

    /**
     * data.from clientId
     * data.to clientId
     */
    socket.on('Poke.poke', function (data) {
        console.log('Poke from:', data.from,  ' --> ', data.to);
        io.emit('Poke.poke', data);
    });
});

/**
 *
 */
function registerUser(username, registerId){
    console.log('Registering user', username, registerId);

    // let user name be something unique to the android device
    var d = q.defer();

    // check if the username already has a register id
    
    getDB().then(function(db){
            console.log('Getting db for Registering user');
            db.users[username] = registerId;
            return saveDB(db);
        }, function(err){
            console.error('Error!', err);

        }).then(function(res){
            d.resolve(res)
        }, function(err){
            d.reject(err);
        })

    return d.promise;
}

function getDB(){
    var d = q.defer();
    console.log('Getting DB');
    // check if the username already has a register id
    fs.readFile('db.json', null, function(err, file){
        if(err){
            console.error('Error in reading db', err);
            q.reject({status: 'Error', statusDescription: err});
        }

        var db = JSON.parse(file);

        d.resolve(db);
    })

    return d.promise;
}

function saveDB(db){

    console.log('Saving DB', db);

    var d = q.defer();
    fs.writeFile('db.json', JSON.stringify(db), null, function(err){
        if(err){
            d.reject({status: 'error', statusDescription: err});
        }else{
            d.resolve({status: 'new'});
        }
    })

    return d.promise;
}