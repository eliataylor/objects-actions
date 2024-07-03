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
                if row['Field Name'] == 'user':
                    logger.info(f'making {obj_type} the internal auth user model')
                    cur_type = 'User'
                else:
                    cur_type = obj_type

            if row['Field Label'] is None or row['Field Label'] == '':
                continue

            if row['Field Name'] is None or row['Field Name'] == '':
                row['Field Name'] = create_machine_name(row['Field Label'])

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

    # Add non-empty new arguments to the existing arguments list
    args.extend(new_args)

    # Filter out empty strings from new_args
    args = [arg for arg in args if arg != '']

    # Combine function name and modified arguments
    if len(args) == 1:  # If there is only one argument, no need for a comma
        modified_target = f"{func_name}({args[0]})"
    else:
        modified_target = f"{func_name}({', '.join(args)})"

    return modified_target

def infer_field_datatype(field_type, field_name, field):
    if field_type == 'user account':
        # links to internal user
        return field['Relationship']
    elif field_type == 'user profile':
        return field['Relationship']
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
    elif field_type == "date time":
        return "string"
    elif field_type == 'coordinates':
        return "string"
    elif field_type == "email":
        return "string"
    elif field_type == "phone":
        return "string"
    elif field_type == "address":
        return "string" # TODO: create address object
    elif field_type == "url":
        return "string"
    elif field_type == "uuid":
        return "string"
    elif field_type == "slug":
        return "string"
    elif field_type == "id (auto increment)":
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
    elif field_type == "vocabulary reference" or field_type == field_type == "type reference":
        return "string"
    else:
        return "string"

def capitalize(string):
    return string[:1].upper() + string[1:] if string else string

def create_object_name(label):
    return re.sub(r'[^a-zA-Z0-9\s]', '', label).replace(' ', '')

def create_machine_name(label, lower=True):
    # Remove special characters and spaces, replace them with underscores
    machine_name = re.sub(r'[^a-zA-Z0-9\s]', '', label).strip().replace(' ', '_')
    if lower is True:
        machine_name = machine_name.lower()
    return machine_name
