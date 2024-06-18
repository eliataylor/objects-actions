import os
from utils import inject_generated_code, create_machine_name, create_object_name, addArgs, infer_field_type, \
    build_json_from_csv, build_choices, capitalize
from loguru import logger


class ReactBuilder:
    def __init__(self, csv_file, output_dir):
        self.output_dir = output_dir

        self.json = build_json_from_csv(csv_file)
        self.build_models(self.imports['models'])

    def build_types(self):
        code = "\n"
        for class_name in self.json:
            model_name = create_object_name(class_name)

            code += f"\ninterface {model_name} {{ \n"

            for field in self.json[class_name]:
                field_type = field['Field Type']
                field_name = field['Field Name']
                if field_name == '':
                    field_name = create_machine_name(field['Field Label'])
                if field_type == '':
                    field_type = 'text'

                # capitalized = capitalize(field_name)
                model_type = infer_field_type(field_type, field)
                if field['Required'].strip() == '' or int(field['Required']) < 1:
                    model_type = addArgs(model_type, ['blank=True', 'null=True'])
                if field['Default'].strip() != '':
                    if field_type == "integer" or field_type == 'decimal':
                        model_type = addArgs(model_type, [f"default={field['Default']}"])
                    else:
                        model_type = addArgs(model_type, [f"default=\"{field['Default']}\""])


            code += f"admin.site.register({model_name})\n"

        model_file_path = os.path.join(self.output_dir, f'models.py')
        inject_generated_code(model_file_path, "\n".join(self.imports), 'MODEL_IMPORTS')

        model_file_path = os.path.join(self.output_dir, f'models.py')
        inject_generated_code(model_file_path, code, 'MODELS')

        if len(self.requirements) > 0:
            cmds = "\n".join(self.requirements)
            logger.warning(f"You must run these commands at the root of your project {self.output_dir} \n\n {cmds}\n")
