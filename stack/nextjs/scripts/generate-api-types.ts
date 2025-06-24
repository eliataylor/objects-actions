import { generate } from 'openapi-typescript-codegen';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateTypes() {
  const schemaPath = path.join(__dirname, '../../django/schema.yaml');
  const outputPath = path.join(__dirname, '../src/types/api');
  
  console.log('🔍 Schema path:', schemaPath);
  console.log('📁 Output path:', outputPath);
  
  // Check if schema file exists
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found:', schemaPath);
    process.exit(1);
  }
  
  // Ensure output directory exists
  if (!fs.existsSync(outputPath)) {
    console.log('📂 Creating output directory...');
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  try {
    console.log('🚀 Starting API type generation...');
    
    await generate({
      input: schemaPath,
      output: outputPath,
      exportSchemas: true,
      exportServices: true,
      exportCore: true,
      indent: '2',
      postfixServices: 'Service',
      useUnionTypes: true,
      // Keep URLs as-is from the server (important for Django media URLs)
      clientName: 'ApiClient',
      useOptions: false,
    });
    
    console.log('✅ API types generated successfully!');
  } catch (error) {
    console.error('❌ Error generating API types:');
    console.error('Error details:', error);
    
    // Log more specific error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    process.exit(1);
  }
}

// Wrap in an async IIFE with proper error handling
(async () => {
  try {
    await generateTypes();
  } catch (error) {
    console.error('❌ Unhandled error in generateTypes:');
    console.error(error);
    process.exit(1);
  }
})(); 