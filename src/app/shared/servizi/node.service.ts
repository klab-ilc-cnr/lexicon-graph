import { Injectable } from '@angular/core';
import { LexicalEntry } from '../models/lexicalEntry.model';
import { TreeNodeCustom } from '../models/tree-node-custom.model';

@Injectable({
  providedIn: 'root'
})
export class NodeService {

  constructor() { }

  convertFromLexicalSenses(lexEntryList: LexicalEntry): TreeNodeCustom[] {
    let result: TreeNodeCustom[] = [];
    lexEntryList.list.forEach(lexicalList => {
        let newEntry = <TreeNodeCustom>{
          expandedIcon: "pi pi-folder-open",
          collapsedIcon: "pi pi-folder",
          label: lexicalList.label,
          data: lexicalList.lexicalEntryInstanceName,
          type: "word",
          pos: lexicalList.pos,
          leaf: false,
        };
        result.push(newEntry)
    });
    return result;
  }

}
