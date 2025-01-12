https://cloud.google.com/sql/docs/mysql/connect-instance-cloud-run

### All scripts below use `gcloud` to configure and create resources in GCP.

Follow installation instructions here: https://cloud.google.com/sdk/docs/install
(or if installed ensure you have 445+ `gcloud components update --version=445.0.0`)

```bash
cp .env.public .env.gcp # and update your project ID, zones, passwords, and listed resource names

# enable all necessary APIs
bash ../django/deploy/enable-apis.sh .env.gcp

# create IAM permissions
bash ../django/deploy/create-service-account.sh .env.gcp
# then update your .env.gcp with GCP_SA_KEY_PATH=[output path]

# setup DNS, routing, ssl, load balancer, (front + backend)
bash deploy/create-bucket-lb-webapp.sh ../django/.env.gcp

# deploy to cloud ru
bash deploy/upload-app.sh ../django/.env.gcp

```
