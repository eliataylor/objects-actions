import json
from utils.utils import inject_generated_code, create_options, build_permissions_from_csv, find_model_details, find_search_fields, create_machine_name, create_object_name, infer_field_datatype, build_types_from_csv, capitalize, find_object_by_key_value
from loguru import logger
import inflect
import os


class TypesBuilder:
    def __init__(self, field_csv, matrix_csv, output_dir):
        self.pluralizer = inflect.engine()
        self.output_dir = output_dir if output_dir.endswith('/') else f"{output_dir}/"
        self.templates_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')) + '/templates/reactjs/'
        self.types_filepath = os.path.join(self.output_dir, 'types.ts')
        self.field_csv = field_csv
        self.matrix_csv = matrix_csv
        self.json = build_types_from_csv(field_csv)

    def build_permissions(self, default_perm):
        access_path = os.path.join(self.output_dir, 'access.ts')
        if not os.path.exists(access_path):
            with open(self.templates_dir + '/access.ts', 'r') as fm:
                tpl = fm.read().strip()
                tpl = tpl.replace('__DEFAULT_PERM__', default_perm)
                with open(access_path, 'w') as file:
                    file.write(tpl)

        matrix = build_permissions_from_csv(self.matrix_csv, self.json) if self.matrix_csv is not None else None
        if matrix is None or 'permissions' not in matrix:
            matrix = {'all_verbs':['view', 'add', 'edit', 'delete'],
                      'all_roles':['anonymous', 'authenticated', 'verified'],
                      'permissions':[]} # reset to default

        inject_generated_code(access_path, f"\nexport type CRUDVerb = '{("' | '").join(matrix['all_verbs'])}';", 'PERMS-VERBS')
        inject_generated_code(access_path, f"\nexport const DEFAULT_PERM: 'AllowAny' | 'IsAuthenticated' | 'IsAuthenticatedOrReadOnly' = '{default_perm}';\n\nexport type PermRoles = '{("' | '").join(matrix['all_roles'])}';", 'PERMS-ROLES')

        perms_path = os.path.join(self.output_dir, 'permissions.json')
        with open(perms_path, 'w') as file:
            file.write(json.dumps(matrix['permissions'], indent=2))

    def build_forms(self):

        with open(self.templates_dir + '/form.tsx', 'r') as fm:
            tpl = fm.read().strip()

        imports = []

        for class_name in self.json:
            fields = []
            model_name = create_object_name(class_name)
            code = tpl.replace('__CLASSNAME__', model_name)

            for field in self.json[class_name]:
                field_type = create_machine_name(field['Field Type'], True)
                field_name = field['Field Name']

                if field_type == 'id_auto_increment' or field_name == 'created_at' or field_name == 'modified_at':
                    logger.debug(f"never render ID, created or modified dates")
                    continue

                # TODO: make Grid size and props dyamic
                fields.append(f"""\t\t\t<Grid item xs={{12}} >
\t\t\t\t{{renderField(TypeFieldSchema["{model_name}"]["{field_name}"], 0, {{fullWidth:true}})}}
\t\t\t</Grid>""")

            imports.append(f"export {{ default as OAForm{model_name} }} from './OAForm{model_name}';")

            code = code.replace('__ALLFIELDS__', "\n".join(fields))
            inject_generated_code(self.output_dir + f'OAForm{model_name}.tsx', code, 'OAFORM')

        imports.append("export type MyFormsKeys = `OAForm${string}`;")

        inject_generated_code(self.output_dir + f'index.tsx', "\n".join(imports), 'OAFORM')

    def build_types(self):

        types = []
        constants = {}
        supermodel = f"""\nexport interface SuperModel {{
    readonly id: number | string; 
    author: RelEntity<'Users'>;
    created_at: string;
    modified_at: string;
    _type: ModelName;
}}\n"""
        interfaces = [supermodel]
        urlItems = []
        for class_name in self.json:
            type_name = capitalize(create_object_name(class_name))
            machine_name = create_machine_name(class_name, True)
            path_segment = create_machine_name(class_name, True, '-')

            if machine_name != 'users':
                types.append(type_name)
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

            singular = self.pluralizer.singular_noun(class_name)
            if not singular:
                singular = class_name
                logger.info(f"Singularizing failed on {class_name}")

            navItem = {"singular":singular}
            navItem['plural'] = class_name # we recommend to list all models as Plural because it's easier to make singular
            navItem = {**navItem,
                       "type":type_name,
                       "segment": path_segment,
                       "api":f"/api/{path_segment}",
                       "search_fields": find_search_fields(self.json, class_name)
                       }

            model_type = find_model_details(self.field_csv, class_name)
            if model_type is not None:
                if "model_type" in model_type:
                    navItem['model_type'] = model_type['model_type']
                if "icon" in model_type:
                    navItem['icon'] = model_type['icon']


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
                field_js["singular"] = self.pluralizer.singular_noun(field_label, 1)
                field_js["plural"] = self.pluralizer.plural_noun(field_label, 2)
                if not field_js["singular"]:
                    field_js["singular"] = field_label

                if not field_js["plural"]:
                    field_js["plural"] = field_label

                field_def = "\t"

                if field_name == 'id':
                    field_def += f"readonly {field_name}"
                else:
                    field_def += field_name

                if len(field['Relationship']) > 0:
                    field_js['relationship'] = capitalize(create_object_name(field['Relationship']))

                data_type = infer_field_datatype(field_type)


                if not field['Required'] and field_type != 'id_auto_increment':
                    field_def += "?: "
                else:
                    field_def += ": "

                field_js['field_type'] = field_type
                field_js['data_type'] = data_type
                field_js['cardinality'] = field['HowMany']
                field_js['default'] = field['Default']
                field_js['required'] = True if field['Required'] else False
                field_js['example'] = field['Example'].strip()

                field_def += data_type
                if data_type == 'RelEntity':
                    if "relationship" in field_js:
                        field_def += f'<"{field_js['relationship']}">'
                    else:
                        logger.warning(f"No relationship defined for {field_name}. Assuming Users")
                        field_def += f'<"Users">'

                if field_type == 'enum':
                    field_js = create_options(field_js)

                constant[field_name] = field_js

                if field['HowMany'] > 1:
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

        modelTypes = "export type ModelType<T extends ModelName> = T extends 'Users' ? Users : "
        for itype in types:
            modelTypes += f"\nT extends '{itype}' ? {itype} :"

        type_defintions = f"""

export type ModelName = "Users" | "{'" | "'.join(types)}";

{modelTypes} never

export interface RelEntity<T extends ModelName = ModelName> {{
  id: string | number;
  str: string;
  _type: T;
  img?: string;
  entity?: Partial<ModelType<T>>;
}}

export type ITypeFieldSchema = {{
  [K in ModelName]: {{
    [fieldName: string]: FieldTypeDefinition;
  }};
}}

export interface ApiListResponse<T extends ModelName> {{
    count: number;
    offset: number;
    limit: number;
    meta: any;
    error: string | null;
    results: Array<ModelType<T>>
}}

export function getProp<T extends ModelName, K extends keyof ModelType<T>>(
  entity: ModelType<T>,
  key: K
): ModelType<T>[K] | null {{
  if (key in entity) return entity[key];
  return null;
}}

export function restructureAsAllEntities<T extends ModelName>(
  modelName: T,
  entity: Partial<ModelType<T>>
): ModelType<T> {{
  const schema = TypeFieldSchema[modelName];
  const result: any = {{ id: entity.id || 0, _type: modelName }};

  Object.entries(schema).forEach(([key, field]) => {{
    const value = (entity as any)[key];

    if (field.data_type === 'RelEntity') {{
      if (!value) {{
        // Skip undefined values
      }} else if (Array.isArray(value)) {{
        // Transform array of RelEntities
        result[key] = value.map((item) =>
          item.entity ? restructureAsAllEntities(item._type as ModelName, item.entity) : item
        );
      }} else if (value.entity) {{
        // Transform single RelEntity
        result[key] = value.entity ?
          restructureAsAllEntities(value._type as ModelName, value.entity) :
          value;
      }} else {{
        result[key] = {{ id: value.id }};
      }}
    }} else if (value !== undefined) {{
      result[key] = value;
    }}
  }});
  return result as ModelType<T>;
}}
"""

        inject_generated_code(self.types_filepath, type_defintions.strip(), 'API-RESP')

        navItems = f"""export interface NavItem<T extends ModelName = ModelName> {{
  singular: string;
  plural: string;
  segment: string;
  api: string;
  icon?: string;
  type: T;
  model_type?: 'vocabulary' | string;
  search_fields: string[];
}}

export const NAVITEMS: {{ [K in ModelName]: NavItem<K> }}[ModelName][] = {json.dumps(urlItems, indent=2).strip()}"""
        inject_generated_code(self.types_filepath, navItems, 'NAV-ITEMS')

        inject_generated_code(self.types_filepath, f"""export interface FieldTypeDefinition {{
    machine: string;
    singular: string;
    plural: string;
    data_type: 'string' | 'number' | 'boolean' | 'object' | 'RelEntity';
    field_type: string;
    cardinality: number | typeof Infinity;
    relationship?: ModelName;
    required: boolean;
    default: string;
    example: string;
    options?: Array<{{ label: string; id: string; }}>;
}}

export const TypeFieldSchema: ITypeFieldSchema = {json.dumps(constants, indent=2).strip()}""", 'TYPE-CONSTANTS')

        inject_generated_code(self.types_filepath, "\n".join(interfaces).strip(), 'TYPE-SCHEMA')

