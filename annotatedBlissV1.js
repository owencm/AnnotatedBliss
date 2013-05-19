/*

	This code is copyright Owen Campbell-Moore (owencmoore@gmail.com). Please contact him with any problems or with feature requests.

	Including this and the associated CSS file will render any bliss written inside tags with the class "annotated-bliss" into bliss with English beneath.

	This is an example of what to write in your HTML:

	<abliss class="annotated-bliss" symbolpath="symbols/" symbolformat="png">
		"Welcome" {welcome} "to" {to} "Blissymbols" {world writing}
	</abliss>

	The text in {} must be the name of the image without the extension (format), for example {bliss} would indicate an image at symols/bliss.png with the above example. 


    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

function renderAllBliss() {
	// Find every section of bliss text to render
	var inputList = document.getElementsByClassName('annotated-bliss');
	console.log("Found "+inputList.length+" sections of bliss to convert.")
	// Loop through and render each
	for (var i = 0; i < inputList.length; i++) {
		var inputElement = inputList[i];
		var inputText = inputElement.innerText;
        if (inputText === undefined) { //Fix for FF
            var inputText = inputElement.innerHTML;
        }
		var symbolPath = inputElement.getAttribute("symbolpath");
		var symbolFormat = inputElement.getAttribute("symbolformat");
		var html = stringToBlissHtml(inputText, symbolPath, symbolFormat);
		inputElement.innerHTML = html;
	}
	function stringToBlissHtml(string, path, format) {
		var input;
		var sections = [];
        var blissSet = [];
		var currentText = "";
		var currentBliss = "";
		var state = 0;
		try {
            var i = 0;
			while (i < string.length) { //Here we simulate a state machine to parse the text
                input = string[i];
                console.log(input);
				switch(state) {
					case 0: //Waiting for a new word
						if (input == '"') {
							state = 1;
                            i++;
						} else if (input == " " || input == "\n" || input=="\t") {
							i++;
						} else {
                            throw "Error: Invalid input at position "+i;
                        }
						break;
					case 1: //Reading the word
						if (input == '"') {
							state = 2;
                            i++;
						} else {
							currentText += input;
                            i++;
						}
						break;
					case 2: //Waiting for the bliss symbol name to start
						if (input == "{") {
							state = 3;
                            i++;
                        } else if (input == " "){ //ignore spaces
                            i++
						} else {
							throw "Error: Expected some bliss at position "+ i;
						}
						break;
					case 3: //Reading the names of the blissymbols
                        if (input == " ") { //If we see a space then we've seen one blissymbol (eat it) and are waiting for the concatenated symbol
                            blissSet.push(currentBliss);
                            currentBliss = "";
                            i++;
                        } else if (input == "}") {
                            blissSet.push(currentBliss);
							sections.push({text: currentText, bliss: blissSet});
                            blissSet = [];
							currentBliss = "";
							currentText = "";
							state = 0;
                            i++;
						} else {
							currentBliss += input;
                            i++;
						}
						break;
				}
			}
			if (state != 0) {
				throw "Error: Text ended at an invalid point";
			}
		} catch (e) {
			alert(e);
		}
		console.log("Decoded some bliss and found " + JSON.stringify(sections));
		var html = "";
		for (var i = 0; i < sections.length; i++) {
			section = sections[i];
			html += '<div class="word"><div class="symbol-container">';
            for (var j = 0; j < section.bliss.length; j++) {
                var blissWord = section.bliss[j];
                html += '<img class="word-sym" src="' + path + blissWord + "." + format + '" />';
            }
            html +='</div><div class="word-text">' + section.text + '</div></div>';
		}
		return html; 
	}
}




/*

	This code provides an onReady function without jQuery.

*/

