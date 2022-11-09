import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { LazyLoadEvent, TreeNode } from 'primeng/api';
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
  formsFetched: any = [];
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

  elFetched: string;

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
      // let elFetched: string;
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
          this.sensesFromLexo = this.sensesFromLexo.concat(this.sensesFromLexo);
          lexicalEntry.list.forEach(entrataL => {
            if (entrataL.label === this.text) {
              this.elFetched = entrataL.lexicalEntryInstanceName;
            }
          })
          return this.elFetched;
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
   * metodo che restituisce children form 
   * @param idNode nodo parent
   * @returns array di figli di tipo form
   */
  private addFormChildren(idNode) {
    let childrenForm = [];
    this.dataStorageService.fetchForms(idNode).subscribe(el => {
      el.forEach(e => {
        childrenForm.push(e);
        return {
          collapsedIcon: "pi pi-folder-open",
          label: e.label,
          data: e.label,
          type: e.type,
          leaf: true
        }
      });
    });
    return childrenForm;
  }

  private addSenseChildren(idNode) {
    let childrenSense = [];
    this.dataStorageService.fetchSense(idNode).subscribe(el => {
      el.forEach(e => {
        childrenSense.push(e);
        return {
          collapsedIcon: "pi pi-folder-open",
          label: e.label,
          data: e.label,
          leaf: true
        }
      });
    });
    return childrenSense;
  }

  /**
   * 
   * @param event espansione nodo per aprire children alberatura
   */
  nodeSelect(event) {
    let idNode = event.node.data;
    this.sub2 = this.dataStorageService.fetchElements(idNode).subscribe(el => {
      el.elements.forEach(elemento => {
        if (elemento.label === 'form' && elemento.count > 0) {
          // recupero forme
          let tempForm = [{
            collapsedIcon: "pi pi-folder",
            expandedIcon: "pi pi-folder-open",
            label: elemento.label + ' (' + elemento.count + ')',
            leaf: false,
            children: []
          }]
          event.node.children = tempForm;
          // chiamata metodo privato
          let childrenForm = this.addFormChildren(idNode);
          tempForm.forEach(el => {
            el.children = childrenForm;
          })
        }
        if (elemento.label === 'sense' && elemento.count > 0) {
          // recupero sensi
          let tempSense = [{
            collapsedIcon: "pi pi-folder",
            expandedIcon: "pi pi-folder-open",
            label: elemento.label + ' (' + elemento.count + ')',
            leaf: false,
            children: []
          }]

          event.node.children = [...event.node.children, ...tempSense];
          let childrenSense = this.addSenseChildren(idNode);
          tempSense.forEach(el => {
            el.children = childrenSense;
          })
        }
      })
    });
  }

  // private expandChildren(element) {
  //   this.sub2 = this.dataStorageService.fetchElements(element).subscribe(el => {
  //     el.elements.forEach(elemento => {
  //       if (elemento.label === 'form') {
  //         // recupero forme
  //         let tempForm = [{
  //           collapsedIcon: "pi pi-folder",
  //           expandedIcon: "pi pi-folder-open",
  //           label: elemento.label + ' (' + elemento.count + ')',
  //           leaf: false,
  //           children: []
  //         }]
  //         element.children = tempForm;
  //         // chiamata metodo privato
  //         let childrenForm = this.addFormChildren(element);
  //         tempForm.forEach(el => {
  //           el.children = childrenForm;
  //         })
  //       }
  //     })
  //   })
  // }

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
              }]
              this.sensesFromLexo.forEach(el => {
                el.children = tempForm
              })
              this.sensesFromLexo.forEach(node => {
                this.expandRecursive(node, true);
              });
              // chiamata metodo privato
              let childrenForm = this.addFormChildren(this.elFetched);
              tempForm.forEach(el => {
                el.children = childrenForm;
              })
            }
          })
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
   * unsubscribe subscriptions
   */
  ngOnDestroy() {
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
    this.sub3.unsubscribe();
    this.sub4.unsubscribe();
  }

}