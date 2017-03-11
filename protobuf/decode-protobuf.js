
module.exports = function(RED) {

  function DecodeProtoBufNode(config) {
    RED.nodes.createNode(this,config);
    var node = this;

	// Extract configuration settings

  	if(config.protofile.length == 0)
  	  throw ".proto file is not defined";

  	node.protofile = config.protofile;

  	if(config.messagetype.length == 0)
  	  throw "message type is not defined";

  	node.messagetype = config.messagetype;

  	// Create protocol buffers builder for decode

    var ProtoBuf = require("protobufjs");
    // var builder = ProtoBuf.loadProtoFile(node.protofile);
    var root = ProtoBuf.loadSync(node.protofile);
    if (root == null){
      node.error("Unable to load proto file");
      node.status({fill:"red",shape:"ring",text:"Unable to load proto file"});
      throw "Unable to load proto file";
    }

    // Create the appropriate message object for the decode

    // var msgTemplate = builder.build(node.messagetype);
    var MessageTemplate = root.lookup(node.messagetype)
    if (root == null){
      node.error("Unable to load message");
      node.status({fill:"red",shape:"ring",text:"Unable to load message"});
      throw "Unable to load message";
    }

    node.status({});
    this.on('input', function(msg) {

      // Decode the incoming bytes to the appropriate message object
      var reader = ProtoBuf.Reader.create(msg.payload);
      if (reader == null){
        node.error("Unable to create Reader from buffer.");
        node.status({fill:"red",shape:"ring",text:"Unable to create Reader from buffer."});
        throw "Unable to create Reader from buffer.";
      }
      var mymsg = MessageTemplate.decode(reader);
      if (mymsg == null){
        node.error("Unable to decide buffer.");
        node.status({fill:"red",shape:"ring",text:"Unable to decide buffer."});
        throw "Unable to decide buffer.";
      }
	    // Modify the payload to contain the decoded object

	    msg.payload = mymsg.toJSON();

	    // Pass it along

      node.send(msg);
    });
  }
    RED.nodes.registerType("decode-protobuf",DecodeProtoBufNode);
}
