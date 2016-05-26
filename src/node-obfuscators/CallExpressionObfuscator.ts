import * as estraverse from 'estraverse';

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
    }

    /**
     * @param callExpressionNode
     */
    public obfuscateNode (callExpressionNode: ICallExpressionNode): void {
    }

}
