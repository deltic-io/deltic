import { EventStreamDefinition } from './interfaces';
import { AnyMessageFrom } from '../messaging';
import { MessageRepository } from './message-repository';

export interface AggregateRootFactory<Stream extends EventStreamDefinition<Stream>> {
    reconstituteFromEvents(id: Stream['aggregateRootIdType'], events: AsyncGenerator<AnyMessageFrom<Stream>>): Promise<Stream['aggregateRootType']>
}

export class AggregateRootRepository<Stream extends EventStreamDefinition<Stream>> {
    constructor(
        private readonly factory: AggregateRootFactory<Stream>,
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
