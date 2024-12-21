import json
from utils.utils import inject_generated_code, build_permissions_from_csv, find_model_details, find_search_fields, create_machine_name, create_object_name, infer_field_datatype, build_types_from_csv, capitalize, find_object_by_key_value
from loguru import logger
import ast
import re
import inflect
import os

class TypesBuilder:
    def __init__(self, field_csv, matrix_csv, output_dir):
        self.pluralizer = inflect.engine()
        self.output_dir = output_dir
        self.types_filepath = os.path.join(self.output_dir, 'types.ts')
        self.field_csv = field_csv
        self.matrix_csv = matrix_csv
        self.json = build_types_from_csv(field_csv)

    def build_permissions(self):
        matrix = build_permissions_from_csv(self.matrix_csv, self.json) if self.matrix_csv is not None else None
        if matrix is None or 'permissions' not in matrix:
            return None

        perms_path = os.path.join(self.output_dir, 'access.tsx')
        inject_generated_code(perms_path, f"\n export type CRUDVerb = '{("' | '").join(matrix['all_verbs'])}';", 'PERMS-VERBS')
        inject_generated_code(perms_path, f"\n export type PermRoles = '{("' | '").join(matrix['all_roles'])}';", 'PERMS-ROLES')

        perms_path = os.path.join(self.output_dir, 'permissions.json')
        with open(perms_path, 'w') as file:
            file.write(json.dumps(matrix['permissions'], indent=2))


    def build_types(self):

        types = []
        constants = {}
        supermodel = f"""\nexport interface SuperModel {{
    readonly id: number | string; 
    author: RelEntity;
    created_at: string;
    modified_at: string;
    _type: string;
}}\n"""
        interfaces = [supermodel]
        urlItems = []
        for class_name in self.json:
            type_name = capitalize(create_object_name(class_name))
            machine_name = create_machine_name(class_name, True)
            path_segment = create_machine_name(class_name, True, '-')

            if machine_name != 'users':
                code = [f"export interface {type_name} extends SuperModel {{"]
            else:
                #TODO: check if all these are predefined!

                code = [f"export interface {type_name} {{"]
                code.append(f"\treadonly id: number | string")
                code.append(f"\t_type: string")
                code.append(f"\tis_active?: boolean")
                code.append(f"\tis_staff?: boolean")
                code.append(f"\tlast_login?: string")
                code.append(f"\tdate_joined?: string")
                if find_object_by_key_value(self.json[class_name], "Field Name", "email") is None:
                    code.append(f"\temail?: string")
                if find_object_by_key_value(self.json[class_name], "Field Name", "username") is None:
                    code.append(f"\tusername?: string")
                code.append(f"\tfirst_name?: string")
                code.append(f"\tlast_name?: string")
                if find_object_by_key_value(self.json[class_name], "Field Name", "groups") is None:
                    code.append(f"\tgroups?: string[]")

            constant = {}

            types.append(type_name)

            navItem = {"singular":self.pluralizer.singular_noun(class_name)}
            navItem['plural'] = class_name if class_name.endswith('ies') else self.pluralizer.plural_noun(navItem['singular'])
            navItem = {**navItem,
                       "type":type_name,
                       "segment": path_segment,
                       "api":f"/api/{path_segment}",
                       "screen":f"/{path_segment}",
                       "search_fields": find_search_fields(self.json, class_name)
                       }

            model_type = find_model_details(self.field_csv, class_name)
            if model_type is not None:
                navItem.model_type = model_type.model_type
                # navItem.examples = model_type.model_type

            urlItems.append(navItem)

            for field in self.json[class_name]:
                field_type = field['Field Type']
                if field_type == '':
                    field_type = 'string'
                field_type = create_machine_name(field_type, True)

                field_name = field['Field Name']
                if field_name == '':
                    field_name = create_machine_name(field['Field Label'], True)
                else:
                    field_name = create_machine_name(field_name, True)


                field_js = {}
                field_js['machine'] = field_name
                field_label = capitalize(field['Field Label'])
                field_js["singular"] = self.pluralizer.plural(field_label, 1)
                field_js["plural"] = self.pluralizer.plural(field_label, 2)

                field_def = "\t"

                if field_name == 'id':
                    noId = False
                    field_def += f"readonly {field_name}"
                else:
                    field_def += field_name

                data_type = infer_field_datatype(field_type)

                if not field['Required'] and field_type != 'id_auto_increment':
                    field_def += "?: "
                else:
                    field_def += ": "

                field_js['field_type'] = field_type
                field_def += data_type
                field_js['data_type'] = data_type
                field_js['cardinality'] = field['HowMany']
                field_js['relationship'] = capitalize(create_object_name(field['Relationship']))
                field_js['default'] = field['Default']
                field_js['required'] = True if field['Required'] else False
                field_js['example'] = field['Example'].strip()

                if field_type == 'enum':
                    list = field_js['example'].strip()
                    if list == '':
                        logger.warning(
                            f"Field {field['Field Label']} has no list of structure of choices. Please list them as a flat json array.")
                    try:
                        if list[0] == '[':
                            list = ast.literal_eval(list)
                        else:
                            list = list.split(',')
                        field_js['options'] = []
                        for name in list:
                            name = re.sub("[\"\']", "", name)
                            if name is None or name == '':
                                continue
                            field_js['options'].append({
                                "label":capitalize(name),
                                "id": create_machine_name(name, True)
                            })
                    except Exception as e:
                        logger.warning(
                            f"{field['Field Label']} has invalid structure of choices: {field_js['example']}  \nPlease list them as a flat json array. {str(e)}")

                constant[field_name] = field_js

                if field['HowMany'] == 'unlimited' or (isinstance(field['HowMany'], int) and field['HowMany'] > 1):
                    field_def += '[]'

                if not field['Required'] and field_type != 'id_auto_increment':
                    field_def += ' | null;'
                else:
                    field_def += ';'


                code.append(field_def)

