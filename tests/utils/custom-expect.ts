import { expect as baseExpect } from '@playwright/test';
import { APILogger } from './logger';

let apiLogger: APILogger;

export const setCustomExpectLogger = (logger: APILogger) => {
    apiLogger = logger;
}
declare global {
    namespace PlaywrightTest {
        interface Matchers<R, T> {
            shouldBeEqual(expected: T): R;
        }
    }
}
export const expect = baseExpect.extend({
    shouldBeEqual(received: any, expected: any) {
        let pass: boolean;
        let logs: string = '';
        try {
            baseExpect(received).toEqual(expected);
            pass = true;
            if (this.isNot) {
                logs = apiLogger
                    ? apiLogger.getRecentLogs()
                    : 'No API logs available';
            }
        } catch (e: any) {
            pass = false;
            logs = apiLogger
                ? apiLogger.getRecentLogs()
                : 'No API logs available';
        }
        const hint = this.isNot ? 'not ' : '';

        const message =
            this.utils.matcherHint('shouldBeEqual', undefined, undefined, {
                isNot: this.isNot,
            }) +
            '\n\n' +
            `Expected: ${hint}${this.utils.printExpected(expected)}\n` +
            `Received: ${this.utils.printReceived(received)}\n\n` +
            `Recent API Activity: \n${logs}`;
        return { message: () => message, pass };
    }

})