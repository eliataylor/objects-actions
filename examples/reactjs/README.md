# oaexample reactjs app

#### Start App template
```sh
cp .env.public .env # and set your google anayltics GA ID
npm install
npm start
```

#### Deploy
```sh

# build
npm run build

gcloud config set project project-name

# create bucket
gsutil mb gs://prod_app

# open "https://prod_app.storage.googleapis.com/index.html"



```