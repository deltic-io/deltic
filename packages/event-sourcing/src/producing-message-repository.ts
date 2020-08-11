import { EventStreamDefinition } from './interfaces';
import { MessageRepository } from './message-repository';
import { AnyMessageFrom, MessageProducer, MessagesFrom } from '@deltic/messaging';

export class ProducingMessageRepository<Stream extends EventStreamDefinition<Stream>> implements MessageRepository<Stream> {
    constructor(
        private readonly repository: MessageRepository<Stream>,
        private readonly dispatcher: MessageProducer<Stream>
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
