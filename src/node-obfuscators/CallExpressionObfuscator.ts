import * as estraverse from 'estraverse';

import { IIdentifierNode } from "../interfaces/nodes/IIdentifierNode";
import { IArrayExpressionNode } from "../interfaces/nodes/IArrayExpressionNode";
import { IObjectExpressionNode } from "../interfaces/nodes/IObjectExpressionNode";
import { IPropertyNode } from "../interfaces/nodes/IPropertyNode";
import { ILiteralNode } from "../interfaces/nodes/ILiteralNode";
import { ICallExpressionNode } from "../interfaces/nodes/ICallExpressionNode";
import { INode } from "../interfaces/nodes/INode";

import { NodeType } from '../enums/NodeType';

import { NodeObfuscator } from './NodeObfuscator';
import { Nodes } from "../Nodes";
import { Utils } from '../Utils';

/**
 *  1. Preserves global functions calls
 *  Most common usage is for require function - we need to keep function name and arguments 
 *  unobfuscated for third party processors (like browserify) to recognize them.
 *  2. Detects browserify bundle structures.
 *  See example at the end of the file and gatherBrowserifyIDs function.
 */
export class CallExpressionObfuscator extends NodeObfuscator {

    /**
     * @param callExpressionNode
     */
    public enterNode (callExpressionNode: ICallExpressionNode): any {
        // if we are calling some global function in preserveFunctionCalls - skip obfuscation of all arguments and call itself
        if (Nodes.isIdentifierNode(callExpressionNode.callee) && this.isFunctionCallToPreserve(<IIdentifierNode>callExpressionNode.callee))
                return estraverse.VisitorOption.Skip;

        // check if this call is a root browserify call, see description in func
        this.gatherBrowserifyIDs(callExpressionNode);
    }
    
    /**
     * @param callExpressionNode
     */
    public obfuscateNode (callExpressionNode: ICallExpressionNode): void {	
    }

    /**
     * @param inode
     */
    private isFunctionCallToPreserve(inode : IIdentifierNode) : boolean {
        let preserveFunctionCalls = this.options.get<string[]>('preserveFunctionCalls');
        if (!preserveFunctionCalls) return false;
        
        return preserveFunctionCalls.some((funcName) => inode.name == funcName);
    }
    
    // This function checks if there are any calls upper in the hierarchy.
    // Only the first anonymous function call close within a few (preferrably 0) steps from Program node can be qualified as browserify call.
    private isRootCall(node: INode, step : number): boolean {	
        if (!node || step > 4 || node.type == NodeType.CallExpression) return false;
        if (node.type == NodeType.Program) return true;
        return this.isRootCall(node.parentNode, step+1);
    }

    /**
     * @param callExpressionNode
     */
    private gatherBrowserifyIDs (callExpressionNode: ICallExpressionNode): void {	
        /* See browserified source code example at the end of this file.
           Basically browserified bundle consists of a single anonymous function call. 
           Function itself defines all the methods required for implementing require, exports, etc. functions used from module.
           Function will have a 3 args:
                      First one is a object collection of all modules, like { moduleId : [ moduleFunc, { depModule : depId } ], id : [ ... }
                      Second one
                      Third one is a array of startup modulesIds
           moduleId - just module index, beginning with 1.
           moduleFunc - source code of module wrapped with anonymous function
           depModule - name of dependency module (like "fs", or "./B.js")
           depId - dependancy module id
        */
 
        // we are looking for only 3 argument calls
        if (callExpressionNode.arguments.length != 3) return;
	
        // is browserified option even specified?
        let browserified = this.options.get<string[]>('browserified');
        if (!browserified || browserified.length == 0) return;
        
        // only the top call in Program hierarchy is considered as browserify call, ensure parents are not calls
        if (!this.isRootCall(callExpressionNode.parentNode, 0)) return;
	
        // get the pure modules IDs (numbers) from option
        let list : number[] = browserified.filter(v=>!!Number(v) && Number(v) > 0).map(v=>Number(v));
        // if any of values in option array is 0 - add all startup modules to list (from last browserify call argument)
        if (browserified.some(v=>Number(v) == 0)) list = list.concat((<IArrayExpressionNode> (callExpressionNode.arguments[2])).elements.map(a => <number>((<ILiteralNode>a).value)));
	
        // decode text values from list considering them regexes for modules names and append to modules IDs list
        list = Array.prototype.concat.apply(list, 
                // for each module
                (<IObjectExpressionNode>(callExpressionNode.arguments[0])).properties
                // get the dependancy modules list (second array item)
                .map(p => (<IObjectExpressionNode>((<IArrayExpressionNode>((<IPropertyNode>p).value)).elements[1])).properties
                        // try to match it with Regexes made from all non-number browserify option array items
			.filter(p=>browserified.some(v=> !Number(v) && Number(v) != 0 && 
                                // function to check string is not null and ensure it matches anything in browserified option literals
                                (((name : string) =>(!!name && !!name.match(v)))
                                // apply that check function to module name
                                (<string>((<ILiteralNode>((<IPropertyNode>p).key)).value)))))
                        // on match build the modulesIds array which will be appended by concat
			.map(p=>(<ILiteralNode>((<IPropertyNode>p).value)).value)));

        // we got anything at all in the list?
	if (list.length > 0) {
		callExpressionNode.browserifiedIDs = list;
	}	
    }
}

/* Browserify example

lets say we have A.js:
require("./B.js").print("hello");

and B.js:
exports.print = function (str) { console.log(str); }

Browserify A.js | uglify -b (beautify) will produce the following results:

(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f;
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e);
            }, l, l.exports, e, t, n, r);
        }
        return n[o].exports;
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
})({
    1: [ function(require, module, exports) {
        require("./B.js").print("hello");
    }, {
        "./B.js": 2
    } ],
    2: [ function(require, module, exports) {
        exports.print = function(str) {
            console.log(str);
        };
    }, {} ]
}, {}, [ 1 ]);

*/