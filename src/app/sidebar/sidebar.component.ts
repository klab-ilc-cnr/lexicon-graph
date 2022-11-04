import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { DataStorageService } from '../shared/data-storage/data-storage.service';
import { TreeNodeCustom } from '../shared/models/tree-node-custom.model';
import { NodeService } from '../shared/servizi/node.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

  sensesFromLexo: TreeNodeCustom[] = [];
  /**
   * subscription
   */
  sub1: Subscription;
  sub2: Subscription;
  sub3: Subscription;
  /**
   * variabili alberatura
   *
   */
  text: string = "*";
  searchMode: string = "startsWith";
  type: string = "";
  pos: string = "";
  formType: string = "entry";
  author: string = "";
  lang: string = "";
  status: string = "";
  offset: number = 0;
  limit: number = 500;
  totalCount: number;

  cercaEntrataLessicale: FormGroup;
  constructor(
    private dataStorageService: DataStorageService,
    private nodeService: NodeService) {

    this.cercaEntrataLessicale = new FormGroup({
      entrataLessicale: new FormControl('')
    })
  }


  ngOnInit(): void {
      this.retrieveSenses();    
  }

  fetchForms(lexicalEntry, event) {
    this.sub3 = this.dataStorageService.fetchForms(lexicalEntry).subscribe(el => {
      let tempEl = el.map(e => {
        return {
          collapsedIcon: "pi pi-folder-open",
          label: e.label,
          data: e.label,
          leaf: true
        }
      });
      event.node.children = tempEl
    })
  }

  fetchSenses(lexicalEntry, event) {
    this.sub3 = this.dataStorageService.fetchSense(lexicalEntry).subscribe(el => {
      let tempEl = el.map(e => {
        return {
          collapsedIcon:"pi pi-folder-open",
          label: e.label,
          data: e.label,
          leaf: true
        }
      });
      event.node.children = tempEl
    })
  }

  retrieveSenses() {
    this.sub1 = this.dataStorageService.fetchLexicalEntries(this.text, this.searchMode, this.type, this.pos,
      this.formType, this.author, this.lang, this.status, this.offset, this.limit).pipe(take(1)).subscribe(lexicalEntry => {
        if (lexicalEntry.list !== undefined) {
          this.sensesFromLexo = this.nodeService.convertFromLexicalSenses(lexicalEntry);        
        }
        this.totalCount = lexicalEntry.totalHits;
        this.limit += 99;
        this.sensesFromLexo = this.sensesFromLexo.concat(this.sensesFromLexo);
      })
  }

  nodeSelect(event) {
    let idNode = event.node.data
    // if(event.node){
    //   this.retrieveSenses();
    //   // this.sensesFromLexo = this.nodeService.convertFromLexicalSenses(event.node);        
    //     }
    this.sub2 = this.dataStorageService.fetchElements(idNode).subscribe(el => {
      el.elements.forEach(elemento => {
        if (elemento.label === 'form' && elemento.count > 0) {
          // this.fetchForms(idNode, event);
          let tempForm= [{
            collapsedIcon: "pi pi-folder-open",
            label: elemento.label + ' ('+elemento.count+')',
            leaf: false
          }]
          event.node.children = tempForm;
        }
        if (elemento.label === 'sense' && elemento.count > 0) {
          let tempSense= [{
            collapsedIcon: "pi pi-folder-open",
            label: elemento.label + ' ('+elemento.count+')',
          }]
          event.node.children = tempSense;
          // if(event.node.parent!== undefined){
          // }
        //  this.fetchSenses(idNode, event);
        }
      })
    });
  }

  onScrollDown(){
    this.retrieveSenses();
  }

  /**
   * unsubscribe subscriptions
   */
  ngOnDestroy() {
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
    this.sub3.unsubscribe();
  }

}