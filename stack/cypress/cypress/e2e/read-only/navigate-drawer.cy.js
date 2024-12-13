process.env.forms = {
    demoFile: 'create-group.ts',
    demoTitle: 'navigate drawer',
    viewportWidth: 1366,
    viewportHeight: 800,
};
import {Helpers} from "../../support/context";

describe("oaexample navigate drawer", async () => {
    // @ts-ignore
    let forms = process.env.forms;
    if (!forms) forms = {};
    if (!forms.viewportWidth) forms.viewportWidth = 360;
    if (!forms.viewportHeight) forms.viewportHeight = 640;
    if (!forms.demoTitle) forms.demoTitle = 'oaexample navigate drawer test';

    let {viewportWidth, viewportHeight, demoTitle} = forms;

    const helpers = new Helpers();

    beforeEach(() => {
        const creds = cy.loginBackground(Cypress.env("email"), Cypress.env("password")).then(e => {
            console.log(e);
        });
    })

    it(demoTitle, () => {

        cy.viewport(viewportWidth, viewportHeight);
        //   cy.loginBackground(Cypress.env("email"), Cypress.env("password"));
        cy.visit(Cypress.env("clientURL") + '');
        cy.addHand('dark');
        cy.assertMenuReady();

        cy.grab('.MuiInputBase-input')
            .type('Our Wedding 2029', {
                force: true
            })

        cy.grab('.MuiButtonBase-root')
            .eq(1)
            .showClick();

        cy.grab('#branding-header')
            .showClick();

        cy.wait(3000)

        cy.grab("textarea[name=field_body]").type("Hello 123", {
            force: true,
        });

        cy.grab('.MuiTypography-root MuiTypography-body1:eq(1) > button').showClick();


    })
})
