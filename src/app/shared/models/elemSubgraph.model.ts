export interface elemSubGraph {
    nodes: [
        {
            data: {
                id: string,
                label: string,
                definition: string,
                pos: string,
                iri: string
            }
        }
    ],
    edges: [
        {
            data: {
                id: string,
                source: string,
                target: string,
                relationType: string,
                labelSource: string,
                labelTarget: string,
                inferred: boolean,
                lenght: number
            }
        }
    ]
}
