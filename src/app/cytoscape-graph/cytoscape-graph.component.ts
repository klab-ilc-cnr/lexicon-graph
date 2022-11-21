import { Component, Input, OnInit } from '@angular/core';
import cytoscape from 'cytoscape';
import { TreeNodeCustom } from '../shared/models/tree-node-custom.model';
import { AddNodoService } from './servizi/add-nodo.service';
import styleCy from './styleCy.json'
@Component({
  selector: 'app-cytoscape-graph',
  templateUrl: './cytoscape-graph.component.html',
  styleUrls: ['./cytoscape-graph.component.scss','../mediaqueries/mediaquery.scss']
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
    console.log('parent node')
    console.log(this.parentNode)
    console.log('senseNode')
    console.log(this.senseNode)
    console.log('formNode')
    console.log(this.formNode)

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

/**
 * 
 * @param event checked event dello switch per visualizzare come label l'id o il valore della label visibile nel tree DA COMPLETARE
 */
 labelOrId(event){
  if(event.checked === true){
    this.cy.getElementById(this.parentNode.data).style('label',this.parentNode.label);
    this.cy.getElementById(this.senseNode.senseInstanceName).style('label',this.senseNode.label);
    this.cy.getElementById(this.formNode.formInstanceName).style('label',this.formNode.label);
  } else{
    this.cy.getElementById(this.parentNode.data).style('label',this.parentNode.data);
    this.cy.getElementById(this.senseNode.senseInstanceName).style('label',this.senseNode.senseInstanceName);
    this.cy.getElementById(this.formNode.formInstanceName).style('label',this.formNode.formInstanceName);
  }
 }
}
