import { Bus, BusDefinition } from './index';

interface NumberToNumber {
    value: number,
}

interface UppercaseResponse {
    value: string,
}

interface ExampleBus extends BusDefinition {
    ['number_to_number']: {
        payload: NumberToNumber,
        response: number,
    },
    ['string_to_string']: {
        payload: string,
        response: UppercaseResponse,
    }
}

describe("@deltic/bus", () => {
    test("a bus forwards to the correct handler", async () => {
        let exampleBus = new Bus<ExampleBus>({
            number_to_number: async (input: NumberToNumber): Promise<number> => {
                return input.value;
            },
            string_to_string: async (input: string): Promise<UppercaseResponse> => {
                return { value: input.toUpperCase() };
            }
        });

        let n = await exampleBus.handle({ type: 'number_to_number', payload: { value: 10 }});
        expect(n).toEqual(10);
        let s = await exampleBus.handle({ type: 'string_to_string', payload: 'frank'});
        expect(s).toEqual({ value: 'FRANK' });
    });
});
