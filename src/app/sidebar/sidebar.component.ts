import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TreeNode } from 'primeng/api';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, take } from 'rxjs/operators';
import { DataStorageService } from '../shared/data-storage/data-storage.service';
import { TreeNodeCustom } from '../shared/models/tree-node-custom.model';
import { NodeService } from '../shared/servizi/node.service';
import { TreeDragDropService } from 'primeng/api';
import { TreeComponent } from '../tree/tree.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  providers: [TreeDragDropService],
  styleUrls: ['./sidebar.component.scss', '../mediaqueries/mediaquery.scss']
})
export class SidebarComponent implements OnInit {
  @ViewChild(TreeComponent, { static: true }) istanzaTreeComponent: TreeComponent;

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
  @Input() pos: any = "";
  formType: string = "entry";
  author: string = "";
  lang: string = "";
  status: string = "";
  offset: number = 0;
  limit: number = 200;
  totalCount: number;
  scrollToTop: boolean;

  /**
   * filtri ricerca 
   */
  cercaEntrataLessicale: FormGroup;

  isLoading: boolean = false;

  showF: boolean = false;

  entries = [
    { name: 'entry' },
    { name: 'flexed' }
  ];
  posFetched = [];

  elFetched: string;

  listener;

  showMorphTraits: boolean = false;
  // DRAG event variabile per visualizzare nodo
  draggedEle: TreeNodeCustom;

  /**
  * output event per inviare nodi di tipo parent, sense o form
  */
  @Output() invioNodoParentFromTree = new EventEmitter<any>();
  @Output() invioNodoSenseFromTree = new EventEmitter<any>();
  @Output() invioNodoFormFromTree = new EventEmitter<any>();
  @Output() invioDraggedNodeFromTree = new EventEmitter<any>();

  parentSent: TreeNodeCustom;
  senseSent: TreeNodeCustom;
  formSent: TreeNodeCustom;
  /** 
   * event emitter per resettare grafo se viene resettato form
   */
  @Output() resetGraph = new EventEmitter<boolean>();

  changeFont: boolean;
  fontInput = '0.9rem'
  heightTree: number;

  _val: Subject<boolean> = new Subject();
  @Input()
  set events(val: Subject<boolean>) {
    this._val = val;
  }

  private eventsSubscription: Subscription;

