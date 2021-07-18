import { ProcessQueue } from './index';

describe("@deltic/process-queue", () => {
    test("the queue processes items in order", async () => {
        let processor = new AppendingProcessor();
        let processQueue = new ProcessQueue({
            onError: async () => {
                throw new Error("No error handler defined");
            },
            processor: processor.process,
        });
        processQueue.push('a');
        processQueue.push('b');
        processQueue.push('c');
        await wait(25);
        expect(processor.value).toEqual('abc');
    });

    test("it supports not auto starting", async () => {
        let processor = new AppendingProcessor();
        let processQueue = new ProcessQueue({
            autoStart: false,
            onError: async () => {
                throw new Error("No error handler defined");
            },
            processor: processor.process,
        });
        processQueue.push('a');
        processQueue.push('b');
        processQueue.push('c');
        await wait(25);
        expect(processor.value).toEqual('');
    });

    test("it can be started manually", async () => {
        let processor = new AppendingProcessor();
        let processQueue = new ProcessQueue({
            autoStart: false,
            onError: async () => {
                throw new Error("No error handler defined");
            },
            processor: processor.process,
        });
        processQueue.start();
        processQueue.push('a');
        processQueue.push('b');
        processQueue.push('c');
        processQueue.start();
        await wait(25);
        expect(processor.value).toEqual('abc');
    });

    test("it calls an onError hook that receives thrown errors", async () => {
        let errors = 0;
        let processQueue = new ProcessQueue({
            onError: async ({error, queue}) => {
                errors++
                await queue.stop();
            },
            processor: async (task) => {
                throw new Error('nope');
            }
        });
        processQueue.push('a');
        await wait(25);
        expect(errors).toEqual(1);
    });

    test("it calls an onError hook when a promise is rejected", async () => {
        let errors = 0;
        let processQueue = new ProcessQueue({
            onError: async ({error, queue}) => {
                errors++
                await queue.stop();
            },
            processor: (task) => new Promise((resolve, reject) => reject(new Error('reason'))),
        });
        processQueue.push('a');
        await wait(25);
        expect(errors).toEqual(1);
    });

    test("when an error happens, the task is retried", async () => {
        let tries = 0;
        let processQueue = new ProcessQueue({
            onError: async ({error, queue, tries}) => {
                if (tries > 5) {
                    await queue.stop();
                }
            },
            processor: async (task) => {
                tries++;
                throw new Error('failing');
            },
        });
        processQueue.push('a');
        await wait(25);
        expect(tries).toEqual(6);
    });

    test('a task can be skipped on error', async () => {
        let tries = 0;
        let processQueue = new ProcessQueue({
            onError: async ({error, queue, skipCurrentTask}) => {
                skipCurrentTask();
            },
            processor: async (task) => {
                tries++;
                throw new Error('failing');
            },
        });
        processQueue.push('a');
        processQueue.push('b');
        await wait(25);
        expect(tries).toEqual(2);
    });

    test('stopping the queue waits on the current job in progress', async () => {
        let tries = 0;
        let processQueue = new ProcessQueue({
            onError: async ({error, queue, skipCurrentTask}) => {
                skipCurrentTask();
            },
            processor: async (task) => {
                tries++;
                await wait(100);
            },
        });
        processQueue.push('a');
        processQueue.push('b');
        await wait(10);
        await processQueue.stop();
        expect(tries).toEqual(1);
    });

    test('stopping the queue in the same event loop cycle prevents tasks from being processed', async () => {
        let processed = 0;
        let processQueue = new ProcessQueue({
            onError: async ({error, queue, skipCurrentTask}) => {
                skipCurrentTask();
            },
            processor: async (task) => {
                processed++;
            },
        });
        processQueue.push('a');
        processQueue.push('b');
        await processQueue.stop();
        expect(processed).toEqual(0);
    });

    test('purging prevents the next task(s) from being handled', async () => {
        let tries = 0;
        let processQueue = new ProcessQueue({
            onError: async () => {},
            processor: async (task) => {
                tries++;
            }
        });
        processQueue.push('a');
        processQueue.push('b');
        await processQueue.purge();
        expect(tries).toEqual(0);
    });

    test('when a job is completed the onFinish hook is called', async () => {
        let called = false;
        let processQueue = new ProcessQueue<string>({
            onError: async () => {},
            onFinish: async () => {
                called = true;
            },
            processor: async (task) => {
            }
        });
        processQueue.push('something');
        await wait(1);
        await processQueue.stop();
        expect(called).toBe(true);
    });

    test('when a job errors the onFinish hook is NOT called', async () => {
        let called = false;
        let processQueue = new ProcessQueue<string>({
            onError: async () => {},
            onFinish: async () => {
                called = true;
            },
            processor: async (task) => {
                throw new Error('oh no');
            }
        });
        processQueue.push('something');
        await wait(1);
        await processQueue.stop();
        expect(called).toBe(false);
    });
});

class AppendingProcessor {
    public value: string = '';

    constructor() {
        this.process = this.process.bind(this);
    }

    public async process(value: string): Promise<void> {
        this.value = this.value.concat(value);
    }
}

let wait = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));
