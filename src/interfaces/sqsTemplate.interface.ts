export interface sqsTemplate{
    type: string,
    template: {
        name: string,
    },
    parameters: Array<{ key: string; value: string }>
}