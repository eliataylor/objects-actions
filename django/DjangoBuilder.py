import os

from loguru import logger

from utils import inject_generated_code, create_machine_name, create_object_name, addArgs, infer_field_type, \
    build_json_from_csv, build_choices, capitalize


class DjangoBuilder:
    def __init__(self, csv_file, output_dir):
        self.output_dir = output_dir

        self.templates_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')) + '/templates/django/'

        self.helpers = {"before": [], "after": []}
        self.imports = {"models": ["from django.db import models",
                                   "from django.contrib.auth.models import User",
                                   "from django.contrib import admin",
                                   "from django.utils import timezone",
                                   "from django.contrib.auth import get_user_model"],
                        "serializers": ["from rest_framework import serializers",
                                        "from django.core.exceptions import ObjectDoesNotExist",
                                        "from django.db.models import ManyToManyField"],
                        "views": ["from rest_framework import viewsets, permissions, status, pagination",
                                  "from rest_framework.response import Response",
                                  "from rest_framework.exceptions import ValidationError",
                                  "from django.utils.decorators import method_decorator",
                                  "from django.views.decorators.cache import cache_page",
                                  "from rest_framework.decorators import action"],
                        "urls": [
                            "from rest_framework.routers import DefaultRouter",
                            "from django.conf import settings",
                            "from django.urls import include, path",
                            "from django.contrib import admin",
                            "from rest_framework.schemas import get_schema_view"
                        ]}

        self.requirements = []

        # TODO: on CREATE / UPDATE, upsert any Foreign Key relationships when the full object is passed

        # TODO: implement `permission_classes` via Roles from Permissions Matrix
        # TODO: generate CRUD query methods based on Permissions Matrix
        # TODO: personalize the CustomPagination class

        self.json = build_json_from_csv(csv_file)
        self.build_models()
        self.build_serializers()
        self.build_viewsets()
        self.build_urls()

    def append_import(self, key, val):
        if val not in self.imports[key]:
            self.imports[key].append(val)

    def append_helper(self, key, val):
        if val not in self.helpers[key]:
            self.helpers[key].append(val)

    def build_models(self):

        model_file_path = os.path.join(self.output_dir, f'models.py')
        parts = []
        with open(self.templates_dir + '/models.py', 'r') as fm:
            parts.append(fm.read())
        with open(self.templates_dir + '/model.py', 'r') as fm:
            model_template = fm.read()

        for class_name in self.json:
            model_name = create_object_name(class_name)
            id_field = False
            code_source = model_template.replace('__CLASSNAME__', model_name)

            fields_code = ""

            for field in self.json[class_name]:
                field_type = field['Field Type']
                field_name = field['Field Name']
                if field_name is None or field_name == '':
                    field_name = create_machine_name(field['Field Label'])

                if field_type == 'id (auto increment)' or field_name == 'id':
                    id_field = field_name
                    logger.info(f"using explicit id field {field_name}")

                if field_type is None:
                    field_type = 'text'
                elif field_type == 'address':
                    self.append_import("models", "from address.models import AddressField")
                    if "pip install django-address" not in self.requirements:
                        self.requirements.append("pip install django-address")
                elif field_type == 'price':
                    self.append_import("models", "from djmoney.models.fields import MoneyField")
                    if "pip install django-money" not in self.requirements:
                        self.requirements.append("pip install django-money")

                model_type = infer_field_type(field_type, field_name, field)

                default_value = field['Default'].strip()

                if field_type == 'slug':
                    if default_value == '':
                        logger.critical("Use the Default column to tell which other field to slugify")
                    else:

                        self.append_import("models", "from django.utils.text import slugify")
                        self.append_import("models", "from django.db.models.signals import pre_save")
                        self.append_import("models", "from django.dispatch import receiver")

                        self.append_helper("after", f"\n@receiver(pre_save, sender={class_name})\n\
def generate_slug_{model_name.lower()}_{field_name}(sender, instance, **kwargs):\n\
    if not instance.{field_name}:\n\
        instance.{field_name} = slugify(instance.{default_value})\n")

                elif field_type == 'id (auto increment)' or field_name == 'id':
                    logger.info(f"using explicit id field {field_name}")
                else:
                    if default_value != '':
                        if field_type == "integer" or field_type == 'decimal':
                            model_type = addArgs(model_type, [f"default={field['Default']}"])
                        else:
                            model_type = addArgs(model_type, [f"default=\"{field['Default']}\""])

                    if field['Required'] < 1:
                        model_type = addArgs(model_type, ['blank=True', 'null=True'])

                    if field_type == 'coordinates':
                        self.append_import("models", "from django.contrib.gis.db import models as gis_models")
                    if field_type == 'enum':
                        capitalized = capitalize(field_name)
                        fields_code = build_choices(capitalized, field) + '\n' + fields_code
                        model_type = addArgs(model_type, [f"choices={capitalized}Choices.choices"])

                    elif field_type == 'phone':

                        self.append_import("models", "import re")
                        self.append_import("models", "from django.core.exceptions import ValidationError")

                        self.append_helper("before", """\ndef validate_phone_number(value):
                        phone_regex = re.compile(r'^\+?1?\d{9,15}$')
                        if not phone_regex.match(value):
                            raise ValidationError("Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")""")

                fields_code += f"    {field_name} = {model_type}\n"

            if id_field:
                admin_code = f"class {model_name}Admin(admin.ModelAdmin):\n\
                    readonly_fields = ('{id_field}',)"
                admin_code += f"\nadmin.site.register({model_name}, {model_name}Admin)\n"
                save_code = f"def save(self, *args, **kwargs):\n        if not self.{id_field}:\n            self.{id_field} = slugify(self.title)\n        super().save(*args, **kwargs)"
            else:
                admin_code = f"\nadmin.site.register({model_name})\n"
                #save_code = f"def save(self, *args, **kwargs):\n    super().save(*args, **kwargs)"
                save_code = ""
            code = code_source.replace('###FIELDS_OVERRIDE###', fields_code[4:])#the [4:] slicing is to remove the first 4 characters,
            # which are the 4 spaces in the beginning of the string, not to over-indent the first field of the class
            code = code.replace('###SAVE_OVERRIDE###', save_code)
            code = code.replace('###ADMIN_OVERRIDE###', admin_code)
            parts.append(code)

        inject_generated_code(model_file_path, "\n".join(self.imports['models']), 'MODEL_IMPORTS')

        if len(self.helpers['before']) > 0:
            inject_generated_code(model_file_path, "\n".join(self.helpers['before']), f'PRE-HELPERS')

        inject_generated_code(model_file_path, "\n\n".join(parts), 'MODELS')

        if len(self.helpers['after']) > 0:
            inject_generated_code(model_file_path, "\n".join(self.helpers['after']), f'POST-HELPERS')

        if len(self.requirements) > 0:
            cmds = "\n".join(self.requirements)
            logger.warning(
                f"Do not forget to run these commands at the root of your project {self.output_dir} \n\n {cmds}\n")

    def build_urls(self):

        outpath = os.path.join(self.output_dir, 'urls.py')

        code = "\nrouter = DefaultRouter()\n"
        for class_name in self.json:
            path_name = create_machine_name(class_name)
            model_name = create_object_name(class_name)
            code += f"router.register(r'api/{path_name}', {model_name}ViewSet, basename='{path_name}')\n"
            self.append_import("urls", f"from .views import {model_name}ViewSet")

        inject_generated_code(outpath, '\n'.join(self.imports["urls"]), 'URL-IMPORTS')

        with open(self.templates_dir + '/urls.py', 'r') as fm:
            code += "\n" + fm.read()

        inject_generated_code(outpath, code, 'URLS')


    def build_serializers(self):
        outpath = os.path.join(self.output_dir, 'serializers.py')

        with open(self.templates_dir + '/serializer.py', 'r') as fm:
            tpl = fm.read()
        with open(self.templates_dir + '/serializers.py', 'r') as fm:
            serializers_helpers = fm.read()

        parts = []
        for class_name in self.json:
            model_name = create_object_name(class_name)
            parts.append(tpl.replace('__CLASSNAME__', model_name))
            # read_only_fields = ('id',)
            self.append_import("serializers", f"from .models import {model_name}")

        inject_generated_code(outpath, '\n'.join(self.imports["serializers"]), 'SERIALIZER-IMPORTS')
        inject_generated_code(outpath, serializers_helpers+"\n"+"\n".join(parts), 'SERIALIZERS')

    def build_viewsets(self):
        outpath = os.path.join(self.output_dir, 'views.py')

        with open(self.templates_dir + '/view.py', 'r') as fm:
            tpl = fm.read()

        parts = []
        for class_name in self.json:
            model_name = create_object_name(class_name)
            parts.append(tpl.replace('__CLASSNAME__', model_name))
            self.append_import("views", f"from .models import {model_name}")
            self.append_import("views", f"from .serializers import {model_name}Serializer")

        inject_generated_code(outpath, '\n'.join(self.imports["views"]), 'VIEWSET-IMPORTS')
        inject_generated_code(outpath, "\n".join(parts), 'VIEWSETS')
