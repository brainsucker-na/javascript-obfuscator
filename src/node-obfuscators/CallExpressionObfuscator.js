"use strict";
const estraverse = require('estraverse');
const NodeType_1 = require('../enums/NodeType');
const NodeObfuscator_1 = require('./NodeObfuscator');
const NodeUtils_1 = require("../NodeUtils");
class CallExpressionObfuscator extends NodeObfuscator_1.NodeObfuscator {
    enterNode(callExpressionNode) {
        if (NodeUtils_1.NodeUtils.isIdentifierNode(callExpressionNode.callee) && this.isFunctionCallToPreserve(callExpressionNode.callee))
            return estraverse.VisitorOption.Skip;
        this.gatherBrowserifyIDs(callExpressionNode);
    }
    obfuscateNode(callExpressionNode) {
    }
    isFunctionCallToPreserve(inode) {
        let preserveFunctionCalls = this.options['preserveFunctionCalls'];
        if (!preserveFunctionCalls)
            return false;
        return preserveFunctionCalls.some((funcName) => inode.name == funcName);
    }
    isRootCall(node, step) {
        if (!node || step > 4 || node.type == NodeType_1.NodeType.CallExpression)
            return false;
        if (node.type == NodeType_1.NodeType.Program)
            return true;
        return this.isRootCall(node.parentNode, step + 1);
    }
    gatherBrowserifyIDs(callExpressionNode) {
        let browserified = this.options['browserified'];
        if (!browserified || callExpressionNode.arguments.length < 3 || browserified.length < 1)
            return;
        if (!this.isRootCall(callExpressionNode.parentNode, 0))
            return;
        let exclude = this.options['browserifiedExclude'] ? true : false;
        let list = browserified.filter(v => !!Number(v) && Number(v) > 0);
        if (browserified.some(v => v == 0))
            list = list.concat((callExpressionNode.arguments[2]).elements.map(a => (a.value)));
        list = Array.prototype.concat.apply(list, ((callExpressionNode.arguments[0]).properties.map(p => ((p.value).elements[1]).properties
            .filter(p => browserified.some(v => !Number(v) && ((p.key).value).match(v)))
            .map(p => (p.value).value))));
        if (list.length > 0) {
            callExpressionNode.browserifiedIDs = list;
            callExpressionNode.browserifiedExclude = exclude;
        }
    }
}
exports.CallExpressionObfuscator = CallExpressionObfuscator;
