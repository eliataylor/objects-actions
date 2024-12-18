## CLI Commands to generate your code:

#### Generate your Django models, views, serializers and urls:

`python -m django/generate admin --types=examples/object-fields-nod.csv --output_dir=examples/django/_app`

#### Generate your TypeScript types, interfaces and URL patterns:

`python -m django/generate typescript --types=examples/object-fields-nod.csv --output_dir=examples/reactjs/src/object-actions/types/types.ts`

#### Test API and Generate fake data for API

`cd databuilder && npm install && npm start`


--------------------------------------------------------------------------------

# Object-Actions Worksheet

All Select options under Fields Types (Column D) in the Object Fields sheet come from column A in the "selectors" sheet.
If you have special field types, add them here. The checkboxes roughly describe what Fields are support by the different
CMS config builders in this repository.

  <a href="docs/images/field-types.png" target="_blank">
      <img src="docs/images/field-types.png" alt="Field Types" height="200" />
    </a>

