import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, take } from 'rxjs/operators';
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
  sub4: Subscription;
  /**
   * variabili alberatura
   *
   */
  text: string = "*";
  searchMode: string = "startsWith";
  type: string = "";
  pos: any = "";
  formType: string = "entry";
  author: string = "";
  lang: string = "";
  status: string = "";
  offset: number = 0;
  limit: number = 500;
  totalCount: number;

  /**
   * filtri ricerca 
   */
  cercaEntrataLessicale: FormGroup;

  isLoading: boolean = false;

  showF: boolean = false;

  scrollHeight: string;


  entries = [
    { name: 'entry' },
    { name: 'flexed' }
  ];

  posFetched = [];

  constructor(
    private dataStorageService: DataStorageService,
    private nodeService: NodeService,
    private fb: FormBuilder) {

    /**
     * form filtro di ricerca 
     */
    this.cercaEntrataLessicale = this.fb.group({
      entrataLessicale: new FormControl(),
      selectedFilter: ['starts', []],
      posSelected: new FormControl(),
    })
  }


  ngOnInit(): void {
    this.scrollHeight = '500px';
    // recupero lista entrate lessicali da visualizzare nell'alberatura TO DO VIRTUAL SCROLL
    this.retrieveSenses();
    this.cercaEntrataLessicale.get('entrataLessicale').valueChanges.pipe(
      debounceTime(500)
      , distinctUntilChanged()
    ).subscribe((text: string) => {
      this.dataStorageService.fetchLexicalEntries(text, this.searchMode, this.type, this.pos,
        this.formType, this.author, this.lang, this.status, this.offset, this.limit).pipe(take(1)).subscribe(lexicalEntry => {
          this.isLoading = true;
          if (this.cercaEntrataLessicale.get('entrataLessicale').value === '') {
            this.isLoading = false;
          }
          if (lexicalEntry.list !== undefined) {
            this.sensesFromLexo = this.nodeService.convertFromLexicalSenses(lexicalEntry);
          }
          this.totalCount = lexicalEntry.totalHits;
          this.limit += 99;
          this.sensesFromLexo = this.sensesFromLexo.concat(this.sensesFromLexo);
        });
    })
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

  onScroll(event: any) {
    if (event.originalEvent.target.offsetHeight + event.originalEvent.target.scrollTop >= event.originalEvent.target.scrollHeight - 1) {
        this.retrieveSenses();
    }
  }

  // fetchSenses(lexicalEntry, event) {
  //   this.sub3 = this.dataStorageService.fetchSense(lexicalEntry).subscribe(el => {
  //     let tempEl = el.map(e => {
  //       return {
  //         collapsedIcon:"pi pi-folder-open",
  //         label: e.label,
  //         data: e.label,
  //         leaf: true
  //       }
  //     });
  //     event.node.children = tempEl
  //   })
  // }

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

  /**
   * 
   * @param event espansione nodo per aprire children alberatura
   */
  nodeSelect(event) {
    let idNode = event.node.data
    this.sub2 = this.dataStorageService.fetchElements(idNode).subscribe(el => {
      el.elements.forEach(elemento => {
        if (elemento.label === 'form' && elemento.count > 0) {
          // recupero forme
          let tempForm = [{
            collapsedIcon: "pi pi-folder",
            expandedIcon: "pi pi-folder-open",
            label: elemento.label + ' (' + elemento.count + ')',
            leaf: false,
            children: [{
            }]
          }]
          event.node.children = tempForm;
          this.dataStorageService.fetchForms(idNode).subscribe(el => {
            let childrenForm = el.map(e => {
              return {
                collapsedIcon: "pi pi-folder-open",
                label: e.label,
                data: e.label,
                leaf: true
              }
            });
            tempForm.forEach(el => {
              el.children = childrenForm;
            })
          })
        }
        if (elemento.label === 'sense' && elemento.count > 0) {
          // recupero sensi
          let tempSense = [{
            collapsedIcon: "pi pi-folder",
            expandedIcon: "pi pi-folder-open",
            label: elemento.label + ' (' + elemento.count + ')',
            leaf: false,
            children: [{
            }]
          }]
          event.node.children = tempSense;
          this.dataStorageService.fetchSense(idNode).subscribe(el => {
            let childrenSense = el.map(e => {
              return {
                collapsedIcon: "pi pi-folder-open",
                label: e.label,
                data: e.label,
                leaf: true
              }
            });
            tempSense.forEach(el => {
              el.children = childrenSense;
            })
          })
        }
      })
    });
  }

  fetchPos() {
    this.sub4 = this.dataStorageService.fetchPos().subscribe(el => {
      this.posFetched = el.map(pos => {
        let objTransform = {};
        objTransform['name'] = pos.label;
        return objTransform
      })
    })
  }

  callService() {
    let posSel: any = { name: '' };
    if (this.cercaEntrataLessicale.get('posSelected').value !== null) {
      posSel = this.cercaEntrataLessicale.get('posSelected').value.name
    } else {
      posSel = ""
    }
    this.pos = posSel;
    this.retrieveSenses();
  }

  showFilter() {
    this.showF = !this.showF;
    if(this.showF===true){
      this.scrollHeight = '370px';
    } else {
      this.scrollHeight = '500px';
    }
  }

  onChange(e) {
    this.type = e.target.value;
    console.log('on change .target.value ')
    console.log(e.target.value)
  }

  /**
   * unsubscribe subscriptions
   */
  ngOnDestroy() {
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
    this.sub3.unsubscribe();
    this.sub4.unsubscribe();
  }

}