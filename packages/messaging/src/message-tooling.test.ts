import { messageWithHeader } from './';
import { Message } from './interfaces';

const exampleMessage: Message<"type", "value"> = {
    type: 'type',
    payload: 'value'
}

test('messageWithHeader adds headers to a message', () => {
    const header = {key: 'something', value: 'value'};
    const message = messageWithHeader(exampleMessage, header);

    expect(message.headers?.something).toEqual('value');
});

test('containsMessage detects when messages are contains in a message array', () => {
    const messages: object[] = [exampleMessage];
    const otherMessage: Message<"type", "other"> = {
        type: 'type',
        payload: 'other'
    }
    expect(messages.includes(otherMessage)).toBe(false);
    expect(messages.includes(exampleMessage)).toBe(true);
})
