import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Element } from '../models/element.model';
import { Forms } from '../models/forms.model';
import { LexicalEntry } from '../models/lexicalEntry.model';
import { Pos } from '../models/pos.model';
import { Sense } from '../models/sense.model';

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {

  constructor(private http: HttpClient) { }

  /**
   * servizio recupero LISTA entrate lessicali
   */
  fetchLexicalEntries(text: string, searchMode: string, type: string, pos: string, formType: string, author: string, lang: string,
    status: string, offset: number, limit: number) {
    return this.http.post<LexicalEntry>(
      'LexO-backend-beta/service/lexicon/data/lexicalEntries'
      , { text, searchMode, type,  pos, formType, author, lang, status, offset, limit }
    );
  }
  /**
   * servizio recupero figli entrata lessicale
   */

  fetchElements(idEntrataLessicale: string): Observable<Element>{
    return this.http.get<Element>('LexO-backend-beta/service/lexicon/data/'+idEntrataLessicale+ '/elements?key=lexodemo');
  }
  /**
   * servizio recupero forms 
   */

  fetchForms(idEntrataLessicale: string): Observable<Forms[]>{
    return this.http.get<Forms[]>('LexO-backend-beta/service/lexicon/data/' + idEntrataLessicale + '/forms?key=lexodemo');
  }

  /**
   * servizio recupero senses
   */

  fetchSense(idEntrataLessicale: string): Observable<Sense[]>{
    return this.http.get<Sense[]>('LexO-backend-beta/service/lexicon/data/'+ idEntrataLessicale +'/senses?key=lexodemo');
  }

  /**
   * servizio recupero pos per filtro search
   */
  fetchPos():Observable<Pos[]>{
    return this.http.get<Pos[]>('LexO-backend-beta/service/lexicon/statistics/pos?key=lexodemo');
  }
}
