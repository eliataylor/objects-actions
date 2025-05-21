import { Helpers } from "./context";

export default class FormLoaders {

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

    constructor(helpers) {
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

    getHtmlType(field) {
        if (typeof this.typeToHTMLType[field.type] === 'undefined') return false;

        let type = this.typeToHTMLType[field.type];
        if (type === 'entity_reference' && field.widget && field.widget[0] && field.widget[0]['#type']) {
            return field.widget[0]['#type'];
        }
        return type;
    }

    /*
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
     */
}
