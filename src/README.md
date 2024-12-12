### Create your Drupal CMS and API from your Object-Actions worksheet

<details>
<summary>To setup an empty project follow this django-rest-framework Quick Start</summary>

This all comes from https://www.django-rest-framework.org/tutorial/quickstart

##### Create the project directory
`mkdir tutorial`
`cd tutorial`

##### Create a virtual environment to isolate our package dependencies locally
`python3 -m venv env`
`source env/bin/activate`  # On Windows use `env\Scripts\activate`

##### Install Django and Django REST framework into the virtual environment
`pip install django`
`pip install djangorestframework`

##### Set up a new project with a single application
`django-admin startproject tutorial .`  # Note the trailing '.' character
`cd tutorial`
`django-admin startapp quickstart`
`cd ..`

</details>


- add read_only_fields to Serializer
- 




