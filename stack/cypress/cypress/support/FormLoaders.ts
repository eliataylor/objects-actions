import {Helpers, Routing} from "./context";

export default class FormLoaders {

    routing: Routing
    helpers: Helpers
    typeToHTMLType = {
        "string": "input",
        "text_format": "textarea",
        "text": "input",
        "text_long": "textarea",
        /*
        "text_with_summary": "textarea",
        "string_long": "textarea",
        "email": "input",
        "password": "input",
        "telephone": "input",
        "float": "input",
        'decimal': "input",
        'integer': "input",
        'boolean': "select",
        "select": "select",
        "radios": "select",
        "checkboxes": "checkbox",
        "list_string": "select",
        "datetime": "input",
        "daterange": "input",
        "fieldset": "input",
        "link": "input",
        "path": "input",
        "color_field_type": "input",
        'image': "input",
        'managed_file': "input",
        'entity_reference': "input",
        "voting_api_field": "input",
        "language":"hidden",
        'hidden': "hidden",
        */
    };

    constructor(routing: Routing, helpers) {
        this.routing = routing;
        this.helpers = helpers;
        this.navigate = this.navigate.bind(this);
    }

    navigate(bundle, verb, can) {
        const that = this;
        let func = [bundle, verb].join("_");
        if (typeof that[func] !== 'function') {
            return console.error('MISSING ' + func);
        }
        console.info("CALLING " + func)
        return that[func](can);
    }

    submitForm(bundle, verb) {
        const that = this;
        let func = [bundle, verb, "submit"].join("_");
        if (typeof that[func] !== 'function') {
            return console.error('MISSING ' + func);
        }
        // TODO: make these work
        return that[func]();
    }

    getHtmlType(field) {
        if (typeof this.typeToHTMLType[field.type] === 'undefined') return false;

        let type = this.typeToHTMLType[field.type];
        if (type === 'entity_reference' && field.widget && field.widget[0] && field.widget[0]['#type']) {
            return field.widget[0]['#type'];
        }
        return type;
    }

    groups_add(can) {
        let route = `/group/start`;
        cy.grabWithFallbacks(route, this.routing);
        // cy.scrollTo("top");
    }

    groups_edit(can) {
        cy.grab(`[aria-label="Open Group Builder"]`).showClick();
        cy.grab(`#branding-header`).showClick();
        // TODO: open Accordion
    }

    account_edit(can) {
        const formRoute = `/forms/users/${this.routing.getParam('uid')}/edit`;
        console.log("playlist edit CanDo :", can)
        if (can === true) {
            let route = `/users/${this.routing.getParam('uid')}`;
            cy.grabWithFallbacks(route, this.routing);
            /* if (this.routing.getParam("gcuid") > 0 && this.routing.getParam("gid") > 0) {
                route = `/forms/group/${this.routing.getParam('gid')}/members/${this.routing.getParam('gcuid')}/edit`;
                cy.grabWithFallbacks(route, this.routing);
            } */
            cy.grabWithFallbacks(formRoute, this.routing);
        } else {
            cy.visit(formRoute); // force error message
        }
    }

    members_edit(can) {
        const formRoute = `/forms/group/${this.routing.getParam('gid')}/members/${this.routing.getParam('gcuid')}/edit`;
        console.log("playlist edit CanDo :", can)
        if (can === true) {
            let route = `/group/${this.routing.getParam('gid')}/members/${this.routing.getParam('gcuid')}`;
            cy.grabWithFallbacks(route, this.routing);
            cy.grabWithFallbacks(formRoute, this.routing);
        } else {
            cy.visit(formRoute); // force error message
        }
    }

    playlists_add(can) {
        console.log("playlist edit CanDo :", can)
        if (can === true) {
            let route = `/group/${this.routing.getParam('gid')}/playlists`;
            cy.grabWithFallbacks(route, this.routing);
            route = `/forms/group/${this.routing.getParam('gid')}/playlists/start`;
            cy.grabWithFallbacks(route, this.routing);
            cy.grab("input[name=entity_id_label]").type("Test " + new Date().getTime(), {force: true});
            cy.grab('[role="listbox"] li').showClick();
        } else {
            cy.visit(`/forms/group/${this.routing.getParam('gid')}/playlists/add`); // force error message
        }
    }

    playlists_edit(can) {
        const formRoute = `/forms/group/${this.routing.getParam('gid')}/playlists/${this.routing.getParam('pid')}/edit`
        console.log("playlist edit CanDo :", can)
        if (can === true) {
            let route = `/group/${this.routing.getParam('gid')}/playlists`;
//                cy.intercept(route).as('step1');
            cy.grabWithFallbacks(route, this.routing);
//                cy.wait("@step1")

            route = `/group/${this.routing.getParam('gid')}/playlists/${this.routing.getParam('pid')}` // WARN: this might not been on first page!!!!
//                cy.intercept(route).as('step2');
            cy.grabWithFallbacks(route, this.routing);
//                cy.wait("@step2")

            cy.grab(`[aria-label^="Playlist Menu"]`).showClick();
            cy.intercept(formRoute).as('step3');
            cy.grabWithFallbacks(formRoute, this.routing);
            cy.wait("@step3")
        } else {
            cy.visit(formRoute); // force error message
        }
    }

    tracks_add(can) {
        const formRoute = `/forms/group/${this.routing.getParam('gid')}/playlists/${this.routing.getParam('pid')}/tracks/add`
        console.log("tracks add CanDo :", can)
        if (can === true) {
            let route = `/group/${this.routing.getParam('gid')}/playlists`;
            cy.grabWithFallbacks(route, this.routing);
            cy.grab(`[aria-label^="Playlist Menu`).showClick();
            cy.grabWithFallbacks(formRoute, this.routing);
            /*
                cy.grab('button[aria-label="connect with tam"]').showClick();
                cy.grab('button[aria-label="upload media"]').showClick();
                cy.grab('button[aria-label="capture media"]').showClick();
            */
        } else {
            cy.visit(formRoute); // force error message
        }
    }

    tracks_edit(can) {
        const formRoute = `/forms/group/${this.routing.getParam('gid')}/playlists/${this.routing.getParam('pid')}/tracks/${this.routing.getParam('tid')}/edit`
        console.log("tracks add CanDo :", can)
        if (can === true) {
            let route = `/group/${this.routing.getParam('gid')}/playlists`;
            cy.grabWithFallbacks(route, this.routing);
            route = `/group/${this.routing.getParam('gid')}/playlists/${this.routing.getParam('pid')}`;
            cy.grabWithFallbacks(route, this.routing);
            cy.grab(`[aria-label^="Track Menu"]`).showClick(); //  ${this.routing.getParam('tid')}
            cy.grabWithFallbacks(formRoute, this.routing);
        } else {
            cy.visit(formRoute); // force error message
        }
    }

    track_edit(can) {
        return this.tracks_edit(can);
    }
}
