import { SchemaDir, SchemaFile } from '@config';
import Ajv from 'ajv';
import fs from 'fs/promises';
import { createSchema } from 'genson-js';
import path from 'path';

const SCHEMA_BASE_PATH = './response-schemas';
const ajv = new Ajv({ allErrors: true });

/**
 * Validates the schema of a response body against a JSON schema.
 * @param dirName - The directory name for the schema
 * @param fileName - The file name for the schema
 * @param responseBody - The response body to validate
 * @param createSchemaFlag - Flag to create a new schema if it doesn't exist
 */
export async function validateSchema<
  Dir extends SchemaDir,
  File extends SchemaFile<Dir>,
>(
  dirName: Dir,
  fileName: File,
  responseBody: object,
  createSchemaFlag: boolean = false,
): Promise<void> {
  const schemaPath = path.join(
    SCHEMA_BASE_PATH,
    dirName,
    `${fileName}_schema.json`,
  );
  if (createSchemaFlag) {
    await generateNewSchema(responseBody, schemaPath);
  }

  const schema = await loadSchema(schemaPath);
  const validate = ajv.compile(schema);
  const valid = validate(responseBody);
  if (!valid) {
    throw new Error(
      `Schema validation ${fileName}_schema.json failed\n` +
        `${JSON.stringify(validate.errors, null, 4)}\n\n` +
        `Actual response Body:\n` +
        `${JSON.stringify(responseBody, null, 4)}`,
    );
  }
}
/**
 * Loads a JSON schema from a file.
 * @param schemaPath - path to the schema file
 * @returns The parsed JSON schema object
 */
async function loadSchema(schemaPath: string) {
  try {
    const schemaContent = await fs.readFile(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaContent);
    if (!schema || typeof schema !== 'object') {
      throw new Error(`Invalid schema format in file: ${schemaPath}`);
    }
    return schema;
  } catch (error) {
    throw new Error(`Failed to read the schema file: ${error.message}`);
  }
}

/**
 * Generates a new JSON schema based on the response body.
 * @param responseBody - The response body to generate the schema from
 * @param schemaPath - The path to save the generated schema
 */
async function generateNewSchema(responseBody: object, schemaPath: string) {
  try {
    const enrichedSchema = createSchema(responseBody);
    // const enrichedSchema = addDateTimeFormats(generateSchema);
    await fs.mkdir(path.dirname(schemaPath), { recursive: true });
    await fs.writeFile(schemaPath, JSON.stringify(enrichedSchema, null, 4));
  } catch (error: any) {
    throw new Error(`Failed to create schema file: ${error.message}`);
  }
}
