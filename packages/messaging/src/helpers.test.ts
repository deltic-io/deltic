import { InMemoryMessageProducer } from './in-memory-message-producer';
import { createMessageConsumer, createMessageProducer } from './helpers';
import { AnyMessageFrom, StreamDefinition } from './interfaces';
import { InMemoryMessageConsumer } from './in-memory-message-consumer';

interface ExampleStream extends StreamDefinition {
    messages: {
        example: string,
    }
}

test("createMessageProducer creates a producer from a function", async () => {
    let actualProducer = new InMemoryMessageProducer<ExampleStream>();
    let producer = createMessageProducer(actualProducer.send.bind(actualProducer));
    let message: AnyMessageFrom<ExampleStream> = { type: 'example', payload: 'lol'};
    await producer.send(message);
    expect(actualProducer.producedMessages()).toContain(message);
});

test("createMessageConsumer creates a consumer from a function", async () => {
    let actualConsumer = new InMemoryMessageConsumer<ExampleStream>();
    let producer = createMessageConsumer<ExampleStream>(actualConsumer.consume.bind(actualConsumer));
    let message: AnyMessageFrom<ExampleStream> = { type: 'example', payload: 'lol'};
    await producer.consume(message);
    expect(actualConsumer.consumedMessages()).toContain(message);
});
