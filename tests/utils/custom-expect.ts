import { APILogger } from './logger';
import { expect as baseExpect } from '@playwright/test';

let apiLogger: APILogger;

export const setCustomExpectLogger = (logger: APILogger) => {
  apiLogger = logger;
};
declare global {
  namespace PlaywrightTest {
    interface Matchers<R, T> {
      shouldBeEqual(expected: T): R;
      shouldBeLessThanOrEqual(expected: T): R;
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
        logs = apiLogger ? apiLogger.getRecentLogs() : 'No API logs available';
      }
    } catch (e: any) {
      pass = false;
      logs = apiLogger ? apiLogger.getRecentLogs() : 'No API logs available';
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
  },
  shouldBeLessThanOrEqual(received: any, expected: any) {
    let pass: boolean;
    let logs: string = '';
    try {
      baseExpect(received).toBeLessThanOrEqual(expected);
      pass = true;
      if (this.isNot) {
        logs = apiLogger.getRecentLogs();
      }
    } catch (e: any) {
      pass = false;
      logs = apiLogger.getRecentLogs();
    }
    const hint = this.isNot ? 'not ' : '';

    const message =
      this.utils.matcherHint('shouldBeLessThanOrEqual', undefined, undefined, {
        isNot: this.isNot,
      }) +
      '\n\n' +
      `Expected: ${hint}${this.utils.printExpected(expected)}\n` +
      `Received: ${this.utils.printReceived(received)}\n\n` +
      `Recent API Activity: \n${logs}`;
    return { message: () => message, pass };
  },
});
