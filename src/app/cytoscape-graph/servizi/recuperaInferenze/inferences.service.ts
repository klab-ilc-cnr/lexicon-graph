import { Injectable } from '@angular/core';
import { GraphVisHttpCallService } from 'src/app/shared/data-storage/graph-vis-http-call.service';

@Injectable({
  providedIn: 'root'
})
export class InferencesService {
  constructor(private graphHttpCall: GraphVisHttpCallService) { }

  minPath(isChecked, cy, senso1, senso2, inference, error, errorEmitter, warning, warningEmitter, arrayNoSenseRel, senseNodeElements, definitionSplitted, arrayInferiti, arrayNonInferiti) {
    let elements = [];
    this.graphHttpCall.fetchMinPath(senso1.senseInstanceName, senso2.senseInstanceName, inference).subscribe(el => {
      // elimino nodi non inferiti se slide è su visualizza nodi inferiti
      arrayNonInferiti.forEach(ele => {
        ele.nodes.forEach(nodi => {
          let eleNonInferitiDaRimuovere = cy.getElementById(nodi.data.id);
          cy.remove(eleNonInferitiDaRimuovere)
        })
      })
      // elimino nodi inferiti se slide è su visualizza nodi NON inferiti
      arrayInferiti.forEach(ele => {
        ele.nodes.forEach(nodi => {
          let eleInferitiDaRimuovere = cy.getElementById(nodi.data.id);
          cy.remove(eleInferitiDaRimuovere)
        })
      })
      // svuoto array 
      arrayNoSenseRel = [];
      arrayInferiti = [];
      arrayNonInferiti = [];

      el.forEach(percorso => {
        if (percorso.nodes.length === 0) {
          warning = true;
          warningEmitter.emit(warning);
        }
        else {
          error = null;
          errorEmitter.emit(error);
          warning = false;
          warningEmitter.emit(warning);
        }

        let accettable = true;
        percorso.edges.forEach(edge => {
          if (
            edge.data.relationType === "http://www.w3.org/ns/lemon/ontolex#reference" ||
            edge.data.relationType === "http://www.w3.org/ns/lemon/ontolex#isReferenceOf" ||
            edge.data.relationType === "http://www.w3.org/ns/lemon/vartrans#senseRel" ||
            edge.data.relationType === "http://www.lexinfo.net/ontology/3.0/lexinfo#meronymTerm" ||
            edge.data.relationType === "http://www.lexinfo.net/ontology/3.0/lexinfo#holonymTerm" ||
            edge.data.relationType === "http://www.lexinfo.net/ontology/3.0/lexinfo#partitiveRelation") {
            accettable = false;
          }
        });
        if (accettable) {
          arrayNoSenseRel.push(percorso);
        }
      });
      arrayNoSenseRel.forEach(elemento => {
        elements.push(elemento)
        if (inference === true) {
          arrayInferiti.push(elemento)
        } else {
          arrayNonInferiti.push(elemento);
        }
        let nodi = elemento.nodes;
        let edge = elemento.edges;
        for (var i = 0; i < nodi.length; i++) {
          senseNodeElements.push(nodi[i])
          if (nodi[i].data.definition.split(" ").length > 3) {
            definitionSplitted = nodi[i].data.definition.split(' ').slice(0, 3).join(' ') + '...'
          } else {
            definitionSplitted = nodi[i].data.definition;
          }
          cy.add([{
            group: "nodes",
            data: {
              id: nodi[i].data.id,
              label: nodi[i].data.label,
              pos: nodi[i].data.pos,
              definition: definitionSplitted,
              definitionSplitt: definitionSplitted,
              lemma: nodi[i].data.label
            }
          }]);
          cy.getElementById(nodi[i].data.id).style('display', 'element');
          cy.getElementById(nodi[i].data.id).addClass('border');
          if (isChecked === false) {
            cy.getElementById(nodi[i].data.id).removeClass('sense');
            cy.getElementById(nodi[i].data.id).addClass('senseLabel');
          } else {
            cy.getElementById(nodi[i].data.id).removeClass('senseLabel');
            cy.getElementById(nodi[i].data.id).addClass('sense');
          }
        }
        // creo edge collegati
        for (var i = 0; i < edge.length; i++) {
          // splitto stringa del relationType per stampare solo nome relazione e non tutto il link
          var relation = edge.map(el => {
            let nuovo = el.data.relationType.split('#')[1]
            return nuovo
          })
          cy.add([{
            group: "edges",
            data: {
              id: edge[i].data.id,
              source: edge[i].data.source,
              target: edge[i].data.target,
              label: relation[i],
              inferred: edge[i].data.inferred,
              relationType: edge[i].data.relationType
            }
          }]);
          cy.getElementById(edge[i].data.id).style('display', 'element');
          cy.edges().filter(':visible').style('label', function (label) { return (label.data().label + "\n\n \ \u2060") });
          cy.edges().filter(':visible').style("text-wrap", "wrap");
          cy.getElementById(edge[i].data.id).style("edge-text-rotation", "autorotate");
          // stile per elementi inferiti
          if (edge[i].data.inferred === true) {
            cy.getElementById(edge[i].data.id).addClass('inferred')
          } else {
            if (edge[i].data.relationType === 'http://www.lexinfo.net/ontology/3.0/lexinfo#hyponym' ||
              edge[i].data.relantionType === 'http://www.lexinfo.net/ontology/3.0/lexinfo#hypernym') {
              cy.getElementById(edge[i].data.id).addClass('iponimi');
            }
            if (edge[i].data.relationType === 'http://www.lexinfo.net/ontology/3.0/lexinfo#partHolonym' ||
              edge[i].data.relationType === 'http://www.lexinfo.net/ontology/3.0/lexinfo#partMeronym') {
              cy.getElementById(edge[i].data.id).addClass('meronimi');
            }
            if (edge[i].data.relationType === 'http://www.lexinfo.net/ontology/3.0/lexinfo#synonym') {
              cy.getElementById(edge[i].data.id).addClass('sinonimi');
            }
          }
        }
      })
      var layout = cy.elements().filter(':visible').layout({
        name: 'cola',
        // convergenceThreshold: 100, // end layout sooner, may be a bit lower quality
        animate: false,
        edgeLength: 250,
        fit: true
      });
      layout.run();

    },
      (error) => {
        error = error.message;
        errorEmitter.emit(error);
      });
    return elements
  }
}
