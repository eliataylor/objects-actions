import { generate } from 'openapi-typescript-codegen';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateTypes() {
  const schemaPath = path.join(__dirname, '../../django/schema.yaml');
  
  try {
    await generate({
      input: schemaPath,
      output: path.join(__dirname, '../src/types/api'),
      exportSchemas: true,
      exportServices: true,
      exportCore: true,
      indent: '2',
      postfixServices: 'Service',
      useUnionTypes: true,
    });
    
    console.log('✅ API types generated successfully!');
  } catch (error) {
    console.error('❌ Error generating API types:', error);
    process.exit(1);
  }
}

generateTypes(); 