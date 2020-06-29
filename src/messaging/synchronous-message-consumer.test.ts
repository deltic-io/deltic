import { AnyMessageFrom, MessageConsumer, StreamDefinition } from './interfaces';
import { wait } from './utils';
import { SynchronousMessageConsumer } from './synchronous-message-consumer';

interface DelayedResolvingStream extends StreamDefinition {
    topic: 'delayed',
    messages: {
        delayed: number,
    }
}

class DelayedConsumer implements MessageConsumer<DelayedResolvingStream> {
    public consumedDelays: number[] = [];
    async consume(message: AnyMessageFrom<DelayedResolvingStream>) {
        let delay = message.payload;
        this.consumedDelays.push(delay);
        await wait(delay);
        this.consumedDelays.push(delay);
    }
}

/**
 * This test proves the SynchronousMessageConsumer ensures wrapped
 * consumers process messages synchronously. The test below validated
 * the normal behaviour of the DelayedConsumer.
 */
test('SynchronousMessageConsumer consumes synchronously', async () => {
    let delayedConsumer = new DelayedConsumer();
    let synchronousConsumer = new SynchronousMessageConsumer<DelayedResolvingStream>(delayedConsumer);
    let delays = [50, 1, 25];
    let promises = delays.map(delay => synchronousConsumer.consume({ type: 'delayed', payload: delay }));
    await Promise.all(promises);
    expect(delayedConsumer.consumedDelays).toEqual([50, 50, 1, 1, 25, 25]);
});

/**
 * This test proves the synchronous consumer ensures the underlying consumer
 * consumes the messages synchronously, even though it doesn't process it
 * that way normally.
 */
test('DelayedConsumes consumes asynchronously', async () => {
    let delayedConsumer = new DelayedConsumer();
    let delays = [50, 1, 25];
    let promises = delays.map(delay => delayedConsumer.consume({ type: 'delayed', payload: delay }));
    await Promise.all(promises);
    await wait(10);
    expect(delayedConsumer.consumedDelays).toEqual([50, 1, 25, 1, 25, 50]);
});

class ExceptionInducingMessageConsumer implements MessageConsumer<DelayedResolvingStream> {
    async consume(message: AnyMessageFrom<DelayedResolvingStream>) {
        throw new Error('something went wrong');
    }
}

test("SynchronousMessageConsumer bubbles errors up", async () => {
    let exceptionInducingConsumer = new ExceptionInducingMessageConsumer();
    let synchronousMessageConsumer = new SynchronousMessageConsumer<DelayedResolvingStream>(exceptionInducingConsumer);

    await expect(synchronousMessageConsumer.consume({ type: 'delayed', payload: 4}))
        .rejects.toEqual(new Error('something went wrong'));
});
