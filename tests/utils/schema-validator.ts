import { SchemaDir, SchemaFile } from '@config';
import fs from 'fs/promises';
import path from 'path';

const SCHEMA_BASE_PATH = './response-schemas';

export async function validateSchema<
  Dir extends SchemaDir,
  File extends SchemaFile<Dir>,
>(dirName: Dir, fileName: File) {
  const schemaPath = path.join(
    SCHEMA_BASE_PATH,
    dirName,
    `${fileName}_schema.json`,
  );
  const schema = await loadSchema(schemaPath);
  console.log(schema);
}

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
