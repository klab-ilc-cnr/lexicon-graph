import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { elemSubGraph } from '../models/elemSubgraph.model';

@Injectable({
  providedIn: 'root'
})
export class GraphVisHttpCallService {

  constructor(private http: HttpClient) { }

  // servizio recupero distanza max 
  fetchNodeMaxHops(node: string, relation: string, direction: string) {
    return this.http.post<any>(
      'LexO-backend-beta/service/graphViz/hopsByRel?key=lexodemo'
      , { node, relation, direction }
    );
  }

  // servizio recupero sotto grafo in base al tipo di relazione scelta
  fetchSubGraph(nodoId: string, relation: string, lenght: number, direction: string) {
    return this.http.post<elemSubGraph>(
      'LexO-backend-beta/service/graphViz/' + nodoId + '/nodeGraph?key=lexodemo'
      , { relation, lenght, direction }
    );
  }
}
