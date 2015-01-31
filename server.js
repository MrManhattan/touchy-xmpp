var GCM = require('node-gcm-ccs');
var fs = require('fs');
var conf = JSON.parse(fs.readFileSync('conf.json', 'utf8'));


var gcm = GCM(conf.gcProjectName, conf.apiKey);

gcm.on('message', function(messageId, from, category, data) {

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

    gcm.send(recipientId, { message: 'touch' }, { delivery_receipt_requested: true }, function(err, messageId, to) {
        if (!err) {
            console.log('sent message to', to, 'with message_id =', messageId);
        } else {
            console.log('failed to send message');
        }
    });

    console.log('received message', arguments);
});

gcm.on('connected', function(){
    console.log('Connected!');
    
})

gcm.on('receipt', function(messageId, from, category, data) {
    console.log('received receipt', arguments);
});



////
//
//var xmpp = require('node-xmpp');
//var options = {
//    type: 'client',
//    jid: conf.gcProjectName+'@gcm-preprod.googleapis.com',
//    password: conf.apiKey,
//    port: 5236,
//    host: 'gcm.googleapis.com',
//    legacySSL: true,
//    preferredSaslMechanism : 'PLAIN'
//};
//
//console.log('creating xmpp app');
//
//var cl = new xmpp.Client(options);
//cl.on('online',
//    function() {
//        console.log("online");
//    });
//
//cl.on('stanza',
//    function(stanza) {
//        if (stanza.is('message') &&
//                // Best to ignore an error
//            stanza.attrs.type !== 'error') {
//
//            console.log("Message received");
//
//            //Message format as per here: https://developer.android.com/google/gcm/ccs.html#upstream
//            var messageData = JSON.parse(stanza.getChildText("gcm"));
//
//            if (messageData && messageData.message_type != "ack" && messageData.message_type != "nack") {
//
//                var ackMsg = new xmpp.Element('message').c('gcm', { xmlns: 'google:mobile:data' }).t(JSON.stringify({
//                    "to":messageData.from,
//                    "message_id": messageData.message_id,
//                    "message_type":"ack"
//                }));
//                //send back the ack.
//                cl.send(ackMsg);
//                console.log("Sent ack");
//
//                //Now do something useful here with the message
//                //e.g. awesomefunction(messageData);
//                //but let's just log it.
//                console.log(messageData);
//
//            } else {
//                //Need to do something more here for a nack.
//                console.log("message was an ack or nack...discarding");
//            }
//
//        } else {
//            console.log("error");
//            console.log(stanza)
//        }
//
//    });
//
//cl.on('error',
//    function(e) {
//        console.log("Error occured:");
//        console.error(e);
//        console.error(e.children);
//    });