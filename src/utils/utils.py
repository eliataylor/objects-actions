import csv
import json
import os
import re
import sys
from loguru import logger
import pandas as pd
import inflect
import ast
import re


def find_model_details(csv_file, model_name):
    with open(csv_file, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            obj_type = row['TYPES']
            if obj_type == model_name:
                if row['Field Type'].lower() == 'vocabulary':
                    return {'model_type': 'vocabulary', 'example': row['Example']}

    return None


def normalize_crud_verb(crud_verb):
    # Define a dictionary with variations for each CRUD verb
    crud_mapping = {
        "view": ["read", "view"],
        "add": ["create", "add", "insert"],
        "edit": ["update", "edit", "modify"],
        "delete": ["delete", "remove", "destroy"]
    }

    # Normalize the crud_verb to lowercase and remove extra spaces
    crud_verb = crud_verb.strip().lower()

    # Iterate over the crud_mapping dictionary and return the corresponding normalized verb
    for normalized_verb, variations in crud_mapping.items():
        if crud_verb in variations:
            return normalized_verb

    # If no match is found, return the original crud_verb (optional: raise error if invalid)
    return crud_verb

def parse_relative_url(url: str, object_types):
    # Remove leading/trailing slashes
    url = url.strip("/")
    pattern = r"\[(id|[a-zA-Z_]+)\]|\{(id|[a-zA-Z_]+)\}|\:(id|[a-zA-Z_]+)" # [pid], {pid}, :pid
    url = re.sub(pattern, ":id", url)

    segments = url.split("/")

    context = {"context":[], "endpoint":url}

    verbstomatch = ['view', 'read', 'add', 'create', 'insert', 'edit', 'update', 'delete', 'remove', 'destroy', 'block']

    # Loop through the segments in reverse
    for i in range(len(segments) - 1, -1, -1):
        segment = segments[i]

        previous = segments[i-1] if i > 0 else ''

        # If the ID is already set, this segment is the verb
        if 'verb' not in context and previous == ':id':
            context['verb'] = segment
        elif segment in verbstomatch and 'verb' not in context:
            context['verb'] = segment
        elif segment.isdigit():
            if "id_index" not in context:
                context['id_index'] = i
        elif segment == 'id':
            if "id_index" not in context:
                context['id_index'] = i
        elif segment == ':id':
            if "id_index" not in context:
                context['id_index'] = i
        else:
            object_name = findObjectClassByPathSegment(segment, object_types)
            if object_name:
                context['context'].insert(0, object_name)

    return context


def findObjectClassByPathSegment(segment: str, object_types):
    pluralizer = inflect.engine()

    segment = re.sub(r'[^a-zA-Z0-9\s]', ' ', segment).strip().lower()

    singular = pluralizer.plural(segment,1)
    plural = pluralizer.plural(segment, 2)

    for object_type in object_types:
        ot = object_type.lower()
        if ot == singular or ot == plural:
            return create_object_name(object_type)
        if ot == create_object_name(singular) or ot == create_object_name(plural):
            return create_object_name(object_type)
        if ot == create_machine_name(singular, True) or ot == create_machine_name(plural, True):
            return create_object_name(object_type)
        if ot == create_machine_name(singular, True, '-') or ot == create_machine_name(plural, True, '-'):
            return create_object_name(object_type)

    logger.warning(f"Context did not find matching object by {segment}")
    return None


def build_permissions_from_csv(csv_path, object_types):
    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        logger.error(e)
        return None

    # Find the position of the "ROLES" column
    roles_start_idx = df.columns.get_loc('ROLES')

    # Find the position of the "STEPS" column
    steps_idx = df.columns.get_loc('EXPLANATIONS')

    # Extract the roles from row 2, between "ROLES" and "EXPLANATIONS", dynamically
    all_roles = df.iloc[0, roles_start_idx:steps_idx].dropna().tolist()

    # Initialize the final permissions dictionary
    permissions = []
    all_verbs = {}

    object_type = False
    capturing_permissions = False

    # Iterate through each object type provided in the input
    for idx, row in df.iterrows():

        if row.iloc[0] in object_types:
            object_type = row.iloc[0]
            print(f"Processing object type: {object_type}")

        if object_type is False:
            continue

        # If the row contains the object type, we start capturing permissions
        if row.iloc[0] == object_type:
            capturing_permissions = True
            continue  # Skip the object type row itself

        # If we are capturing permissions, process the relevant data
        if capturing_permissions:
            # Extract CRUD verb (e.g., "Read", "Create", "Update")
            verb_name = row.iloc[1].strip() if pd.notna(row.iloc[1]) else ""

            # Extract the context (own/any)
            ownership = row.iloc[2].strip() if pd.notna(row.iloc[2]) else ""

            # Extract the endpoint from the "EXPLANATIONS" column
            endpoint = row.iloc[steps_idx-1] if pd.notna(row.iloc[steps_idx-1]) else f"/{object_type}"
            helpText = row.iloc[steps_idx] if pd.notna(row.iloc[steps_idx]) else ""

            segments = parse_relative_url(endpoint, object_types)

            # Identify roles with "TRUE" permissions
            allowed_roles = [
                all_roles[i] for i in range(len(all_roles)) if row.iloc[roles_start_idx + i] == 'TRUE'
            ]

            if "verb" not in segments:
                segments['verb'] = create_machine_name(verb_name)

            all_verbs[segments['verb']] = True


            permission_dict = {
                **segments,
                "ownership": ownership,
                "roles": allowed_roles,
            }
            if helpText:
                permission_dict["help"] = helpText

            if permission_dict['verb'] is not None and permission_dict['verb'] != '':
                permissions.append(permission_dict)
            else:
                pass

    return {'all_roles': all_roles, 'all_verbs': all_verbs, 'permissions':permissions}


def build_types_from_csv(csv_file):
    # Initialize an empty dictionary to store JSON object
    json_data = {}

    # Open the CSV file
    with open(csv_file, 'r') as csvfile:
        # Create a CSV reader object
        reader = csv.DictReader(csvfile)

        cur_type = None
        # Iterate over each row in the CSV
        for row in reader:
            # Extract the type from the row
            obj_type = row['TYPES']
            if obj_type is not None and obj_type != '':
                if row['Field Name'].lower() == 'user':
                    logger.info(f'making {obj_type} the internal auth user model')
                    cur_type = 'User'
                else:
                    cur_type = obj_type

            if row['Field Type'] is None or row['Field Type'] == '' or row['Field Label'] is None or row['Field Label'] == '':
                continue

            if row['Field Name'] is None or row['Field Name'] == '':
                row['Field Name'] = create_machine_name(row['Field Label'], True)
            else:
                row['Field Name'] = create_machine_name(row['Field Name'], True)

            if cur_type is None:
                continue

            row['Default'] = row['Default'].strip()

            # Remove 'Type' from the row since we don't need it in the JSON object
            del row['TYPES']

            if row['HowMany'] == '' or row['HowMany'] == '1':
                row['HowMany'] = 1
            elif row['HowMany'] == 'unlimited':
                row['HowMany'] = float('inf')
            else:
                row['HowMany'] = int(row['HowMany'])

            if row['Required'].isdigit():
                row['Required'] = True if int(row['Required']) > 0 else False
            else:
                row['Required'] = False

            # Check if the type already exists in the JSON object
            if cur_type in json_data:
                # Append the row to the existing array
                json_data[cur_type].append(row)
            else:
                # Create a new array with the row as its first element
                json_data[cur_type] = [row]

    return json_data


def find_object_by_key_value(fields, prop, value):
    """
    Finds the first object in the list with the specified key-value pair.

    Parameters:
    objects (list): A list of dictionaries.
    key (str): The key to search for.
    value: The value to match.

    Returns:
    dict: The first dictionary that matches the key-value pair, or None if no match is found.
    """
    for obj in fields:
        if prop in obj and obj[prop] == value:
            return obj
    return None


def str_to_bool(value):
    if isinstance(value, str):
        return value.lower() not in ('false', '0')
    return bool(value)


def inject_generated_code(output_file_path, code, prefix):
    comments = "####" if ".py" in output_file_path else "//---"
    commentend = "####" if ".py" in output_file_path else "---//"
    start_delim = f"{comments}OBJECT-ACTIONS-{prefix}-STARTS{commentend}"
    end_delim = f"{comments}OBJECT-ACTIONS-{prefix}-ENDS{commentend}"

    os.makedirs(os.path.dirname(output_file_path), exist_ok=True)

    if output_file_path == "" or os.path.isfile(output_file_path) is False:
        html = start_delim + "\n" + code + "\n" + end_delim
    else:

        with open(output_file_path, 'r') as file:
            html = file.read().strip()

        start = 0
        end = len(html)

        start = html.find(start_delim)
        if start < 0:
            start = len(html)  # append to END of file
            code = f"\n{start_delim}\n{code}\n{end_delim}"
        else:
            start += len(start_delim)
            end = html.find(end_delim)
            if end < 0:
                logger.critical(f"unbalanced deliminators {start_delim} for {prefix}")
                return html

        start_html = html[:start]
        end_html = html[end:]
        html = f"{start_html}\n{code}\n{end_html}\n"

    with open(output_file_path, 'w') as file:
        file.write(html.strip())

    logger.info(f"{prefix} built to {output_file_path}. ")


def addArgs(target, new_args):
    # Split the target string into function name and arguments
    start = target.find('(')
    func_name = target[:start]
    args_str = target[start + 1:len(target) - 1]
    args = args_str.split(',')

    # Remove leading and trailing whitespace from each argument
    args = [arg.strip() for arg in args]

    # Add non-empty new arguments to the existing arguments list
    for new_arg in new_args:
        new_arg = new_arg.strip()
        if new_arg and new_arg not in args:
            args.append(new_arg)

    # Filter out empty strings from args
    args = [arg for arg in args if arg != '']

    # Combine function name and modified arguments
    modified_target = f"{func_name}({', '.join(args)})"

    return modified_target


def infer_field_datatype(field_type):
    if field_type == 'user_account':
        return 'RelEntity'
    elif field_type == 'user_profile':
        return "RelEntity"
    elif field_type == "vocabulary_reference" or field_type == field_type == "type_reference":
        return "RelEntity"
    elif field_type == "text":
        return "string"
    elif field_type == "textarea":
        return "string"
    elif field_type == "integer":
        return "number"
    elif field_type == "price":
        return "number"
    elif field_type == "decimal":
        return "number"
    elif field_type == "date":
        return "string"
    elif field_type == "date_time":
        return "string"
    elif field_type == "date_range":
        return "string"
    elif field_type == 'coordinates':
        return "string"
    elif field_type == "email":
        return "string"
    elif field_type == "phone":
        return "string"
    elif field_type == "address-structured":
        return "object"
    elif field_type == "address":
        return "string"  # TODO: create address object
    elif field_type == "url":
        return "string"
    elif field_type == "uuid":
        return "string"
    elif field_type == "slug":
        return "string"
    elif field_type == "id_auto_increment":
        return "number"
    elif field_type == "boolean":
        return "boolean"
    elif field_type == "image":
        return "string"
    elif field_type == "video":
        return "string"
    elif field_type == "media":
        return "string"
    elif field_type == "flat list":
        return "string"
    elif field_type == "json":
        return "object"
    elif field_type == "enum":
        return "string"
    else:
        return "string"


def capitalize(string):
    return string[:1].upper() + string[1:] if string else string

def create_object_name(label):
    return re.sub(r'[^a-zA-Z0-9_\s]', '', label).replace(' ', '')


def create_machine_name(label, lower=True, punctuation='_'):
    # Remove special characters and spaces, replace them with underscores
    if punctuation == '-':
        machine_name = re.sub(r'[^a-zA-Z0-9\-\s]', '', label).strip().replace(' ', punctuation)
    else:
        machine_name = re.sub(r'[^a-zA-Z0-9_\s]', '', label).strip().replace(' ', punctuation)
    if lower is True:
        machine_name = machine_name.lower()
    return machine_name

def create_options(field_js):
    list = field_js['example'].strip()
    if list == '':
        logger.warning(
            f"Field {field_js['machine']} has no list of structure of choices. Please list them as a flat json array.")
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
                "label": capitalize(name),
                "id": create_machine_name(name, True)
            })
    except Exception as e:
        logger.warning(
            f"{field_js['machine']} has invalid structure of choices: {field_js['example']}  \nPlease list them as a flat json array. {str(e)}")

    return field_js


def find_search_fields(json_data, class_name):
    search_fields = []
    if class_name == "Users":
        search_fields.append('first_name')
        search_fields.append('last_name')
    elif find_object_by_key_value(json_data[class_name], "Field Name", "title") is not None:
        search_fields.append('title')
    elif find_object_by_key_value(json_data[class_name], "Field Name", "name") is not None:
        search_fields.append('name')
    else:
        for obj in json_data[class_name]:
            if obj['Field Type'] in ["vocabulary reference", "type reference", "user profile"]:

                if obj['Relationship'] is None or obj['Relationship'] not in json_data:
                    logger.critical(f"MISSING {class_name} RELATIONSHIP: {json.dumps(obj)}")
                    sys.exit()

                rel_model = json_data[obj['Relationship']]
                if find_object_by_key_value(rel_model, "Field Name", "title") is not None:
                    search_fields.append(f"{obj['Field Name']}__title")
                elif find_object_by_key_value(rel_model, "Field Name", "name") is not None:
                    search_fields.append(f"{obj['Field Name']}__name")

            elif obj['Field Type'] == "user_account":
                search_fields.append(f"{obj['Field Name']}__first_name")
                search_fields.append(f"{obj['Field Name']}__last_name")

    return search_fields
