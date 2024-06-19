In order to test this project, you need a target project. Here's the one generated from [object-fields-nod.csv](examples%2Fobject-fields-nod.csv) and [permissions-matrix-nod.csv](examples%2Fpermissions-matrix-nod.csv)

1. **Clone Django Project**  
```sh
git clone git@github.com:eliataylor/nod-backend.git nod_backend
cd nod_backend 
python -m venv env
source env/bin/activate  # On Windows use `env\Scripts\activate`
pip install -r requirements.txt
```

2. **Build Models, Views, Serializers and URLs**  
```sh
cd root-of-this-repo
python django/generate.py admin --types=examples/object-fields-nod.csv --output_dir=../nod_backend/nod_backend
```

3. **Build and Test that target**
```sh
cd nod_backend # root of Django project from step 1
python manage.py makemigrations 
python manage.py migrate --run-syncdb
python manage.py createsuperuser
python manage.py runserver
```