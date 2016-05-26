"use strict";
const index_1 = require("../index");
let obfuscatedCode = index_1.JavaScriptObfuscator.obfuscate(`
    var util = require("util");
    (function(){	
	var o = {
		a : [{ b: "c" }],
		require : (a) => console.log("fake-require", a),
	};
	o.require("ok");
	console.log(util.inspect(o, false, null));    
    })();
    `, {
    disableConsoleOutput: false,
    rotateUnicodeArray: false,
    preserveFunctionCalls: ["require"]
});
console.log(obfuscatedCode);
console.log(eval(obfuscatedCode));
