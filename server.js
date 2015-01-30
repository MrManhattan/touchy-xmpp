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

    gcm.send(recipientId, { message: 'touch' }, { delivery_receipt_requested: false }, function(err, messageId, to) {
        if (!err) {
            console.log('sent message to', to, 'with message_id =', messageId);
        } else {
            console.log('failed to send message');
        }
    });

    console.log('received message', arguments);
});

gcm.on('receipt', function(messageId, from, category, data) {
    console.log('received receipt', arguments);
});

