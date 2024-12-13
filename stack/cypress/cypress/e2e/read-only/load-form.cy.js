import {Helpers, Routing} from "../../support/context";
import FormLoaders from "../../support/FormLoaders";

const forms = process.env.forms;
const {
    viewportWidth,
    viewportHeight,
    fixtureTitle,
    fixturePath,
    formSegments,
    testRole
} = forms;

describe(fixtureTitle, () => {

    let routing = null;
    let fixture = null;

    beforeEach(function () {
        console.log('loading ' + fixturePath);
        cy.fixture(fixturePath).then((fixture) => {

            this.routing = new Routing(fixture.debug.url, fixture.debug);

            let startUrl = '/';
            startUrl = fixture.debug.url;
            if (fixture.debug.bundle === 'playlists' && fixture.debug.verb === 'add') {
                startUrl += '?title=test'
            }
            fixture.startUrl = startUrl;
            this.fixture = fixture;
            cy.viewport(viewportWidth, viewportHeight);
            if (Cypress.env("showLogin") === false) {
                cy.loginByAuth0Api(this.fixture.debug.email, this.fixture.debug.password, this.routing.getParam('gid'));
            }

        })
    })

    it(`${testRole}: ${formSegments}`,    function () {

        if (Cypress.env("showLogin") === true) {
            cy.login(this.fixture.debug.email, this.fixture.debug.password, this.routing.getParam('gid'));
        }

        cy.log(`Starting Test ${fixturePath}`);

        const {debug, ...expectedRes} = this.fixture;
        this.helpers = new Helpers(this.fixture);

        cy.window().then(win => {
            const can = this.helpers.getProfile(win.store.getState(), this.fixture.debug.verb);

            cy.log(`isAccessible`, can);

            const formLoaders = new FormLoaders(this.routing, this.helpers);
            formLoaders.navigate(this.fixture.debug.bundle, this.fixture.debug.verb, can);

            const errorMsg = this.helpers.getErrorMsg(expectedRes);
            console.log(`TEST CONTEXT CanDo ${this.fixture.debug.verb}:`, can, errorMsg);

            if (typeof errorMsg === "string" || can === false) {
                return cy.get("#notistack-snackbar").should("exist");
            }

            for (let f in expectedRes.fields) {
                let field = expectedRes.fields[f];
                const inputTag = formLoaders.getHtmlType(field);
                if (!inputTag) {
                    // console.warn('skipping ' + field.type, field);
                    continue;
                }

                let entity = expectedRes.entity ? expectedRes.entity[field.field_name] : null;
                let defaultValue = this.helpers.getDefaultValue(field, entity, 0).toString();
                if (field.type === 'text_with_summary') {
                    defaultValue = defaultValue.replace('&nsbp;', ' ');
                    defaultValue = defaultValue.replace(/\r/g, '');
                }

                const selector = `${inputTag}[name="${field.field_name}"]`;

                cy.log([selector, defaultValue].join(' - expecting - '));

                if (field.field_name === "gid") {
                    cy.get(selector).should("have.value", this.routing.getParam('gid').toString());
                } else if (field.type === "hidden") {
                    cy.get(selector).should("have.value", defaultValue);
                } else if (inputTag === 'input' || inputTag === 'textarea') {
                    cy.grab(selector).should("have.value", defaultValue);
                } else if (inputTag === 'select') {
                    if (defaultValue.length > 0) {
                        cy.grab(`${inputTag}[name="${field.field_name}"] options:selected`).should("have.value", defaultValue);
                    } else {
                        cy.grab(selector).should('exist');
                    }
                } else {
                    // TODO: handle other field types
                }
            }

            cy.grab(`button[type="submit"]`).scrollIntoView({
                behavior: "smooth",
                block: "start",
                offset: {top: -150, left: 0},
            });

        })

    });
});
