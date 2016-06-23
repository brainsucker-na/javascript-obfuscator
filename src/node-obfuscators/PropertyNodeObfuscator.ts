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
import { NodeUtils } from "../NodeUtils";
import { Utils } from '../Utils';

/**
 *  Check CallExpressionObfuscator for explanation
 */
export class PropertyNodeObfuscator extends NodeObfuscator {

    /**
     * @param callExpressionNode
     */
    public enterNode (node: IPropertyNode): any {
        // is this a module definition with ID prohibited (either by exclusion or by inclusion) for obfuscation?
        if (this.isPreservedBrowserifiedModule(node))
                return estraverse.VisitorOption.Skip;
    }
    
    /**
     * @param callExpressionNode
     */
    public obfuscateNode (node: IPropertyNode): void {	
    }

    // Checks for closest parent CallExpressionNode to check if browserifiedIDS are non-null, meaning this is really a browserify module definiton
    private getParentCall(node: INode, step : number): ICallExpressionNode {	
        if (!node || step > 4) return null;
        if (node.type == NodeType.CallExpression) return <ICallExpressionNode>node;
        return this.getParentCall(node.parentNode, step+1);
    }

    /**
     * @param node
     */
    private isPreservedBrowserifiedModule(node : IPropertyNode) : boolean {
        // is browserified option even specified (hopefully a fast check)
        let browserified = this.options.get<string[]>('browserified');
        if (!browserified || browserified.length == 0) return false;
        // is it exclude or include mode
        let exclude = this.options.get('browserifiedExclude');
        
        // get the closest parent CallExpressionNode
        let parentCall = this.getParentCall(node.parentNode, 0);
        // check if it got browserifyIDs (meaning it is really a browserify definition call)
        if (!parentCall || !parentCall.browserifiedIDs) return false;

        // check if id of that module matches the list
        let found = parentCall.browserifiedIDs.some(id => (<ILiteralNode>(node.key)).value == id);
        // depending on inclusion/exclusion mode make the decision on module obfuscation fate
        return exclude ? found : !found;
    }

}
