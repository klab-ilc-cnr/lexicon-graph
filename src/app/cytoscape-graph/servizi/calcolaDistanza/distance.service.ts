import { Injectable } from '@angular/core';
import { GraphVisHttpCallService } from 'src/app/shared/data-storage/graph-vis-http-call.service';

@Injectable({
  providedIn: 'root'
})
export class DistanceService {

  constructor(private graphHttpCall: GraphVisHttpCallService) { }

  levelOne(cy, node0, node1, relantionType, direction) {
    this.graphHttpCall.fetchNodeMaxHops(node1, relantionType, direction).subscribe(elem => {
      if (elem !== null) {
        elem.forEach(res => {
          if (res.lenght === 1 && res.hops.includes('http://lexica/mylexicon#' + node0)) {
            this.graphHttpCall.fetchSubGraph(node1, relantionType, 1, direction).subscribe(ele => {
              if (direction === 'incoming') {
                ele.edges.forEach(edge => {
                  if (edge.data.source === node0 && edge.data.target === node1) {
                    cy.add([{
                      group: "edges",
                      data: {
                        id: edge.data.id,
                        source: node0,
                        target: node1,
                        label: edge.data.relationType,
                        relantionType: edge.data.relationType
                      }
                    }]);
                    cy.edges().filter(':visible').style('label', function (label) { return (label.data().label + "\n\n \ \u2060") });
                    cy.edges().filter(':visible').style("text-wrap", "wrap");
                    cy.edges().filter(':visible').style("edge-text-rotation", "autorotate");
                    if (cy.getElementById(edge.data.id).data().relantionType === 'hyponym') {
                      cy.getElementById(edge.data.id).addClass('iponimi');
                    }
                    if (cy.getElementById(edge.data.id).data().relantionType === 'partMeronym') {
                      cy.getElementById(edge.data.id).addClass('meronimi');
                    }
                    if (cy.getElementById(edge.data.id).data().relantionType === 'synonym') {
                      cy.getElementById(edge.data.id).addClass('sinonimi');
                    }
                  }
                });
              }
              if (direction === 'outgoing') {
                ele.edges.forEach(edge => {
                  if (edge.data.source === node1 && edge.data.target === node0) {
                    cy.add([{
                      group: "edges",
                      data: {
                        id: edge.data.id,
                        source: node1,
                        target: node0,
                        label: edge.data.relationType,
                        relantionType: edge.data.relationType
                      }
                    }]);
                    cy.edges().filter(':visible').style('label', function (label) { return (label.data().label + "\n\n \ \u2060") });
                    cy.edges().filter(':visible').style("text-wrap", "wrap");
                    cy.edges().filter(':visible').style("edge-text-rotation", "autorotate");
                    if (cy.getElementById(edge.data.id).data().relantionType === 'hyponym') {
                      cy.getElementById(edge.data.id).addClass('iponimi');
                    }
                    if (cy.getElementById(edge.data.id).data().relantionType === 'partMeronym') {
                      cy.getElementById(edge.data.id).addClass('meronimi');
                    }
                    if (cy.getElementById(edge.data.id).data().relantionType === 'synonym') {
                      cy.getElementById(edge.data.id).addClass('sinonimi');
                    }
                  }
                });
              }
            })
          }
        })
      }
    });

  }

  dblClic(cy, event, relantionType, direction) {
    let sense = event.target.data().id;
    this.graphHttpCall.fetchSubGraph(sense, relantionType, 1, direction).subscribe(el => {
      el.nodes.forEach(node => {
        cy.add([{
          group: "nodes",
          data: {
            id: node.data.id,
            label: node.data.id
          },
        }]);
        cy.getElementById(node.data.id).addClass('border');
        cy.getElementById(node.data.id).addClass('dblclic');
        cy.getElementById(sense).removeClass('dblclic');
      });
      el.edges.forEach(edge => {
        cy.add([{
          group: "edges",
          data: {
            id: edge.data.id,
            source: edge.data.source,
            target: edge.data.target,
            label: relantionType,
            relantionType: relantionType
          }
        }]);
        cy.edges().filter(':visible').style('label', function (label) { return (label.data().label + "\n\n \ \u2060") });
        cy.edges().filter(':visible').style("text-wrap", "wrap");
        cy.edges().filter(':visible').style("edge-text-rotation", "autorotate");
        if (cy.getElementById(edge.data.id).data().relantionType === 'hyponym') {
          cy.getElementById(edge.data.id).addClass('iponimi');
        }
        if (cy.getElementById(edge.data.id).data().relantionType === 'partMeronym') {
          cy.getElementById(edge.data.id).addClass('meronimi');
        }
        if (cy.getElementById(edge.data.id).data().relantionType === 'synonym') {
          cy.getElementById(edge.data.id).addClass('sinonimi');
        }
      });
      var layout = cy.elements().layout({
        name: 'concentric',
        fit: false,
        minNodeSpacing: 150,
      });
      layout.run();
    })
  }

}
