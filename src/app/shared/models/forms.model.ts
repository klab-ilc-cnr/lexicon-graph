export interface Forms {
  creator: string,
  lastUpdate : string,
  creationDate : string,
  confidence : number,
  type : string,
  label : string,
  note : string,
  phoneticRep : string,
  morphology : [ {
    trait : string,
    value : string,
  }, {
    trait : string,
    value : string
  }, {
    trait : string,
    value : string,
  }, {
    trait : string,
    value : string,
  }, {
    trait : string,
    value : string,
  } ],
  form : string,
  formInstanceName : string,
  lexicalEntry : string,
  lexicalEntryInstanceName : string,
  targetSense : string,
  targetSenseInstanceName : string

}