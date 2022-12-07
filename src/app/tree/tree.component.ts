import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Subscription } from 'rxjs';
import { DataStorageService } from '../shared/data-storage/data-storage.service';
import { TreeNodeCustom } from '../shared/models/tree-node-custom.model';
import { NodeService } from '../shared/servizi/node.service';
@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.scss']
})
export class TreeComponent implements OnInit, OnDestroy {
  /**
   * 
   * @param $event scroll to bottom: virtual scroll per caricamento ulteriori entrate lessicali
   */
  @HostListener("scroll", ["$event"]) private onScroll($event: any): void {
    if ($event.target.offsetHeight + $event.target.scrollTop >= $event.target.scrollHeight - 1) {
      // per chiamo metodo retrievesense solo se il campo del filtro è vuoto
      if (this.formType === 'entry') {
        this.retrieveSenses();
      } else {
        return
      }
    }
  }
  scrollHeight: string;

  /**
   * subscription
   */
  sub1: Subscription;
  sub2: Subscription;

  /**
* variabili alberatura
*
*/
  @Input() text: string = "*";
  searchMode: string = "startsWith";
  type: string = "";
  @Input() pos: any = "";
  @Input() formType: string = "entry";
  author: string = "";
  lang: string = "";
  status: string = "";
  offset: number = 0;
  limit: number = 200;
  totalCount: number;

  /**
   * event emitter per inviare total count lexical entry da visualizzare all'apertura dell'app nella sidebar
   */
  @Output() invioTotalCount = new EventEmitter<number>();
  /** 
   * filtri ricerca 
  */

  @Input() showF: boolean = false;

  @Input() sensesFromLexo: TreeNodeCustom[] = [];
  // DRAG event variabile per visualizzare nodo
  visualizedNode: TreeNodeCustom;
  draggedEle: TreeNodeCustom;

  isLoading: boolean = false;

  fontS = '1rem'
  fontSPos = '0.8rem'
  fontIcon = '0.8rem'

  nodeExpanded = [];

  elFetched: string;

  /**
   * event emitte per inviare parent node , form node e sense node
   */
  @Output() invioNodoParent = new EventEmitter<any>();
  @Output() invioNodoForm = new EventEmitter<any>();
  @Output() invioNodoSense = new EventEmitter<any>();
  @Output() invioVisualizedNode = new EventEmitter<any>();

  showHideMorphTraits: boolean;

  constructor(
    private dataStorageService: DataStorageService,
    private nodeService: NodeService) { }

