var Future = require('./core/promise');
var TaskRunner = require('./core/tasker');
var Client = require('./core/client');
var Emitter = require('./core/emitter');
var DOM = require('./core/dom');
var Digest = require('./auth/digest-protocol');

var config = {
	credentialsEndPoint:"",
	headers:{
		
	}
};

function JaloSDK(){
	
	this.presence = DOM.getScriptAttribute('data-api-presence');
}

JaloSDK.prototype.init = function(fn){

	return Emitter;
}

JaloSDK.prototype.newDelivery = function(cfg){

	return new Future();
}

JaloSDK.prototype.cancelDelivery = function(cfg){

	return new Future();
}

JaloSDK.prototype.logDelivery = function(cfg){

	return new Future();
}


module.exports = new JaloSDK();