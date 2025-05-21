export interface Params {
    ":pid": number;
    ":tid": number;
    ":gid": number;
    ":game_type": number;
    ":uid": number;
    ":gcuid": number;
}

export interface Debug {
    url: string;
    password: string;
    email: string;
    path: string;
    params: Params;
    testrole: string;
}

export class Helpers {
    private json: any;

    constructor(fixture) {
        this.json = fixture?.entity;
    }

    public getProfile(st, verb) {
        console.log("CanDo getState auth: ", st.auth);
        if (!this.json) {
            console.log("CanDo: missing json")
            return false;
        }
        const profile = st.auth.me ? st.auth.me.profile : false;
        const can = this.json['can_' + verb](profile);
        console.log(`can_${verb} CanDo: `, can, st.auth.me);
        return can;
    }

    public can_verb(verb) {
        if (!window.store) {
            return cy.window().then(win => {
                const profile = this.getProfile(win.store.getState(), verb);
                return profile
            })
        }
        return new Promise((resolve, reject) => {
            if (window.store) {
                console.log('using window.store without cy')
                const profile = this.getProfile(window.store.getState(), verb);
                return resolve(profile);
            } else {
                console.log('using cy.window')

            }
        })
    }

    public getDefaultValue(field: any, entry?: any, index: number = 0) {
        let propname = field['data-propname'];
        if (entry && typeof entry[index] !== 'undefined' && typeof entry[index][propname] !== 'undefined') {
            return (entry[index][propname] === null) ? '' : entry[index][propname];
        } else if (typeof field.default_value === 'string' || typeof field.default_value === 'number') {
            return field.default_value;
        } else if (field.default_value === null) {
            return '';
        } else if (typeof field.default_value === 'object' && typeof field.default_value[index] !== 'undefined' && typeof field.default_value[index][propname] !== 'undefined') {
            return field.default_value[index][propname];
        } else if (typeof field.default_value === 'object' && typeof field.default_value[index] !== 'undefined' && typeof field.default_value[index]['default_date'] !== 'undefined' && field.default_value[index]['default_date'] === 'now') {
            const date = new Date();
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            }).format(date);
        }
        return '';
    }

    getErrorMsg(err) {
        if (typeof err.message !== 'undefined' && err.message !== '') {
            return err.message;
        } else if (typeof err.message !== 'undefined' && err.message === '') {
            return 'Unauthorized';
        } else if (typeof err.error === 'string') {
            return err.error;
        }
    }
}
