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
export class CallExpressionObfuscator extends NodeObfuscator {

    /**
     * @param callExpressionNode
     */
    public enterNode (callExpressionNode: ICallExpressionNode): any {
	if (NodeUtils.isIdentifierNode(callExpressionNode.callee) && this.isFunctionCallToPreserve(<IIdentifierNode>callExpressionNode.callee))
	    return estraverse.VisitorOption.Skip;
	    
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
	let preserveFunctionCalls = this.options['preserveFunctionCalls'];
        if (!preserveFunctionCalls) return false;
        
	return preserveFunctionCalls.some((funcName) => inode.name == funcName);
    }

    private isRootCall(node: INode, step : number): boolean {	
	if (!node || step > 4 || node.type == NodeType.CallExpression) return false;
	if (node.type == NodeType.Program) return true;
	return this.isRootCall(node.parentNode, step+1);
    }

    /**
     * @param callExpressionNode
     */
    private gatherBrowserifyIDs (callExpressionNode: ICallExpressionNode): void {	
	let browserified = this.options['browserified'];
        if (!browserified || callExpressionNode.arguments.length < 3 || browserified.length < 1) return;
        
	if (!this.isRootCall(callExpressionNode.parentNode, 0)) return;
	
	let exclude = this.options['browserifiedExclude'] ? true : false;
	let list : number[] = browserified.filter(v=>!!Number(v) && Number(v) > 0);
	if (browserified.some(v=>v == 0)) list = list.concat((<IArrayExpressionNode> (callExpressionNode.arguments[2])).elements.map(a => <number>((<ILiteralNode>a).value)));

	list = Array.prototype.concat.apply(list, ((<IObjectExpressionNode>(callExpressionNode.arguments[0])).properties.map(p =>  
		(<IObjectExpressionNode>((<IArrayExpressionNode>((<IPropertyNode>p).value)).elements[1])).properties
			.filter(p=>browserified.some(v=> !Number(v) && (<string>((<ILiteralNode>((<IPropertyNode>p).key)).value)).match(v)))
			.map(p=>(<ILiteralNode>((<IPropertyNode>p).value)).value))));

	if (list.length > 0) {
		callExpressionNode.browserifiedIDs = list;
		callExpressionNode.browserifiedExclude = exclude;
	}	
    }
}
