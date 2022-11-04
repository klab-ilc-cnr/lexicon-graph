export class LexicalEntry {
  totalHits: number
  list: [{
    creator: string,
    lastUpdate: string,
    creationDate: string,
    confidence: number,
    status: string,
    revisor: string,
    type: string,
    pos: string,
    label: string,
    language: string,
    author: string,
    note: string,
    hasChildren: boolean,
    lexicalEntry: string,
    lexicalEntryInstanceName: string,
    morphology: [{
      trait: string,
      value: string
    }],
    completionDate: string,
    revisionDate: string,
  }
  ]
}
