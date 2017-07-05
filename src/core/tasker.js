/**
 */

var Future = require('./promise'),
	get_id = function(){
		var stretch = String.fromCharCode(36 + (Math.random() * 10));
		return Math.random((new Date).getTime())
					.toString(36)
					.replace('.', stretch);
	};

function TaskQueue(contextObj){

   // @REM: a queue is a FIFO data structure
   
   this.methods = {}; // callback queue container
   this.methodsOrder = [];
   this.response = null; // async/sync response
   this.first = null; // the first task object in the queue
   this.flushed = false; // flush flag
   this.context = contextObj; // queue context object
   this.isDaemon = function(){ return true; };   
   this.setIndex = function(arr, aVal, indx){
      if(typeof arr[indx] == "undefined") indx = arr.length - 1, _temp;
          for(var i =0; i < arr.length; i++){
            if(arr[i] === aVal){
                if(arr[indx] != aVal){ 
                   _temp = arr[i];   
                   arr[i] = arr[indx];
                }
               	arr[indx] = _temp;
           }
      }
   }       
}  

TaskQueue.prototype.enqueue = function(fn, args){  // fn: Function, args: Array
     var ag = args, 
         id = get_id();
       	if(typeof fn != "function") return;
	   	ag = (ag instanceof Array && ag) || [ag];
	   	if(this.flushed){
	        fn.apply(this, ag); // assump: if the queue has been flushed, then the async response should be available as "ag"
	  	}else{ 
	        //this.methods.unshift({"task":fn,"args":ag});
	         this.methods[id] = {"task":fn,"args":ag};
	         this.methodsOrder.push(id);
	         this.first = this.methods[this.methodsOrder[0]];			   
	  	}

		return id;
};

TaskQueue.prototype.dequeue = function(arg){
  if(!this.first){
     return -1;
  }
  this.first["args"].push(arg);
      this.response = this.first["task"].apply(this, this.first["args"]);
  if(this.methodsOrder.length){
      delete this.methods[this.methodsOrder[0]];
      this.methodsOrder.shift();
      try{
          this.first = this.methods[this.methodsOrder[0]];
      }catch(ex){ return -1; }
  }    
  return this.remaining();
};
	   
TaskQueue.prototype.putToBack = function(id){
   var index = this.methodsOrder.indexOf(id);
   if(index == -1){
      return false;
   }
   var id = this.methodsOrder[index];
   this.setIndex(this.methodsOrder, id, (this.methodsOrder.length - 1));
};

TaskQueue.prototype.bringToFront = function(id){
     var index = this.methodsOrder.indexOf(id);
   if(index == -1){
      return false;
   }
   var id = this.methodsOrder[index];
   this.setIndex(this.methodsOrder, id, 0);
};
	   
TaskQueue.prototype.remaining = function(){

  	return this.methodsOrder.length;
};
	   
TaskQueue.prototype.reinit = function(){
  	this.flushed = false;
	return true;
};

TaskQueue.prototype.flushInBackground = function(callback){ 
  var _self = this,
  	  promise = new Future(); 
  	  promise.then(callback);   
   	  setTimeout(function(){
      		_self.syncFlush(function(){ 
      				promise.resolve.apply(promise, [].slice.call(arguments)); 
      		});
 	  }, 0);

  	return promise;
};

TaskQueue.prototype.asyncFlush = function(callback){
  var _self = this,
      next = function(){
        var id  = _self.methodsOrder.shift(),
            method = _self.methods[id], 
    		args;
        delete _self.methods[id];
        _self.response = [].slice.call(arguments);
        method["args"].unshift(arguments.callee);
        method["task"].apply(_self, method["args"]); 
  };
  next(null);
};

/*
function task(next){
 [c] is the response from the preceeding task 
  
var args = [].slice.call(arguments, 1);

 var currentCalingContext = this.context;
 var precedingTaskResponse = this.response; 
 var v = Math.pow(4, 2); // [v] is the response from this task

 return next(v); 
}
*/
	   
TaskQueue.prototype.flushWith = function(fnc){
     // fnc - callback to apply to each item in the queue
};
	   
TaskQueue.prototype.syncFlush = function(callback){
   if(this.flushed) return; // the queue can only be flushed once until it is reinitialised!!
	   var remaining = this.remaining(); 
	   while(remaining){
	      remaing = this.dequeue();
	   }
	   this.flushed = true; // the queue has now been flushed!!
 		callback(this.flushed);
};

    

module.exports = TaskQueue;