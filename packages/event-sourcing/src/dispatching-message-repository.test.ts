import { InMemoryMessageRepository } from "./in-memory-message-repository";
import { AnyMessageFrom, InMemoryMessageDispatcher } from "@deltic/messaging";
import { DispatchingMessageRepository } from "./dispatching-message-repository";
import { ExampleStream, ExampleTypes } from './example-stream.stubs';

let message: AnyMessageFrom<ExampleStream> = {
    type: ExampleTypes.MemberWasAdded,
    payload: {
        id: 'abcd',
        name: 'Frank',
        age: 123,
    }
}

let actualMessageRepository = new InMemoryMessageRepository<ExampleStream>();
let messageDispatcher = new InMemoryMessageDispatcher<ExampleStream>();
let messageRepository = new DispatchingMessageRepository<ExampleStream>(
    actualMessageRepository,
    messageDispatcher
);

afterEach(async () => {
    actualMessageRepository.clear()
    messageDispatcher.clear()
})

describe('DispatchingMessageRepository', () => {
    it('should send the messages it persists', async () => {
        await messageRepository.persist('1234', [message]);

        expect(messageDispatcher.producedMessages()).toContain(message);
        expect(actualMessageRepository.lastCommit).toContain(message);
    });

    it('should delegate retrieving all messages', async () => {
        await actualMessageRepository.persist('1234', [message]);

        let retrievedMessages = [];
        for await (let m of messageRepository.retrieveAll('1234')) {
            retrievedMessages.push(m);
        }

        expect(retrievedMessages).toHaveLength(1)
        expect(retrievedMessages).toContainEqual(message);
    });
})
