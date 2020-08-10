import { AnyMessageFrom, StreamDefinition } from './interfaces';
import { InMemoryMessageConsumer } from './in-memory-message-consumer';

interface ExampleStream extends StreamDefinition {
    topic: 'example',
    messages: {
        example: string
    }
}

let create = (payload: string): AnyMessageFrom<ExampleStream> => ({ type: 'example', payload });

test("InMemoryMessageConsumer collects messages it consumes", async () => {
    let consumer = new InMemoryMessageConsumer<ExampleStream>();
    let message = create('value');
    await consumer.consume(message);
    expect(consumer.consumedMessages()).toContain(message);
});

test("InMemoryMessageConsumer tells if it's empty or not", () => {
    let consumer = new InMemoryMessageConsumer<ExampleStream>();
    expect(consumer.isEmpty()).toBe(true);
    consumer.consume(create('example'));
    expect(consumer.isEmpty()).toBe(false);
});

test("InMemoryMessageConsumer can clear itself", () => {
    let consumer = new InMemoryMessageConsumer<ExampleStream>();
    expect(consumer.isEmpty()).toBe(true);
    consumer.consume(create('example'));
    expect(consumer.isEmpty()).toBe(false);
    consumer.clear();
    expect(consumer.isEmpty()).toBe(true);
});
