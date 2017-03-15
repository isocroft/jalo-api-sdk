
require('../core/utils');

var globals = require('../core/globals'),
	w = globals.window,
	d = w.document,

	Futures = require('../core/promise'),
	DOM = require('../core/dom'),

noop = function(){},

requestComplete = function (xhr, control, xtras) {
						var requestCompleteResult = {xhr:null},
							notFoundOk,
							headers = {},
							httpStatus;

						//
						// XDomainRequest doesn't give us a way to get the status,
						// so allow passing in a forged one
						//
						if (typeof xhr.status === "undefined") {
							
							httpStatus = control.fakeStatus;

							headers = xhr.getAllResponseHeaders();
						}
						else {
							//
							// older versions of IE don't properly handle 204 status codes
							// so correct when receiving a 1223 to be 204 locally
							// http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
							//
							httpStatus = (xhr.status === 1223) ? 204 : xhr.status;

							headers = xhr.getAllResponseHeaders();
						}

						if (!control.finished) {
							// The request may be in sync or async mode, using XMLHttpRequest or IE XDomainRequest, onreadystatechange or
							// onload or both might fire depending upon browser, just covering all bases with event hooks and
							// using 'finished' flag to avoid triggering events multiple times
							control.finished = true;

							notFoundOk = (httpStatus === 404);
							if ((httpStatus >= 200 && httpStatus < 400) || !notFoundOk) {
								
									requestCompleteResult = {
										headers:headers,
										err:((ex && ex[0].message) || httpStatus),
										xhr:(xhr.statusText || xhr.responseText)
									};
									
									return requestCompleteResult;
								
							}
							else {
								requestCompleteResult = {
									headers:headers,
									err: httpStatus,
									xhr:(xhr.responseText || xhr.response)
								};
								
								if (httpStatus === 0) {
									; // throw new Error('Server Offline Or Unavailable');
								}
								
								return requestCompleteResult;
							}
						}
						else {

							return requestCompleteResult;
						}
            },
		
		    CreateMSXMLDocument = function(){
				 
				   var progIDs = [
							   'Msxml2.DOMDocument.3.0',
							   'Msxml2.DOMDocument',
							   "Msxml2.DOMDocument.6.0", 
							   "Msxml2.DOMDocument.5.0", 
							   "Msxml2.DOMDocument.4.0", 
							   "MSXML2.DOMDocument", 
							   "MSXML.DOMDocument"
							];
								   
					if(w.ActiveXObject){
						for(var i=0;i<progIDs.length;i++){
								try{
									  return (new ActiveXObject(progIDs[i]));
								} catch(ex){ }
						}
						return new ActiveXObject("Microsoft.XMLHTTP");
					}

                	return null;
}, Ajax = {};

Ajax.request = function(options, sync){
		
		            options = options || {};
					
					var xhr = null, deferred = new Futures(), isIE = ('XDomainRequest' in w);
					
					if(!options.context){

					    options.context = {};
					}
					
					if(!options.beforeload){
					   options.beforeload = noop;
					}
					
					try{
						    if(!options.crossdomain){
						    	xhr = CreateMSXMLDocument();
						    }	
							if(xhr === null){
							   xhr = new XMLHttpRequest();
							   if(options.crossdomain && ('withCredentials' in xhr)){
							      xhr = DOM.createHiddenIframeWithForm();
							   }
							}
							if(isIE){
							   if(options.crossdomain)
							        xhr = new XDomainRequest();
						    }else{
							    	w.XDomainRequest = noop; // just a stub!
							}
					}catch(ex){}
					 
					
					if(!options.headers){
					   options.headers = {};
					}
					
					for (var prop in options.headers){
						if (headers.hasOwnProperty(prop)) {
							xhr.setRequestHeader(prop, headers[prop]);
						}
					}

					if (sync && options.method && options.url){
					   if(xhr instanceof w.XDomainRequest){
					       xhr.open(options.method, options.url);
					       xhr.onload = function(){ // HTTP status - Ok
						       deferred.resolveWith(options.context, requestComplete(xhr, {fakeStatus:200}));
						   }
						   xhr.onerror = function(){ // HTTP status - Forbidden
						      deferred.rejectWith(options.context, requestComplete(xhr, {fakeStatus:403}));
						   }
						   xhr.ontimeout = function(){ // HTTP status - Server Unavailable
						      deferred.rejectWith(options.context, requestComplete(xhr, {fakeStatus:0}));
						   }
						   
						   xhr.onprogress = noop;
                           xhr.timeout = 0;
					   }else{

					        xhr.open(options.method, options.url, sync);
							xhr.onreadystatechange = function () {
							    if(xhr.readyState === 2){
								   options.beforeload(xhr);
								}
								if (xhr.readyState === 4) {
								   if(xhr.status >= 400){
								      deferred.rejectWith(options.context, requestComplete(xhr, {status:xhr.status, error:true}));
								   }else{
									  deferred.resolveWith(options.context, requestComplete(xhr, {status:xhr.status, error:false}));
								   }
								}
							};
					   }
					}

					//
					// research indicates that IE is known to just throw exceptions
					// on {xhr.send(...)} and it seems everyone pretty much just ignores them
					// including jQuery (https://github.com/jquery/jquery/blob/1.10.2/src/ajax.js#L549
					// https://github.com/jquery/jquery/blob/1.10.2/src/ajax/xhr.js#L97)
					//
					try {
						if(isIE 
							&& options.crossdomain){
						     options.beforeload(xhr);
						 }
						setTimeout(function(){
						  	xhr.send(options.data);
						},0);
					}catch (ex) {
						setTimeout(function(){
							deferred.rejectWith(options.context, requestComplete(xhr, {status:xhr.status, error:true, 'extras':[ex]}));
						},0);
					}

					return deferred.promise();
 };

module.exports = Ajax;