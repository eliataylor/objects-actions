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
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate --run-syncdb
python manage.py createsuperuser
python manage.py runserver_plus "localapi.$projectpath.com:8080" --cert-file ~/.ssh/certificate.crt

exit

echo "Starting ReactJS"
cd "$projectpath/reactjs"
npm install
npm run start-ssl
# start react

echo "Starting DataBuilder"
cd "$projectpath/databuilder"
npm install
npm run start

# run cypress
