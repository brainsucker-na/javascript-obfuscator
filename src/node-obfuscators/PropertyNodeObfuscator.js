"use strict";
const estraverse = require('estraverse');
const NodeType_1 = require('../enums/NodeType');
const NodeObfuscator_1 = require('./NodeObfuscator');
class PropertyNodeObfuscator extends NodeObfuscator_1.NodeObfuscator {
    enterNode(node) {
        if (this.isPreservedBrowserifiedModule(node))
            return estraverse.VisitorOption.Skip;
    }
    obfuscateNode(node) {
    }
    getParentCall(node, step) {
        if (!node || step > 4)
            return null;
        if (node.type == NodeType_1.NodeType.CallExpression)
            return node;
        return this.getParentCall(node.parentNode, step + 1);
    }
    isPreservedBrowserifiedModule(node) {
        let browserified = this.options['browserified'];
        if (!browserified)
            return false;
        let parentCall = this.getParentCall(node.parentNode, 0);
        if (!parentCall || !parentCall.browserifiedIDs)
            return false;
        let found = parentCall.browserifiedIDs.some(id => (node.key).value == id);
        return parentCall.browserifiedExclude ? found : !found;
    }
}
exports.PropertyNodeObfuscator = PropertyNodeObfuscator;
