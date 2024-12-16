from utils.utils import create_machine_name, create_object_name, addArgs, capitalize
from loguru import logger
import os
from .ModelBuilder import ModelBuilder

class UserBuilder(ModelBuilder):
    def __init__(self, class_name):
        super().__init__(class_name)

        templates_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')) + '/templates/django/'
        self.template_path = templates_dir + '/user-model.py'

        self.admin_field_list = []

        self.default_user_fields = {
            'id': 'AutoField (Primary Key)',
            'password': 'CharField (max_length=128)',
            'last_login': 'DateTimeField (nullable)',
            'is_superuser': 'BooleanField',
            'username': 'CharField (max_length=150, unique)',
            'first_name': 'CharField (max_length=150)',
            'last_name': 'CharField (max_length=150)',
            'email': 'EmailField (max_length=254)',
            'is_staff': 'BooleanField',
            'is_active': 'BooleanField',
            'date_joined': 'DateTimeField'
        }

    def admin_string(self):
        admin_code = f"""\nclass {self.model_name}Admin(BaseUserAdmin):
    fieldsets = BaseUserAdmin.fieldsets + (
        (_('Additional Info'), {{'fields': ({(', ').join(self.admin_field_list)})}}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (None, {{
            'classes': ('wide',),
            'fields': ({(', ').join(self.admin_field_list)}),
        }}),
    )                
"""

        admin_code += f"\n\nadmin.site.register({self.model_name}, {self.model_name}Admin)\n"
        return admin_code.strip()


    def build_fields(self, model_json):
        for field in model_json:
            field_type = create_machine_name(field['Field Type'], True)
            field_name = field['Field Name']

            if field_name in self.default_user_fields:
                logger.warning(f"This field {field_name} is default to User. Skipping")
                continue

            if field_type == 'id_auto_increment':
                self.id_field = field_name
                logger.debug(f"User has it's own internal auto increment named 'id' ")

            field_code = self.infer_field_type(field_type, field_name, field)

            self.admin_field_list.append(f"'{field_name}'")

            if field_code.startswith("models."):
                field_code = f"{field_name} = {field_code}"

                field_code = self.apply_default(field_code, field['Default'], field_type)
                field_code = self.apply_required(field_code, field['Required'])
                field_code = addArgs(field_code, [f"verbose_name='{field['Field Label']}'"])

            self.fields.append(field_code)
