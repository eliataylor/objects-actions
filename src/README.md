# Code Generator Documentation

A flexible code generator tool that creates Django models, TypeScript types, permissions, and React forms from CSV specifications.

## Commands

```bash
python -m generate <command> --types=<csv_path> [options]
```

### Available Commands

- `django` - Generates Django models, views, serializers and URLs
- `typescript` - Creates TypeScript interfaces and type definitions
- `permissions-ts` - Builds TypeScript-based permission system
- `forms` - Generates React form components

### Required Arguments

- `--types` - Path to CSV file defining object types and fields
- `--output_dir` - Directory where generated files will be saved

### Optional Arguments

- `--permissions` - Path to CSV file defining access control matrix
- `--default_perm` - Default permission level when no matches found:
  - `AllowAll`
  - `IsAuthenticated` 
  - `IsAuthenticatedOrReadOnly` (default)

## Examples

Generate Django backend:
```bash
python -m generate django --types=objects.csv --output_dir=myapp/
```

Generate TypeScript types:
```bash
python -m generate typescript --types=objects.csv --output_dir=src/types/
```

Generate permissions with custom matrix:
```bash 
python -m generate permissions-ts --types=objects.csv --permissions=perms.csv --output_dir=src/access/
```

Generate React forms:
```bash
python -m generate forms --types=objects.csv --output_dir=src/components/forms/
```

## CSV Structure

### Objects CSV
Required columns:
- Field Name
- Field Type 
- Field Label
- Required
- Default
- Example
- Relationship
- HowMany

### Permissions CSV
Required columns:
- Context
- Endpoint
- Verb
- Ownership
- Roles
- Help
