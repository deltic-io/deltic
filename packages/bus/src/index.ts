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

export type BusHandler<Type, Payload, ReturnType> = (payload: Payload, input: Input<Type, Payload>) => Promise<ReturnType>;

export type BusHandlers<Definition extends BusDefinition> = {
    [T in keyof Definition]: BusHandler<T, Definition[T]['payload'], Definition[T]['response']>
}

export class InputNotSupported extends Error{
}

export class Bus<Definition extends BusDefinition> {
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
