'use strict';

let JavaScriptObfuscator = require('../../dist/index');

function logCodeAndResults(code) {
  console.log(code);
  console.log(eval(code));
  console.log();
}

logCodeAndResults( 
  JavaScriptObfuscator.obfuscate(
    `
    (function(){
        var result = 1,
            term1 = 0,
            term2 = 1,
            i = 1;
        while(i < 10)
        {
            var test = 10;
            result = term1 + term2;
            console.log(result);
            term1 = term2;
            term2 = result;
            i++;
        }

        console.log(test);
        
        var test = function (test) {
            console.log(test);
            
            if (true) {
                var test = 5
            }
            
            return test;
        }
        
        console.log(test(1));
        
        function test2 (abc) {
            function test1 () {
              console.log('inside', abc.item);
            }
            
            console.log('тест', abc);
            
            var abc = {};
            
            return abc.item = 15, test1();
        };
        
        var regexptest = /version\\/(\\d+)/i;
        console.log(regexptest);
        
        test2(22);
        console.log(105.4);
        console.log(true, false);
        
        try {
        } catch (error) {
            console.log(error);
        }
    })();
    `,
    {
        disableConsoleOutput: false,
        encodeUnicodeLiterals: true
    }
  )
);

logCodeAndResults( 
  JavaScriptObfuscator.obfuscate(
    `
    var util = require("util");
    (function(){	
	var o = {
		a : [{ b: "c" }],
		require : (a) => console.log("fake-require", a),
	};
	o.require("ok");
	console.log(util.inspect(o, false, null));    
    })();
    `,
    {
        disableConsoleOutput: false,
	selfDefending : false,
        rotateUnicodeArray: false,	
	preserveFunctionCalls : ["require"]
    }
  )
);

logCodeAndResults( 
  JavaScriptObfuscator.obfuscate(
    `
    !function r(t,e,n){function o(i,u){if(!e[i]){if(!t[i]){var f="function"==typeof require&&require;if(!u&&f)return f(i,!0);if(c)return c(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var l=e[i]={exports:{}};t[i][0].call(l.exports,function(r){var e=t[i][1][r];return o(e?e:r)},l,l.exports,r,t,e,n)}return e[i].exports}for(var c="function"==typeof require&&require,i=0;i<n.length;i++)o(n[i]);return o}({1:[function(r,t,e){e.txt="call"},{}],2:[function(r,t,e){e.example=(t=>console.log("Undecorated code got a "+r("./calltxt.js").txt+" from",t))},{"./calltxt.js":1}],3:[function(r,t,e){var n=r("./inc");n.example("decorated")},{"./inc":2}]},{},[3]);
    `, {
    disableConsoleOutput: false,
	selfDefending : false,
    rotateUnicodeArray: false,
    browserifiedExclude : true,
    browserified: [
        /^\W*inc$/i,
    ],
    }
  )
);
2