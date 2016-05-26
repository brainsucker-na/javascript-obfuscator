import * as estraverse from 'estraverse';

import { IIdentifierNode } from "../interfaces/nodes/IIdentifierNode";
import { ICallExpressionNode } from "../interfaces/nodes/ICallExpressionNode";
import { INode } from "../interfaces/nodes/INode";

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
}
