import { AnyMessageFrom, StreamDefinition } from './interfaces';
import { InMemoryMessageConsumer } from './in-memory-message-consumer';
import { SynchronousMessageDispatcher } from './synchronous-message-dispatcher';

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
    const producer = new SynchronousMessageDispatcher<ExampleStream>(consumer);
    let firstMessage: AnyMessageFrom<ExampleStream> = { type: ExampleTypes.First, payload: 'value' };
    producer.send(firstMessage);
    let secondMessage: AnyMessageFrom<ExampleStream> = { type: ExampleTypes.Second, payload: 1234 };
    producer.send(secondMessage);
    let producedMessages = consumer.consumedMessages();
    expect(producedMessages).toContain(firstMessage);
    expect(producedMessages).toContain(secondMessage);
});
