import { APILogger } from './logger';
import { validateSchema } from './schema-validator';
import { SchemaDir, SchemaFile } from '@config';
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
      shouldMatchSchema<Dir extends SchemaDir, File extends SchemaFile<Dir>>(
        dirName: Dir,
        fileName: File,
        createSchemaFlag?: boolean,
      ): Promise<R>;
    }
  }
}

export const expect = baseExpect.extend({
  /**
   * Custom matcher to compare two values for equality with enhanced logging.
   * @param received - The received value
   * @param expected - The expected value
   * @returns The result of the comparison
   */
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
  /**
   * Custom matcher to compare two values for less than or equal with enhanced logging.
   * @param received - The received value
   * @param expected - The expected value
   * @returns The result of the comparison
   */
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
  /**
   * Custom matcher to validate the schema of a received value.
   * @param received - The received value
   * @param dirName - The directory name for the schema
   * @param fileName - The file name for the schema
   * @param createSchemaFlag - Flag to create a new schema if it doesn't exist
   * @returns The result of the schema validation
   */
  async shouldMatchSchema<Dir extends SchemaDir, File extends SchemaFile<Dir>>(
    received: any,
    dirName: Dir,
    fileName: File,
    createSchemaFlag: boolean = false,
  ) {
    let pass: boolean;
    let message: string = '';

    try {
      await validateSchema(dirName, fileName, received, createSchemaFlag);
      pass = true;
      message = 'Schema validation passed';
    } catch (e: any) {
      pass = false;
      const logs = apiLogger.getRecentLogs();
      message = `${e.message}\n\n\RecentAPI Activity:\n${logs}`;
    }
    return { message: () => message, pass };
  },
});
