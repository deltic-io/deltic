import { AnyMessageFrom, Message, StreamDefinition } from './interfaces';
import { InMemoryMessageConsumer } from './in-memory-message-consumer';
import { SynchronousMessageProducer } from './synchronous-message-producer';

enum ExampleTypes {
    First,
    Second,
}

interface ExampleStream extends StreamDefinition {
    topic: 'example',
    messages: {
        [ExampleTypes.First]: string,
        [ExampleTypes.Second]: number,
    }
}

test('SynchronousMessageProducer sends messages to consumers', () => {
    const consumer = new InMemoryMessageConsumer();
    const producer = new SynchronousMessageProducer<ExampleStream>(consumer);
    let firstMessage: AnyMessageFrom<ExampleStream> = { type: ExampleTypes.First, payload: 'value' };
    producer.send(firstMessage);
    let secondMessage: AnyMessageFrom<ExampleStream> = { type: ExampleTypes.Second, payload: 1234 };
    producer.send(secondMessage);
    let producesMessages = consumer.producesMessages();
    expect(producesMessages).toContain(firstMessage);
    expect(producesMessages).toContain(secondMessage);
});
