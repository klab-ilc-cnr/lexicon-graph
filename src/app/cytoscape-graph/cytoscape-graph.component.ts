import { Component, HostListener, Input, OnInit } from '@angular/core';
import cytoscape from 'cytoscape';
import { Forms } from '../shared/models/forms.model';
import { Sense } from '../shared/models/sense.model';
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
  // sensoDroppato;
  // formDroppato;
  // parentDroppato;

  // @Input() visualizedDraggedNode: string;
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
      this.addElement.addNodo(this.cy, this.parentNode.label, this.parentNode.label,pos);
      this.cy.getElementById(this.parentNode.label).addClass('border')
      this.cy.getElementById(this.parentNode.label).addClass('lexicalEntry');
    }
    if(this.senseNode){
      this.addElement.addNodo(this.cy, this.senseNode.label, this.senseNode.label, pos);
      this.cy.getElementById(this.senseNode.label).addClass('border')
      this.cy.getElementById(this.senseNode.label).addClass('sense');
    }
    if(this.formNode){
      this.addElement.addNodo(this.cy, this.formNode.label, this.formNode.label, pos);
      this.cy.getElementById(this.formNode.label).addClass('border')
      this.cy.getElementById(this.formNode.label).addClass('form');
    }
  }

 resetView(){
  this.cy.elements().style('display','none');
 }
  
}
