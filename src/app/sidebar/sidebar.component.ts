import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { LazyLoadEvent, TreeNode } from 'primeng/api';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, take } from 'rxjs/operators';
import { DataStorageService } from '../shared/data-storage/data-storage.service';
import { TreeNodeCustom } from '../shared/models/tree-node-custom.model';
import { NodeService } from '../shared/servizi/node.service';
import { TreeDragDropService } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  providers: [TreeDragDropService],
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
  limit: number = 200;
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

  elFetched: string;

  sensiDroppati = [];
  formsDroppati = [];

  // DRAG event variabile per visualizzare nodo
  visualizedNode: string;
  draggedEle: TreeNodeCustom;
  @Output() invioIdNodo = new EventEmitter<any>();
  constructor(
    private dataStorageService: DataStorageService,
    private nodeService: NodeService,
    private fb: FormBuilder) {

    /**
     * form filtro di ricerca 
     */
    this.cercaEntrataLessicale = this.fb.group({
      entrataLessicale: new FormControl(),
      selectedFilter: ['startsWith', []],
      posSelected: new FormControl(),
      entrySelected: new FormControl()
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
      this.isLoading = true;
      this.dataStorageService.fetchLexicalEntries(text, this.searchMode, this.type, this.pos,
        this.formType, this.author, this.lang, this.status, this.offset, this.limit).pipe(take(1)).subscribe(lexicalEntry => {
          this.text = text;
          if (lexicalEntry) {
            this.isLoading = false;
          }
          if (lexicalEntry.list !== undefined) {
            this.sensesFromLexo = this.nodeService.convertFromLexicalSenses(lexicalEntry);
          }
          this.totalCount = lexicalEntry.totalHits;
          this.limit += 99;
        });
    })
  }

  onScroll(event: any) {
    if (event.originalEvent.target.offsetHeight + event.originalEvent.target.scrollTop >= event.originalEvent.target.scrollHeight) {
      this.dataStorageService.fetchLexicalEntries(this.text, this.searchMode, this.type, this.pos,
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
    }
  }

  retrieveSenses() {
    this.isLoading = true;
    this.sub1 = this.dataStorageService.fetchLexicalEntries(this.text, this.searchMode, this.type, this.pos,
      this.formType, this.author, this.lang, this.status, this.offset, this.limit).pipe(take(1)).subscribe(lexicalEntry => {
        if (lexicalEntry) {
          this.isLoading = false;
        }
        if (lexicalEntry.list !== undefined) {
          this.sensesFromLexo = this.nodeService.convertFromLexicalSenses(lexicalEntry);
        }
        this.totalCount = lexicalEntry.totalHits;
        this.limit += 99;
        // this.sensesFromLexo = this.sensesFromLexo.concat(this.sensesFromLexo);
      })
  }

  /**
   * metodo che restituisce children form 
   * @param idNode nodo parent
   * @returns array di figli di tipo form
   */
  private addFormChildren(idNode) {
    let childrenForm = [];
    this.dataStorageService.fetchForms(idNode).subscribe(el => {
      el.forEach(e => {
        this.formsDroppati.push(e);
        let child2L = {
          label: e.label,
          data: e.label,
          type: 'childF2L',
          leaf: true
        }
        childrenForm.push(child2L);
      });
    });
    return childrenForm;
  }

  private addSenseChildren(idNode) {
    let childrenSense = [];
    this.dataStorageService.fetchSense(idNode).subscribe(el => {
      el.forEach(e => {
        this.sensiDroppati.push(e);
        let child2L = {
          label: e.label,
          data: e.label,
          type: 'childS2L',
          leaf: true
        }
        childrenSense.push(child2L);
      });
    });
    return childrenSense;
  }

  /**
   * 
   * @param event espansione nodo per aprire children alberatura
   */
  nodeExpand(event) {
    let idNode = event.node.data;
    if (event.node.parent === undefined) {
      this.sub2 = this.dataStorageService.fetchElements(idNode).subscribe(el => {
        let tempForm = [];
        let tempSense = [];
        // salvo il parametro leaf in una variabile,
        // se la forma o il senso non ha figli non viene visualizzata la freccia per espandere nodo, altrimenti si
        let isLeaf: boolean;
        el.elements.forEach(elemento => {
          if (elemento.label === 'form') {
            if (elemento.count > 0) {
              isLeaf = false;
            } else {
              isLeaf = true;
            }
            // recupero forme
            tempForm = [{
              label: elemento.label + ' (' + elemento.count + ')',
              leaf: isLeaf,
              type: 'child1level',
              children: []
            }]

            // chiamata metodo privato
            let childrenForm = this.addFormChildren(idNode);
            tempForm.forEach(el => {
              el.children = childrenForm;
            })
            event.node.children = tempForm;
          }
          if (elemento.label === 'sense') {
            if (elemento.count > 0) {
              isLeaf = false;
            } else {
              isLeaf = true;
            }
            // let childrenSense = [];
            // recupero sensi
            tempSense = [{
              label: elemento.label + ' (' + elemento.count + ')',
              leaf: isLeaf,
              type: 'child1level',
              children: []
            }]

            let childrenSense = this.addSenseChildren(idNode);

            tempSense.forEach(el => {
              el.children = childrenSense;
            })
            event.node.children = [...event.node.children, ...tempSense];
            // event.node.children = [...tempForm, ...tempSense];
          }
        })
      });
    }
  }

  onDragStart(event) {
    this.visualizedNode = event.path[0].childNodes[3].innerText;
    // senso
    this.sensiDroppati.forEach(el=>{
      if(el.definition.includes(this.visualizedNode.trim())){
        localStorage.setItem('sensoChild',JSON.stringify(el))
      }
    })
    // forma
    this.formsDroppati.forEach(el=>{
      if(el.label.includes(this.visualizedNode.trim())){  
        localStorage.setItem('formChild',JSON.stringify(el))
      }
    })
    this.invioIdNodo.emit(this.visualizedNode);
    let result = this.visualizedNode.trim();
    let sensoDropped = JSON.parse(localStorage.getItem('sensoChild'))
    let formDropped = JSON.parse(localStorage.getItem('formChild'));
  //   if(sensoDropped !== null && result === sensoDropped.label){
  //     localStorage.setItem('isAsense','true');
  //     localStorage.setItem('isAform','false');
  //   }
  //  if(formDropped !== null && result === formDropped.label){
  //     localStorage.setItem('isAform','true');
  //     localStorage.setItem('isAsense','false');
  //   }
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

  callServicePos() {
    let posSel: any = { name: '' };
    if (this.cercaEntrataLessicale.get('posSelected').value !== null) {
      posSel = this.cercaEntrataLessicale.get('posSelected').value.name
    } else {
      posSel = ""
    }
    this.pos = posSel;
    this.retrieveSenses();
  }

  callServiceEntry(e) {
    // toglie errore 
    if (e.value !== null) {
      if (e.value.name === 'entry') {
        this.sub1 = this.dataStorageService.fetchLexicalEntries(this.text, this.searchMode, this.type, this.pos,
          this.formType, this.author, this.lang, this.status, this.offset, this.limit).subscribe(lexicalEntry => {
            if (lexicalEntry.list !== undefined) {
              this.sensesFromLexo = this.nodeService.convertFromLexicalSenses(lexicalEntry);
            }
          })
      }
      if (e.value.name === 'flexed') {
        // espando nodi parent
        this.dataStorageService.fetchLexicalEntries(this.text, this.searchMode, this.type, this.pos,
          'flexed', this.author, this.lang, this.status, this.offset, this.limit).subscribe(lexicalEntry => {
            this.totalCount = lexicalEntry.totalHits;
            lexicalEntry.list.forEach(l => {
              let flexedParent;
              flexedParent = [{
                collapsedIcon: "pi pi-folder",
                expandedIcon: "pi pi-folder-open",
                label: l.label,
                leaf: false,
                type: "parentLevel",
                children: []
              }]; 
              this.sensesFromLexo = this.nodeService.convertFromLexicalSenses(lexicalEntry);
              this.elFetched = l.lexicalEntryInstanceName;
            });
            this.sub2 = this.dataStorageService.fetchElements(this.elFetched).subscribe(el => {
              el.elements.forEach(elemento => {
                if (elemento.label === 'form' && elemento.count > 0) {
                  // recupero forme
                  let tempForm = [{
                    collapsedIcon: "pi pi-folder",
                    expandedIcon: "pi pi-folder-open",
                    label: elemento.label + ' (' + elemento.count + ')',
                    leaf: false,
                    children: []
                  }];

                  this.sensesFromLexo.forEach(el => {
                    el.children = tempForm
                  })
                  this.sensesFromLexo.forEach(node => {
                    this.expandRecursive(node, true);
                  });
                  // chiamata metodo privato
                  let childrenForm = this.addFormChildren(this.elFetched);
                  // apre parent

                  // apre children
                  tempForm.forEach(el => {
                    el.children = childrenForm;
                  })
                }
              })
            });


          });


      }
    } else {
      // collapse nodi espansi
      this.sensesFromLexo.forEach(node => {
        this.expandRecursive(node, false);
      });
    }

  }


  private expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach(childNode => {
        this.expandRecursive(childNode, isExpand);
      });
    }
  }

  showFilter() {
    this.showF = !this.showF;
    if (this.showF === true) {
      this.scrollHeight = '370px';
    } else {
      this.scrollHeight = '500px';
    }
  }

  resetFilter() {
    this.cercaEntrataLessicale.get('entrataLessicale').setValue('');
    this.cercaEntrataLessicale.get('selectedFilter').setValue('startsWith');
    this.cercaEntrataLessicale.get('posSelected').setValue('');
    this.cercaEntrataLessicale.get('entrySelected').setValue('');
    this.searchMode = "startsWith";
    this.text = "*";
    this.pos = "";
  }

  onChange(e) {
    this.searchMode = e.target.value;
    this.isLoading = true;
    this.sub1 = this.dataStorageService.fetchLexicalEntries(this.text, this.searchMode, this.type, this.pos,
      this.formType, this.author, this.lang, this.status, this.offset, this.limit).pipe(take(1)).subscribe(lexicalEntry => {
        if (lexicalEntry) {
          this.isLoading = false;
        }
        if (lexicalEntry.list !== undefined) {
          this.sensesFromLexo = this.nodeService.convertFromLexicalSenses(lexicalEntry);
        }
        this.totalCount = lexicalEntry.totalHits;
        this.limit += 99;
        this.sensesFromLexo = this.sensesFromLexo.concat(this.sensesFromLexo);
      })
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