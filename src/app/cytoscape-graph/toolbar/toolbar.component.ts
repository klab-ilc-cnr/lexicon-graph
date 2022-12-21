import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GraphVisHttpCallService } from 'src/app/shared/data-storage/graph-vis-http-call.service';
import { ConceptsService } from '../servizi/recuperaConcetti/concepts.service';
import { InferencesService } from '../servizi/recuperaInferenze/inferences.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  /**
   * variabili toggle btns
   */
  isChecked: boolean;
  retrieveInferences: boolean;
  retrieveConcepts: boolean;
  disableBtn: boolean;
  disableMinPath: boolean;
  // btn concetti disabilitato (per ora)
  disableBtnConcept: boolean = true;
  // inferences
  arrayInferiti: any[] = [];
  arrayNonInferiti: any[] = [];
  inference: boolean;
  // concepts
  arrayConcetti: any[] = [];

  constructor(
    private retrieveInferencesService: InferencesService,
    private retrieveConceptsService: ConceptsService,
    private graphHttpCall: GraphVisHttpCallService) { }
  @Input() cy: any;
  @Input() parentNodeElements: any = [];
  @Input() senseNodeElements: any = [];
  @Input() formNodeElements: any = [];

  @Input() senso1;
  @Input() senso2;

  @Output() resetEvent = new EventEmitter<boolean>();

  arrayNoSenseRel = [];

  definitionSplitted: string;

  /**
   * variabile per tenere traccia di un eventuale errore nella chiamata http
   */
  error: null;
  warning: null;
  @Output() errorEmitter = new EventEmitter<any>();
  @Output() warningEmitter = new EventEmitter<any>();

  ngOnInit(): void {
    this.disableBtn = true;
    this.disableMinPath = true;
  }

  /**
  * resetta il viewport e il toggle label/id
  */
  resetView() {
    this.cy.remove(this.cy.elements());
    this.isChecked = false;
    this.arrayNoSenseRel = [];
    // emetto evento per aggiornare cytoscape component 
    this.resetEvent.emit(true);
    this.error = null;
    this.warning = null;
    this.errorEmitter.emit(this.error);
    this.warningEmitter.emit(this.warning);
    this.disableBtn = true;
    this.disableMinPath = true;
    this.retrieveInferences = false;
    this.retrieveConcepts = false;
  }

  /**
 * 
 * @param event checked event del toggle switch per visualizzare come label l'id o il valore della label visibile nel tree DA COMPLETARE
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
        this.cy.getElementById(this.senseNodeElements[i].data.id).removeClass('sense');
        this.cy.getElementById(this.senseNodeElements[i].data.id).addClass('senseLabel');
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
        this.cy.getElementById(this.senseNodeElements[i].data.id).removeClass('senseLabel');
        this.cy.getElementById(this.senseNodeElements[i].data.id).addClass('sense');
      }
      for (var i = 0; i < this.formNodeElements.length; i++) {
        this.cy.getElementById(this.formNodeElements[i].formInstanceName).style('label', this.formNodeElements[i].formInstanceName);
      }
    }
  }

  /**
   * 
   * @param evt checked event del toggle switch per recuperare o meno le inferenze
   */
  inferences(evt) {
    if (evt.checked === true) {
      this.inference = true;
      // chiamata servizio min path recupero inferenze
      this.arrayInferiti = this.retrieveInferencesService.minPath(this.isChecked,
        this.cy, this.senso1, this.senso2, this.inference, this.error,
        this.errorEmitter, this.warning, this.warningEmitter,
        this.arrayNoSenseRel, this.senseNodeElements, this.definitionSplitted, this.arrayInferiti, this.arrayNonInferiti)
    } else {
      this.inference = false;
      // chiamata servizio min path recupero inferenze
      this.arrayNonInferiti = this.retrieveInferencesService.minPath(this.isChecked,
        this.cy, this.senso1, this.senso2, this.inference, this.error,
        this.errorEmitter, this.warning, this.warningEmitter,
        this.arrayNoSenseRel, this.senseNodeElements, this.definitionSplitted, this.arrayInferiti, this.arrayNonInferiti)
    }

  }

  /**
   * 
   * @param evt checked event del toggle switch per recuperare o meno i concetti
   */
  concepts(evt) {
    if (evt.checked === true) {
      this.arrayConcetti = this.retrieveConceptsService.minPath(this.cy, this.senso1, this.senso2, evt.checked, this.arrayNoSenseRel, this.arrayInferiti, this.inference, this.arrayConcetti, this.definitionSplitted, this.senseNodeElements, this.isChecked)
    } else {
      // // elimino nodi array concetti
      // if (evt === false) {
      let nodesRemoved;
      let edgesRemoved;
      this.arrayConcetti.forEach(ele => {
        ele.nodes.forEach(nodi => {
          nodesRemoved = this.cy.getElementById(nodi.data.id);
          // this.cy.remove(nodesRemoved)
          // nodesRemoved.style('opacity', 0)
        })
        // ele.edges.forEach(edge => {
        //   edgesRemoved = cy.getElementById(edge.data.id);
        //   cy.remove(edgesRemoved);
        // })
      });
      console.log('array concetti')
      console.log(this.arrayConcetti)
      console.log('array inferiti')
      console.log(this.arrayInferiti)


      // this.arrayInferiti.forEach(ele => {
      //   ele.nodes.forEach(nodi => {
      //     // let eledaRipristinare = cy.getElementById(nodi.data.id);
      //     nodesRemoved.style('background-color', 'green')
      //   })
      //   //     // ele.edges.forEach(edge => {
      //   //     //   let eledaRipristinare = cy.getElementById(edge.data.id);
      //   //     //   edgesRemoved.restore();
      //   //     // })
      // })
      // }

      // elimino nodi array concetti
      // this.arrayConcetti.forEach(ele => {
      //   ele.edges.forEach(edge => {
      //     let edgeConcettiSIDaRimuovere = this.cy.getElementById(edge.data.id);
      //     // edgeConcettiSIDaRimuovere.style('opacity', '0');
      //     // edgeConcettiSIDaRimuovere.removeClass('senseLabel');
      //     this.cy.remove(edgeConcettiSIDaRimuovere);
      //   });
      //   ele.nodes.forEach(node => {
      //     let nodeConcettiSIDaRimuovere = this.cy.getElementById(node.data.id);
      //     // this.cy.remove(nodeConcettiSIDaRimuovere);
      //     nodeConcettiSIDaRimuovere.style('opacity', '0');
      //   });
      // });

      // this.arrayInferiti.forEach(ele => {
      //   ele.nodes.forEach(nodi => {
      //     let eledaRipristinare = this.cy.getElementById(nodi.data.id);
      //     eledaRipristinare.style('opacity', '1');
      //   })
      //   ele.edges.forEach(edge => {
      //     let eledaRipristinare = this.cy.getElementById(edge.data.id);
      //     eledaRipristinare.style('opacity', '1')
      //   })
      // })
      // this.arrayInferiti.forEach(ele => {
      //   ele.nodes.forEach(nodi => {
      //     let eledaRipristinare = this.cy.getElementById(nodi.data.id);
      //     this.cy.restore(eledaRipristinare);
      //   })
      //   ele.edges.forEach(edge => {
      //     let eledaRipristinare = this.cy.getElementById(edge.data.id);
      //     this.cy.restore(eledaRipristinare);
      //   })
      // })
      this.retrieveInferencesService.minPath(this.isChecked,
        this.cy, this.senso1, this.senso2, this.inference, this.error,
        this.errorEmitter, this.warning, this.warningEmitter,
        this.arrayNoSenseRel, this.senseNodeElements, this.definitionSplitted, this.arrayInferiti, this.arrayNonInferiti)
    }
  }

  /**
   * metodo per recuperare percorso minimo tra due nodi 
   */
  minPath() {
    this.disableBtn = false;
    // chiamata servizio min path recupero escluse inferenze
    this.retrieveInferencesService.minPath(this.isChecked,
      this.cy, this.senso1, this.senso2, false, this.error,
      this.errorEmitter, this.warning, this.warningEmitter,
      this.arrayNoSenseRel, this.senseNodeElements, this.definitionSplitted, this.arrayInferiti, this.arrayNonInferiti)
  }

}
