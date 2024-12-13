// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import {Routing} from "./context";
// import moment from "moment";

/*
// doesn't work
Cypress.Commands.add("dispatchRedux", (action) => {
    return cy.window().its('store').invoke('dispatch', action)
});

*/

// cypress/support/commands.js
Cypress.Commands.add(
    'loginBackground',
    (email, pass) => {
        cy.request({
            method: 'GET',
            url: Cypress.env("apiURL") + '/_allauth/browser/v1/config'
        }).then(({body}) => {

            cy.getCookie('csrftoken').then((cookie) => {
                const csrfToken = cookie ? cookie.value : '';

                console.log(`Background logging in as ${email} with CSRF token`, csrfToken);

                cy.request({
                    method: 'POST',
                    url: `${Cypress.env("apiURL")}/_allauth/browser/v1/auth/login`,
                    headers: {
                        "Content-Type": "application/json",
                        'X-CSRFToken': cookie
                    },
                    body: {
                        username: email,
                        password: pass
                    },
                }).then(({body}) => {
                    console.log('RECEIVED LOGIN: ', body)
                    let route = '/';
                    cy.visit(route);
                    cy.addHand('dark');
                    cy.wait('@waitForProfile').its('response.body').should('have.property', 'data')
                })
            })

        })

    }
)

Cypress.Commands.add("login", (email, pass) => {
    cy.visit('/signin', {timeout: 30000});
    cy.intercept({
        method: 'POST',
        url: Cypress.env("apiURL") + '/oauth/token?_format=json'
    }).as('waitForToken');
    cy.intercept({
        method: 'GET',
        url: Cypress.env("apiURL") + '/appstartup*'
    }).as('waitForProfile');

    cy.addHand('dark');
    cy.grab('input[name=email]').type(email);
    cy.grab('input[name=password]').type(pass);
    cy.grab('button[aria-label="Login Button"]').showClick();
    cy.wait('@waitForToken').its('response.body').should('have.property', 'access_token').then((interception) => {
        console.log('CanDO access token: ', interception)
    })
    cy.wait('@waitForProfile').its('response.body').should('have.property', 'profile').then((interception) => {
        console.log('CanDO profile: ', interception) // make sure it's set in redux though!?!
        cy.wait(1400); // wait for redux updated
        // cy.window().its('store').invoke('dispatch', 'logInSuccess')
    })
});

Cypress.Commands.add("showClick",
    {prevSubject: "element"},
    (subject) => {
        Cypress.$("#cypressHand").addClass("pulse");
        setTimeout((e) => {
            Cypress.$("#cypressHand").removeClass("pulse");
        }, 1000);
        cy.wrap(subject).click({force: true});
    }
);

Cypress.Commands.add("grab", (sel) => {
    // cy.wrap(
//        new Promise((resolve, reject) => {
    cy.get(sel, {force: true, includeShadowDom: true, timeout: 6000}).first().then(($el) => {
        // const $el = $body.length > 1 ? $body.first() : $body;
        const midY = $el.offset().top + $el.height() / 2;
        const midX = $el.offset().left + ($el.get(0).nodeName.toLowerCase() === "input" ? 5 : $el.width() / 2);

        // console.log("GRAB DEST: " + midX + ' ' + midY);

        // if (midY >= document.documentElement.clientHeight + window.scrollHeight && midY <= document.documentElement.clientHeight) {
        // cy.scrollTo(0, midY);
        $el.get(0).scrollIntoViewIfNeeded(true);
        // }

        Cypress.$("#cypressHand").animate(
            {top: midY, left: midX},
            {
                duration: 200,
                easing: "linear",
                /* always: () => {
                    if (resolved === false) {
                        resolve($el);
                    }
                },
                fail: () => {
                    // reject('missing hand or' + sel);
                }
                 */
            }
        );
    });
    // }), {timeout:8000}
    // );
});

Cypress.Commands.add("grabWithFallbacks", (url, routing) => {
    if (!cy.ifExists(`[href^="${url}"]`)) {
        cy.openDrawer();
        if (!cy.ifExists(`[href^="${url}"]`)) {
            cy.grab(`[aria-label="Expand Group Menu ${routing.getParam('gid')}"]`).showClick();
        }
    }
    const dest = url === routing.getDestination() ? routing : new Routing(url)
    cy.grab(`[href^="${url}"]`).showClick();
    if (dest.isEntityView() === true) {
        cy.assertEntityView()
    } else if (dest.isForm() === true) {
        cy.assertForm()
    } else if (dest.isList() === true) {
        cy.assertListView()
    }
});

Cypress.Commands.add("ifExists", (ele) => {
    //console.warn("ifExists",ele)
    return cy.get('body')
        .find(ele)
        .its("length")
        .then((res) => {
            if (res > 0) {
                console.log("exists: " + ele)
                return true;
            }
            console.log("DOES NOT EXSITS: " + ele)
            return false;
        })

});

Cypress.Commands.add("addHand", (theme) => {
    cy.document().then(dom => {
        const src = theme === 'dark' ? '/assets/my_location-white-18dp.svg' : '/assets/my_location-black-18dp.svg';
        if (dom.getElementById("cypressHand")) {
            dom.getElementById("cypressHand").src = src;
        } else {
            cy.get('body').then(($body) => {
                const img = dom.createElement("IMG");
                img.src = src;
                img.width = 18;
                img.height = 18;
                img.id = 'cypressHand';
                $body.append(img);
                // Cypress.$("body").append(img);
                // $body.get(0).appendChild(img);
                console.log('Added Hand', img);
            })
        }
    })
    cy.get('#cypressHand').should('exist')
})


Cypress.Commands.add('assertMenuReady', () => {
    cy.get('header', {timeout: 10000}).should('exist');
})

Cypress.Commands.add('assertForm', () => {
    cy.get('form.taForm').should('exist');
})

Cypress.Commands.add('assertEntityView', () => {
    cy.get('#EntityView').should('exist');
})

Cypress.Commands.add('assertListView', () => {
    cy.get('#Dashboard').should('exist');
})

Cypress.Commands.add('openDrawer', () => {
    cy.grab('[aria-label="Open drawer"]').showClick(true);
})

Cypress.Commands.add('assertAuthenticated', () => {
    cy.window().its('store').invoke('getState').its('auth').should('have.a.property', 'me')
    // cy.get('#mainheader[aria-label="authenticated"]', {timeout: 10000}).should('exist');
})
