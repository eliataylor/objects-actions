# Object Actions world builder

#### Start App template
```sh
cp .env.public .env 
npm install
npm start
```


----
Alternative way to create users based on your own custom seed data:
`cd stack/django`
`source .venv/bin/activate`
`python manage.py generate_users` (if you're running mysql inside a container, you may need to change the host in your .env)



---
#### To purge test data:
`python manage.py shell`
Then with your Object types:
`Songs.objects.all().delete()`
