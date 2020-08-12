import {
    AnyMessageFrom,
    createMessageConsumer,
    createMessageDispatcher,
    InMemoryMessageConsumer,
    InMemoryMessageDispatcher,
    StreamDefinition
} from './';

interface ExampleStream extends StreamDefinition {
    messages: {
        example: string,
    }
}

/**
 * @group unit
 */
describe('Messaging helper functions', () => {
    test("createMessageDispatcher creates a producer from a function", async () => {
        let actualProducer = new InMemoryMessageDispatcher<ExampleStream>();
        let producer = createMessageDispatcher(actualProducer.send.bind(actualProducer));
        let message: AnyMessageFrom<ExampleStream> = {type: 'example', payload: 'lol'};
        await producer.send(message);
        expect(actualProducer.producedMessages()).toContain(message);
    });

    test("createMessageConsumer creates a consumer from a function", async () => {
        let actualConsumer = new InMemoryMessageConsumer<ExampleStream>();
        let producer = createMessageConsumer<ExampleStream>(actualConsumer.consume.bind(actualConsumer));
        let message: AnyMessageFrom<ExampleStream> = {type: 'example', payload: 'lol'};
        await producer.consume(message);
        expect(actualConsumer.consumedMessages()).toContain(message);
    });
});
