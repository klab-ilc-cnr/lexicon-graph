import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { TreeNodeCustom } from '../shared/models/tree-node-custom.model';
import { CytoscapeGraphComponent } from '../cytoscape-graph/cytoscape-graph.component';
import { ResizedEvent } from 'angular-resize-event';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.scss','../mediaqueries/mediaquery.scss']
})
export class ViewportComponent implements OnInit {  
  constructor() { }
  @ViewChild(CytoscapeGraphComponent, { static: true }) istanzaCyComponent: CytoscapeGraphComponent;
  @Input() parentReceived:TreeNodeCustom;
  @Input() senseReceived: TreeNodeCustom;
  @Input() formReceived: TreeNodeCustom;

  eventsSubject: Subject<boolean> = new Subject();
  expanded:boolean = true;

  width: number;
  height: number;
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
      this.istanzaCyComponent.isChecked = false;
    }
  }

  /**
   * 
   * @param event evento resize, se la larghezza è minore a 236 si applicano degli stili alla colonna: font e icone diminuite
   */
  onResized(event: ResizedEvent) {
    this.width = event.newRect.width;
    this.height = event.newRect.height;

    if(event.newRect.width < 236){
      this.eventsSubject.next(true);
    } else{
      this.eventsSubject.next(false);
    }
  }
}
