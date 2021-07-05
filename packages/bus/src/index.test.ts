import { Bus, BusDefinition, BusSection, Input } from './index';

interface NumberToNumber {
    value: number,
}

interface UppercaseResponse {
    value: string,
}

interface ExampleBus extends BusDefinition {
    ['number_to_number']: BusSection<NumberToNumber, number>,
    ['string_to_string']: {
        payload: string,
        response: UppercaseResponse,
    }
}

describe("@deltic/bus", () => {
    let exampleBus = new Bus<ExampleBus>({
        number_to_number: async (input: NumberToNumber): Promise<number> => input.value,
        string_to_string: async (input: string): Promise<UppercaseResponse> => ({ value: input.toUpperCase() }),
    });

    test("a bus forwards to the correct handler", async () => {
        let n = await exampleBus.handle({ type: 'number_to_number', payload: { value: 10 }});
        expect(n).toEqual(10);
        let s = await exampleBus.handle({ type: 'string_to_string', payload: 'frank'});
        expect(s).toEqual({ value: 'FRANK' });
    });
    test("a bus throws when input is not supported", async() => {
        let input = { type: 'unknown', payload: 'unknown'} as unknown;
        await (expect(exampleBus.handle(input as Input<string, UppercaseResponse>))).rejects.toThrow();
    })
});
