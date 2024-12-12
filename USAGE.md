# Object-Actions Worksheet

All Select options under Fields Types (Column D) in the Object Fields sheet come from column A in the "selectors" sheet.
If you have special field types, add them here. The checkboxes roughly describe what Fields are support by the different
CMS config builders in this repository.

  <a href="docs/images/field-types.png" target="_blank">
      <img src="docs/images/field-types.png" alt="Field Types" height="200" />
    </a>

--------------------------------------------------------------------------------
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
python src/generate.py admin --types=examples/object-fields-nod.csv --output_dir=/Users/user/Developer/nod_backend/nod_app
python src/generate.py typescript --types=examples/object-fields-nod.csv --output_dir=examples/reactjs/src/object-actions/types/types.tsx
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
