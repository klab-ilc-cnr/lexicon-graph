import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AddNodoService {

  constructor() { }

  addNodo(cy, id, label, pos, type, definition?){
    cy.add([{
      group: "nodes",
      data: {
        id: id,
        label: label,
        type: type,
        definition: definition
      },
      renderedPosition: pos,
    }]);
  }
}
