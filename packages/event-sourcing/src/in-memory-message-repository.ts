import { EventStreamDefinition } from './interfaces';
import { MessageRepository } from './message-repository';
import { AnyMessageFrom, MessagesFrom } from '@deltic/messaging';

export class InMemoryMessageRepository<Stream extends EventStreamDefinition<Stream>> implements MessageRepository<Stream> {
    private messages: Map<Stream['aggregateRootId'], MessagesFrom<Stream>> = new Map;
    private _lastCommit: MessagesFrom<Stream> = [];

    async persist(id: Stream["aggregateRootId"], messages: MessagesFrom<Stream>) {
        let list = (this.messages.get(id) || []).concat(messages);
        this._lastCommit = messages;
        this.messages.set(id, list);
    }

    async * retrieveAll(id: Stream["aggregateRootId"]): AsyncGenerator<AnyMessageFrom<Stream>> {
        for (let m of (this.messages.get(id) || [])) {
            yield m;
        }
    }

    clear(): void {
        this.messages = new Map();
        this._lastCommit = [];
    }

    get lastCommit(): MessagesFrom<Stream> {
        return this._lastCommit;
    }

    clearLastCommit(): void {
        this._lastCommit = [];
    }
}
