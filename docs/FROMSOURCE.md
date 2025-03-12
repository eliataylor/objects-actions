## TO BUILD FROM SOURCE:


### Install Git, Brew, Python3, NVM, Node  
### `sh install.sh`
This will only install these tools if they don't exist. You can skip this if you have these dependencies.

### Build Your Stack
### `sh clone.sh --project "newproject" --type [object -field-types].csv --[permissions-matrix].csv`
<br />
This will clone the entire [stack](stack) directory and change necessary names and variables to your project name.

### Install / Connect to MySQL  
Update your database credentials here [newproject/django/.env](/stack/django/.env#L16)
<br />
If you don't have a mysql server, run `sh mysql_db.sh` to install docker and mysql inside a container and leave the .env file with it's default values.


### Run your Web App, API, CMS, and Cypress tests 
### `sh start.sh --project "newproject"`

This will start these sites:
- Django API: https://localapi.newproject.com:8080/api/schema/swagger
- Django Admin: https://localapi.newproject.com:8080/admin/login
- React WebApp: https://localhost.newproject.com:3000

### Generate unlimited Fake Data 
`sh fakedata.sh --project "newproject"`
By default 5 of each object type will be created. You can change the numbers and control which users create content from [newproject/databuilder/src/WorldBuilder.ts#L168](stack/databuilder/src/WorldBuilder.ts#L168)

### Test your WebApp with Cypress.io
`sh test-frontend.sh --project "newproject"`
By default 5 of each object type will be created. You can change the numbers and control which users create content from [newproject/databuilder/src/WorldBuilder.ts#L168](stack/databuilder/src/WorldBuilder.ts#L168)

### Test your API with K6
`sh test-backend.sh --project "newproject"`
By default the load testing runs for 30 seconds. You can change the settings here [newproject/k6/run.sh](stack/k6/run.sh)

