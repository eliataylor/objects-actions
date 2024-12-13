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


        // TODO: loop over all NavItems click and assetEntityList, then EntityView


    })
})
