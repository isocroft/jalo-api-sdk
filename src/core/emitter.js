
"use strict";

require('./utils');
						 
var handlers = {}, 
					  
  reparate = function(array){
		 var obj = {};
		 Object.each(array, 
			 function(val){ 
				 this[val.name] = val.result;  
			 }, 
		 obj);
		 return obj;
  },
 
  timers = {},

  queues = {},

  getDelay = function(num){
      return Math.ceil(1 + Math.random() * num);
  },
  
  normaliseScope = function(e){
     return (e.indexOf('->', 0) > 0)? e.split('->', 2) : [];
  },
						 
  __emitter = {
						 
                                emit:function(evt){
								    
								    var scope, f=-1, res=[], nx, base = {}, set, data = [].slice.call(arguments, 1), ah = false;
									
									scope = normaliseScope(evt);
									
									if(scope.length){
									    evt = scope[0];
										scope[0] = String(ah);
										ah = handlers[evt];
									}else{
									    scope.push([]);
									    ah = handlers[evt];
								    }	
									
                                    if(ah){
                                        while(f < ah.length - 1){
										    f=f+1;
										    nx = ah[f]["name"];
										    if(!!scope[0][0]){
											   if(scope[1] === nx)
											        scope[0] = true;											  
											   else
                                                    continue; 	  
											}
                                            res.unshift({result:ah[f]["fn"].apply(ah[f]["cxt"], data), name:nx});
											if(res[0].result === null || typeof res[0].result === "undefined"){
											     res.shift();
											}
											if(scope[0] === true){
											    break;
											}
						                } 
                                    }

			                        f=0; 
									/*  ----> USAGE:
									        var $e = $cdvjs.Application.command("emitter"); 
									        $e.on("subject:onstore", 
											       function(data){ 
												         ... 
													     this.notify(data);
												   }, 
											        {
												      notify:function(){ ... },
													  addObserver:function(){ ... }
												    }
											);
									        var ty = $e.emit("onstore", true); 
									        var details = ty.onstore["subject"];
                                                OR											
											var details = ty.onstore["0"]
											
											.....
											
											var ty = $e.emit("onstore->subject", {});
											var details = ty.onstore;
											if(details){
											    ty = details.subject;
											}
									*/
									
									base[evt] = (res.length)? reparate(res) : null;
							        return base;
                                },
                                on:function(evt, callback, context){ 
                                      var name, self = this, scope = (evt.indexOf(":") > -1)? evt.split(":", 2) : evt;
                                        if(typeof evt != "string" || typeof callback != "function"){
			                                        return;
			                            }
										evt = (typeof scope === "string")? scope  : scope[1];
			                            // initialise (where necessary)
			                            if(!Object.keyExists(handlers, evt)){ 
                                                handlers[evt] = []; 
                                        }
										
										name = (Array.isArray(scope))? scope[0] : ""+handlers[evt].length; 
			  
			                            // capture all props for handler
			                            handlers[evt].push({
										        name:name,
			                                    cxt:context,
			                                    fn:callback,
					                            timestamp:(new Date).getTime() // just for sorting purposes... 
			                            });
			  
			                            // rearrange in order of entry/insertion
			                            handlers[evt].sort(function(a, b){
			                                   a.timestamp - b.timestamp;
			                            });
			  
                                        return self; // chaining
                                },
								once:function(evt, callback, context){
								
								},
                                has:function(evt){
                                        return (!evt)? !!evt : handlers.hasOwnProperty(evt);
                                },
                                poof:function(){
                                       handlers = {};
                                },
								emitList:function(events, data, context){
								      var result = {}, scope, ev;
								      if(Array.isArray(events)){
									      for(var d=0; d < events.length; d++){
										      ev = events[d];
										      scope = (normaliseScope(ev)[0] || ev);
										      result[scope] = this.emit(ev, data, context)[scope];
										  }	 
									  }	
                                      result;									  
								},
								queue:function(event, data){ 
											var self = this, queue = queues[event], event = event;
											
											if(!Array.isArray(queue)){
											    queue = queues[event] = [];
											}
											
											queue.push(data);
											queue.lastLength = queue.length;
											queues[event] = queue;
											return {
												emitWhenFree:function(context){
												   var _self = this, evt = event, timer = timers[evt];
												   if(Array.isArray(timer) && timer.length){
													   ;
												   }else{
												       timer = timers[evt] = [];
												   }
												   
												   timer[timer.length] = setTimeout(function setup(){
														var tick = false, _queue = queues[evt];
														console.log(_queue.lastLength+'queue '+_queue+'ppppppppp '+_queue.length);
														if(Array.isArray(_queue) && _queue.length){
															if(_queue.length === _queue.lastLength){
																_self.emit(evt, context, _queue.length);
																tick = true;
															}   
														}
														
														setup.delay = ((setup.delay * 2) || 500);
														if(Array.isArray(timers[evt]) && timers[evt].length)
														    timers[evt][timers[evt].length] = setTimeout(setup, (tick? getDelay(setup.delay) : getDelay(setup.delay = (setup.delay/2))));
												   }, 300);
												   timers[evt] = timer;						   
												},
												flush:function(){
													self.flush();
												},
												emit:function(evt, context, num){
												    var _queue = queues[evt];
													self.emit(evt, (_queue.shift()), context);
													_queue.lastLength = _queue.length;

													if(_queue.length === 0){

													     num = _queue.length;
														delete queues[evt];
													}else{

													    queues[evt] = _queue;
														queues[evt].splice(num, 1);
													}	
														if(timers[evt][num]){

														    clearTimeout(timers[evt][num]);
															timers[evt].splice(num, 1);

															if(timers[evt] && timers[evt].length == 0){
														         delete timers[evt];
															}else{
															     timers[evt].splice(num, 1);
															}	 
														}  
													
												}
											}
								 },
								 flush:function(){
								      /* more code here */
								 },
                                 off:function(evt, target){
                                   var hj = [], self = this;
                                   if(handlers[evt]){
								       if(target === null || typeof target == "undefined"){
                                            delete handlers[evt];
									   }else{
									        Array.filter(handlers[evt], function(v, k){
											      if(v && v.name === target){
												      return (!!hj.push(k)); 
												  }
											});
									        Object.each(hj, function(v){
											       this.splice(v, 1);
											}, handlers[evt]);
									   }
                                            									   
                                   }
								   return self; // chaining
                                 }
 };

 module.exports = __emitter;