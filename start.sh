#!/bin/bash
source "$(dirname "$0")/common.sh"

echo "Starting Django in $stackpath/django"
cd "$stackpath/django"

if [ ! -d .venv ]; then
    python -m venv .venv
    echo "Created new virtual environment"
else
    echo "Virtual environment already exists."
fi
source .venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations "$machinename_app"
python manage.py migrate
python manage.py migrate --run-syncdb
python manage.py makemigrations
python manage.py createsuperuser
python manage.py runserver_plus "localapi.$machinename.com:8080" --cert-file ~/.ssh/certificate.crt

echo "Starting ReactJS in $stackpath/reactjs"
cd "$stackpath/reactjs"
npm install
npm run start-ssl

# run cypress
