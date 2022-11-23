import { TreeNode } from "primeng/api";
import { LexicalEntry } from "./lexicalEntry.model";
export interface TreeNodeCustom extends TreeNode {
  lexicalEntry: LexicalEntry[];
  lexicalEntryInstanceName: string | undefined;
  count?:number,
  senseInstanceName?: string;
  formInstanceName?:string;
  pos: string;
  type:string;
  definition?:string;
}