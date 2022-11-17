import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AddNodoService {

  constructor() { }

  addNodo(cy,id, label, pos){
    cy.add([{
      group: "nodes",
      data: {
        id: id,
        label: label
      },
      renderedPosition: pos,
    }]);
  }
}
