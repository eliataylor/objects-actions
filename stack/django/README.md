# NOD Backend

## Installation

1. **Clone the repository:**

    ```sh
    python3 -m venv .venv
    source .venv/bin/activate  # On Windows use `env\Scripts\activate`
    pip install -r requirements.txt
    ```

4. **Apply migrations:**
    ```sh
    python manage.py makemigrations oaexample_app
    python manage.py migrate
    python manage.py migrate --run-syncdb
    python manage.py makemigrations
    ```

5. **Create a superuser:**

    ```sh
    python manage.py createsuperuser
    ```

6. **Run the development server:**

    ```sh
    python manage.py runserver 8080
    python manage.py runserver_plus localapi.oaexample.com:8080 --cert-file ~/.ssh/certificate.crt
    ```

------

# To Connect to remote SQL:
- `./cloud-sql-proxy oaexample:us-west1:mysql-v8 --credentials-file ./keys/oaexample-django.json`
