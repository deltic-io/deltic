export type BusDefinition = {
    [index: string]: { payload: any, response: any }
};

export interface BusSection<Payload, Response> {
    payload: Payload,
    response: Response,
}

export interface Input<T, P> {
    type: T
    payload: P;
}

export type BusHandlers<Definition extends BusDefinition> = {
    readonly [T in keyof Definition]: (payload: Definition[T]['payload'], input: Input<T, Definition[T]['payload']>) => Promise<Definition[T]['response']>
}

export class InputNotSupported extends Error {
}

export interface ServiceBus<Definition extends BusDefinition> {
    handle<T extends keyof Definition>(input: Input<T, Definition[T]['payload']>): Promise<Definition[T]['response']>
}

export class Bus<Definition extends BusDefinition> implements ServiceBus<Definition>{
    constructor(private readonly handlers: BusHandlers<Definition>) {
    }

    public async handle<T extends keyof Definition>(input: Input<T, Definition[T]['payload']>): Promise<Definition[T]['response']> {
        let handler = this.handlers[input.type];

        if (!handler) {
            throw new InputNotSupported(`Unable to handle input of type: ${input.type}`);
        }

        return await handler(input.payload, input);
    }
}
