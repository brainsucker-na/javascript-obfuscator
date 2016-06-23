import { INode } from "./INode";

export interface IArrayExpressionNode extends INode{
    elements: INode[];
}
