export interface Element{
        type: string,
        elements: [ {
          label: string,
          count: number,
          hasChildren : boolean
        }]
}