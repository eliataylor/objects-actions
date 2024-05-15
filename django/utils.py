import csv
import json
import re
import os

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

            # Check if the type already exists in the JSON object
            if cur_type in json_data:
                # Append the row to the existing array
                json_data[cur_type].append(row)
            else:
                # Create a new array with the row as its first element
                json_data[cur_type] = [row]

    return json_data
def inject_generated_code(output_file_path, code, prefix):
    start_delim = f"###OBJECT-ACTIONS-{prefix}-STARTS###"
    end_delim = f"###OBJECT-ACTIONS-{prefix}-ENDS###"

    if os.path.exists(output_file_path) is False:
        html = start_delim + "\n" + code + "\n" + end_delim
    else:

        with open(output_file_path, 'r', encoding='utf-8') as file:
            html = file.read()

        start = html.find(start_delim)
        if start < 0:
            start = len(html) - 1 #append to end of file
            code = f"\n\n{start_delim}n" + code
        else:
            start += len(start_delim)

        end = html.find(end_delim)
        if end < 0:
            end = len(code)
            code = code + end_delim

        start_html = html[:start]
        end_html = html[end:]
        html = start_html + code + end_html

    with open(output_file_path, 'w', encoding='utf-8') as file:
        file.write(html)

    print(f"{prefix} built. ")

def addArgs(target, new_args):
    # Split the target string into function name and arguments
    func_name, args_str = target.split('(')

    # Remove trailing parenthesis from args string and split the arguments
    args = args_str.rstrip(')').split(',')

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


def infer_field_type(field_type, field):
    field_type = field_type.lower()
    if field_type == "text":
        return "models.CharField(max_length=255)"  # Adjust max_length as needed
    elif field_type == "textarea":
        return "models.TextField()"
    elif field_type == "integer":
        return "models.IntegerField()"
    elif field_type == "decimal":
        return "models.DecimalField(max_digits=10, decimal_places=2)"  # Adjust precision as needed
    elif field_type == "date":
        return "models.DateField()"
    elif field_type == "url":
        return "models.URLField()"
    elif field_type == "id":
        return "models.AutoField(primary_key=True)"
    elif field_type == "boolean":
        return "models.BooleanField()"
    elif field_type == "image":
        return "models.ImageField()"
    elif field_type == "video":
        return "models.FileField(upload_to='videos/')"
    elif field_type == "media":
        return "models.FileField(upload_to='media/')"
    elif field_type == "list_of_strings":
        return "models.JSONField()"  # Store both as JSON array
    elif field_type == "json":
        return "models.JSONField()"  # Store both as JSON array
    elif field_type == "enum":
        return f"models.CharField(max_length=20, choices=MealTimes.choices)"
    elif field_type == "vocabulary reference" or field_type == field_type == "type reference":
        # return "models.ManyToManyField()"
        # return "models.OneToOneField()"
        model_name = create_object_name(field['Relationship'])
        return f"models.ForeignKey('{model_name}', on_delete=models.CASCADE)"
    elif field_type == "address":
        return "models.CharField(max_length=2555)"  # Adjust max_length as needed
    else:
        return "models.TextField()"

def create_object_name(label):
    return re.sub(r'[^a-zA-Z0-9\s]', '', label).replace(' ', '')

def create_machine_name(label, lower=True):
    # Remove special characters and spaces, replace them with underscores
    machine_name = re.sub(r'[^a-zA-Z0-9\s]', '', label).strip().replace(' ', '_')
    if lower is True:
        machine_name = machine_name.lower()
    return machine_name
