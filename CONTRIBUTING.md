#### In order to test this project, you need a target project. Here's the one generated from this [Worksheet](https://docs.google.com/spreadsheets/d/1AkFY0dSelMAxoaLVA_knNHIYmL97rtVjE1zuqEonCyM/edit?usp=sharing) exported here as [object-fields-nod.csv](examples%2Fobject-fields-nod.csv) and [permissions-matrix-nod.csv](examples%2Fpermissions-matrix-nod.csv)

#### This following code assumes your working directory is `/Users/user/Developer`

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
cd '..' # move back to /Users/user/Developer
git clone git@github.com:eliataylor/object-actions.git object-actions
cd object-actions
python django/generate.py admin --types=examples/object-fields-nod.csv --output_dir=/Users/user/Developer/nod_backend/nod_backend
python django/generate.py typescript --types=examples/object-fields-nod.csv --output_dir=templates/reactjs
```

3. **Build and Test that target**
```sh
cd ../nod_backend # move back to target project and run server 
python manage.py makemigrations 
python manage.py migrate --run-syncdb
python manage.py createsuperuser
python manage.py runserver
```

4. **Run the demo front end**
```sh
cd ../object-actions/templates/reactjs # move to react template project inside object-actions
npm install
npm start
```
