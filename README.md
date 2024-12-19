# Object-Actions Worksheet

## WHY

- [x] Document your Idea and Database
- [x] Quickly scaffold scalable Apps & APIs. Including:
  - [x] Authentication with Email, SMS, and nearly every social network
  - [x] Access Controls for User Groups and content ownership context
  - [x] Web App interface with API connectivity
  - [x] Complete End-To-End tests for functionality and content permissions
  - [x] Data generator to create unlimited content data to test and prototype, and the base data for your Cypress tests 


## HOW

|                                                          1: Define your Fields for each Object Type                                                          |                                                                     2: Define your roles and permissions                                                                    |
|:----------------------------------------------------------------------------------------------------------------------------------------:|:-------------------------------------------------------------------------------------------------------------------------------------------------------------:|
| <a href="docs/images/objects-nod.png" target="_blank"><img src="docs/images/objects-nod.png" alt="Objects to Actions" height="300"/></a> | <a href="docs/images/permissions-matrix-nod.png" target="_blank"><img src="docs/images/permissions-matrix-nod.png" alt="Permission Matrix" height="300"/></a> |

> `docker-compose up --build`
>
> ↓ Generates this whole stack ↓

https://github.com/user-attachments/assets/3065f1a1-9fa6-4420-99c2-f3aa4bcce373

|                                                         Content Admin                                                          |                                                                      API Docs                                                                       |                                                                Front-End WebApp                                                                |
|:------------------------------------------------------------------------------------------------------------------------------:|:---------------------------------------------------------------------------------------------------------------------------------------------------:|:----------------------------------------------------------------------------------------------------------------------------------------------:|
| <a href="docs/images/nod-backend_admin.png" target="_blank"><img src="docs/images/nod-backend_admin.png" alt="CMS Admin" height="200" /></a> | <a href="docs/images/nod-backend_swagger.png" target="_blank"><img src="docs/images/nod-backend_swagger.png" alt="Swagger Docs" height="200" /></a> | <a href="docs/images/nod-oa-interface.png" target="_blank"><img src="docs/images/nod-oa-interface.png" alt="WebApp" height="200" /></a> |

#### Build a scalable, secure API and CMS in Django, a fully integrated and authenticating ReactJS web app, end-to-end tests with Cypress.io and API load tests with K6. Includes OAuth logins from Google, Facebook, Spotify, SMS, and pretty much social network that provides OAuth.


# TO RUN:

- `git clone git@github.com:eliataylor/object-actions.git`
- `cd object-actions`
- `docker-compose up --build`

# TO CUSTOMIZE AND BUILD:

1. Copy and customize your own worksheets from this [Empty version](https://docs.google.com/spreadsheets/d/14Ej7lu4g3i85BWJdHbi4JK2jM2xS5uDSgfzm3rIhx4o/edit?usp=sharing) or this populated [Example version](https://docs.google.com/spreadsheets/d/1Jm15OeR6mS6vbJd7atHErOwBgq2SwKAagb4MH0D1aIw/edit?usp=sharing):
2. Download your Object Fields to  [stack/objects.csv](stack/objects.csv) 
3. Download your Permissions Matrix to [stack/permissions.csv](stack/permissions.csv)
4. Run `./load-sheets.sh --project "oaexample" --types "stack/objects.csv" --permissions "stack/permissions.csv"`
5. If you want to clone and rename the whole stack run `./clone.sh --project "newproject"` or any name you want

- If you want to build from source follow [FROMSOURCE.md](docs/FROMSOURCE.md)
- If you already have a codebase and only want to generate TypeScript or Django code visit [COMMANDS.md](docs/COMMANDS.md) to generate individual files 

--------------------------------------------------------------------------------

### TO CONTRIBUTE: [CONTRIBUTING.md](docs/CONTRIBUTING.md)

### TO SPONSOR: [github.com/sponsors/eliataylor](https://github.com/sponsors/eliataylor)

---
Example Site
![readme.png](docs/images/readme.png)

Offer Sign-in / Sign-up from any of these [AllAuth Providers](https://docs.allauth.org/en/dev/socialaccount/providers/index.html)
![sign-in-page.png](docs/images/sign-in-page.png)
