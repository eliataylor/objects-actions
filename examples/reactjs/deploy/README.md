https://cloud.google.com/sql/docs/mysql/connect-instance-cloud-run

### All scripts below use `gcloud` to configure and create resources in GCP.
Follow installation instructions here: https://cloud.google.com/sdk/docs/install
(or if installed ensure you have 445+ `gcloud components update --version=445.0.0`)

```bash
cp .env.public .env.gcp # and update your project ID, zones, passwords, and listed resource names

# enable all necessary APIs
bash deploy/enable-apis.sh .env.gcp 

# create IAM permissions
bash deploy/create-service-account.sh .env.gcp 
# then update your .env.gcp with GCP_SA_KEY_PATH=[output path]

# create Cloud SQL instance and DB
bash deploy/create-sql.sh .env.gcp 
# then update your .env.gcp with your MySQL host and 

# setup DNS, routing, ssl, load balancer, (front + backend)
bash deploy/setup-dns-https.sh .env.gcp 

# create bucket for API uploads
bash deploy/create-bucket.sh .env.gcp 

# build and upload docker repo 
bash deploy/build-docker.sh .env.gcp 

# push private credentials to Secrets Manager
bash deploy/create-secrets.sh .env.gcp 

# deploy to cloud ru
bash deploy/cloud-run.sh .env.gcp 

```