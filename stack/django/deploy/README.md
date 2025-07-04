### All scripts below use `gcloud` to configure and create resources in GCP.
Follow installation instructions here: https://cloud.google.com/sdk/docs/install
(or if installed ensure you have 445+ `gcloud components update --version=445.0.0`)

```bash
`gcloud auth login` # and set this project as your defaulgt
`gcloud config set project objects-actions`

cp .env.public .env.gcp # and update your project ID, zones, passwords, and listed resource names

# enable all necessary APIs
bash deploy/enable-apis.sh .env .env.gcp

# create IAM permissions
bash deploy/create-service-account.sh .env .env.gcp
# then update your .env.gcp with GCP_SA_KEY_PATH=[output path]

Go to https://console.cloud.google.com/apis/credentials > your service account > Keys > Create JSON key > download it > set the path in your .env.gcp `GCP_SA_KEY_PATH` variable

# create Cloud SQL instance and DB
bash deploy/create-sql.sh .env .env.gcp
# then update your .env.gcp with your MySQL host and 

# create bucket for API uploads
bash deploy/create-bucket.sh .env.gcp


# setup DNS, routing, ssl, load balancer, (front + backend)
bash deploy/setup-dns-https.sh .env.gcp

# push private credentials to Secrets Manager
bash deploy/create-secrets .sh .env .env.gcp

# build and upload docker repo 
bash deploy/build-docker.sh .env .env.gcp

# deploy to cloud ru
bash deploy/cloud-run.sh .env .env.gcp

```
