import { EventStreamDefinition } from './interfaces';
import { AnyMessageFrom } from '../messaging';
import { MessageRepository } from './message-repository';

interface Factory<Concrete, Id, Events> {
    reconstituteFromEvents(id: Id, events: Events): Promise<Concrete>
}

export class AggregateRootRepository<Stream extends EventStreamDefinition<Stream>> {
    constructor(
        private readonly factory: Factory<Stream['aggregateRootType'], Stream['aggregateRootIdType'], AsyncGenerator<AnyMessageFrom<Stream>>>,
        private readonly messageRepository: MessageRepository<Stream>,
    ) {
    }

    async retrieve(id: Stream['aggregateRootIdType']): Promise<Stream['aggregateRootType']> {
        return this.factory.reconstituteFromEvents(id, this.messageRepository.retrieveAll(id));
    }

    async persist(aggregateRoot: Stream['aggregateRootType']) {
        let uncommittedMessages = aggregateRoot.releaseEvents();
        await this.messageRepository.persist(aggregateRoot.aggregateRootId, uncommittedMessages);
    }
}
