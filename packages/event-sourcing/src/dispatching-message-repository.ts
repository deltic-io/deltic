import { EventStreamDefinition } from './interfaces';
import { MessageRepository } from './message-repository';
import { AnyMessageFrom, MessageDispatcher, MessagesFrom } from '@deltic/messaging';

export class DispatchingMessageRepository<Stream extends EventStreamDefinition<Stream>> implements MessageRepository<Stream> {
    constructor(
        private readonly repository: MessageRepository<Stream>,
        private readonly dispatcher: MessageDispatcher<Stream>
    ) {
    }

    async persist(id: Stream["aggregateRootId"], messages: MessagesFrom<Stream>): Promise<void> {
        await this.repository.persist(id, messages);
        await this.dispatcher.send(...messages);
    }

    retrieveAll(id: Stream["aggregateRootId"]): AsyncGenerator<AnyMessageFrom<Stream>> {
        return this.repository.retrieveAll(id);
    }

}
