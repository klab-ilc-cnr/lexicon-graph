import { Component, HostListener, Input, OnInit } from '@angular/core';
import * as cytoscape from 'cytoscape';

@Component({
  selector: 'app-cytoscape-graph',
  templateUrl: './cytoscape-graph.component.html',
  styleUrls: ['./cytoscape-graph.component.scss']
})
export class CytoscapeGraphComponent implements OnInit {
  constructor() { }
  cy: any;
  @HostListener('window:mousedown', ['$event'])
  onMouseHover(event: MouseEvent) {
    // console.log('event mouse down')
    // console.log(event)
    // console.log('noegrab')
    // console.log(this.visualizedDraggedNode)
  }
  @Input() visualizedDraggedNode: string;
  ngOnInit(): void {
    const that = this;
    this.cy = cytoscape({
      container: document.getElementById('cy'),
      minZoom: 0.2,
      maxZoom: 5.0,
      zoomingEnabled: true,
      textureOnViewport: true,
      hideEdgesOnViewport: true,
      wheelSensitivity: 0.1,

      style: [
        {
          selector: 'node',
          style: {
            // 'display': 'none',
            'width': '50',
            'height': '50',
            'label': 'data(id)'

          }
        },
        {
          selector: 'edge',
          style: {
            'target-arrow-shape': 'triangle',
            'curve-style': 'straight'
          }
        }
      ],
    });
  }


  drop(evt) {
    let label = this.visualizedDraggedNode.slice(0, this.visualizedDraggedNode.indexOf(' - '));
    var pos = {
      x: evt.x, y: evt.y
    };
    this.cy.add([{
      group: "nodes",
      data: {
        id: label,
        label: label,
      },
      renderedPosition: pos,

    }]);
    this.cy.getElementById(this.visualizedDraggedNode).style('display', 'element');
  }
}
