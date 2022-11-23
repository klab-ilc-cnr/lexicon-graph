import { Component, Input, OnInit } from '@angular/core';
import cytoscape from 'cytoscape';
import { TreeNodeCustom } from '../shared/models/tree-node-custom.model';
import { AddNodoService } from './servizi/add-nodo.service';
import styleCy from './styleCy.json'
import popper from 'cytoscape-popper';
cytoscape.use(popper);
@Component({
  selector: 'app-cytoscape-graph',
  templateUrl: './cytoscape-graph.component.html',
  styleUrls: ['./cytoscape-graph.component.scss', '../mediaqueries/mediaquery.scss']
})
export class CytoscapeGraphComponent implements OnInit {
  constructor(
    private addElement: AddNodoService) { }
  cy: any;

  @Input() parentNode: TreeNodeCustom;
  @Input() senseNode: TreeNodeCustom;
  @Input() formNode: TreeNodeCustom;

  parentNodeElements: any = [];
  senseNodeElements: any = [];
  formNodeElements: any = [];

  isChecked: boolean;
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

    this.isChecked = false;
    this.cy.removeListener('mouseover', 'node');
    this.cy.on('mouseover', 'node', (event) => {
      let contentToRender;
      if (event.target.data().type === 'childS2L') {
        contentToRender = event.target.data().definition;
      } else {
        contentToRender = event.target.data().id;
      }
      event.target.popperRefObj = event.target.popper({
        content: () => {
          var content = document.createElement("div-popper");
          content.innerHTML = contentToRender;
          var x = document.createElement("style");
          var t = document.createTextNode("div-popper{background-color: #f6f8fa;color: black;border: 1px solid  #c4c8cc;border-radius: 5px;font-size:small;padding:10px}");
          x.appendChild(t);
          document.head.appendChild(x);
          document.body.appendChild(content);
          return content;
        },
        popper: {
          placement: 'top',
        }
      });
    });

    this.cy.removeListener('mouseout', 'node');
    this.cy.on('mouseout', 'node', (event) => {
      if (event.target.popper) {
        event.target.popperRefObj.state.elements.popper.remove();
        event.target.popperRefObj.destroy();
      }
    })
  }

  /**
   * 
   * @param evt drop: aggiungo il nodo in base alle informazioni recuperate dal componente tree
   */
  drop(evt) {
    var pos = {
      x: evt.x, y: evt.y
    };
    if (this.parentNode) {
      this.parentNodeElements.push(this.parentNode);
      this.addElement.addNodo(this.cy, this.parentNode.data, this.parentNode.data, pos, this.parentNode.type);
      this.cy.getElementById(this.parentNode.data).addClass('border')
      this.cy.getElementById(this.parentNode.data).addClass('lexicalEntry');
      if (this.isChecked === true) {
        this.cy.getElementById(this.parentNode.data).style('label', this.parentNode.label);
      }
    }
    if (this.senseNode) {
      this.senseNodeElements.push(this.senseNode);
      this.addElement.addNodo(this.cy, this.senseNode.senseInstanceName, this.senseNode.senseInstanceName, pos, this.senseNode.type, this.senseNode.definition);
      this.cy.getElementById(this.senseNode.senseInstanceName).addClass('border')
      this.cy.getElementById(this.senseNode.senseInstanceName).addClass('sense');
      if (this.isChecked === true) {
        this.cy.getElementById(this.senseNode.senseInstanceName).style('label', this.senseNode.label);
      }
    }
    if (this.formNode) {
      this.formNodeElements.push(this.formNode);
      this.addElement.addNodo(this.cy, this.formNode.formInstanceName, this.formNode.formInstanceName, pos, this.formNode.type);
      this.cy.getElementById(this.formNode.formInstanceName).addClass('border')
      this.cy.getElementById(this.formNode.formInstanceName).addClass('form');
      if (this.isChecked === true) {
        this.cy.getElementById(this.formNode.formInstanceName).style('label', this.formNode.label);
      }
    }
    this.cy.nodes().style('text-halign', 'center');
    this.cy.nodes().style('text-valign', 'bottom');
  }

  /**
   * resetta il viewport e il toggle label/id
   */
  resetView() {
    this.cy.elements().style('display', 'none');
    this.isChecked = false;
  }

  /**
   * 
   * @param event checked event dello switch per visualizzare come label l'id o il valore della label visibile nel tree DA COMPLETARE
   */
  labelOrId(event) {
    this.isChecked = event.checked;
    if (event.checked === true) {
      for (var i = 0; i < this.parentNodeElements.length; i++) {
        this.cy.getElementById(this.parentNodeElements[i].data).style('label', this.parentNodeElements[i].label);
      }
      for (var i = 0; i < this.senseNodeElements.length; i++) {
        this.cy.getElementById(this.senseNodeElements[i].senseInstanceName).style('label', this.senseNodeElements[i].label);
      }
      for (var i = 0; i < this.formNodeElements.length; i++) {
        this.cy.getElementById(this.formNodeElements[i].formInstanceName).style('label', this.formNodeElements[i].label);
      }
    } else {
      for (var i = 0; i < this.parentNodeElements.length; i++) {
        this.cy.getElementById(this.parentNodeElements[i].data).style('label', this.parentNodeElements[i].data);
      }
      for (var i = 0; i < this.senseNodeElements.length; i++) {
        this.cy.getElementById(this.senseNodeElements[i].senseInstanceName).style('label', this.senseNodeElements[i].senseInstanceName);
      }
      for (var i = 0; i < this.formNodeElements.length; i++) {
        this.cy.getElementById(this.formNodeElements[i].formInstanceName).style('label', this.formNodeElements[i].formInstanceName);
      }
    }
  }
}
