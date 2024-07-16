import json
import os
from utils import inject_generated_code, create_machine_name, create_object_name, infer_field_datatype, build_json_from_csv, capitalize, pluralize, find_object_by_key_value
from loguru import logger
import ast


class ReactBuilder:
    def __init__(self, field_csv, matrix_csv, types_filepath):
        self.types_filepath = types_filepath

        self.json = build_json_from_csv(field_csv)

    def build_types(self):

        types = []
        constants = {}
        interfaces = []
        urlItems = []
        for class_name in self.json:
            type_name = capitalize(create_object_name(class_name))
            machine_name = create_machine_name(class_name, True)

            code = [f"interface {type_name} {{"]
            code.append(f"\t_type: string") # also User

            if machine_name != 'users':
                # provided by SuperModel
                if find_object_by_key_value(self.json[class_name], "Field Name", "created_at") is None:
                    code.append(f"\tcreated_at: number")
                if find_object_by_key_value(self.json[class_name], "Field Name", "modified_at") is None:
                    code.append(f"\tmodified_at: number")
                if find_object_by_key_value(self.json[class_name], "Field Name", "author") is None:
                    code.append(f"\tauthor?: number")
            else:
                code.append(f"\tis_active?: boolean")
                code.append(f"\tis_staff?: boolean")
                code.append(f"\tlast_login?: string")
                code.append(f"\tdate_joined?: string")
                if find_object_by_key_value(self.json[class_name], "Field Name", "email") is None:
                    code.append(f"\temail?: string")
                code.append(f"\tusername?: string")
                code.append(f"\tfirst_name?: string")
                code.append(f"\tlast_name?: string")

            constant = {}

            types.append(type_name)

            urlItems.append({"name":class_name, "type":type_name, "api":f"/api/{machine_name}", "screen":f"/{machine_name}"})

            for field in self.json[class_name]:
                field_type = field['Field Type']
                field_name = field['Field Name']
                if field_name == '':
                    field_name = create_machine_name(field['Field Label'], True)
                else:
                    field_name = create_machine_name(field_name, True)

                if field_type == '':
                    field_type = 'string'

                field_js = {}
                field_js['machine'] = field_name
                field_label = capitalize(field['Field Label'])
                field_js["singular"] = pluralize(field_label, 1)
                field_js["plural"] = pluralize(field_label, 2)

                field_def = "\t"

                if field_name == 'id':
                    field_def += f"readonly {field_name}"
                else:
                    field_def += field_name

                if not field['Required']:
                    field_def += "?: "
                else:
                    field_def += ": "

                field_js['field_type'] = create_machine_name(field_type, True)
                data_type = infer_field_datatype(field_js['field_type'])
                field_def += data_type
                field_js['data_type'] = data_type
                field_js['cardinality'] = field['HowMany']
                field_js['relationship'] = create_machine_name(field['Relationship'], True)
                field_js['default'] = field['Default']
                field_js['required'] = True if field['Required'] else False
                field_js['example'] = field['Example'].strip()

                if field_type == 'enum':
                    list = field_js['example']
                    if list == '':
                        logger.warning(
                            f"Field {field['Field Label']} has no list of structure of choices. Please list them as a flat json array.")
                    try:
                        list = ast.literal_eval(list)
                        field_js['options'] = []
                        for name in list:
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

                if not field['Required']:
                    field_def += ' | null;'
                else:
                    field_def += ';'


                code.append(field_def)

            constants[type_name] = constant
            code.append("}")
            interfaces.append("\n".join(code))

        inject_generated_code(self.types_filepath, "\n".join(interfaces).strip(), 'TYPE-SCHEMA')

        type_defintions = f"""export interface RelEntity {{
    id: string | number;
    str: string;
    _type: string;
}}

export interface ListView {{
    count: number;
    next: string | null;
    previous: string | null;
    results: Array<{" | ".join(types)}>
}}

export type EntityView = {" | ".join(types)}; 

export function getProp<T extends EntityView, K extends keyof T>(entity: EntityView, key: string): T[K] | null {{
    // @ts-ignore
    if (key in entity) return entity[key]
	return null;
}}
"""

        inject_generated_code(self.types_filepath, type_defintions.strip(), 'API-RESP')

        navItems = f"""export interface NavItem {{
        name: string;
        screen: string;
        api: string;
        type: string;
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
    options?: object;
}}
interface ObjectOfObjects {{
    [key: string]: {{ [key: string]: FieldTypeDefinition }};
}}
export const TypeFieldSchema: ObjectOfObjects = {json.dumps(constants, indent=2).strip()}""", 'TYPE-CONSTANTS')




    def build_navigation(self):
        test = 1