#            if noId is True:
#               code.insert(1, f"\treadonly id: number | string")  # also User

            constants[type_name] = constant
            code.append("}")
            interfaces.append("\n".join(code))

        type_defintions = f"""export interface RelEntity {{
    id: string | number;
    str: string;
    _type: string;
    img?: string;
    entity?: EntityTypes
}}

export interface NewEntity {{
    id: number | string
}}

export type EntityTypes = {" | ".join(types)};

export interface ApiListResponse<T = EntityTypes> {{
    count: number;
    offset: number;
    limit: number;
    meta: any;
    error: string | null;
    results: T[]
}}

export function getProp<T extends EntityTypes, K extends keyof T>(entity: EntityTypes, key: string): T[K] | null {{
    // @ts-ignore
    if (key in entity) return entity[key]
	return null;
}}



export function restructureAsAllEntities(modelName: keyof typeof TypeFieldSchema, entity: any): any {{
    const schema = TypeFieldSchema[modelName];
    const result: any = {{id: entity.id || 0}};

    Object.entries(schema).forEach(([key, field]) => {{
        const value = entity[key];

        if (field.data_type === 'RelEntity') {{
            if (!value) {{
                // don't add at all
            }} else if (Array.isArray(value)) {{
                // Transform an array of RelEntities
                result[key] = value.map((item) => (item.entity ? restructureAsAllEntities(item._type, item.entity) : item));
            }} else if (value.entity) {{
                // Transform a single RelEntity
                result[key] = value?.entity ? restructureAsAllEntities(value._type, value.entity) : value;
            }} else {{
                result[key] = {id: value.id};
            }}
        }} else if (value) {{
            result[key] = value;
        }}
    }});

    return result;
}}


"""

        inject_generated_code(self.types_filepath, type_defintions.strip(), 'API-RESP')

        navItems = f"""export interface NavItem {{
        singular: string;
        plural: string;
        segment: string;
        screen: string;
        api: string;
        icon?: string;
        type: string;
        model_type?: string;
        search_fields: string[];

}}
export const NAVITEMS: NavItem[] = {json.dumps(urlItems, indent=2).strip()}"""
        inject_generated_code(self.types_filepath, navItems, 'NAV-ITEMS')

        inject_generated_code(self.types_filepath, f"""export interface FieldTypeDefinition {{
    machine: string;
    singular: string;
    plural: string;
    data_type: string;
    field_type: string;
    cardinality?: number;
    relationship?: string;
    required?: boolean;
    default?: string;
    example?: string;
    options?: {{ label: string; id: string; }}[];
}}
interface ObjectOfObjects {{
    [key: string]: {{ [key: string]: FieldTypeDefinition }};
}}
export const TypeFieldSchema: ObjectOfObjects = {json.dumps(constants, indent=2).strip()}""", 'TYPE-CONSTANTS')

        inject_generated_code(self.types_filepath, "\n".join(interfaces).strip(), 'TYPE-SCHEMA')

