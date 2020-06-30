import { EventStreamDefinition } from './interfaces';
import { MessageRepository } from './message-repository';
import { AnyMessageFrom, MessageProducer, MessagesFrom } from '../messaging';

export class DispatchingMessageRepository<Stream extends EventStreamDefinition<Stream>> implements MessageRepository<Stream> {
    constructor(
        private readonly repository: MessageRepository<Stream>,
        private readonly dispatcher: MessageProducer<Stream>
    ) {
    }

    async persist(id: Stream["aggregateRootIdType"], messages: MessagesFrom<Stream>): Promise<void> {
        await this.repository.persist(id, messages);
        await this.dispatcher.send(...messages);
    }

    retrieveAll(id: Stream["aggregateRootIdType"]): AsyncGenerator<AnyMessageFrom<Stream>> {
        return this.repository.retrieveAll(id);
    }

}
