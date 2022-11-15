import { Component, HostListener, Input, OnInit } from '@angular/core';
import cytoscape from 'cytoscape';
import { Forms } from '../shared/models/forms.model';
import { Sense } from '../shared/models/sense.model';
import styleCy from './styleCy.json'
@Component({
  selector: 'app-cytoscape-graph',
  templateUrl: './cytoscape-graph.component.html',
  styleUrls: ['./cytoscape-graph.component.scss']
})
export class CytoscapeGraphComponent implements OnInit {
  constructor() { }
  cy: any;
  sensoDroppato: Sense;
  formDroppato: Forms;

  @Input() visualizedDraggedNode: string;
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
    this.sensoDroppato = JSON.parse(localStorage.getItem('sensoChild'));
    this.formDroppato = JSON.parse(localStorage.getItem('formChild'));
    
    let sliced = this.visualizedDraggedNode.slice(0, this.visualizedDraggedNode.indexOf(' - ')).trim();

    let label: string;
    let id: string;
    this.sensoDroppato = JSON.parse(localStorage.getItem('sensoChild'))
    this.formDroppato = JSON.parse(localStorage.getItem('formChild'))
    
    // let isSense = localStorage.getItem('isAsense');
    // let isForm = localStorage.getItem('isAform');
    if(this.sensoDroppato!== null && this.sensoDroppato.definition.includes(sliced)){
      label = this.sensoDroppato.definition;
      id = this.sensoDroppato.label;
    } 
    if(this.formDroppato!== null && this.formDroppato.label.includes(sliced)){
      label = this.formDroppato.label;
      id = this.formDroppato.label;
    } else {
      label = sliced;
      id = sliced;
    }
    var pos = {
      x: evt.x, y: evt.y
    };
    this.cy.add([{
      group: "nodes",
      data: {
        id: id,
        label: label
      },
      renderedPosition: pos,
    }]);
    // this.cy.getElementById(label).addClass('border')
     // let isForm = localStorage.getItem('isAform');
    //  if(this.sensoDroppato!== null && this.sensoDroppato.definition.includes(sliced)){
    //   this.cy.getElementById(label).removeClass('lexicalEntry');
    //   this.cy.getElementById(label).removeClass('form');
    //   this.cy.getElementById(label).addClass('sense');
    // } 
    // if(this.formDroppato!== null && this.formDroppato.label.includes(sliced)){
    //   this.cy.getElementById(label).removeClass('lexicalEntry');
    //   this.cy.getElementById(label).removeClass('sense');
    //   this.cy.getElementById(label).addClass('form');
    // } else {
    //   this.cy.getElementById(label).removeClass('sense');
    //   this.cy.getElementById(label).removeClass('form');
    //   this.cy.getElementById(label).removeClass('lexicalEntry');
    // }



    // if(isSense === 'true'){
      // this.cy.getElementById(label).addClass('sense');

    //   this.cy.getElementById(label).removeClass('form');
    // }
    // if(isForm === 'true'){
    //   this.cy.getElementById(label).addClass('form');
    // }
  }

 resetView(){
  // localStorage.clear();
  this.cy.elements().style('display','none');
 }
  
}
