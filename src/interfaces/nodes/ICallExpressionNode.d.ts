import { INode } from "./INode";

export interface ICallExpressionNode extends INode{
    callee: INode;
    arguments: INode[];

    browserifiedIDs : number[];
}
