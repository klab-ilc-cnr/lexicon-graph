import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { elemSubGraph } from '../models/elemSubgraph.model';

@Injectable({
  providedIn: 'root'
})
export class GraphVisHttpCallService {

  constructor(private http: HttpClient) { }

  /**
   * servizio recupero distanza max relativa al nodo focus
   * @param node nodo focus 
   * @param relation tipo di relazione
   * @param direction incoming o outgoing
   * @returns 
   */
  fetchNodeMaxHops(node: string, relation: string, direction: string) {
    return this.http.post<any>(
      'LexO-backend-beta/service/graphViz/hopsByRel?key=lexodemo'
      , { node, relation, direction }
    );
  }

  /**
   * servizio recupero sotto grafo in base al tipo di relazione scelta
   * @param nodoId nodo focus
   * @param relation tipo di relazione
   * @param lenght distanza dal nodo focus ai suoi nodi connessi
   * @param direction incoming o outgoing
   * @returns 
   */
  fetchSubGraph(nodoId: string, relation: string, lenght: number, direction: string) {
    return this.http.post<elemSubGraph>(
      'LexO-backend-beta/service/graphViz/' + nodoId + '/nodeGraph?key=lexodemo'
      , { relation, lenght, direction }
    );
  }

  /**
   * servizio cammino minimo tra due nodi
   * @param sourceId nodo source
   * @param targetId nodo target
   * @param inference inferito o meno
   * @returns 
   */
  fetchMinPath(sourceId: string, targetId: string, inference: boolean) {
    return this.http.post<any>(
      'LexO-backend-beta/service/graphViz/minPath?key=lexodemo&source=' + sourceId + '&target=' + targetId + '&inference=' + inference,
      { sourceId, targetId, inference }
    );
  }
}
