import { EventStreamDefinition } from './interfaces';
import { AnyMessageFrom, MessagesFrom } from '../messaging';

export interface MessageRepository<Stream extends EventStreamDefinition<Stream>> {
    persist(id: Stream['aggregateRootId'], messages: MessagesFrom<Stream>): Promise<void>;
    retrieveAll(id: Stream['aggregateRootId']): AsyncGenerator<AnyMessageFrom<Stream>>;
}
