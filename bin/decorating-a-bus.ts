import { Bus, BusDefinition, BusSection, Input, ServiceBus } from '@deltic/bus';
import { v4 as uuidv4 } from 'uuid';

enum AccountOperation {
    REGISTER_ACCOUNT = 'register_account',
    CLOSE_ACCOUNT = 'close_account',
}

interface Profile {
    id: string,
    emailAddress: string,
    firstName: string,
    lastName: string,
}

interface RegisterAccount {
    profile: Profile,
}

interface CloseAccount {
    profileId: string,
}

interface AccountService extends BusDefinition {
    [AccountOperation.REGISTER_ACCOUNT]: BusSection<RegisterAccount, void>,
    [AccountOperation.CLOSE_ACCOUNT]: BusSection<CloseAccount, void>,
}

let accountServiceBus: ServiceBus<AccountService> = new Bus({
    [AccountOperation.REGISTER_ACCOUNT]: async (payload) => {

    },
    [AccountOperation.CLOSE_ACCOUNT]: async (payload) => {

    },
});

class LoggingServiceBus<Definition extends BusDefinition> implements ServiceBus<Definition>{
    constructor(private readonly innerBus: ServiceBus<Definition>) {
    }

    public async handle<T extends keyof Definition>(input: Input<T, Definition[T]["payload"]>): Promise<Definition[T]["response"]> {
        console.log(input);

        return this.innerBus.handle(input);
    }
}

let accountService = new LoggingServiceBus(accountServiceBus);

accountService.handle({
    type: AccountOperation.REGISTER_ACCOUNT,
    payload: {
        profile: {
            id: uuidv4(),
            emailAddress: 'info@frankdejonge.nl',
            firstName: 'Frank',
            lastName: 'de Jonge',
        }
    }
}).then(() => {
    console.log('alright!');
})
