import { Component, Input, OnInit } from '@angular/core';
import cytoscape from 'cytoscape';
import { TreeNodeCustom } from '../shared/models/tree-node-custom.model';
import { AddNodoService } from './servizi/add-nodo.service';
import styleCy from './styleCy.json'
import popper from 'cytoscape-popper';
var nodeHtmlLabel = require('cytoscape-node-html-label');
nodeHtmlLabel(cytoscape); // register extension
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
  @Input() draggedNode: TreeNodeCustom;

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
      style: styleCy,
    });
    this.cy.nodeHtmlLabel([
      {
        query: 'node.lexicalEntryLabel',
        cssClass: 'cy-title',
        valign: "bottom",
        tpl: function (data) {
          return '<div ><p style="padding-top: 2.5rem;"><strong><em>' + data.label + '<sub>' + data.pos + '</sub></em></strong></p></div>';

        }
      },
      {
        query: 'node.formLabel',
        cssClass: 'cy-title',
        valign: "top",
        valignBox: "top",
        tpl: function (data) {
          return '<p class="cy-title__main">' + data.name + '</p>';
        }
      },
      {
        query: 'node.senseLabel',
        cssClass: 'cy-title',
        valign: "bottom",
        valignBox: "bottom",
        tpl: function (data) {
          return '<div> <p style="margin-bottom: 0.5rem; text-align:center;"><strong><em>' + data.lemma + '<sub>' + data.pos + '</sub></em></strong></p>' +
            '<p style="text-align:center; font-size:18px; ">' + data.definition + '</p></div>';
        }
      }
    ]);

    this.isChecked = false;
    this.cy.removeListener('mouseover', 'node.sense,node.senseLabel');
    this.cy.on('mouseover', 'node.sense,node.senseLabel', (event) => {
      if (event.target.data().definition.length > 18) {
        event.target.popperRefObj = event.target.popper({
          content: () => {
            var content = document.createElement("div-popper");
            content.innerHTML = event.target.data().definition;
            var x = document.createElement("style");
            var t = document.createTextNode("div-popper{background-color: #f6f8fa;color: black;border: 1px solid  #c4c8cc;border-radius: 5px;font-size:small;padding:10px;width:200px;}");
            x.appendChild(t);
            document.head.appendChild(x);
            document.body.appendChild(content);
            return content;
          },
          popper: {
            placement: 'top',
          }
        });
      }

    });

    this.cy.removeListener('mouseout', 'node.sense,node.senseLabel');
    this.cy.on('mouseout', 'node.sense,node.senseLabel', (event) => {
      if (event.target.data().definition.length > 18) {
        if (event.target.popper) {
          event.target.popperRefObj.state.elements.popper.remove();
          event.target.popperRefObj.destroy();
        }
      }
    });
  }

  /**
   * 
   * @param evt drop: aggiungo il nodo in base alle informazioni recuperate dal componente tree
   */
  drop(evt) {
    // coordinate del mouse per posizionamento nodo
    var pos = {
      x: evt.layerX, y: evt.layerY
    };
    if (this.draggedNode.type === 'parentLevel') {
      this.parentNodeElements.push(this.parentNode);
      this.addElement.addNodo(this.cy, this.parentNode.data, this.parentNode.label, pos, this.parentNode.type, this.parentNode.pos);
      this.cy.getElementById(this.parentNode.data).addClass('border')
      this.cy.getElementById(this.parentNode.data).addClass('lexicalEntry');
      if (this.isChecked === false) {
        this.cy.getElementById(this.parentNode.data).removeClass('lexicalEntry');
        this.cy.getElementById(this.parentNode.data).addClass('lexicalEntryLabel');
        // this.cy.getElementById(this.parentNode.data).style('label', this.parentNode.label);
      }
    }
    if (this.draggedNode.type === 'childS2L') {
      this.senseNodeElements.push(this.senseNode);
      this.addElement.addNodo(this.cy, this.senseNode.senseInstanceName, this.senseNode.label, pos, this.senseNode.type, this.senseNode.pos, this.senseNode.lexicalEntryInstanceName, this.senseNode.lemma, this.senseNode.definition);
      this.cy.getElementById(this.senseNode.senseInstanceName).addClass('border')
      this.cy.getElementById(this.senseNode.senseInstanceName).addClass('sense');
      if (this.isChecked === false) {
        this.cy.getElementById(this.senseNode.senseInstanceName).removeClass('sense');
        this.cy.getElementById(this.senseNode.senseInstanceName).addClass('senseLabel');
        // this.cy.getElementById(this.senseNode.senseInstanceName).style('label', this.senseNode.label);
      }
    }
    if (this.draggedNode.type === 'childF2L') {
      this.formNodeElements.push(this.formNode);
      this.addElement.addNodo(this.cy, this.formNode.formInstanceName, this.formNode.formInstanceName, pos, this.formNode.type);
      this.cy.getElementById(this.formNode.formInstanceName).addClass('border')
      this.cy.getElementById(this.formNode.formInstanceName).addClass('form');
      if (this.isChecked === false) {
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
    // this.cy.elements().style('display', 'none');
    this.cy.remove(this.cy.elements());
    // this.cy.destroy();
    this.isChecked = false;
  }

  /**
   * 
   * @param event checked event dello switch per visualizzare come label l'id o il valore della label visibile nel tree DA COMPLETARE
   */
  labelOrId(event) {
    this.isChecked = event.checked;
    if (event.checked === false) {
      for (var i = 0; i < this.parentNodeElements.length; i++) {
        this.cy.getElementById(this.parentNodeElements[i].data).removeClass('lexicalEntry');
        this.cy.getElementById(this.parentNodeElements[i].data).addClass('lexicalEntryLabel');
      }
      for (var i = 0; i < this.senseNodeElements.length; i++) {
        this.cy.getElementById(this.senseNodeElements[i].senseInstanceName).removeClass('sense');
        this.cy.getElementById(this.senseNodeElements[i].senseInstanceName).addClass('senseLabel');
      }
      for (var i = 0; i < this.formNodeElements.length; i++) {
        this.cy.getElementById(this.formNodeElements[i].formInstanceName).style('label', this.formNodeElements[i].label);
      }
    } else {
      for (var i = 0; i < this.parentNodeElements.length; i++) {
        // this.cy.getElementById(this.parentNodeElements[i].data).style('label', this.parentNodeElements[i].data);
        this.cy.getElementById(this.parentNodeElements[i].data).removeClass('lexicalEntryLabel');
        this.cy.getElementById(this.parentNodeElements[i].data).addClass('lexicalEntry');
      }
      for (var i = 0; i < this.senseNodeElements.length; i++) {
        // this.cy.getElementById(this.senseNodeElements[i].senseInstanceName).style('label', this.senseNodeElements[i].senseInstanceName);
        this.cy.getElementById(this.senseNodeElements[i].senseInstanceName).removeClass('senseLabel');
        this.cy.getElementById(this.senseNodeElements[i].senseInstanceName).addClass('sense');
      }
      for (var i = 0; i < this.formNodeElements.length; i++) {
        this.cy.getElementById(this.formNodeElements[i].formInstanceName).style('label', this.formNodeElements[i].formInstanceName);
      }
    }
  }
}
