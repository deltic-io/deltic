import { MessageConsumer, MessageProducer, MessagesFrom, StreamDefinition } from './interfaces';

export class SynchronousMessageProducer<Stream extends StreamDefinition> implements MessageProducer<Stream> {
    private consumer: MessageConsumer<Stream>;
    constructor(consumer: MessageConsumer<Stream>) {
        this.consumer = consumer;
    }

    async send(...messages: MessagesFrom<Stream>): Promise<void> {
        await Promise.all(messages.map(m => this.consumer.consume(m)));
    }

}
