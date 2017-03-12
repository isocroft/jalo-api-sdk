
require('./utils');

var d = document,
 __dom = {

 		importCSSFile:function(cfile){
			var styles, newSS, url = d.location.href,
			    prtc = (d.location.protocol == "https:"),
			    indx = prtc ? 7 : 6,
			    baseURL = url.substring(0 , url.indexOf('/', indx+1));
				if(d.createStyleSheet) {
				      d.createStyleSheet(baseURL+cfile);
				}else {
					  styles = "@import url('"+ baseURL+cfile +"');";
					  newSS = d.createElement('link');
					  newSS.rel = 'stylesheet';
					  newSS.href = 'data:text/css,'+escape(styles);
					  (d.getElementsByTagName("head")[0]).appendChild(newSS);
				}
		},
		getScriptAttribute:function(){
			return '';
		},
		getHead:function(){
			return d.head || d.documentElement.children.item(0) || d.getElementsByTagName('head')[0];
		},
		InternalStyleById:function (id){
		    var head = this.getHead();
			return (head.getElementById(id) && head.getElementById(id).firstChild && head.getElementById(id).firstChild.nodeValue);
		},

		includeStyleSheet : function (rules, md){
		    var base = d.createElement("style");
		    base.media = (md)? md : 'all';
		    base.type = "text/css";
		    if(base.styleSheet){
		        base.styleSheet.cssText = rules;
		    }else{
		        base.appendChild(d.createTextNode(rules));
		    }
		    return base;
		},

		fixIEOverflowIssue : function () {
  			// only apply to IE
  			if (!/*@cc_on!@*/0) return;

  			// find every element to test
  			var all = d.getElementsByTagName('*'), i = all.length;

  			// fast reverse loop
  			while (i--) {
    				// if the scrollWidth (the real width) is greater than
    				// the visible width, then apply style changes
    				if (all[i].scrollWidth > all[i].offsetWidth) {
      					all[i].style['paddingBottom'] = '20px';
      					all[i].style['overflowY'] = 'hidden';
    				}
  			}
		},

		getElements : function (selector, parent) {
                         var elements = [],
			     			 singleIdElement = /^#[\w_-]+$/,
                             i = 0,
                             length,
                             obj,
                             style,
                             nodes, //to store the list of child nodes
                             node;  //single node

                        // set parent to d if not passed
                        parent = parent || d;
						selector = typeof selector == "string" ? selector : "";

						if(singleIdElement.exec(selector)){
							selector = selector.substring(1);
							if(d.all){
								elements.push(d.all[selector]);
							}else{
								elements.push(d.getElementById(selector));
							}
							return elements;
						}

                       // if the browser does not support querySelectorAll we need to do it ourselves
                       if (parent.querySelectorAll) {
                              obj = parent.querySelectorAll(selector);
                              
                             // convert object/function to array of elements
                             if ((typeof obj === 'object' || typeof obj === 'function') && typeof obj.length === 'number') {
                                    for (i = 0; i < obj.length; i++) {
                                           elements.push(obj[i]);
                                    }
                             } else if (typeof obj === 'array') {
                             	    elements = obj;
                             }
                       } else if (d.createStyleSheet) {
                             if (d.styleSheets.length) { // IE requires you check against the length as it bugs out otherwise
                                    style = d.styleSheets[0];
                             } else {
                                    style = d.createStyleSheet();
                             }

                             // split selector on comma because IE7 doesn't support comma delimited selectors
                             var selectors = selector.split(/\s*,\s*/),
                                    indexes = [],
                                    index;
                             for (i = 0; i < selectors.length; i++) {
                                    // create custom (random) style rule and add it to elements
                                    index = style.rules.length;
                                    indexes.push(index);
                                    style.addRule(selectors[i], 'aybabtu:pa', index);
                             }

                             // get all child nodes (document object has bugs with childNodes)
                             if (parent === d) {
                                    nodes = parent.all;
                             } else {
                                    nodes = parent.childNodes;
                             }

                             // cycle through all elements until we find the ones with our custom style rule
                             for (i = 0, length = nodes.length; i < length; i++) {
                                    node = nodes[i];
                                    if (node.nodeType === 1 && node.currentStyle.aybabtu === 'pa') {
                                           elements.push(node);
                                    }
                             }

                             // remove the custom style rules we added (go backwards through loop)
                             for (i = indexes.length - 1; i >= 0; i--) {
                                    style.removeRule(indexes[i]);
                             }
                       }
                       return elements;
                },

                // cross browser add event listener
                addListener : function (element, event, callback) {
                	   var _temp;
                       if (element.addEventListener) {
                             element.addEventListener(event, callback, false);
                       } else if (element.attachEvent) {
                             return element.attachEvent('on' + event, callback);
                       } else{
                       	     _temp = element['on'+event];
                       	     if(typeof ____ == "function"){
                                  ____.$$formerCallback = _temp;
                             }     
                       	     return (element['on'+event] = ____);
                       }

                       function ____(e){
                       	     	 if(typeof callback == "function"){
                       	     	 	 callback.call(this, e);
                       	     	 }	 
                       	     	 if(typeof ____.$$formerCallback == "function"){
                                      ____.$$formerCallback.call(this, e);
                       	     	 }
                       }
                },
                // cross browser remove event listener
                removeListener : function (element, event, callback) {
                	   var _temp, formerCallback, dumpArr = ["",""];
                       if (element.removeEventListener) {
                             element.removeEventListener(event, callback, false);
                       } else if (element.detachEvent) {
                             return element.detachEvent('on' + event, callback);
                       } else{
                       	     _temp = element['on'+event];
			     			 if(typeof _temp == "function"){	
                       	     	if(_temp.name && _temp.name == "____" 
				  					|| (/\s*function\s*(.*)?/.exec(String(_temp)) 
				  						|| dumpArr)[1] == "____"){
                                 	formerCallback = ____.$$formerCallback;
                       	     	}
                             	element['on'+event] = null;
                             	element['on'+event] = formerCallback;
                            }
                       }
                },
				getElementPixelStyle : function(elem, prop) { 
						var numericPropsWithUnits = [
							"paddingTop",
							"paddingLeft",
							"width",
							"paddingBottom",
							"paddingRight",
							"height",
							"marginTop",
							"marginLeft",
							"fontSize",
							"marginBottom",
							"marginRight",
							""
						];
						
			  			var value;

						if(elem.currentStyle){

							value = elem.currentStyle[prop] || 0;

							if(numericPropsWithUnits.indexOf(prop) == -1){
								return this.fromRgba(value);
							}
			 
							if(value.indexOf("px") == -1){
			  					// we use 'left' property as a place holder so backup values
			  					var leftCopy = elem.style.left
							
			  					var runtimeLeftCopy = elem.runtimeStyle.left
			  					// assign to runtimeStyle and get pixel value
			  					elem.runtimeStyle.left = elem.currentStyle.left
			  					elem.style.left = (prop === "fontSize") ? "1em" : value
			  					value = elem.style.pixelLeft + "px";
			  					// restore values for left
			  					elem.style.left = leftCopy
			  					elem.runtimeStyle.left = runtimeLeftCopy
							}
			  			}else if(window.getComputedStyle){
							value = window.getComputedStyle(elem, null).getPropertyValue(this.decamelize(prop, "-"));

							if(numericPropsWithUnits.indexOf(prop) == -1){
								return this.fromRgba(value);
							}
						}
						return value;

				},
				camelize:function(str, delim){
				    var rx = new RegExp(delim+"(.)","g");
				    return s.replace(rx, function (m, m1){
				      return m1.toUpperCase()
				    });
				},
				decamelize : function(str, delim){
				   	return str.replace(/([A-Z])/g, delim+"$1").toLowerCase();
				},
				reverseString : function(initstr){
			        if(typeof(initstr) == 'string'){
			           var rev = '';
				       for(var s = (initstr.length - 1); s >= 0; s--){
				          rev += initstr.charAt(s);
				       }
				        return rev;
			        }else{
			           return;
			        }
			    },
				isNodeDisconnected : function(obj){
		   			return (obj && isNode(obj) && obj.offsetParent === null); 
				},     
				isWinFullScreen : function (){
		 			 window.screen.height === (window.innerHeight || d.documentElement.scrollHeight) && window.screen.width === (window.innerWidth || d.documentElement.scrollWidth);
				},
				isNode:function(node){
					if(!node) return; 
		 			var doesInterfaceExist = (typeof(Node)=="object" || typeof(Node)=="function");
		 			if(doesInterfaceExist){
		  				return (node instanceof Node &&  'innerHTML' in node);
		 			}else{
						return (typeof(node.nodeType) == "number");
					}
				},
				isElementNode:function (elemnode){
					var z = isNode(elemnode)
					return (z && elemnode.nodeType == 1 && elemnode.appendChild !== undefined)? true : false;
				},
				isAttributeNode:function(attrnode){
					var q = isNode(attrnode)
					return (q && attrnode.nodeType == 2)? true : false;
				},
				isTextNode:function(textnode){
					var a = isNode(textnode)
					return (a && textnode.nodeType == 3 && textnode.nodeValue !== undefined)? true : false;
				}
 };

module.exports = __dom;