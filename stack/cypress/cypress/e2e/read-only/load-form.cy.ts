import { FieldTypeDefinition, NAVITEMS, TypeFieldSchema } from "../../support/types";
import { fakeFieldData } from "../../support/faker";
import { canDo } from "../../support/access";

describe("oaexample load and populate add forms by user - role", async () => {
  let users = require("../../fixtures/oa-testers.json");

  users.forEach((user) => {

    describe(`Tests for user: ${user.email}`, () => {

      beforeEach(() => {
        if (user.email) {
          cy.loginBackground(user.email, user.password ?? Cypress.env("password")).then(e => {
            console.log(`LOGIN COMPLETE ${user.email} - ${user.password}`, e);
            cy.clickIf("#FirstVisitBtn");
            cy.clickIf("[aria-label=\"Dismiss EULA Notice\"]");
          });
        }
      });

      it("oaexample load and populate add forms", () => {

        cy.viewport(Cypress.env("viewportWidth"), Cypress.env("viewportHeight"));
        cy.visit(Cypress.env("REACT_APP_APP_HOST"));
        cy.assertMenuReady();
        if (!user.email) {
          cy.grab("#FirstVisitBtn").showClick();
          cy.grab("[aria-label=\"Dismiss EULA Notice\"]").showClick();
        }
        cy.grab(".MuiSwitch-root").showClick(); // do it in light mode for the video

        NAVITEMS.forEach(navItem => {

          if (Cypress.env("viewportWidth") <= 600) {
            cy.clickIf("[aria-label=\"Open Drawer\"]");
          }

          cy.grab(`#OAMenuButton`).showClick();

          cy.intercept("GET", `${navItem.api}*`).as(`Get${navItem.type}`); // wildcard for query params
          cy.grab(`#OAMenu a[href="/${navItem.segment}" i]`).showClick();
          cy.wait(`@Get${navItem.type}`).then((interception) => {
            expect(interception.response).to.exist;
            expect(interception.response.statusCode).to.eq(200);
          });

          if (Cypress.env("viewportWidth") <= 600) {
            cy.clickIf("[aria-label=\"Close Drawer\"]");
          }


          cy.intercept("GET", `/forms/${navItem.segment}/0/add*`).as(`GetForm${navItem.type}`); // wildcard for query params
          cy.grab(`[data-href="/forms/${navItem.segment}/0/add" i]`).showClick();


          const allow = canDo("add", { _type: navItem.type, id: 0 }, user);
          if (typeof allow === "string") {
            cy.clickIf("[aria-label=\"Permission Error\"]");
          } else {
            cy.log(`Populate Form ${navItem.type}`);
//            cy.wait(`@GetForm${navItem.type}`).its('response.status').should('eq', 200)
//            cy.wait(`@GetForm${navItem.type}`).then((interception) => {
//                expect(interception.response).to.exist;
//                expect(interception.response.statusCode).to.eq(200);

            const fields: FieldTypeDefinition[] = Object.values(TypeFieldSchema[navItem.type]);

            for (let f in fields) {
              let field = fields[f];
              const selector = `[name="${field.machine}"]`;

              const input = fakeFieldData(field.field_type, field.machine, field.options, navItem.plural);
              if (field.field_type === "image" || field.field_type === "media" || field.field_type === "video") {
                console.warn("TODO: handle media types " + field.field_type, field);
              } else if (field.field_type === "provider_url") {
                console.warn("TODO: social providers " + field.field_type, field);
              } else if (field.field_type === "boolean") {
                cy.grab(selector, { force: true }).parent().click();
              } else if (field.field_type === "enum") {
                cy.grab(selector, { force: true }).parent().click();
                cy.get(`#menu-${field.machine} li[role="option"]`).first().click();
              } else if (field.data_type === "RelEntity") {
                cy.grab(selector, { force: true }).type(input);
                cy.get(selector).blur();
              } else {
                cy.grab(selector, { force: true }).type(input);
              }
            }

            cy.grab("button[aria-label=\"Submit\" i]").scrollIntoView({
              behavior: "smooth",
              block: "start",
              offset: { top: -150, left: 0 }
            });
          }
        });
      });
    });
  });
});


