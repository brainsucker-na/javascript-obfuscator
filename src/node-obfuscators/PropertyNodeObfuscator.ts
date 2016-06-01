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
 * replaces:
 *     todo
 *
 * on:
 *     todo
 *
 */
export class PropertyNodeObfuscator extends NodeObfuscator {

    /**
     * @param callExpressionNode
     */
    public enterNode (node: IPropertyNode): any {
	if (this.isPreservedBrowserifiedModule(node))
	    return estraverse.VisitorOption.Skip;
    }
    
    /**
     * @param callExpressionNode
     */
    public obfuscateNode (node: IPropertyNode): void {	
    }

    private getParentCall(node: INode, step : number): ICallExpressionNode {	
	if (!node || step > 4) return null;
	if (node.type == NodeType.CallExpression) return <ICallExpressionNode>node;
	return this.getParentCall(node.parentNode, step+1);
    }

    /**
     * @param node
     */
    private isPreservedBrowserifiedModule(node : IPropertyNode) : boolean {
	let browserified = this.options['browserified'];
        if (!browserified) return false;
        
	let parentCall = this.getParentCall(node.parentNode, 0);
	if (!parentCall || !parentCall.browserifiedIDs) return false;
        
	let found = parentCall.browserifiedIDs.some(id => (<ILiteralNode>(node.key)).value == id);
	return parentCall.browserifiedExclude ? found : !found;
    }

}
