import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { GraphVisHttpCallService } from 'src/app/shared/data-storage/graph-vis-http-call.service';
import { InferencesService } from '../servizi/inferences.service';

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
  // inferences
  arrayInferiti: any[] = [];
  arrayNonInferiti: any[] = [];

  constructor(
    private retrieveInferencesService: InferencesService,
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
    let inferences: boolean;
    if (evt.checked === true) {
      inferences = true;
      // chiamata servizio min path recupero inferenze
      this.arrayInferiti = this.retrieveInferencesService.minPath(this.isChecked,
        this.cy, this.senso1, this.senso2, inferences, this.error,
        this.errorEmitter, this.warning, this.warningEmitter,
        this.arrayNoSenseRel, this.senseNodeElements, this.definitionSplitted, this.arrayInferiti, this.arrayNonInferiti)
    } else {
      inferences = false;
      // chiamata servizio min path recupero inferenze
      this.arrayNonInferiti = this.retrieveInferencesService.minPath(this.isChecked,
        this.cy, this.senso1, this.senso2, inferences, this.error,
        this.errorEmitter, this.warning, this.warningEmitter,
        this.arrayNoSenseRel, this.senseNodeElements, this.definitionSplitted, this.arrayInferiti, this.arrayNonInferiti)
    }

  }

  /**
   * 
   * @param evt checked event del toggle switch per recuperare o meno i concetti
   */
  concepts(evt) {

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
