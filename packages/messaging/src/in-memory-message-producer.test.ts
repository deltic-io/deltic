import { AnyMessageFrom, StreamDefinition } from './interfaces';
import { InMemoryMessageDispatcher } from './in-memory-message-dispatcher';

interface ExampleStream extends StreamDefinition {
    topic: 'example',
    messages: {
        example: string
    }
}

let create = (payload: string): AnyMessageFrom<ExampleStream> => ({ type: 'example', payload });

test("InMemoryMessageProducer collects messages it produces", async () => {
    let producer = new InMemoryMessageDispatcher<ExampleStream>();
    let message = create('value');
    await producer.send(message);
    expect(producer.producedMessages()).toContain(message);
});

test("InMemoryMessageProducer tells if it's empty or not", async () => {
    let producer = new InMemoryMessageDispatcher<ExampleStream>();
    expect(producer.isEmpty()).toBe(true);
    await producer.send(create('example'));
    expect(producer.isEmpty()).toBe(false);
});

test("InMemoryMessageProducer can clear itself", async () => {
    let producer = new InMemoryMessageDispatcher<ExampleStream>();
    expect(producer.isEmpty()).toBe(true);
    await producer.send(create('example'));
    expect(producer.isEmpty()).toBe(false);
    producer.clear();
    expect(producer.isEmpty()).toBe(true);
});
