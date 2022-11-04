import { Injectable } from '@angular/core';
import { elementAt } from 'rxjs';
import { Element } from '../models/element.model';
import { Forms } from '../models/forms.model';
import { LexicalEntry } from '../models/lexicalEntry.model';
import { Sense } from '../models/sense.model';
import { TreeNodeCustom } from '../models/tree-node-custom.model';

@Injectable({
  providedIn: 'root'
})
export class NodeService {

  constructor() { }


  convertFromLexicalSenses(lexEntryList: LexicalEntry): TreeNodeCustom[] {
    let result: TreeNodeCustom[] = [];
    lexEntryList.list.forEach(lexicalList => {
      const lexEntryInstanceName = lexicalList.lexicalEntryInstanceName;
      const lexEntryINIndex = result.findIndex(res =>
        res.data === lexEntryInstanceName);
      let newSense: TreeNodeCustom = <TreeNodeCustom>{
          label: lexicalList.label,
          data: lexicalList.lexicalEntryInstanceName,
          type: lexicalList.type,
          creator: lexicalList.creator,
        };
      if (lexEntryINIndex === -1) {
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
      } else {
        result[lexEntryINIndex].children?.push(newSense);
      }
    });
    return result;
  }

}
