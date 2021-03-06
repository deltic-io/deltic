import { EventStreamDefinition } from './interfaces';
import { AnyMessageFrom } from '@deltic/messaging';
import { MessageRepository } from './message-repository';

export interface AggregateRootFactory<Stream extends EventStreamDefinition<Stream>> {
    reconstituteFromEvents(id: Stream['aggregateRootId'], events: AsyncGenerator<AnyMessageFrom<Stream>>): Promise<Stream['aggregateRoot']>
}

export class AggregateRootRepository<Stream extends EventStreamDefinition<Stream>> {
    constructor(
        private readonly factory: AggregateRootFactory<Stream>,
        private readonly messageRepository: MessageRepository<Stream>,
    ) {
    }

    async retrieve(id: Stream['aggregateRootId']): Promise<Stream['aggregateRoot']> {
        return this.factory.reconstituteFromEvents(id, this.messageRepository.retrieveAll(id));
    }

    async persist(aggregateRoot: Stream['aggregateRoot']) {
        let uncommittedMessages = aggregateRoot.releaseEvents();
        await this.messageRepository.persist(aggregateRoot.aggregateRootId, uncommittedMessages);
    }
}
