import { InMemoryMessageRepository } from './in-memory-message-repository';
import { EventStreamDefinition } from './interfaces';
import { AnyMessageFrom } from '@deltic/messaging';
import { threadId } from 'worker_threads';

enum ExampleTypes {
    First,
    Second,
}

interface ExampleEventStream extends EventStreamDefinition<ExampleEventStream> {
    aggregateRootId: string,
    messages: {
        [ExampleTypes.First]: string,
        [ExampleTypes.Second]: number,
    }
}

/**
 * @group unit
 */
describe('InMemoryMessageRepository', () => {
    test('it stores and retrieves messages', async () => {
        let repository = new InMemoryMessageRepository<ExampleEventStream>();
        let firstMessage: AnyMessageFrom<ExampleEventStream> = {type: ExampleTypes.First, payload: 'first'};
        let secondMessage: AnyMessageFrom<ExampleEventStream> = {type: ExampleTypes.Second, payload: 2};
        await repository.persist('this', [firstMessage, secondMessage]);
        let retrievedMessages = [];
        for await (let m of repository.retrieveAll('this')) {
            retrievedMessages.push(m);
        }
        expect(retrievedMessages).toHaveLength(2);

        let [firstRetrievedMessage, secondRetrievedMessage] = retrievedMessages;
        expect(firstRetrievedMessage).toEqual(firstMessage);
        expect(secondRetrievedMessage).toEqual(secondMessage);
    });

    test('it retrieves nothing when nothing is stored', async () => {
        let repository = new InMemoryMessageRepository<ExampleEventStream>();
        let retrievedMessages = [];
        for await (let m of repository.retrieveAll('this')) {
            retrievedMessages.push(m);
        }
        expect(retrievedMessages).toHaveLength(0);
    });

    test('it can clear itself', async () => {
        let repository = new InMemoryMessageRepository<ExampleEventStream>();
        let firstMessage: AnyMessageFrom<ExampleEventStream> = {type: ExampleTypes.First, payload: 'first'};
        await repository.persist('this', [firstMessage]);
        repository.clear();
        let retrievedMessages = [];
        for await (let m of repository.retrieveAll('this')) {
            retrievedMessages.push(m);
        }
        expect(retrievedMessages).toHaveLength(0);
    });

    test('it exposes the last commit', async () => {
        let repository = new InMemoryMessageRepository<ExampleEventStream>();
        let firstMessage: AnyMessageFrom<ExampleEventStream> = {type: ExampleTypes.First, payload: 'first'};
        let secondMessage: AnyMessageFrom<ExampleEventStream> = {type: ExampleTypes.Second, payload: 2};
        await repository.persist('this', [firstMessage, secondMessage]);
        let lastCommit = repository.lastCommit;
        expect(lastCommit).toHaveLength(2);
        expect(lastCommit).toEqual([firstMessage, secondMessage]);

        let thirdMessage: AnyMessageFrom<ExampleEventStream> = {type: ExampleTypes.First, payload: 'plus 2'};
        await repository.persist('this', [thirdMessage]);
        lastCommit = repository.lastCommit;
        expect(lastCommit).toHaveLength(1);
        expect(lastCommit).toEqual([thirdMessage]);
    });
});
