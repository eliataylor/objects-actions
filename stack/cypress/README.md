# Fake User & Data generator


# LOCAL

## To Install
```
cp cypress.public.json cypress.env.json
npm install
```

## To watch Tests as they run:
```
npm run cy:open
```

## To run tests in the background + record videos / take screenshots:
```
npm run cy:run
```

# IN DOCKER

run tests:

```
docker exec -it cypress-service npx cypress run --spec cypress/e2e/read-only/load-form.cy.ts
```

Check if Xvfb is running inside the container:
```
docker exec -it cypress-service ps aux | grep Xvfb
```

Test Cypress directly inside the container:
```
docker exec -it cypress-service npx cypress run --headless --browser chrome
```

Ensure the DISPLAY environment variable is correctly set in the container by running:
```
docker exec -it cypress-service sh -c "echo $DISPLAY"
```
