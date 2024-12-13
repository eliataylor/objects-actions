#!/bin/bash

projectname=${1:-test}

# Convert projectname to alphanumeric, lowercase, and replace spaces with hyphens
machinename=$(echo "$projectname" | tr '[:upper:]' '[:lower:]' | sed 's/[^[:alnum:]]\+/-/g' | sed 's/^-\|-$//g')

# Default to "test" if machinename is empty
if [ -z "$machinename" ]; then
    machinename="test"
fi

projectpath=$(realpath "$machinename")

echo "Starting Django"
cd "$projectpath/django"
if [ ! -d .venv ]; then
    python -m venv .venv
    echo "Created new virtual environment."
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
python manage.py runserver_plus "localapi.$projectpath.com:8080" --cert-file ~/.ssh/certificate.crt

echo "Starting ReactJS"
cd "$projectpath/reactjs"
npm install
npm run start-ssl

# run cypress
