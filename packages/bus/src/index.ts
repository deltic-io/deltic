export type BusDefinition = {
    [index: string]: { payload: any, response: any }
};

export interface Input<T, P> {
    type: T
    payload: P;
}

export type BusHandler<Input, ReturnType> = (input: Input) => Promise<ReturnType>;

export type BusHandlers<Definition extends BusDefinition> = {
    [T in keyof Definition]: BusHandler<Definition[T]['payload'], Definition[T]['response']>
}

export class Bus<Definition extends BusDefinition> {
    constructor(private readonly handlers: BusHandlers<Definition>) {
    }

    public async handle<T extends keyof Definition>(input: Input<T, Definition[T]['payload']>): Promise<Definition[T]['response']> {
        let handler = this.handlers[input.type];

        return await handler(input.payload);
    }
}
