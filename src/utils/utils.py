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


def normalize_headers(headers):
    """Normalize CSV headers to lowercase and standardize format."""
    return [h.strip().lower() for h in headers]


def normalize_row(row, headers):
    """Create a normalized version of a row with case-insensitive access."""
    normalized = {}
    for original_key in row.keys():
        normalized_key = original_key.strip().lower()
        normalized[normalized_key] = row[original_key]
    return normalized


def get_value(row, key, fallback=None):
    """Get a value from a row using case-insensitive key matching."""
    key = key.lower().strip()

    # Direct match
    if key in row:
        return row[key]

    # Case-insensitive match
    for k in row:
        if k.lower().strip() == key:
            return row[k]

    return fallback


def find_model_details(csv_file, model_name):
    with open(csv_file, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            normalized_row = normalize_row(row, reader.fieldnames)
            obj_type = get_value(normalized_row, 'types')  # Case-insensitive access

            if obj_type and obj_type.lower() == model_name.lower():
                field_type = get_value(normalized_row, 'field type', '').lower()
                result = {}

                if field_type == 'vocabulary':
                    result['model_type'] = 'vocabulary'
                    result['example'] = get_value(normalized_row, 'example', '')

                # Add icon property if Field Label has a value
                field_label = get_value(normalized_row, 'field label')
                if field_label and field_label.strip():
                    result['icon'] = field_label

                if result:
                    return result

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

    # If no match is found, return the original crud_verb
    return crud_verb


def parse_relative_url(url: str, object_types):
    # Remove leading/trailing slashes
    url = url.strip("/")
    pattern = r"\[(id|[a-zA-Z_]+)\]|\{(id|[a-zA-Z_]+)\}|\:(id|[a-zA-Z_]+)"  # [pid], {pid}, :pid
    url = re.sub(pattern, ":id", url)

    segments = url.split("/")

    context = {"context": [], "endpoint": url}

    verbstomatch = ['view', 'read', 'add', 'create', 'insert', 'edit', 'update', 'delete', 'remove', 'destroy', 'block']

    # Loop through the segments in reverse
    for i in range(len(segments) - 1, -1, -1):
        segment = segments[i]

        previous = segments[i - 1] if i > 0 else ''

        # If the ID is already set, this segment is the verb
        if 'verb-path' not in context and previous == ':id':
            context['verb-path'] = segment
        elif segment in verbstomatch and 'verb-path' not in context:
            context['verb-path'] = segment
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

    singular = pluralizer.plural(segment, 1)
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
        # Read the CSV with case-insensitive headers
        df = pd.read_csv(csv_path)
        df.columns = [col.strip().lower() for col in df.columns]
    except Exception as e:
        logger.error(f"Error reading permissions CSV: {e}")
        return None

    # Find the position of the "roles" column (case-insensitive)
    roles_col = next((col for col in df.columns if col.lower() == 'roles'), None)
    if not roles_col:
        logger.error("Unable to find 'ROLES' column in permissions CSV")
        return None

    roles_start_idx = df.columns.get_loc(roles_col)

    # Find the position of the "explanations" column (case-insensitive)
    steps_col = next((col for col in df.columns if col.lower() == 'explanations'), None)
    if not steps_col:
        logger.error("Unable to find 'EXPLANATIONS' column in permissions CSV")
        return None

    steps_idx = df.columns.get_loc(steps_col)

    # Extract the roles from row 0, between "ROLES" and "EXPLANATIONS"
    all_roles = df.iloc[0, roles_start_idx:steps_idx].dropna().tolist()

    # Initialize the final permissions dictionary
    permissions = []
    all_verbs = {}

    object_type = False
    capturing_permissions = False

    # Iterate through each object type provided in the input
    for idx, row in df.iterrows():
        row_values = row.to_dict()
        first_col_value = row.iloc[0]

        # Check if this row defines an object type (case insensitive)
        matching_object_type = None
        if first_col_value is not None and isinstance(first_col_value, str):
            for ot in object_types:
                if ot.lower() == first_col_value.lower():
                    matching_object_type = ot
                    break

        if matching_object_type:
            object_type = matching_object_type
            print(f"Processing object type: {object_type}")
            capturing_permissions = True
            continue  # Skip the object type row itself

        if object_type is False:
            continue

        # If we are capturing permissions, process the relevant data
        if capturing_permissions:
            # Get values using case-insensitive column access
            verb_name = row.iloc[1].strip() if pd.notna(row.iloc[1]) else ""
            ownership = row.iloc[2].strip() if pd.notna(row.iloc[2]) else ""

            # Extract the endpoint from the "EXPLANATIONS" column
            endpoint_idx = steps_idx - 1  # Column before explanations
            endpoint = row.iloc[endpoint_idx] if pd.notna(row.iloc[endpoint_idx]) else f"/{object_type}"
            helpText = row.iloc[steps_idx] if pd.notna(row.iloc[steps_idx]) else ""

            segments = parse_relative_url(endpoint, object_types)

            # Identify roles with "TRUE" permissions (case-insensitive)
            allowed_roles = []
            for i in range(len(all_roles)):
                col_value = row.iloc[roles_start_idx + i]
                if pd.notna(col_value) and str(col_value).upper() == 'TRUE':
                    allowed_roles.append(all_roles[i])

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

    return {'all_roles': all_roles, 'all_verbs': list(all_verbs.keys()), 'permissions': permissions}


def build_types_from_csv(csv_file):
    # Initialize an empty dictionary to store JSON object
    json_data = {}

    # Open the CSV file
    with open(csv_file, 'r') as csvfile:
        # Create a CSV reader object
        reader = csv.DictReader(csvfile)
        # Normalize header names
        headers = normalize_headers(reader.fieldnames)

        cur_type = None
        # Iterate over each row in the CSV
        for row in reader:
            # Normalize the row for case-insensitive access
            norm_row = normalize_row(row, headers)

            # Extract the type from the row
            obj_type = get_value(norm_row, 'types')

            if obj_type is not None and obj_type != '':
                if get_value(norm_row, 'field name', '').lower() == 'user':
                    logger.info(f'making {obj_type} the internal auth user model')
                    cur_type = 'User'
                else:
                    cur_type = obj_type

            field_type = get_value(norm_row, 'field type')
            field_label = get_value(norm_row, 'field label')

            if field_type is None or field_type == '' or field_label is None or field_label == '':
                continue

            field_name = get_value(norm_row, 'field name')
            if field_name is None or field_name == '':
                field_name = create_machine_name(field_label, True)
            else:
                field_name = create_machine_name(field_name, True)

            if cur_type is None:
                continue

            # Create a normalized row for output
            output_row = {
                'Field Type': field_type,
                'Field Label': field_label,
                'Field Name': field_name,
                'Default': get_value(norm_row, 'default', '').strip(),
                'Relationship': get_value(norm_row, 'relationship', ''),
                'Example': get_value(norm_row, 'example', '')
            }

            # Process HowMany
            how_many = get_value(norm_row, 'howmany', '')
            if how_many == '' or how_many == '1':
                output_row['HowMany'] = 1
            elif how_many.strip() == 'unlimited':
                output_row['HowMany'] = float('inf')
            else:
                try:
                    output_row['HowMany'] = int(how_many)
                except ValueError:
                    output_row['HowMany'] = 1

            # Process Required
            required = get_value(norm_row, 'required', '')
            if required and str(required).isdigit():
                output_row['Required'] = True if int(required) > 0 else False
            else:
                output_row['Required'] = False if required in ('', 'False', 'false', '0') else bool(required)

            # Check if the type already exists in the JSON object
            if cur_type in json_data:
                # Append the row to the existing array
                json_data[cur_type].append(output_row)
            else:
                # Create a new array with the row as its first element
                json_data[cur_type] = [output_row]

    return json_data


def find_object_by_key_value(fields, prop, value):
    """
    Finds the first object in the list with the specified key-value pair.
    Uses case-insensitive matching for the key and value.

    Parameters:
    fields (list): A list of dictionaries.
    prop (str): The key to search for.
    value: The value to match.

    Returns:
    dict: The first dictionary that matches the key-value pair, or None if no match is found.
    """
    prop_lower = prop.lower()
    if isinstance(value, str):
        value_lower = value.lower()
    else:
        value_lower = value

    for obj in fields:
        # Check for direct match (original case)
        if prop in obj and obj[prop] == value:
            return obj

        # Check for case-insensitive key match
        for key in obj:
            if key.lower() == prop_lower:
                # Check for case-insensitive value match if the value is a string
                obj_value = obj[key]
                if isinstance(obj_value, str) and obj_value.lower() == value_lower:
                    return obj
                # For non-string values, just do a direct comparison
                elif obj_value == value:
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
    field_type = field_type.lower().strip()

    if field_type == 'user_account':
        return 'RelEntity'
    elif field_type == 'user_profile':
        return "RelEntity"
    elif field_type == "vocabulary_reference" or field_type == "type_reference":
        return "RelEntity"
    elif field_type == "text" or field_type == "string":
        return "string"
    elif field_type == "textarea":
        return "string"
    elif field_type == "integer":
        return "number"
    elif field_type == "price":
        return "number"
    elif field_type == 'percent':
        return "number"
    elif field_type == "decimal":
        return "number"
    elif field_type == "date":
        return "string"
    elif field_type == "date_time" or field_type == "timestamp":
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
    elif field_type == "audio":
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
    list_str = field_js['example'].strip()
    if list_str == '':
        logger.warning(
            f"Field {field_js['machine']} has no list of structure of choices. Please list them as a flat json array.")
        return field_js

    try:
        if list_str[0] == '[':
            list_values = ast.literal_eval(list_str)
        else:
            list_values = list_str.split(',')

        field_js['options'] = []
        for name in list_values:
            if isinstance(name, str):
                name = re.sub("[\"\']", "", name.strip())
                if name is None or name == '':
                    continue
                field_js['options'].append({
                    "label": capitalize(name),
                    "id": create_machine_name(name, True)
                })
            else:
                # Handle non-string values
                field_js['options'].append({
                    "label": str(name),
                    "id": create_machine_name(str(name), True)
                })
    except Exception as e:
        logger.warning(
            f"{field_js['machine']} has invalid structure of choices: {field_js['example']}  \nPlease list them as a flat json array. {str(e)}")

    return field_js


def find_search_fields(json_data, class_name):
    search_fields = []

    # Handle Users model specially
    if class_name.lower() == "users":
        search_fields.append('first_name')
        search_fields.append('last_name')
        return search_fields

    # Check for common searchable fields
    title_field = find_object_by_key_value(json_data[class_name], "Field Name", "title")
    name_field = find_object_by_key_value(json_data[class_name], "Field Name", "name")

    if title_field is not None:
        search_fields.append('title')
    elif name_field is not None:
        search_fields.append('name')
    else:
        # Check relationship fields
        for obj in json_data[class_name]:
            field_type = get_value(obj, 'field type', '').lower()

            if field_type in ["vocabulary reference", "type reference", "user profile"]:
                relationship = get_value(obj, 'relationship')

                if not relationship or relationship not in json_data:
                    logger.critical(f"MISSING {class_name} RELATIONSHIP: {json.dumps(obj)}")
                    sys.exit()

                rel_model = json_data[relationship]
                field_name = get_value(obj, 'field name')

                if find_object_by_key_value(rel_model, "Field Name", "title") is not None:
                    search_fields.append(f"{field_name}__title")
                elif find_object_by_key_value(rel_model, "Field Name", "name") is not None:
                    search_fields.append(f"{field_name}__name")

            elif field_type == "user_account":
                field_name = get_value(obj, 'field name')
                search_fields.append(f"{field_name}__first_name")
                search_fields.append(f"{field_name}__last_name")

    return search_fields
