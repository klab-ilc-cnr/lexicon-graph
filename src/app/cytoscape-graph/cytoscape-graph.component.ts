import { Component, Input, OnInit, ViewChild } from '@angular/core';
import cytoscape from 'cytoscape';
import { TreeNodeCustom } from '../shared/models/tree-node-custom.model';
import { AddNodoService } from './servizi/aggiungiNodo/add-nodo.service';
import styleCy from './styleCy.json'
import popper from 'cytoscape-popper';
import { DistanceService } from './servizi/calcolaDistanza/distance.service';
import dblclick from 'cytoscape-dblclick';
import { DataStorageService } from '../shared/data-storage/data-storage.service';
import { Subject, Subscription } from 'rxjs';
import { ToolbarComponent } from './toolbar/toolbar.component';
cytoscape.use(dblclick);
var nodeHtmlLabel = require('cytoscape-node-html-label');
nodeHtmlLabel(cytoscape); // register extension
import cola from 'cytoscape-cola';
cytoscape.use(cola);
cytoscape.use(popper);
@Component({
  selector: 'app-cytoscape-graph',
  templateUrl: './cytoscape-graph.component.html',
  styleUrls: ['./cytoscape-graph.component.scss', '../mediaqueries/mediaquery.scss']
})
export class CytoscapeGraphComponent implements OnInit {
  constructor(
    private addElement: AddNodoService,
    private calculateDistance: DistanceService,
    private dataStorageService: DataStorageService) { }
  cy: any;

  @Input() parentNode: TreeNodeCustom;
  @Input() senseNode: TreeNodeCustom;
  @Input() formNode: TreeNodeCustom;
  @Input() draggedNode: TreeNodeCustom;
  @ViewChild(ToolbarComponent, { static: true }) istanzaToolBarComponent: ToolbarComponent;

  _val: Subject<boolean> = new Subject();
  @Input()
  set events(val: Subject<boolean>) {
    this._val = val;
  }

  private eventsSubscription: Subscription;

  /**
   * array elementi lessico 
   */
  parentNodeElements: any = [];
  senseNodeElements: any = [];
  formNodeElements: any = [];

  /**
   * sensi salvati per recupero percorso minimimo
   */
  senso1;
  senso2;
  definitionSplitted: string;

  expanded: boolean = false;

  /**
 * variabile per tenere traccia di un eventuale errore o warning nella chiamata http dal componente toolbar
 */
  error: null;
  warning: null;

