import { MessageProducer, MessagesFrom, StreamDefinition } from './interfaces';

export class InMemoryMessageProducer<Stream extends StreamDefinition> implements MessageProducer<Stream> {
    private messages: MessagesFrom<Stream> = [];

    public clear(): void {
        this.messages = [];
    }

    public isEmpty(): boolean {
        return this.messages.length === 0;
    }

    public producesMessages(): MessagesFrom<Stream> {
        return this.messages;
    }

    async send(...messages: MessagesFrom<Stream>): Promise<void> {
        this.messages.push(...messages);
    }
}
