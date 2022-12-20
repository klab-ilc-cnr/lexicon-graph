import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TreeNodeCustom } from '../shared/models/tree-node-custom.model';
import { CytoscapeGraphComponent } from '../cytoscape-graph/cytoscape-graph.component';
import { ResizedEvent } from 'angular-resize-event';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-viewport',
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.scss', '../mediaqueries/mediaquery.scss']
})
export class ViewportComponent implements OnInit {

  constructor() { }
  @ViewChild(CytoscapeGraphComponent, { static: true }) istanzaCyComponent: CytoscapeGraphComponent;
  @Input() parentReceived: TreeNodeCustom;
  @Input() senseReceived: TreeNodeCustom;
  @Input() formReceived: TreeNodeCustom;
  draggedNodeReceived: TreeNodeCustom;
  eventsSubject: Subject<boolean> = new Subject();
  expanded: boolean = true;

  width: number;
  height: number;

  resetEventsSubject: Subject<boolean> = new Subject();

  ngOnInit(): void {
  }

  /**
   * 
   * @param $event nodi di tipo parent, form e senso ricevuti da sidebar, ricevuti a sua volta dal componente tree
   */
  nodoParentFromSidebar($event) {
    this.parentReceived = $event;
  }

  nodoSenseFromSidebar($event) {
    this.senseReceived = $event;
  }

  nodoDraggedFromSidebar($event) {
    this.draggedNodeReceived = $event;
  }

  nodoFormFromSidebar($event) {
    this.formReceived = $event;
  }

  resetGraph($event) {
    this.resetEventsSubject.next($event);
    // se evento ricevuto da sidebar c è true, chiamo servizio in cytoscape c per resettare view
    // if ($event === true) {
    //   this.istanzaToolBarComponent.resetView();
    //   this.istanzaToolBarComponent.isChecked = false;
    //   this.istanzaCyComponent.isChecked = false;
    // }
  }

  expandedSidebar() {
    this.expanded = !this.expanded;
    let left = document.getElementById('first');
    let right = document.getElementById('second');
    if (this.expanded === false) {
      console.log('clicked chiudi')
      left.style.flex = `0 5 0`;
      right.style.flex = `0 5 100%`;

    } else {
      console.log('clicked aperto')
      left.style.flex = `0 5 25%`;
      right.style.flex = `0 5 75%`;
    }
  }
  /**
   * 
   * @param event evento resize, se la larghezza è minore a 236 si applicano degli stili alla colonna: font e icone diminuite
   */
  onResized(event: ResizedEvent) {
    this.width = event.newRect.width;
    this.height = event.newRect.height;

    if (event.newRect.width < 236) {
      this.eventsSubject.next(true);
    } else {
      this.eventsSubject.next(false);
    }
  }
}
