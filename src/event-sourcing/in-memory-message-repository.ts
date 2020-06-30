import { EventStreamDefinition } from './interfaces';
import { MessageRepository } from './message-repository';
import { AnyMessageFrom, MessagesFrom } from '../messaging';

export class InMemoryMessageRepository<Stream extends EventStreamDefinition<Stream>> implements MessageRepository<Stream> {
    private messages: Map<Stream['aggregateRootIdType'], MessagesFrom<Stream>> = new Map;

    async persist(id: Stream["aggregateRootIdType"], messages: MessagesFrom<Stream>) {
        let list = (this.messages.get(id) || []).concat(messages);
        this.messages.set(id, list);
    }

    async * retrieveAll(id: Stream["aggregateRootIdType"]): AsyncGenerator<AnyMessageFrom<Stream>> {
        for (let m of (this.messages.get(id) || [])) {
            yield m;
        }
    }

}
