import { AnyMessageFrom, MessageConsumer, StreamDefinition } from './interfaces';

interface ProcessFunc {
    (): Promise<void>
}

interface ResolvablePromise<Response> extends Promise<Response> {
    resolve(response: Response | Promise<Response>): void;
    reject(reason?: any): void;
}

function later<Response>(): ResolvablePromise<Response> {
    let resolve: (response: Response | Promise<Response>) => void;
    let reject: (response?: any) => void;
    let promise = new Promise<Response>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    (promise as ResolvablePromise<Response>).resolve = (response: Response | Promise<Response>): void => resolve(response);
    (promise as ResolvablePromise<Response>).reject = (reason?: any) => reject(reason);
    return promise as ResolvablePromise<Response>;
}

export class SynchronousMessageConsumer<Stream extends StreamDefinition> implements MessageConsumer<Stream> {
    private queue: [ProcessFunc, ResolvablePromise<void>][] = [];
    private running: boolean = false;
    constructor(private readonly consumer: MessageConsumer<Stream>) {
        this.process = this.process.bind(this);
    }

    consume(message: AnyMessageFrom<Stream>): Promise<void> {
        let promise = later<void>();
        this.queue.push([() => this.consumer.consume(message), promise]);

        if (this.queue.length === 1 && this.running === false) {
            this.running = true;
            setImmediate(this.process);
        }

        return promise;
    }

    async process() {
        let [job, resolver] = this.queue.shift() || [];

        if (job === undefined || resolver === undefined) {
            this.running = false;
            return;
        }

        try {
            await job();
            resolver.resolve();
            setImmediate(this.process);
        } catch (e) {
            resolver.reject(e);
        }

    }
}
