import csv
import re
import os
from loguru import logger


def build_json_from_csv(csv_file):
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

            if row['Field Type'] is None or row['Field Type'] == '':
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

def inject_generated_code(output_file_path, code, prefix):
    comments = "####" if ".py" in output_file_path else "//---"
    commentend = "####" if ".py" in output_file_path else "---//"
    start_delim = f"{comments}OBJECT-ACTIONS-{prefix}-STARTS{commentend}"
    end_delim = f"{comments}OBJECT-ACTIONS-{prefix}-ENDS{commentend}"

    if output_file_path == "" or os.path.exists(output_file_path) is False:
        html = start_delim + "\n" + code + "\n" + end_delim
    else:

        with open(output_file_path, 'r') as file:
            html = file.read()

        start = 0
        end = len(html)

        start = html.find(start_delim)
        if start < 0:
            start = len(html) # append to END of file
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
        file.write(html)

    logger.info(f"{prefix} built. ")
    return html


def addArgs(target, new_args):
    # Split the target string into function name and arguments
    start = target.find('(')
    func_name = target[:start]
    args_str = target[start+1:len(target)-1]
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
        return "string" # TODO: create address object
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

def pluralize(word, count):
    if word.lower() == 'status' or word.lower() == 'url alias' or word.lower() == 'privacy':
        return word

    """Pluralizes a word based on the count."""
    if count == 1:
        if word.endswith('ies'):
            return word[:-3] + 'y'  # Singularize 'ies' to 'y'
        elif word.endswith('es'):
            if word[-3] in 'sxc':
                return word[:-2]  # Remove 'es' added for words ending in 's', 'x', 'c'
            elif word[-4:] in ['ches', 'shes']:
                return word[:-2]  # Remove 'es' added for words ending in 'sh', 'ch'
            else:
                return word[:-1]  # Remove 'es' added in general
        elif word.endswith('s'):
            return word[:-1]  # Remove 's' added in general
        else:
            return word  # Return original word if none of the above conditions are met
    elif count > 1:
        # Check if the word ends with common plural suffixes; if so, return the word as-is
        if word.endswith('ies') or word.endswith('es') or word.endswith('s'):
            return word
        elif word[-1] in 'sx' or word[-2:] in ['sh', 'ch']:
            return word + 'es'  # Add 'es' for words ending in 's', 'x', 'sh', 'ch'
        else:
            return word + 's'  # Add 's' in general for plural form
    else:
        return word  # Handle unexpected cases where count is less than 1


def create_object_name(label):
    return re.sub(r'[^a-zA-Z0-9_\s]', '', label).replace(' ', '')

def create_machine_name(label, lower=True):
    # Remove special characters and spaces, replace them with underscores
    machine_name = re.sub(r'[^a-zA-Z0-9_\s]', '', label).strip().replace(' ', '_')
    if lower is True:
        machine_name = machine_name.lower()
    return machine_name
