import { AnyMessageFrom, MessageConsumer, MessagesFrom, StreamDefinition } from './interfaces';

export class InMemoryMessageConsumer<Stream extends StreamDefinition> implements MessageConsumer<Stream> {
    private messages: MessagesFrom<Stream> = [];

    public clear(): void {
        this.messages = [];
    }

    public isEmpty(): boolean {
        return this.messages.length === 0;
    }

    public consumedMessages(): MessagesFrom<Stream> {
        return this.messages;
    }

    async consume(message: AnyMessageFrom<Stream>): Promise<void> {
        this.messages.push(message);
    }

}
