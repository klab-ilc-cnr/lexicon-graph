import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { TreeNode } from 'primeng/api';
import {TreeDragDropService} from 'primeng/api'; 
@Component({
  selector: 'app-tree-column',
  templateUrl: './tree-column.component.html',
  providers: [TreeDragDropService],
  styleUrls: ['./tree-column.component.scss']
})
export class TreeColumnComponent implements OnInit {
  /**
   * variabili tree node
   */
  test: TreeNode[];
  nodeDragged:string;

  constructor() { }

  ngOnInit(): void {
    // this.nodeService.getFiles().then(elementi => this.test = elementi);
  }

  onDrop(event) {
  this.nodeDragged = event.dragNode.label;
}

}
