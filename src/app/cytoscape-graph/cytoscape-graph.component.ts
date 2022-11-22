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

  parentNodeElements:any= [];
  senseNodeElements:any= [];
  formNodeElements:any= [];

  isChecked:boolean;
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
      this.parentNodeElements.push(this.parentNode);
      this.addElement.addNodo(this.cy, this.parentNode.data, this.parentNode.data,pos);
      this.cy.getElementById(this.parentNode.data).addClass('border')
      this.cy.getElementById(this.parentNode.data).addClass('lexicalEntry');
    }
     if(this.senseNode){
      this.senseNodeElements.push(this.senseNode);
      this.addElement.addNodo(this.cy, this.senseNode.senseInstanceName, this.senseNode.senseInstanceName, pos);
      this.cy.getElementById(this.senseNode.senseInstanceName).addClass('border')
      this.cy.getElementById(this.senseNode.senseInstanceName).addClass('sense');
    }
    if(this.formNode){
      this.formNodeElements.push(this.formNode);
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
  this.isChecked = event.checked;
  let nodesVisible = this.cy.nodes().filter(':visible');
    if(event.checked === true){
      for(var i = 0; i< this.parentNodeElements.length; i++){
        this.cy.getElementById(this.parentNodeElements[i].data).style('label',this.parentNodeElements[i].label);
      }
      for(var i = 0; i< this.senseNodeElements.length; i++){
        this.cy.getElementById(this.senseNodeElements[i].senseInstanceName).style('label',this.senseNodeElements[i].label);
      }
      for(var i = 0; i< this.formNodeElements.length; i++){
        this.cy.getElementById(this.formNodeElements[i].formInstanceName).style('label',this.formNodeElements[i].label);
      }
    } else{
      for(var i = 0; i< this.parentNodeElements.length; i++){
        this.cy.getElementById(this.parentNodeElements[i].data).style('label',this.parentNodeElements[i].data);
      }
      for(var i = 0; i< this.senseNodeElements.length; i++){
        this.cy.getElementById(this.senseNodeElements[i].senseInstanceName).style('label',this.senseNodeElements[i].senseInstanceName);
      }
      for(var i = 0; i< this.formNodeElements.length; i++){
        this.cy.getElementById(this.formNodeElements[i].formInstanceName).style('label',this.formNodeElements[i].formInstanceName);
      }
    }  
 }
}
