import csv
import json
import re

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

def build_all_models(json):
    model_code = "from django.db import models\n"
    if 'user' not in json and 'User' not in json and 'Users' not in json:
        model_code += f"from django.contrib.auth.models import User\n"
    for object_type in json:
        model_name = object_type
        model_code += f"\nclass {model_name}(models.Model):\n"

        for field in json[object_type]:
            field_type = field['Field Type']
            field_name = field['Field Name']
            if field_name is None or field_name == '':
                field_name = create_machine_name(field['Field Label'])
            if field_type is None:
                field_type = 'text'
            model_type = infer_field_type(field_type, field)
            model_code += f"    {field_name} = {model_type}\n"

    return model_code

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
    elif field_type == "reference":
        # return "models.ManyToManyField()"
        # return "models.OneToOneField()"
        return f"models.ForeignKey({field['Relationship']}, on_delete=models.CASCADE)"
    elif field_type == "address":
        return "models.CharField(max_length=2555)"  # Adjust max_length as needed
    else:
        return "models.TextField()"

def create_machine_name(label):
    # Remove special characters and spaces, replace them with underscores
    machine_name = re.sub(r'[^a-zA-Z0-9\s]', '', label).strip().replace(' ', '_')
    # Convert to lowercase
    machine_name = machine_name.lower()
    return machine_name

# Example usage
csv_file = "object-fields.csv"

model_json = build_json_from_csv(csv_file)
f = open("models.json", "r+")
f.write(json.dumps(model_json, indent=2))
f.close()

model_code = build_all_models(model_json)
f = open("models.py", "r+")
f.write(model_code)
f.close()

# You can save the generated code to a file named 'models.py' in your app directory
