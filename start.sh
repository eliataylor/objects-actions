#!/bin/bash

projectname=$1

cd projectname/django
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate --run-syncdb
python manage.py createsuperuser
python manage.py runserver_plus localapi.[projectname].com:8080 --cert-file ~/.ssh/certificate.crt

cd projectname/reactjs
npm install
npm run start-ssl
# start react

cd projectname/databuilder
npm install
npm run start

# run cypress
