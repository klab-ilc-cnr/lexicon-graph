import { TreeNode } from "primeng/api";
import { LexicalEntry } from "./lexicalEntry.model";
import { Element } from "./element.model";
export interface TreeNodeCustom extends TreeNode {
  lexicalEntry: LexicalEntry[];
  element: Element[];
  lexicalEntryInstanceName: string | undefined;
  count:number,
  creator: string;
  lastUpdate: string;
  creationDate: string;
  senseInstanceName: string;
  formInstanceName: string;
  pos: string;
  type:string;
}