var ready = (function(){    

    var readyList,
        DOMContentLoaded,
        class2type = {};
        class2type["[object Boolean]"] = "boolean";
        class2type["[object Number]"] = "number";
        class2type["[object String]"] = "string";
        class2type["[object Function]"] = "function";
        class2type["[object Array]"] = "array";
        class2type["[object Date]"] = "date";
        class2type["[object RegExp]"] = "regexp";
        class2type["[object Object]"] = "object";

    var ReadyObj = {
        // Is the DOM ready to be used? Set to true once it occurs.
        isReady: false,
        // A counter to track how many items to wait for before
        // the ready event fires. See #6781
        readyWait: 1,
        // Hold (or release) the ready event
        holdReady: function( hold ) {
            if ( hold ) {
                ReadyObj.readyWait++;
            } else {
                ReadyObj.ready( true );
            }
        },
        // Handle when the DOM is ready
        ready: function( wait ) {
            // Either a released hold or an DOMready/load event and not yet ready
            if ( (wait === true && !--ReadyObj.readyWait) || (wait !== true && !ReadyObj.isReady) ) {
                // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
                if ( !document.body ) {
                    return setTimeout( ReadyObj.ready, 1 );
                }

                // Remember that the DOM is ready
                ReadyObj.isReady = true;
                // If a normal DOM Ready event fired, decrement, and wait if need be
                if ( wait !== true && --ReadyObj.readyWait > 0 ) {
                    return;
                }
                // If there are functions bound, to execute
                readyList.resolveWith( document, [ ReadyObj ] );

                // Trigger any bound ready events
                //if ( ReadyObj.fn.trigger ) {
                //  ReadyObj( document ).trigger( "ready" ).unbind( "ready" );
                //}
            }
        },
        bindReady: function() {
            if ( readyList ) {
                return;
            }
            readyList = ReadyObj._Deferred();

            // Catch cases where $(document).ready() is called after the
            // browser event has already occurred.
            if ( document.readyState === "complete" ) {
                // Handle it asynchronously to allow scripts the opportunity to delay ready
                return setTimeout( ReadyObj.ready, 1 );
            }

            // Mozilla, Opera and webkit nightlies currently support this event
            if ( document.addEventListener ) {
                // Use the handy event callback
                document.addEventListener( "DOMContentLoaded", DOMContentLoaded, false );
                // A fallback to window.onload, that will always work
                window.addEventListener( "load", ReadyObj.ready, false );

            // If IE event model is used
            } else if ( document.attachEvent ) {
                // ensure firing before onload,
                // maybe late but safe also for iframes
                document.attachEvent( "onreadystatechange", DOMContentLoaded );

                // A fallback to window.onload, that will always work
                window.attachEvent( "onload", ReadyObj.ready );

                // If IE and not a frame
                // continually check to see if the document is ready
                var toplevel = false;

                try {
                    toplevel = window.frameElement == null;
                } catch(e) {}

                if ( document.documentElement.doScroll && toplevel ) {
                    doScrollCheck();
                }
            }
        },
        _Deferred: function() {
            var // callbacks list
                callbacks = [],
                // stored [ context , args ]
                fired,
                // to avoid firing when already doing so
                firing,
                // flag to know if the deferred has been cancelled
                cancelled,
                // the deferred itself
                deferred  = {

                    // done( f1, f2, ...)
                    done: function() {
                        if ( !cancelled ) {
                            var args = arguments,
                                i,
                                length,
                                elem,
                                type,
                                _fired;
                            if ( fired ) {
                                _fired = fired;
                                fired = 0;
                            }
                            for ( i = 0, length = args.length; i < length; i++ ) {
                                elem = args[ i ];
                                type = ReadyObj.type( elem );
                                if ( type === "array" ) {
                                    deferred.done.apply( deferred, elem );
                                } else if ( type === "function" ) {
                                    callbacks.push( elem );
                                }
                            }
                            if ( _fired ) {
                                deferred.resolveWith( _fired[ 0 ], _fired[ 1 ] );
                            }
                        }
                        return this;
                    },

                    // resolve with given context and args
                    resolveWith: function( context, args ) {
                        if ( !cancelled && !fired && !firing ) {
                            // make sure args are available (#8421)
                            args = args || [];
                            firing = 1;
                            try {
                                while( callbacks[ 0 ] ) {
                                    callbacks.shift().apply( context, args );//shifts a callback, and applies it to document
                                }
                            }
                            finally {
                                fired = [ context, args ];
                                firing = 0;
                            }
                        }
                        return this;
                    },

                    // resolve with this as context and given arguments
                    resolve: function() {
                        deferred.resolveWith( this, arguments );
                        return this;
                    },

                    // Has this deferred been resolved?
                    isResolved: function() {
                        return !!( firing || fired );
                    },

                    // Cancel
                    cancel: function() {
                        cancelled = 1;
                        callbacks = [];
                        return this;
                    }
                };

            return deferred;
        },
        type: function( obj ) {
            return obj == null ?
                String( obj ) :
                class2type[ Object.prototype.toString.call(obj) ] || "object";
        }
    }
    // The DOM ready check for Internet Explorer
    function doScrollCheck() {
        if ( ReadyObj.isReady ) {
            return;
        }

        try {
            // If IE is used, use the trick by Diego Perini
            // http://javascript.nwbox.com/IEContentLoaded/
            document.documentElement.doScroll("left");
        } catch(e) {
            setTimeout( doScrollCheck, 1 );
            return;
        }

        // and execute any waiting functions
        ReadyObj.ready();
    }
    // Cleanup functions for the document ready method
    if ( document.addEventListener ) {
        DOMContentLoaded = function() {
            document.removeEventListener( "DOMContentLoaded", DOMContentLoaded, false );
            ReadyObj.ready();
        };

    } else if ( document.attachEvent ) {
        DOMContentLoaded = function() {
            // Make sure body exists, at least, in case IE gets a little overzealous (ticket #5443).
            if ( document.readyState === "complete" ) {
                document.detachEvent( "onreadystatechange", DOMContentLoaded );
                ReadyObj.ready();
            }
        };
    }
    function ready( fn ) {
        // Attach the listeners
        ReadyObj.bindReady();

        var type = ReadyObj.type( fn );

        // Add the callback
        readyList.done( fn );//readyList is result of _Deferred()
    }
    return ready;
})();

ready(function(){ renderAllBliss(); });

