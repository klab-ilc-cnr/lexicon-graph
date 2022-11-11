export interface Forms {
  confidence: number,
  creationDate: string,
  creator: string,
  form: string,
  formInstanceName: string,
  label: string,
  lastUpdate: string,
  lexicalEntry: string,
  lexicalEntryInstanceName: string,
  morphology: [{
    trait: string,
    value: string,
  }],
  note: string,
  phoneticRep: string,
  targetSense: string,
  targetSenseInstanceName: string,
  type: string
}