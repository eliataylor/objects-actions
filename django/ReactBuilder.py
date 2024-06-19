import os
from utils import inject_generated_code, create_machine_name, create_object_name, infer_field_datatype, build_json_from_csv, capitalize
from loguru import logger


class ReactBuilder:
    def __init__(self, field_csv, matrix_csv, react_dir):
        self.react_dir = react_dir

        self.json = build_json_from_csv(field_csv)

    def build_types(self):
        types_file_path = os.path.join(self.react_dir, 'src/types/object-actions.tsx')

        blocks = []
        for class_name in self.json:
            model_name = create_object_name(class_name)

            code = [f"interface {model_name} {{"]

            for field in self.json[class_name]:
                field_type = field['Field Type']
                field_name = field['Field Name']
                if field_name == '':
                    field_name = create_machine_name(field['Field Label'])
                if field_type == '':
                    field_type = 'text'

                if field_name == 'id':
                    field_def = f"readonly {field_name}"
                else:
                    field_def = field_name

                if field['Required'].strip() == '' or int(field['Required']) < 1:
                    field_def += "?: "
                else:
                    field_def += ": "

                field_def += infer_field_datatype(field_type, field_name, field)

                if field_type == "flat list" or field['HowMany'] != 1:
                    field_def += '[]'

                if field['Required'].strip() == '' or int(field['Required']) < 1:
                    field_def += ' | null;'
                else:
                    field_def += ';'

                code.append(field_def)

            code.append("}")
            blocks.append("\n".join(code))

        inject_generated_code(types_file_path, "\n".join(blocks), 'SCHEMA')

    def build_navigation(self):
        test = 1