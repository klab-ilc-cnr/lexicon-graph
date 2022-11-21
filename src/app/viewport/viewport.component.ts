import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { TreeNodeCustom } from '../shared/models/tree-node-custom.model';
import { CytoscapeGraphComponent } from '../cytoscape-graph/cytoscape-graph.component';

@Component({
  selector: 'app-viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.scss','../mediaqueries/mediaquery.scss'],
  animations: [
    trigger('slidein', [
      transition(':enter', [
        // when ngif has true
        style({ transform: 'translateX(-100%)' }),
        animate(250, style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        // when ngIf has false
        animate(250, style({ transform: 'translateX(-100%)' }))
      ])
    ])
  ]
})
export class ViewportComponent implements OnInit {  
  constructor() { }
  @ViewChild(CytoscapeGraphComponent, { static: true }) istanzaCyComponent: CytoscapeGraphComponent;
  @Input() parentReceived:TreeNodeCustom;
  @Input() senseReceived: TreeNodeCustom;
  @Input() formReceived: TreeNodeCustom;
  expanded:boolean = true;
  ngOnInit(): void {
  }
 
  /**
   * 
   * @param $event nodi di tipo parent, form e senso ricevuti da sidebar, ricevuti a sua volta dal componente tree
   */
  nodoParentFromSidebar($event){
    this.parentReceived = $event;
  }

  nodoSenseFromSidebar($event){
    this.senseReceived = $event;
  }

  nodoFormFromSidebar($event){
    this.formReceived = $event;
  }

  resetGraph($event){
    // se evento ricevuto da sidebar c è true, chiamo servizio in cytoscape c per resettare view
    if($event === true){
      this.istanzaCyComponent.resetView();
    }
  }
}