  ngOnInit(): void {
    this.scrollHeight = '500px';
    // recupero lista entrate lessicali da visualizzare nell'alberatura TO DO VIRTUAL SCROLL
    this.retrieveSenses();
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
        let morphology;
        morphology = e.morphology.map(e => {
          return e.value
        }).join(' ');

        let child2L = {
          label: e.label,
          data: e.label,
          type: 'childF2L',
          formInstanceName: e.formInstanceName,
          morphology: morphology,
          leaf: true
        }
        childrenForm.push(child2L);
        this.nodeExpanded.push(child2L);
      });
    });
    return childrenForm;
  }

  private addSenseChildren(idNode) {
    let childrenSense = [];
    this.dataStorageService.fetchSense(idNode).subscribe(el => {
      el.forEach(e => {
        let child2L = {
          label: e.label,
          data: e.label,
          type: 'childS2L',
          lemma: e.lemma,
          lexicalEntryInstanceName: e.lexicalEntryInstanceName,
          pos: e.pos,
          definition: e.definition,
          senseInstanceName: e.senseInstanceName,
          leaf: true
        }
        childrenSense.push(child2L);
        this.nodeExpanded.push(child2L);
      });
    });
    return childrenSense;
  }
  // 
  /**
   * 
   * @param event espansione nodo per aprire children alberatura
   */
  nodeExpand(event) {
    this.nodeExpanded.push(event.node);
    this.openNodes(event.node);
  }

  private openNodes(node) {
    let idNode = node.data;
    if (node.parent === undefined) {
      this.sub1 = this.dataStorageService.fetchElements(idNode).subscribe(el => {
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
              label: elemento.label,
              leaf: isLeaf,
              count: elemento.count,
              type: 'childF1L',
              children: []
            }]

            // chiamata metodo privato
            let childrenForm = this.addFormChildren(idNode);
            tempForm.forEach(el => {
              el.children = childrenForm;
            })
            node.children = tempForm;
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
              label: elemento.label,
              leaf: isLeaf,
              count: elemento.count,
              type: 'childS1L',
              children: []
            }]

            let childrenSense = this.addSenseChildren(idNode);

            tempSense.forEach(el => {
              el.children = childrenSense;
            })
            node.children = [...node.children, ...tempSense];
          }
        })
      });
    }
  }

  /**
   * 
   * @param target nodo draggato di tipo parent, sense(childS2level) o form(childF2level) 
   * @returns oggetto treenodecustom con i dati relativi al nodo che sarà visualizzato nel cytoscape component
   */
  mouseDown(target) {
    this.visualizedNode = target;
    return this.visualizedNode;
  }

  onDragStart(event) {
    let parentNode;
    let formChid;
    let senseChild;
    this.invioVisualizedNode.emit(this.visualizedNode);
    if (this.visualizedNode.type === 'parentLevel') {
      parentNode = this.visualizedNode;
      this.invioNodoParent.emit(parentNode);
    }
    if (this.visualizedNode.type === 'childS2L') {
      senseChild = this.visualizedNode;
      this.invioNodoSense.emit(senseChild);
    }
    if (this.visualizedNode.type === 'childF2L') {
      formChid = this.visualizedNode;
      this.invioNodoForm.emit(formChid);
    }
    // mouse event over sopra nodo child1level form o sense, al trascinamento non si deve visualizzare alcun nodo
    if (this.visualizedNode.type === 'childF1L' ||
      this.visualizedNode.type === 'childS1L') {
      event.stopPropagation();
    }

  }

  retrieveSenses() {
    this.isLoading = true;
    this.sub1 = this.dataStorageService.fetchLexicalEntries(this.text, this.searchMode, this.type, this.pos,
      this.formType, this.author, this.lang, this.status, this.offset, this.limit).subscribe(lexicalEntry => {
        if (lexicalEntry) {
          this.isLoading = false;
        }
        if (lexicalEntry.list !== undefined) {
          this.sensesFromLexo = this.nodeService.convertFromLexicalSenses(lexicalEntry);
        }
        this.totalCount = lexicalEntry.totalHits;
        this.invioTotalCount.emit(this.totalCount)
        this.limit += 99;
      });
    // if (this.nodeExpanded.length > 0) {
    //   let flexedParent;
    //   this.dataStorageService.fetchLexicalEntries(this.text, this.searchMode, this.type, this.pos,
    //     this.formType, this.author, this.lang, this.status, this.offset, this.limit).subscribe(lexicalEntry => {
    //       this.totalCount = lexicalEntry.totalHits;
    //       lexicalEntry.list.forEach(l => {
    //         flexedParent = [{
    //           collapsedIcon: "pi pi-folder",
    //           expandedIcon: "pi pi-folder-open",
    //           label: l.label,
    //           leaf: false,
    //           type: "parentLevel",
    //           children: []
    //         }];
    //         this.sensesFromLexo = this.nodeService.convertFromLexicalSenses(lexicalEntry);
    //         this.nodeExpanded.forEach(node => {
    //           if (node.type === 'parentLevel') {
    //             this.elFetched = node.data;
    //           }
    //           return this.elFetched;
    //         })
    //       });
    //       this.sub2 = this.dataStorageService.fetchElements(this.elFetched).subscribe(el => {
    //         el.elements.forEach(elemento => {
    //           // salvo il parametro leaf in una variabile,
    //           // se la forma o il senso non ha figli non viene visualizzata la freccia per espandere nodo, altrimenti si
    //           let isLeaf: boolean;
    //           if (elemento.label === 'form') {
    //             if (elemento.count > 0) {
    //               isLeaf = false;
    //             } else {
    //               isLeaf = true;
    //             }
    //             // recupero forme
    //             let tempForm = [{
    //               label: elemento.label,
    //               leaf: isLeaf,
    //               count: elemento.count,
    //               type: 'childF1L',
    //               children: []
    //             }];

    //             // chiamata metodo privato
    //             let childrenForm = this.addFormChildren(this.elFetched);

    //             this.sensesFromLexo.forEach(el => {
    //               el.children = tempForm
    //             })
    //             this.sensesFromLexo.forEach(node => {
    //               if (node.data === this.elFetched) {
    //                 this.expandRecursive(node, true);
    //               }
    //             });

    //             // apre children
    //             tempForm.forEach(el => {
    //               el.children = childrenForm;
    //             });
    //             flexedParent.children = tempForm;
    //           }

    //           if (elemento.label === 'sense') {
    //             if (elemento.count > 0) {
    //               isLeaf = false;
    //             } else {
    //               isLeaf = true;
    //             }
    //             // recupero sensi
    //             let tempSense = [{
    //               label: elemento.label,
    //               leaf: isLeaf,
    //               count: elemento.count,
    //               type: 'childS1L',
    //               children: []
    //             }]

    //             // chiamata metodo privato
    //             let childrenSense = this.addSenseChildren(this.elFetched);

    //             this.sensesFromLexo.forEach(el => {
    //               el.children = tempSense
    //             });
    //             // flexedParent.children = [...flexedParent.children, ...tempSense];
    //             this.sensesFromLexo.forEach(node => {
    //               if (node.data === this.elFetched) {
    //                 this.expandRecursive(node, true);
    //               }
    //             });

    //             // apre children
    //             tempSense.forEach(el => {
    //               el.children = childrenSense;
    //             });
    //             flexedParent.children = [...flexedParent.children, ...tempSense];
    //           }
    //         })
    //       });
    //     });
    // }
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
  /**
  * unsubscribe subscriptions
  */
  ngOnDestroy() {
    this.sub1.unsubscribe();
  }

}
