import { JavaScriptObfuscator } from "../index";

let obfuscatedCode: string = JavaScriptObfuscator.obfuscate(
    `
    !function r(t,e,n){function o(i,u){if(!e[i]){if(!t[i]){var f="function"==typeof require&&require;if(!u&&f)return f(i,!0);if(c)return c(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var l=e[i]={exports:{}};t[i][0].call(l.exports,function(r){var e=t[i][1][r];return o(e?e:r)},l,l.exports,r,t,e,n)}return e[i].exports}for(var c="function"==typeof require&&require,i=0;i<n.length;i++)o(n[i]);return o}({1:[function(r,t,e){e.txt="call"},{}],2:[function(r,t,e){e.example=(t=>console.log("Undecorated code got a "+r("./calltxt.js").txt+" from",t))},{"./calltxt.js":1}],3:[function(r,t,e){var n=r("./inc");n.example("decorated")},{"./inc":2}]},{},[3]);
    `,
    {
        disableConsoleOutput: false,
        rotateUnicodeArray: false,
	browserified : [
		"-",
		//0, // shortcut for any module in default modules array
		/^\W*inc$/i, 
	],
    }
);

console.log(obfuscatedCode);
console.log(eval(obfuscatedCode));
