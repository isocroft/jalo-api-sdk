 var ob = ({}),
     hOwn = ob.hasOwnProperty,
     toStr = ob.toString,
     isNullOrUndefined = function(subject){ 
 		return (subject === null || subject === undefined); 
 	};


if(!Function.prototype.bind){
    Function.prototype.bind = function(obj) {
                
         var  args = [].slice.call(arguments, 1),
         self = this,
         nop = function () {},
         bound = function () {
             return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
         };
        
        nop.prototype = self.prototype;
        
        bound.prototype = new nop();
        
        return bound;
    };
}	

 Object.each = function(){

 }

 Object.empty = function(){
 
 };
 
 Object.keyExists = function(d, key){
	    return !!d[key] && hOwn.call(d, key);
 };

 Object.getKeyCount = function(d, all){ 
	     var count=0;
		 for(var n in d){
		    if(!all && Object.keyExists(d, n))
	            count++;
			else
	            count++;											
		 } 
        return count;
 };

 Object.clearKeys = function(d){
 	      for(var n in d){
		     if(Object.keyExists(d, n))
 	      	       delete d[n];
 	      }
 };
                                                
 // Shim missing functionality for ES5 global Generics

 Object.create = Object.create || function (fi) {

               if (typeof (fi) != 'object' 
               		&& typeof (fi) != 'function'){
                       return;
               }

               var j = new Function();

               j.prototype = fi;

               return (new j());

 }
 
 Object.keys = Object.keys || function (fu){
                if (typeof (fu) != 'object' 
                	&& typeof (fu) != 'function') {
                        return;
                }

                var j = [];
                for (var k in fuc) {
                      if(hOwn.call(fuc, k)) {
                            j.push(k)
                      }
                }
                var l = !ob.propertyIsEnumerable('toString'), 
				    m = [
				    	 'toString', 
				    	 'toLocaleString', 
				    	 'valueOf', 
				    	 'hasOwnProperty', 
				    	 'isPrototypeOf', 
				    	 'prototypeIsEnumerable', 
				    	 'constructor'
				    	];

                if(l){
                     for (var n = 0; n < m.length; n++) {
                            var o = m[n];
                            if(hOwn.call(fuc, o)) {
                                 j.push(o);
                            }
                     }
                }
                return j;
}

Array.filter = Array.filter || function (arr, func, i) {
          if (!(arr instanceof Array) 
          	&& typeof(func) != 'function') { 
          		return; 
          }
          var f, x = arr, n = [];
          for (d = 0; d < x.length; ++d){

                f = x[d];

                if (func.call(i, f, d, x) === true){
                        n.push(f);
                }
          }
       return n;
}
    
   
 String.replace = String.replace || function (a, RE, out) {
                 if (typeof(this) == 'function') {
                         this.apply(ob, new Array(arguments));
                 }
                 if (typeof (a) != 'object') {
				        return; 
				 }
                 var Comp = [];
                 for (var i = 0; i < a.length; i++){
                             Comp[i] = a[i].replace(RE, out);
                 }
                 if (Comp) { return Comp; }
                 return null;
}
    
    
Array.isArray = Array.isArray || function (arr) {
       return arr && (arr instanceof Array);
}
							
Array.isArrayLike = function(obj){
     
	 if(isNullOrUndefined(obj)){
	     return false;
	 }
	  
	   if("length" in obj){
	   
	        if((obj.window) 
	        	|| (typeof obj === "function")){
			    return false;
			}
		 
		    return "NaN" !== String((Math.max(parseInt((obj).length), -1)));
			 
	   }	 
	 
	  return false;
	  
}
							
							
Array.inArray = Array.inArray || function(arr, arrElem) {
               for (var i = 0; i < arr.length; i++) {
                   if (arr[i] === arrElem) return true;
               }
               return false;
}

Object.each = function (obj, iterator, context) {
             var key, length, temp, results; 
			 
             if (obj) {
                             if (typeof obj === "function") {
							  		results = (function(){});
		                            for (key in obj) {
			                             // Need to check if hasOwnProperty exists,
			                             // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
			                             if (key != 'prototype' 
			                             	&& key != 'length' 
			                             		&& key != 'name' 
			                             			&& (!obj.hasOwnProperty || hOwn.call(obj,key))){
			                                  temp = iterator.call(context, obj[key], key, obj);
											  if(!isNullOrUndefined(temp))
											      results[key] = temp;
			                             }
		                            }
                             } else if (Array.isArray(obj) || Array.isArrayLike(obj)) {
	                             var isPrimitive = typeof obj !== 'object'; 
								 results =  [];
	                             for (key = 0, length = obj.length; key < length; key++){
		                             if (isPrimitive || key in obj) {
		                                  temp = iterator.call(context, obj[key], key, obj);
										  if(!isNullOrUndefined(temp))
										       results.push(temp);
		                             }
	                             }
                             } else if (obj.forEach) {
							      results = [];
                                  obj.forEach(function(){ 
								        temp = iterator.apply(this, slice.call(arguments)); 
										if(!isNullOrUndefined(temp))
								            results.push(temp);
								  }, context);
                             } else {
							  	    results = {};
	                                for (key in obj) {
			                             if (hOwn.call(obj, key)) {							       
			                                    temp = iterator.call(context, obj[key], key, obj);
											    if(!isNullOrUndefined(temp))
												    results[key] = temp;
			                             }
                             	    }
                             }
             }
             return (results)? results : obj;
 }

module.exports = {};