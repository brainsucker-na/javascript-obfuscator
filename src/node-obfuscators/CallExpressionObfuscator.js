"use strict";
const estraverse = require('estraverse');
const NodeObfuscator_1 = require('./NodeObfuscator');
const NodeUtils_1 = require("../NodeUtils");
class CallExpressionObfuscator extends NodeObfuscator_1.NodeObfuscator {
    enterNode(callExpressionNode) {
        if (NodeUtils_1.NodeUtils.isIdentifierNode(callExpressionNode.callee) && this.isFunctionCallToPreserve(callExpressionNode.callee))
            return estraverse.VisitorOption.Skip;
    }
    obfuscateNode(callExpressionNode) {
    }
    isFunctionCallToPreserve(inode) {
        let preserveFunctionCalls = this.options['preserveFunctionCalls'];
        if (!preserveFunctionCalls)
            return false;
        return preserveFunctionCalls.some((funcName) => inode.name == funcName);
    }
}
exports.CallExpressionObfuscator = CallExpressionObfuscator;
