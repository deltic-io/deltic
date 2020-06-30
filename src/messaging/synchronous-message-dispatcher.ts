import { MessageConsumer, MessageDispatcher, MessagesFrom, StreamDefinition } from './interfaces';

export class SynchronousMessageDispatcher<Stream extends StreamDefinition> implements MessageDispatcher<Stream> {
    private consumer: MessageConsumer<Stream>;
    constructor(consumer: MessageConsumer<Stream>) {
        this.consumer = consumer;
    }

    async send(...messages: MessagesFrom<Stream>): Promise<void> {
        await Promise.all(messages.map(m => this.consumer.consume(m)));
    }

}
