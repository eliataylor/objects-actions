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
- `sudo /etc/init.d/mysql stop` or `sudo mysql.server stop`
- `./cloud-sql-proxy $GCP_MYSQL_PROJECT_ID:$GCP_MYSQL_ZONE:$GCP_MYSQL_INSTANCE --credentials-file $GCP_SA_KEY_PATH`
- `mysqldump -h 127.0.0.1 -u <DB_USER> -p<DB_PASSWORD> <DB_NAME> > db_dump.sql`
- `mysql -u username -p -h hostname database_name`
