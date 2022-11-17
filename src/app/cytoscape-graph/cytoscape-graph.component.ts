import { Component, Input, OnInit } from '@angular/core';
import cytoscape from 'cytoscape';
import { TreeNodeCustom } from '../shared/models/tree-node-custom.model';
import { AddNodoService } from './servizi/add-nodo.service';
import styleCy from './styleCy.json'
@Component({
  selector: 'app-cytoscape-graph',
  templateUrl: './cytoscape-graph.component.html',
  styleUrls: ['./cytoscape-graph.component.scss']
})
export class CytoscapeGraphComponent implements OnInit {
  constructor(
    private addElement:AddNodoService) { }
  cy: any;

  @Input() parentNode: TreeNodeCustom;
  @Input() senseNode: TreeNodeCustom;
  @Input() formNode: TreeNodeCustom;
  ngOnInit(): void {
    localStorage.clear();
    const that = this;
    this.cy = cytoscape({
      container: document.getElementById('cy'),
      minZoom: 0.2,
      maxZoom: 5.0,
      zoomingEnabled: true,
      textureOnViewport: true,
      hideEdgesOnViewport: true,
      wheelSensitivity: 0.1,
      style: styleCy
      
    });
  }

  drop(evt) {
    var pos = {
      x: evt.x, y: evt.y
    };
    if(this.parentNode){
      this.addElement.addNodo(this.cy, this.parentNode.data, this.parentNode.data,pos);
      this.cy.getElementById(this.parentNode.data).addClass('border')
      this.cy.getElementById(this.parentNode.data).addClass('lexicalEntry');
    }
     if(this.senseNode){
      this.addElement.addNodo(this.cy, this.senseNode.senseInstanceName, this.senseNode.senseInstanceName, pos);
      this.cy.getElementById(this.senseNode.senseInstanceName).addClass('border')
      this.cy.getElementById(this.senseNode.senseInstanceName).addClass('sense');
    }
    if(this.formNode){
      this.addElement.addNodo(this.cy, this.formNode.formInstanceName, this.formNode.formInstanceName, pos);
      this.cy.getElementById(this.formNode.formInstanceName).addClass('border')
      this.cy.getElementById(this.formNode.formInstanceName).addClass('form');
    }
  }

 resetView(){
  this.cy.elements().style('display','none');
 }
  
}
