export interface Processor<Task> { (task: Task): Promise<any> }

export interface ProcessQueueOptions<Task> {
    processor: Processor<Task>,
    autoStart?: boolean,
    onDrained?: (queue: ProcessQueue<Task>) => any,
    onError: (config: {
        error: Error,
        task: Task,
        tries: number,
        skipCurrentTask: () => void,
        queue: ProcessQueue<Task>,
    }) => Promise<any>,
    onFinish?: (task: Task) => Promise<any>,
}

export class ProcessQueue<Task> {
    private nextTick: undefined | (() => void) = undefined;
    private tasks: Task[] = [];
    private tries: number = 0;
    private running: boolean = true;
    private processing: boolean = false;
    private timer: any;
    private config: Required<ProcessQueueOptions<Task>>;

    public constructor(
        options: ProcessQueueOptions<Task>,
    ) {
        this.config = {
            autoStart: true,
            onDrained: () => {},
            onFinish: async () => {},
            ...options,
        };
        this.processNextTask = this.processNextTask.bind(this);
        this.skipCurrentTask = this.skipCurrentTask.bind(this);
        this.running = this.config.autoStart;
    }

    public async purge() {
        await this.stop();
        this.tasks = [];
    }

    public start(): void {
        if (this.running) return;
        this.running = true;
        this.scheduleNextTask();
    }

    private scheduleNextTask(): void {
        this.timer = setImmediate(this.processNextTask);
    }

    private skipCurrentTask(): void {
        this.tasks.shift();
        this.tries = 0;
    }

    private processNextTask(): void {
        if (this.tasks.length > 0) {
            this.processing = true;
            this.tries++;
            // noinspection JSVoidFunctionReturnValueUsed
            this.config.processor.apply(null, [this.tasks[0]]).then(
                (_) => this.handleProcessorResult(undefined),
                (err: Error) => this.handleProcessorResult(err)
            );
        }
    }

    public push(task: Task): void {
        this.tasks.push(task);

        if (this.tasks.length === 1 && this.running) {
            this.scheduleNextTask();
        }
    }

    private async handleProcessorResult(err: Error | undefined): Promise<void> {
        this.processing = false;
        const task = this.tasks[0];

        if (err) {
            this.config.onError(({error: err, task, tries: this.tries, queue: this, skipCurrentTask: this.skipCurrentTask}));
        } else {
            this.tries = 0;
            this.tasks.shift();
        }

        if (this.nextTick) {
            this.nextTick.apply(null);
            this.nextTick = undefined;
        }

        this.config.onFinish.apply(null, [task]);

        if (this.tasks.length === 0) {
            this.config.onDrained.apply(null, [this]);
        } else if (this.running) {
            this.scheduleNextTask();
        }
    }

    public stop(): Promise<void> {
        this.running = false;
        clearImmediate(this.timer);

        if (!this.processing) {
            return Promise.resolve();
        }

        return new Promise<void>(resolve => this.nextTick = resolve);
    }
}
