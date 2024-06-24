import csv
import json
import re
import os
from loguru import logger
import ast

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
                cur_type = obj_type

            if row['Field Label'] is None or row['Field Label'] == '':
                continue

            if cur_type is None:
                continue

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

        with open(output_file_path, 'r', encoding='utf-8') as file:
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

    with open(output_file_path, 'w', encoding='utf-8') as file:
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

def build_choices(field_name, field):
    list = field['Example'].strip()
    if list == '':
        logger.warning(f"Field {field['Field Label']} has no list of structure of choices. Please list them as a flat json array.")
        return ""

    try:
        list = ast.literal_eval(list)
        code = f"    class {field_name}Choices(models.TextChoices):"
        for name in list:
            code += f'\n        {create_machine_name(name, True)} = ("{capitalize(name)}", "{create_machine_name(name, True)}")'
    except Exception as e:
        logger.warning(f"{field['Field Label']} has invalid structure of choices: {field['Example'].strip()}  \nPlease list them as a flat json array. {str(e)}")
        return ""

    return code


def infer_field_datatype(field_type, field_name, field):
    if field_type == 'user (custom)':
        return field['Relationship']
    elif field_type == 'user (cms)':
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

def infer_field_type(field_type, field_name, field):
    field_type = field_type.lower()
    if field_type == 'user (custom)':
        model_name = create_object_name(field['Relationship'])
        return f"models.OneToOneField('{model_name}', on_delete=models.CASCADE, related_name='+')"
    elif field_type == 'user (cms)':
        return "models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name='+')"
    elif field_type == "text":
        return "models.CharField(max_length=255)"  # Adjust max_length as needed
    elif field_type == "textarea":
        return "models.TextField()"
    elif field_type == "integer":
        return "models.IntegerField()"
    elif field_type == "price":
        return "MoneyField(decimal_places=2, default_currency='USD', max_digits=11)"
    elif field_type == "decimal":
        return "models.DecimalField(max_digits=10, decimal_places=2)"  # Adjust precision as needed
    elif field_type == "date":
        # TODO: implement data validation / format handlers onsave
        return "models.DateField()"
    elif field_type == "date time":
        # TODO: implement data validation / format handlers onsave
        return "models.DateField()"
    elif field_type == 'coordinates':
        return "models.JSONField()"
        # return "gis_models.PointField()" # too much overhead to install the libaries
    elif field_type == "email":
        return "models.EmailField()"
    elif field_type == "phone":
        return "models.CharField(validators=[validate_phone_number], max_length=16)"
    elif field_type == "address":
        return "AddressField(related_name='+')"
    elif field_type == "url":
        return "models.URLField()"
    elif field_type == "uuid":
        return "models.UUIDField(default=uuid.uuid4, editable=False)"
    elif field_type == "slug":
        if field_name == 'id':
            return "models.SlugField(primary_key=True, unique=True, editable=False)"
        else:
            return "models.SlugField(unique=True)"
    elif field_type == "id (auto increment)":
        return "models.AutoField(primary_key=True)"
    elif field_type == "boolean":
        return "models.BooleanField()"
    elif field_type == "image":
        target_directory = field.get('Example', "images")
        return f"models.ImageField(upload_to='{target_directory}')"
    elif field_type == "video":
        target_directory = field.get('Example', "videos")
        return f"models.FileField(upload_to='{target_directory}')"
    elif field_type == "media":
        target_directory = field.get('Example', "media")
        return f"models.FileField(upload_to='{target_directory}')"
    elif field_type == "flat list":
        # TODO: implement data validation based on "Example" column
        return "models.JSONField()"  # Store both as JSON array
    elif field_type == "json":
        return "models.JSONField()"  # Store both as JSON array
    elif field_type == "enum":
        return f"models.CharField(max_length=20)"
    elif field_type == "vocabulary reference" or field_type == field_type == "type reference":
        # TODO: when is `related_name` needed?
        model_name = create_object_name(field['Relationship'])
        if field['HowMany'] == 1:
            return f"models.OneToOneField('{model_name}', on_delete=models.CASCADE)"
        elif field['HowMany'] > 1:
            # return f"models.ManyToManyField('{model_name}', on_delete=models.CASCADE)"
            return f"models.ManyToManyField('{model_name}')"
        else:
            # maybe add convention to apply reverse reference >
            return f"models.ForeignKey('{model_name}', on_delete=models.CASCADE, related_name='{create_machine_name(field['Field Label'])}')"
            # return f"models.ForeignKey('{model_name}', on_delete=models.CASCADE)"
    else:
        logger.warning(f"UNSUPPORTED FILE TYPE {field_type}")
        return "models.TextField()"

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
