# Object Actions demo reactjs app

#### Start App template
```sh
cp .env.public .env # and set your google anayltics GA ID
npm install
npm start
```

#### create TypeScript interfaces, Navigation Items and API response type defintions
``` 

python django/generate.py typescript --types=/Users/elitaylor/Developer/tmt/object-actions/examples/object-fields-nod.csv --matrix=/Users/elitaylor/Developer/tmt/object-actions/examples/permissions-matrix-nod.csv --output_dir=/Users/elitaylor/Developer/tmt/object-actions/templates/reactjs
```

#### Create React component Cards, detail Views, and forms
``` 
python django/generate.py react --types=/Users/elitaylor/Developer/tmt/object-actions/examples/object-fields-nod.csv --matrix=/Users/elitaylor/Developer/tmt/object-actions/examples/permissions-matrix-nod.csv --output_dir=/Users/elitaylor/Developer/tmt/object-actions/templates/reactjs
```