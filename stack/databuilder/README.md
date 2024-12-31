# Object Actions Fake User & Data generator


## To Install
```
cp .env.public .env 
npm install
```


Register Users with password from .env
```
ts-node src/main.ts --env-file=.env --action=objects-add --count=5
```

Generate content from randomly selected users
```
ts-node src/main.ts --env-file=.env --action=users-add --count=10
```


----
Alternative way to create users based on your own custom seed data:
```
cd stack/django
source .venv/bin/activate
python manage.py generate_users
```

---

***All CRUD operations are done by a authenticated user. So this currently works best if all users have the same password from your .env file***   


Start a Django Shell
```
cd stack/django
source .venv/bin/activate
```

`python manage.py shell` or `docker-compose exec django python manage.py shell` if in docker


Then paste this in your Django Shell
```
from oaexample_app.models import Users

def update_all_passwords(new_password: str):
    for user in Users.objects.all():
        user.set_password(new_password)
        user.save()
    print(f"All passwords updated successfully for {Users.objects.count()} users.")

update_all_passwords("APasswordYouShouldChange")
```



---
#### To purge test data:
```
python manage.py shell
```
Then with your Object types:
`Songs.objects.all().delete()`