  ngOnInit(): void {
    this.eventsSubscription = this._val.subscribe((x) => {
      if (x === true) {
        this.istanzaToolBarComponent.resetView();
      }
    });
    sessionStorage.removeItem('focusNode');
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
            '<p style="text-align:center; font-size:18px;">' + data.definitionSplitt + '</p></div>';
        }
      }
    ]);

    this.istanzaToolBarComponent.isChecked = false;
    this.cy.removeListener('mouseover', 'node.sense,node.senseLabel');
    this.cy.on('mouseover', 'node.sense,node.senseLabel', (event) => {
      if (event.target.data().definition.length > 20) {
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
            placement: 'bottom',
          }
        });
      }
    });

    this.cy.removeListener('mouseout', 'node.sense,node.senseLabel');
    this.cy.on('mouseout', 'node.sense,node.senseLabel', (event) => {
      if (event.target.data().definition.length > 20) {
        if (event.target.popper) {
          event.target.popperRefObj.state.elements.popper.remove();
          event.target.popperRefObj.destroy();
        }
      }
    });


    // dbl clic entrata lessicale
    this.cy.on('dblclick', 'node.lexicalEntry,node.lexicalEntryLabel', (event) => {
      let lexicalEntry = event.target.data().id;
      this.dataStorageService.fetchElements(lexicalEntry).subscribe(elem => {
        elem.elements.forEach(elem => {
          if (elem.label === 'form' && elem.count > 0) {
            this.dataStorageService.fetchForms(lexicalEntry).subscribe(forms => {
              forms.forEach(node => {
                this.cy.add([{
                  group: "nodes",
                  data: {
                    id: node.formInstanceName,
                    label: node.formInstanceName
                  },
                }]);
                this.cy.getElementById(node.formInstanceName).style('display', 'element');
                this.cy.getElementById(node.formInstanceName).addClass('border');
                this.cy.getElementById(node.formInstanceName).addClass('form');
                this.cy.add([{
                  group: "edges",
                  data: {
                    id: node.formInstanceName + 1,
                    source: lexicalEntry,
                    target: node.formInstanceName,
                    label: 'form'
                  }
                }]);
                this.cy.edges().style('display', 'element')
                this.cy.edges().filter(':visible').style("edge-text-rotation", "autorotate");
                var layout = this.cy.elements().layout({
                  name: 'concentric',
                  fit: false,
                  minNodeSpacing: 100,
                });
                layout.run();
              });
            })
          }
          if (elem.label === 'sense' && elem.count > 0) {
            this.dataStorageService.fetchSense(lexicalEntry).subscribe(sense => {
              sense.forEach(node => {
                this.cy.add([{
                  group: "nodes",
                  data: {
                    id: node.senseInstanceName,
                    label: node.senseInstanceName
                  },
                }]);
                this.cy.getElementById(node.senseInstanceName).style('display', 'element');
                this.cy.getElementById(node.senseInstanceName).addClass('border');
                this.cy.getElementById(node.senseInstanceName).addClass('sense');
                this.cy.add([{
                  group: "edges",
                  data: {
                    id: node.senseInstanceName + 1,
                    source: lexicalEntry,
                    target: node.senseInstanceName,
                    label: 'sense'
                  }
                }]);
                this.cy.edges().style('display', 'element')
                this.cy.edges().filter(':visible').style("edge-text-rotation", "autorotate");
                var layout = this.cy.elements().layout({
                  name: 'concentric',
                  fit: false,
                  minNodeSpacing: 100,
                });
                layout.run();
              });
            })
          }
        })
      })
    });


    // dbl clic senso
    this.cy.on('dblclick', 'node.sense,node.senseLabel', (event) => {
      // stato 1
      if (sessionStorage.getItem('focusNode') === null) {
        sessionStorage.setItem('focusNode', event.target.data().id);
        // recupero iponimi
        this.calculateDistance.dblClic(this.cy, event, 'hyponym', 'incoming');
        // recupero iperonimi
        this.calculateDistance.dblClic(this.cy, event, 'hyponym', 'outgoing');
        // recupero meronimi
        this.calculateDistance.dblClic(this.cy, event, 'partMeronym', 'incoming');
        // recupero olonimi
        this.calculateDistance.dblClic(this.cy, event, 'partMeronym', 'outgoing');
        // recupero sinonimi entranti
        this.calculateDistance.dblClic(this.cy, event, 'synonym', 'incoming');
        // recupero sinonimi uscenti
        this.calculateDistance.dblClic(this.cy, event, 'synonym', 'outgoing');
      } else {
        // this.cy.remove(this.cy.getElementById(event.target.data().id).connectedEdges().sources());
        let sources = this.cy.getElementById(event.target.data().id).connectedEdges().sources();
        for (var i = 0; i < sources.length; i++) {
          if (sources[i].data().id !== event.target.data().id) {
            this.cy.remove(this.cy.getElementById(sources[i].data().id))
          }
        }
        let targets = this.cy.getElementById(event.target.data().id).connectedEdges().targets();
        for (var i = 0; i < targets.length; i++) {
          if (targets[i].data().id !== event.target.data().id) {
            this.cy.remove(this.cy.getElementById(targets[i].data().id))
          }
        }
        // if (this.cy.getElementById(event.target.data().id).connectedEdges().connectedNodes() !== this.cy.getElementById(event.target.data().id)) {
        // }
        sessionStorage.removeItem('focusNode');
      }
    });
  }

  /**
   * 
   * @param evt drop: aggiungo il nodo in base alle informazioni recuperate dal componente tree
   */
  drop(evt) {
    // resetto zoom viewport
    this.cy.zoom(1);
    sessionStorage.removeItem('focusNode');
    // coordinate del mouse per posizionamento nodo
    var pos = {
      x: evt.layerX, y: evt.layerY
    };
    let senseAdded: [];
    if (this.draggedNode.type === 'parentLevel') {
      this.parentNodeElements.push(this.parentNode);
      this.addElement.addNodo(this.cy, this.parentNode.data, this.parentNode.label, pos, this.parentNode.type, this.parentNode.pos);
      this.cy.getElementById(this.parentNode.data).addClass('border')
      this.cy.getElementById(this.parentNode.data).addClass('lexicalEntry');
      if (this.istanzaToolBarComponent.isChecked === false) {
        this.cy.getElementById(this.parentNode.data).removeClass('lexicalEntry');
        this.cy.getElementById(this.parentNode.data).addClass('lexicalEntryLabel');
        // this.cy.getElementById(this.parentNode.data).style('label', this.parentNode.label);
      }
    }
    if (this.draggedNode.type === 'childS2L') {
      this.senseNodeElements.push(this.senseNode);
      for (var i = 0; i < this.senseNodeElements.length; i++) {
        this.senso1 = this.senseNodeElements[0];
        this.senso2 = this.senseNodeElements[1];
      }
      if (this.senseNode.definition.split(" ").length > 3) {
        this.definitionSplitted = this.senseNode.definition.split(' ').slice(0, 3).join(' ') + '...'
      } else {
        this.definitionSplitted = this.senseNode.definition;
      }
      senseAdded = this.addElement.addNodo(this.cy, this.senseNode.senseInstanceName, this.senseNode.label, pos, this.senseNode.type, this.senseNode.pos, this.senseNode.lexicalEntryInstanceName, this.senseNode.lemma, this.senseNode.definition, this.definitionSplitted);
      this.cy.getElementById(this.senseNode.senseInstanceName).addClass('border')
      this.cy.getElementById(this.senseNode.senseInstanceName).addClass('sense');
      if (this.istanzaToolBarComponent.isChecked === false) {
        this.cy.getElementById(this.senseNode.senseInstanceName).removeClass('sense');
        this.cy.getElementById(this.senseNode.senseInstanceName).addClass('senseLabel');
      }
    }
    if (this.draggedNode.type === 'childF2L') {
      this.formNodeElements.push(this.formNode);
      this.addElement.addNodo(this.cy, this.formNode.formInstanceName, this.formNode.formInstanceName, pos, this.formNode.type);
      this.cy.getElementById(this.formNode.formInstanceName).addClass('border')
      this.cy.getElementById(this.formNode.formInstanceName).addClass('form');
      if (this.istanzaToolBarComponent.isChecked === false) {
        this.cy.getElementById(this.formNode.formInstanceName).style('label', this.formNode.label);
      }
    }
    this.cy.nodes().style('text-halign', 'center');
    this.cy.nodes().style('text-valign', 'bottom');

    // controllo elementi visibili
    let nodiVisibili = this.cy.nodes().filter(':visible');
    let sensiVisibili = [];

    sensiVisibili = nodiVisibili.filter(nodo => {
      // aggiungo nodi di tipo childS2L all'array sensivisibili
      if (nodo.data().type === 'childS2L') {
        return nodo.data()
      } else {
        return;
      }
    });
    let lastAddedSense;
    senseAdded.forEach(senso => {
      lastAddedSense = senso;
      return lastAddedSense;
    })
    // chiamo servizio distanza se sono presenti due sensi nel viewport
    if (sensiVisibili.length >= 2) {
      // abilito btn per recuperare min path
      this.istanzaToolBarComponent.disableMinPath = false;
      for (var i = 0; i < sensiVisibili.length; i++) {
        // recupero iponimi
        this.calculateDistance.levelOne(this.cy, sensiVisibili[i].data().id, lastAddedSense.data().id, 'hyponym', 'incoming');
        // recupero iperonimi
        this.calculateDistance.levelOne(this.cy, sensiVisibili[i].data().id, lastAddedSense.data().id, 'hyponym', 'outgoing');
        // recupero meronimi
        this.calculateDistance.levelOne(this.cy, sensiVisibili[i].data().id, lastAddedSense.data().id, 'partMeronym', 'incoming');
        // recupero olonimi
        this.calculateDistance.levelOne(this.cy, sensiVisibili[i].data().id, lastAddedSense.data().id, 'partMeronym', 'outgoing');
        // recupero sinonimi entranti
        this.calculateDistance.levelOne(this.cy, sensiVisibili[i].data().id, lastAddedSense.data().id, 'synonym', 'incoming');
        // recupero sinonimi uscenti
        this.calculateDistance.levelOne(this.cy, sensiVisibili[i].data().id, lastAddedSense.data().id, 'synonym', 'outgoing');
      }
    }
  }
  expandedToolbar() {
    this.expanded = !this.expanded;
  }

  resetFromToolbar(evt) {
    if (evt === true) {
      this.expanded = false;
      this.senseNodeElements = [];
    }
  }

  /**
   * metodo che mostra il messaggio di errore 
   * @param evt errore ricevuto da componente toolbar quando c'è chiamata a servizio per recuperare percorso minimo
   */
  errorFromToolbar(evt) {
    this.error = evt;
  }

  /**
  * metodo che mostra il messaggio di errore 
  * @param evt errore ricevuto da componente toolbar quando c'è chiamata a servizio per recuperare percorso minimo
  */
  warningFromToolbar(evt) {
    this.warning = evt;
  }
}
