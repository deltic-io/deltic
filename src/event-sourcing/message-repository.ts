import { EventStreamDefinition } from './interfaces';
import { AnyMessageFrom, MessagesFrom } from '../messaging';

export interface MessageRepository<Stream extends EventStreamDefinition<Stream>> {
    persist(id: Stream['aggregateRootIdType'], messages: MessagesFrom<Stream>): Promise<void>;
    retrieveAll(id: Stream['aggregateRootIdType']): AsyncGenerator<AnyMessageFrom<Stream>>;
}
