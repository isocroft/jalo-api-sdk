"use strict";

require('./utils');

var _curry = function (func, args, context){
	return function(){
		var _args = [].slice.call(arguments);
		return func.apply(context, args.concat(_args)); 
	}
 },
 futuresStates = {
      STARTED:0,
      AWAIT:1,
      RESOLVED:2,
      REJECTED:3
 },
 formatOptions = function(opts){
  	var options = {}, _opts = String(opts).split(",");
      _opts.forEach(function(key){
            options[key] = true;
      });
	  options.savedData = !1;
      return options;
 },
 Routines = function(opts){
	var options = formatOptions(opts),
       fireStart,
       fireEnd,
       index,
       fired,
       firing,
       pending = [],
       queue = options.multiple && [],
       fire = function(data){
             options.savedData = !fire.$decline && options.save && data; // save it only when we are not rejecting {fire.$decline != true}!
             fired = true;
             firing = true; // firing has begun!
             index = fireStart || 0;
             fireEnd = pending.length;
             for(fireStart = 0; index < fireEnd; index++){
             		// @TODO: need to curry args instead of directly binding them
                  setTimeout(_curry(pending[index], data[1], data[0]) /*.bind(data[0], data[1])*/, 20); // fire asynchronously (Promises/A+ spec requirement)
             }
             firing = false; // firing has ended!

             if(queue){ // deal with the queue if it exists and has any contents...
                 if(queue.length){
				     return fire(queue.shift()); // fire on the {queue} items recursively
                 }
                  // if queue is empty.... then end [flow of control] at this point!
             }

             fire.$decline = false;
			 
	if(options.savedData){
		if(options.unpack){
		    // clear our {pending} list and free up some memeory!!
			pending.length = 0; // saves the reference {pending} and does not replace it!
		}
	}
};
	
	return {
    add:function(){
        var len = 0;
        if(pending){ // if not disbaled
            
            var start = pending.length;
            (function add(args){
             
                   args.forEach(function(arg){
				          var type = typeof arg;
                          
                          if(type == "function"){
                             len = pending.push(arg);
                          }else{
                             if(!!arg && arg.length 
                             	&& typeof arg != "string"){

                             	 // inspect recursively
                                 add([].slice.call(arg)); 
                             }
                          }
                   });
             
             }([].slice.call(arguments)));
            
            
			if( fired ){ // if we have already run the {pending} list of routines at least once, ...
				   if(options.join){
					  fireStart = start; 
					  fireEnd = len; // update info again...
					  fire.$decline = true;
					  fire( options.savedData ); // fire with the saved data 
					  this.disable();
					  
				   }  
			}
            
            
        }
        return len;
    },
    hasFn:function(fn){
	    var result = false;
        Object.each(pending, function(val){
		     if(typeof fn === "function" && fn === val)
			      result = true;
		}, this);
		return result;
    },
    hasList:function(){
        return !!pending; // [false] only when the disabled(); method has been called!!
    },
    fireWith:function(/* context, args */){
        if(pending && (!fired || queue)){
            var args = arguments.length && [].slice.call(arguments) || [null, 0];
            
            if(firing){ // we are currently iterating on the {pending} list of routines
                queue.push( args ); // queue assets for recursive firing within {fire} function later
            }else{
                fire( args );
            }
        }
    },
    disable:function(){
	    if(!options.savedData){
             pending = queue = undefined;
	    }
    }
  };
    
},

// Futures constructor - Promises/A+ Spec Implementation (Influenced by jQuery though...)
Futures = function(){
	
    var defTracks = {
        resolve:['ok', 'RESOLVED', Routines(['join', 'save'])],
        reject:['err', 'REJECTED', Routines(['join','save'])],
        notify:['progress', 'AWAIT', Routines(['join', 'multiple'])]
    },
    self = this,
    keys = Object.keys(defTracks),
    setter = function(dx, arr,  forPromise){
        var drop = (dx != "notify");
        if(!arr.length && !forPromise) return defTracks[dx][2].fireWith;
        return (!forPromise)? function(){
            if(self.state >= 0 && self.state <=1){
                self.state = futuresStates[defTracks[dx][1]];
            }
            defTracks[dx][2].fireWith(self === this? self : this, [].slice.call(arguments));
            if(drop){
			    defTracks[arr[0]][2].disable();
                defTracks[arr[1]][2].disable();
			    switch(dx){	
				   case "reject":
				   case "resolve":
				      self.state = futuresStates[defTracks[dx][1]];
				   break;
			    }	
			}
            return true;
        } : function(){
            if(self.state >= 0 && self.state <=1){
                defTracks[dx][2].add.apply(self, [].slice.call(arguments));
            }
            return self;
        } ;
    },
    i = 0,
    ax = keys.slice(),
    d,
    promise = {};
    
    
    // using a closure to define a function on the fly...
    for(d in defTracks){
        if(Hop.call(defTracks, d)){
            keys.splice(i++, 1);
            self[d] = setter(d, keys);
            self[d+"With"] = setter(d, []);
            promise[defTracks[d][0]] = setter(d, [], true);
            keys = ax.slice();
        }
    }
    
    promise.state = futuresStates.STARTED;
	
    promise.any = function(){
        return this.ok.apply(self, arguments).err.apply(self, arguments);
    };
	
    promise.promise = function(obj){
        if(obj 
        	&& typeof obj == "object" 
        		&& !obj.length){
            for(var i in promise){
                if(Hop.call(promise, i)){
                    obj[i] = promise[i];
                }
            }
            return obj;
        }
        return promise;
    };
	
    promise.then = function(/* fnDone, fnFail, fnProgress */){
        var ret, args = [].slice.call(arguments);
        args.forEach(function(item, i){
             item = (typeof item == "function") && item;
             self[defTracks[keys[i]][0]](function(){
			       var rt;
			       try{ // Promises/A+ specifies that errors should be conatined and returned as value of rejected promise
                       rt = item && item.apply(this, arguments);
                   }catch(e){ 
				       rt = this.reject(e);
				   }finally{
				       if(rt && typeof rt.promise == "function")
                            ret = rt.promise();						   
				   }	   
             });
        });
        return self.promise(ret);
    };
	
    promise.isResolved = function(){
        return !defTracks['reject'][2].hasList();
    };
    promise.isRejected = function(){
        return !defTracks['resolve'][2].hasList();
    };
    promise.pipe = promise.then;
    
    promise.promise(self);
    
    Futures.STARTED = futuresStates.STARTED;
    Futures.AWAITING = futuresStates.AWAIT;
    Futures.RESOLVED = futuresStates.RESOLVED;
    Futures.REJECTED = futuresStates.REJECTED;
    
    /* avoid leaking memory with each call to Futures constructor!! */
    setter = ax = d = i = null; 
    
	/* enforce {new} on constructor */
	return (self instanceof Futures)? self : new Futures();
},

module.exports = Futures;