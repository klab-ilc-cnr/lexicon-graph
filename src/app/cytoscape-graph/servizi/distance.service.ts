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
              let edgeId;
              if (direction === 'incoming') {
                ele.edges.forEach(edge => {
                  if (edge.data.source === node0) {
                    edgeId = edge.data.id
                  }
                  return edgeId;
                });
              }
              if (direction === 'outgoing') {
                ele.edges.forEach(edge => {
                  if (edge.data.source === node1) {
                    edgeId = edge.data.id
                  }
                  return edgeId;
                });
              }
              ele.edges.forEach(edge => {
                cy.add([{
                  group: "edges",
                  data: {
                    id: edgeId,
                    source: edge.data.source,
                    target: edge.data.target,
                    label: edgeId
                  }
                }]);
                cy.edges().filter(':visible').style("edge-text-rotation", "autorotate");
              })
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
            label: relantionType
          }
        }]);
        cy.edges().filter(':visible').style("edge-text-rotation", "autorotate");
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
