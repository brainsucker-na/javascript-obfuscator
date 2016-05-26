import { INode } from '../interfaces/nodes/INode';

export interface INodeObfuscator {
    /**
     * @param node
     * @param parentNode
     */
    obfuscateNode (node: INode, parentNode?: INode): void;

    /**
     * @param node
     * @param parentNode
     */
    enterNode (node: INode, parentNode?: INode): any;
}