  /**
   * 
   * @param dataStorageService servizio chiamate http
   * @param nodeService servizio trasformazione array senselexo in nodi di tipo treecustom da visualizzare nell'alberatura
   * @param fb formbuilder per il form di ricerca
   */

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
      entrySelected: new FormControl(),
      morphologicalTraits: new FormControl(false)
    })
  }


  ngOnInit(): void {
    this.scrollToTop = false;
    this.eventsSubscription = this._val.subscribe((x) => {
      this.changeFont = x;
      if (this.changeFont === true) {
        this.istanzaTreeComponent.fontS = '0.7rem';
        this.istanzaTreeComponent.fontSPos = '0.5rem';
        this.istanzaTreeComponent.fontIcon = '0.5rem';
        this.fontInput = '0.7rem';
      } else {
        this.istanzaTreeComponent.fontS = '1rem';
        this.istanzaTreeComponent.fontSPos = '0.8rem';
        this.istanzaTreeComponent.fontIcon = '0.8rem';
        this.fontInput = '0.9rem';
      }
    });
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
          this.limit += 200;
        });
    })
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
        let morphology = [];
        morphology = e.morphology.map(e => {
          return `[ ` + e.trait + `-` + e.value + ` ] `
        });
        morphology.join('\n')
        let child2L = {
          label: e.label,
          data: e.label,
          type: 'childF2L',
          formInstanceName: e.formInstanceName,
          morphology: morphology,
          leaf: true
        }
        childrenForm.push(child2L);
      });
    });
    return childrenForm;
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
    if (this.formType === 'flexed') {
      this.retrieveFlexed();
    } else {
      this.retrieveSenses();
    }
  }

  /**
   * metodo private per recuperare item flexed. Metodo riutilizzato nel filtro pos per mantenere aperte le forme nel caso sia selezionato flexed
   */
  private retrieveFlexed() {
    this.dataStorageService.fetchLexicalEntries(this.text, this.searchMode, this.type, this.pos,
      this.formType, this.author, this.lang, this.status, this.offset, this.limit).subscribe(lexicalEntry => {
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
                label: elemento.label,
                leaf: false,
                count: elemento.count,
                type: 'childF1L',
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
              // apre children
              tempForm.forEach(el => {
                el.children = childrenForm;
              })
            }
          })
        });
      });
  }

  callServiceEntry(e) {
    // toglie errore 
    if (e.value !== null) {
      if (e.value.name === 'entry') {
        this.formType = 'entry'
        this.sub1 = this.dataStorageService.fetchLexicalEntries(this.text, this.searchMode, this.type, this.pos,
          this.formType, this.author, this.lang, this.status, this.offset, this.limit).subscribe(lexicalEntry => {
            if (lexicalEntry.list !== undefined) {
              this.sensesFromLexo = this.nodeService.convertFromLexicalSenses(lexicalEntry);
            }
            this.totalCount = lexicalEntry.totalHits;
          })
      }
      if (e.value.name === 'flexed') {
        this.formType = 'flexed'
        this.istanzaTreeComponent.formType = 'flexed';
        this.istanzaTreeComponent.text = this.text;
        this.retrieveFlexed();
      }
    } else {
      // collapse nodi espansi
      this.sensesFromLexo.forEach(node => {
        this.expandRecursive(node, false);
      });
    }

    return this.formType;
  }

  /**
   * 
   * @param node nodi dell'alberatura
   * @param isExpand controllo per espandere o meno alberatura
   */
  private expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach(childNode => {
        this.expandRecursive(childNode, isExpand);
      });
    }
  }


  collapseAll() {
    this.sensesFromLexo.forEach(node => {
      this.expandRecursive(node, false);
    });
  }

  showFilter() {
    this.showF = !this.showF;
  }

  showHideMorphTraits($event) {
    if ($event.checked === true) {
      this.istanzaTreeComponent.showHideMorphTraits = true;
    } else {
      this.istanzaTreeComponent.showHideMorphTraits = false;
    }
  }

  resetFilter() {
    this.cercaEntrataLessicale.get('entrataLessicale').setValue('');
    this.cercaEntrataLessicale.get('selectedFilter').setValue('startsWith');
    this.cercaEntrataLessicale.get('posSelected').setValue('');
    this.cercaEntrataLessicale.get('entrySelected').setValue('');
    this.cercaEntrataLessicale.get('morphologicalTraits').setValue(false);
    this.istanzaTreeComponent.showHideMorphTraits = false;
    this.searchMode = "startsWith";
    this.formType = "entry";
    this.text = "*";
    this.pos = "";
    this.showF = false;
    this.resetGraph.emit(true);
    this.collapseAll();
    this.scrollToTop = true;
    let top = document.getElementsByTagName('a');
    top[1].click();
  }

  onChange(e) {
    this.searchMode = e.target.value;
    this.istanzaTreeComponent.searchMode = this.searchMode;
    this.istanzaTreeComponent.text = this.text;
    // this.isLoading = true;
    if (this.formType === 'flexed') {
      this.retrieveFlexed();
    } else {
      this.retrieveSenses();
    }
  }

  /**
   * 
   * @param $event nodo parent, sense e form ricevuto da tree component, da inviare a viewport component
   */
  nodoParentReceived($event) {
    this.parentSent = $event;
    this.invioNodoParentFromTree.emit(this.parentSent);
  }

  nodoSenseReceived($event) {
    this.senseSent = $event;
    this.invioNodoSenseFromTree.emit(this.senseSent);
  }

  draggedNodeReceived($event) {
    this.invioDraggedNodeFromTree.emit($event);
  }

  nodoFormReceived($event) {
    this.formSent = $event;
    this.invioNodoFormFromTree.emit(this.formSent)
  }

  totalCountReceived($event) {
    this.totalCount = $event;
  }

  /**
   * unsubscribe subscriptions
   */
  // ngOnDestroy() {
  //   this.sub1.unsubscribe();
  //   this.sub2.unsubscribe();
  //   this.sub3.unsubscribe();
  //   this.sub4.unsubscribe();
  // }


}