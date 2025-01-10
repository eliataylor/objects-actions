import {NAVITEMS} from "../../support/types";


describe("oaexample navigate drawer", async () => {
    beforeEach(() => {
        cy.loginBackground(Cypress.env("email"), Cypress.env("password")).then(e => {
            console.log(e);
        });
    })

    it("oaexample navigate drawer", () => {

        cy.viewport(Cypress.env("viewportWidth"), Cypress.env("viewportHeight"));
        cy.visit(Cypress.env("REACT_APP_APP_HOST"));
        cy.assertMenuReady();

        NAVITEMS.forEach(navItem => {
            cy.intercept('GET', `${navItem.api}*`).as(`Get${navItem.type}`) // wildcard for query params
            cy.grab(`#OAMenu a[href="/${navItem.segment}" i]`).showClick();
            // cy.get('#EntityList', {timeout: 10000}).should('exist');
            cy.wait(`@Get${navItem.type}`).then((interception) => {
                expect(interception.response).to.exist;
                expect(interception.response.statusCode).to.eq(200);
            });
        })

    })
})
