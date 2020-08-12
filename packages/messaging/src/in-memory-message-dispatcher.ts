import { MessageDispatcher, MessagesFrom, StreamDefinition } from './interfaces';

export class InMemoryMessageDispatcher<Stream extends StreamDefinition> implements MessageDispatcher<Stream> {
    private messages: MessagesFrom<Stream> = [];

    public clear(): void {
        this.messages = [];
    }

    public isEmpty(): boolean {
        return this.messages.length === 0;
    }

    public producedMessages(): MessagesFrom<Stream> {
        return this.messages;
    }

    async send(...messages: MessagesFrom<Stream>): Promise<void> {
        this.messages.push(...messages);
    }
}
