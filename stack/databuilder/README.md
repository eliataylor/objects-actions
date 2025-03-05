# Fake User & Data generator
__**This project generates infinite users and rows of data using the `faker` library. It is especially useful for quickly testing permissions and pagination.**__


# IN DOCKER
For the time being you'll have to manually edit this file: https://github.com/eliataylor/objects-actions/blob/main/stack/django/oaexample_base/settings/security.py#L65 by setting
```aiignore
CSRF_COOKIE_DOMAIN = None
CSRF_COOKIE_SAMESITE = None
```

### Register test Users with password from .env
```aiignore
docker exec databuilder-service npx tsx src/main.ts --env-file=.env --action=users-add --count=1
```


### Create content types
```aiignore
docker exec databuilder-service npx tsx src/main.ts --env-file=.env --action=objects-add --count=5
```


### Delete all test users and data
```aiignore
docker exec databuilder-service npx tsx src/main.ts --env-file=.env --action=delete-all
```

you can also sh into the docker container and execute just the npx command:

```aiignore
docker exec -it databuilder-service /bin/sh
npx tsx src/main.ts --env-file=.env --action=users-add --count=1
```



# LOCALLY

## To Install
```
cp .env.public .env
npm install
```

## To Generate data:
Register test Users with password from .env
```
npx tsx src/main.ts --env-file=.env --action=users-add --count=1
```

Generate content for every Object type by users created above
```
npx tsx src/main.ts --env-file=.env --action=objects-add --count=1
```

Delete all test users and data
```
npx tsx src/main.ts --env-file=.env --action=delete-all
```

---
### you can also create tester users based on your own custom seed data:
Edit [generate_users.py](stack/django/oaexample_app/management/commands/generate_users.py) with seed data
```
docker-compose exec django python manage.py generate-users
```
(all these users are given the 'oa-tester' group which will be auto deleted during delete commands above)
