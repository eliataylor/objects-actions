# oaExample.com reactjs web app

#### Run in Docker
```sh
cp .env.public .env # and update your configs
cd ../.. # go to root of this repository
docker-compose up --build # start docker
```

#### Run Locally
```sh
sh start.sh
```

#### Deploy

```sh
bash deploy/upload-app.sh .env
```

----
### O/A Generated Files 
#### The following files have generated code written by [TypesBuilder.py](src/typescript/TypesBuilder.py). Code is injected with comment deliminators such as `//---OBJECT-ACTIONS-NAV-ITEMS-STARTS---//` and `//---OBJECT-ACTIONS-NAV-ITEMS-ENDS---//`

The builder ensures consistent TypeScript interfaces that match the Django models and generates fully typed forms with validation

1. [types.ts](stack/reactjs/src/object-actions/types/types.ts) contains 
- Interfaces for all model types
- Interfaces for API responses, errors and transformers
- `TypeFieldSchema`: a map of fields and their meta data 
- `NAVITEMS`: the list of base URLs and meta data

2. [access.ts](stack/reactjs/src/object-actions/types/access.ts) contains

- `canDo(verb: CRUDVerb, obj: EntityTypes, me?: MySession | null): boolean | string` - this function depends on how you've entered your Permission Matrix. Simple URLs like `/:object/:id/:verb` work well, but more complex patterns or URL alias will not work unless `getPermsByTypeAndVerb()` finds the correct permissions rows.

3. [Forms](stack/reactjs/src/object-actions/forming/forms) directory: 
- Builds one form component file per model, e.g.:
  - `OAFormTopics.tsx`
  - `OAFormResources.tsx`
  - `OAFormUsers.tsx`
  - etc...
- `index.tsx` provides form exports (ex. EntityForm.tsx)
- `FormProvider.tsx` handles the state management for every form and field and even supports nested sub forms.

4. [permissions.json](stack/reactjs/src/object-actions/types/permissions.json) is a flattened Permissions matrix used by `canDO()` in `access.ts`. It likely needs to be restructured to support contextual permissions and non-standard verbs

- Endpoint permissions mapping
- Ownership and context rules


***__Feel free to edit the file outside comment deliminators for each generated code block. If you edit inside, use git and be aware it could get editted by the builder if you rerun it later.__***
