# Fake User & Data generator


# LOCAL

## To Install
```
cp cypress.public.json cypress.env.json
npm install
```

## To watch Tests as they run and debug interactively:
```
npm run cy:open
```

## To run tests in the background + record videos / take screenshots:
```
npm run cy:run
```

# IN DOCKER

Open to `stack/reactjs/.env` and set the API url to `REACT_APP_API_HOST=https://django-service:8080`

then run tests:
```
docker exec -it cypress-service npx cypress run --spec cypress/e2e/read-only/load-form.cy.ts
```


### Troubleshooting
Check if Xvfb is running inside the container:
```
docker exec -it cypress-service ps aux | grep Xvfb
```

Ensure the DISPLAY environment variable is correctly set in the container by running:
```
docker exec -it cypress-service sh -c "echo $DISPLAY"
```


Test Cypress directly inside the container:
```
docker exec -it cypress-service npx cypress run --headless --browser electron
```
