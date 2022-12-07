import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AddNodoService {

  constructor() { }

  addNodo(cy, id, label, pos, type, posNodo?, lexicalEntryInstanceName?, lemma?, definition?) {
    cy.add([{
      group: "nodes",
      data: {
        id: id,
        label: label,
        type: type,
        pos: posNodo,
        lexicalEntryInstanceName: lexicalEntryInstanceName,
        lemma: lemma,
        definition: definition
      },
      renderedPosition: pos,
    }]);
    // cy.getElementById(id).style('display', 'element');
  }

}
