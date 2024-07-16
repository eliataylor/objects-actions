from utils import create_machine_name, create_object_name, addArgs, capitalize, pluralize
from loguru import logger
import os
import ast


class ModelBuilder:
    def __init__(self, class_name):
        self.class_name = class_name
        self.model_name = create_object_name(class_name)

        self.id_field = 'id'
        templates_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')) + '/templates/django/'
        self.template_path = templates_dir + '/model.py'


        self.fields = []
        self.methods = []
        self.functions = []
        self.imports = []
        self.requirements = []

    def to_string(self):
        with open(self.template_path, 'r') as fm:
            model_template = fm.read()

        code_source = model_template.replace('__CLASSNAME__', self.model_name)

        # TODO: use Field Name column from
        code_source = code_source.replace('__SINGULAR__', f'"{pluralize(self.class_name, 1)}"')
        code_source = code_source.replace('__PLURAL__', f'"{pluralize(self.class_name, 2)}"')

        code_source = code_source.replace(' ' * 4, '\t')

        code_source = code_source.replace('###FIELDS_OVERRIDE###',
                                          "\t" + "\n\t".join(self.fields))

        if len(self.methods) > 0:
            code_source = code_source.replace('###METHODS###', "\t" + "\n\t".join(self.methods))
        else:
            code_source = code_source.replace('###METHODS###', "")

        return code_source.strip()

    def admin_string(self):
        admin_code = f"\nclass {self.model_name}Admin(admin.ModelAdmin):\n\treadonly_fields = ('{self.id_field}',)"
        admin_code += f"\n\nadmin.site.register({self.model_name}, {self.model_name}Admin)\n"
        return admin_code.strip()

    def append_import(self, val):
        if val not in self.imports:
            self.imports.append(val)

    def get_imports(self):
        return self.imports

    def append_function(self, val):
        if val not in self.functions:
            self.functions.append(val)

    def get_functions(self):
        return self.functions

    def build_fields(self, model_json):
        for field in model_json:
            field_type = create_machine_name(field['Field Type'], True)
            field_name = field['Field Name']

            if field_type == 'id_auto_increment' or field_name == 'id':
                self.id_field = field_name
                logger.debug(f"using explicit id field {field_name}")

            if field_name == 'author':
                if field['Field Label'].lower() == 'author':
                    logger.debug(
                        f"author is handled by SuperModel, but might want to change the label to {field['Field Label']}")
                else:
                    field_name = 'author'   # overwrides SuperModal but keeps verbose_name

            field_code = self.infer_field_type(field_type, field_name, field)

            if field_code.startswith("models."):
                field_code = f"{field_name} = {field_code}"

                if field_type == 'id_auto_increment' or field_name == 'id':
                    logger.info(f"using explicit id field {field_name}")
                else:
                    field_code = self.apply_default(field_code, field['Default'], field_type)
                    field_code = self.apply_required(field_code, field['Required'])
                    field_code = addArgs(field_code, [f"verbose_name='{field['Field Label']}'"])

            self.fields.append(field_code)

    def build_choices(self, field_name, field):
        list = field['Example'].strip()
        if list == '':
            logger.warning(
                f"Field {field['Field Label']} has no list of structure of choices. Please list them as a flat json array.")
            return ""

        try:
            list = ast.literal_eval(list)
            code = f"\n\tclass {field_name}Choices(models.TextChoices):"
            for name in list:
                code += f'\n\t\t{create_machine_name(name, True)} = ("{create_machine_name(name, True)}", "{capitalize(name)}")'
        except Exception as e:
            logger.warning(
                f"{field['Field Label']} has invalid structure of choices: {field['Example'].strip()}  \nPlease list them as a flat json array. {str(e)}")
            return ""

        return code

    def apply_default(self, field_code, default_value, field_type):
        if default_value != '':
            if field_type == "integer" or field_type == 'decimal':
                field_code = addArgs(field_code, [f"default={default_value}"])
            else:
                field_code = addArgs(field_code, [f"default=\"{default_value}\""])
        return field_code

    def apply_required(self, field_code, required):
        if not required:
            if "ManyToManyField" in field_code or "OneToManyField" in field_code:
                field_code = addArgs(field_code, ['blank=True'])
            else:
                field_code = addArgs(field_code, ['blank=True', 'null=True'])
        return field_code

    def infer_field_type(self, field_type, field_name, field):
        if field_type == "id_auto_increment":
            return "models.AutoField(primary_key=True)"
        elif field_type == 'user_profiles':
            return "models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True)"
        elif field_type == 'user_account':
            return "models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, related_name='+', null=True)"
        elif field_type == "vocabulary_reference" or field_type == field_type == "type_reference":
            # TODO: Test OneToOneField, ManyToMany, ...
            model_name = create_object_name(field['Relationship'])
            model_name = 'get_user_model()' if model_name == 'User Account' else f"'{model_name}'"
            if field['HowMany'] == 1:
                return f"models.ForeignKey({model_name}, on_delete=models.SET_NULL, related_name='+', null=True)"
            else:
                return f"models.ForeignKey({model_name}, on_delete=models.SET_NULL, null=True)"
        elif field_type == "text":
            return "models.CharField(max_length=255)"  # Adjust max_length as needed
        elif field_type == "textarea":
            return "models.TextField()"
        elif field_type == "integer":
            return "models.IntegerField()"
        elif field_type == "price":
            self.append_import("from djmoney.models.fields import MoneyField")
            if "pip install django-money" not in self.requirements:
                self.requirements.append("pip install django-money")

            return f"MoneyField(decimal_places=2, default_currency='USD', max_digits=11, verbose_name='{field['Field Label']}')"
        elif field_type == "decimal":
            return "models.DecimalField(max_digits=10, decimal_places=2)"  # Adjust precision as needed
        elif field_type == "date":
            # TODO: auto_now=True ?
            return "models.DateField()"
        elif field_type == "date_time":
            # TODO: auto_now=True ?
            return "models.DateTimeField()"
        elif field_type == "date_time_range":
            # TODO: IMPLEMENT as two fields with validate ends is after start
            return "models.DateField()"
        elif field_type == 'bounding_box':
            # TODO: implement data validation / format handlers onsave
            return f"models.JSONField()"
        elif field_type == 'coordinates':
            # self.append_import("from django.contrib.gis.db import models as gis_models")

            field_code = f"{field_name} = models.JSONField(verbose_name='{field['Field Label']}')"
            field_code = self.apply_default(field_code, field['Default'], field_type)
            field_code = self.apply_required(field_code, field['Required'])

            self.methods.append(
                f"""\n\tdef get_lat_lng(self): \n\t\treturn self.{field_name}['lat'], self.{field_name}['lng']""")

            return field_code
            # return "gis_models.PointField()" # too much overhead to install the libaries
        elif field_type == "email":
            return "models.EmailField()"
        elif field_type == "phone":
            self.append_import("import re")
            self.append_import("from django.core.exceptions import ValidationError")

            field_code = f"{field_name} = models.CharField(validators=[validate_phone_number], max_length=16, verbose_name='{field['Field Label']}')"
            field_code = self.apply_default(field_code, field['Default'], field_type)
            field_code = self.apply_required(field_code, field['Required'])

            # TODO: move to classwide helper
            self.functions.append("""\ndef validate_phone_number(value):
\tphone_regex = re.compile(r'^\+?1?\d{9,15}$')
\tif not phone_regex.match(value):
\t\traise ValidationError("Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")""")

            return field_code

        elif field_type == "address":
            return f"{field_name} = models.CharField(max_length=255)"
        elif field_type == "address-structured":
            self.append_import("from address.models import AddressField")
            if "pip install django-address" not in self.requirements:
                self.requirements.append("pip install django-address")

            field_code = f"{field_name} = AddressField(related_name='+', verbose_name='{field['Field Label']}')"
            field_code = self.apply_default(field_code, field['Default'], field_type)
            field_code = self.apply_required(field_code, field['Required'])
            return field_code

        elif field_type == "url":
            return "models.URLField()"
        elif field_type == "uuid":
            return "models.UUIDField(default=uuid.uuid4, editable=False)"
        elif field_type == "slug":
            slugified = field['Default'].strip()
            if slugified == '':
                # TODO: try title / name
                logger.critical("Use the Default column to tell which other field to slugify")
            else:
                overwrite = """\n\tdef save(self, *args, **kwargs):
\t\tif '{slugified}' in kwargs:
\t\t\tself.{slugified} = kwargs.pop('{slugified}')

\t\tbase_slug = slugify(self.{slugified})
\t\tslug = base_slug
\t\tcount = 1

\t\twhile {model_name}.objects.filter({field_name}=slug).exclude(id=self.id).exists():
\t\t\tslug = f"{{base_slug}}-{{count}}"
\t\t\tcount += 1
\t\tself.{field_name} = slug

\t\tsuper().save(*args, **kwargs)
""".format(field_name=field_name, model_name=self.model_name, slugified=slugified)

                self.methods.append(overwrite)
                self.append_import("from django.utils.text import slugify")
                # self.append_import("from django.db.models.signals import pre_save")
                # self.append_import("from django.dispatch import receiver")

            if field_name == 'id':
                return f"models.SlugField(primary_key=True, unique=True, editable=False)"
            else:
                return "models.SlugField(unique=True)"
        elif field_type == "boolean":
            return "models.BooleanField()"
        elif field_type == "image" or field_type == 'video' or field_type == 'media':
            if field_type == "image":
                fieldType = 'ImageField'
            else:
                fieldType = 'FileField'

            prefix = field.get('Example')
            if prefix is None or prefix == '':
                return f"models.{fieldType}(upload_to='uploads/%Y-%m')"
            else:
                return f"models.{fieldType}(upload_to='{prefix}')"
        elif field_type == "flat list":
            # TODO: implement data validation based on "Example" column
            return "models.JSONField()"  # Store both as JSON array
        elif field_type == "json":
            return "models.JSONField()"  # Store both as JSON array
        elif field_type == "enum":
            capitalized = capitalize(field_name)
            self.methods.append(self.build_choices(capitalized, field))

            field_code = f"{field_name} = models.CharField(max_length=20, choices={capitalized}Choices.choices, verbose_name='{field['Field Label']}')"
            field_code = self.apply_default(field_code, field['Default'], field_type)
            field_code = self.apply_required(field_code, field['Required'])

            return field_code
        else:
            logger.warning(f"UNSUPPORTED FILE TYPE {field_type}")
            return "models.TextField()"
