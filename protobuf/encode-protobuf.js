
module.exports = function(RED) {

    function EncodeProtoBufNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

	// Extract configuration settings

	if(config.protofile.length == 0)
	  throw ".proto file is not defined";

	node.protofile = config.protofile;

	if(config.messagetype.length == 0)
	  throw "message type is not defined";

	node.messagetype = config.messagetype;

	// Create protocol buffers builder for encode
    var ProtoBuf = require("protobufjs");
	// Create the configured message type

        // var builder = ProtoBuf.loadProtoFile(node.protofile),
		// Message = builder.build(node.messagetype);

  var root = ProtoBuf.loadSync(node.protofile)
  if (root == null){
    node.error("Unable to load proto file");
    node.status({fill:"red",shape:"ring",text:"Unable to load proto file"});
    throw "Unable to load proto file";
  }
	var MessageTemplate = root.lookup(node.messagetype)
  if (root == null){
    node.error("Unable to load message");
    node.status({fill:"red",shape:"ring",text:"Unable to load message"});
    throw "Unable to load message";
  }
  if (MessageTemplate == null){
    node.error("Message not found");
    node.status({fill:"red",shape:"ring",text:"Message not found"});
    throw "something is fucked up";
  }

  node.status({});
  this.on('input', function(msg) {

	    // Create an instance of the message from payload containing
            // JSON format data
	    // var message = new Message();
      var message = MessageTemplate.create( msg.payload )
      if (message == null){
        node.error("Unable to create message");
        node.status({fill:"red",shape:"ring",text:"Unable to create message"});
        throw "something is fucked up";
      }

      var verified = MessageTemplate.verify(message);
      if (verified != null){
        node.error(verified);
        node.status({fill:"red",shape:"ring",text:verified});
        throw "something is fucked up " + verified;
      }

	    // Encode the message
	    var buffer = MessageTemplate.encode(message).finish();
      if (buffer == null){
        node.error("Unable to create buffer");
        node.status({fill:"red",shape:"ring",text:"Unable to create buffer"});
        throw "something is fucked up buffer";
      }
	    // var buffer = writer.finish();

	    // Modify the payload to contain the encoded object
	    msg.payload = buffer;

	    // Pass it along
           node.status({});
            node.send(msg);
        });
    }
    RED.nodes.registerType("encode-protobuf",EncodeProtoBufNode);
}
