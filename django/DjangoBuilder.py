import os, pathlib
from utils import inject_generated_code, create_machine_name, create_object_name, addArgs, infer_field_type, \
    build_json_from_csv, build_choices, capitalize
from loguru import logger
my_path = pathlib.Path(__file__).parent.absolute()
templates_path = my_path.parent / 'templates' / 'django'

class DjangoBuilder:
    def __init__(self, csv_file, output_dir):
        self.output_dir = output_dir

        # TODO: build list dynamically and inject add the end
        # List of import lines for each file
        self.imports = {"models": [],
                        "serializers": ["from rest_framework import serializers", "from . import models"],
                        "views": ["from rest_framework import viewsets, permissions, status, pagination", "from . import models, serializers", "from rest_framework.response import Response", "from django.utils.decorators import method_decorator", "from django.views.decorators.cache import cache_page", "from rest_framework.decorators import action"],
                        "urls": ["from django.conf import settings", "from . import views", "from rest_framework.routers import DefaultRouter", "from django.urls import include, path", "from django.contrib import admin", "from rest_framework.schemas import get_schema_view"]}
        self.functions_and_classes = {"models": [], "serializers": [], "views": ["""class CustomPagination(pagination.PageNumberPagination):
            pass"""], "urls": []}
        self.code_at_end = {"models": [], "serializers": [], "views": [], "urls": ["""

\"\"\"
path('schema/', get_schema_view(
    title="Your Project",
    description="API for all things …",
    version="1.0.0"
), name='openapi-schema')
\"\"\"

urlpatterns = [
    path("admin/", admin.site.urls),
    path('api', include(router.urls)),
    #path('', include(router.urls)),
]

if settings.DEBUG:
    from django.conf.urls.static import static
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns

    # Serve static and media files from development server
    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns.extend(router.urls)
"""]}
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

    def build_models(self):

        code=""
        for class_name in self.json:
            model_name = create_object_name(class_name)

            code += f"\nclass {model_name}(SuperModel):\n"

            for field in self.json[class_name]:
                field_type = field['Field Type']
                field_name = field['Field Name']
                if field_name is None or field_name == '':
                    field_name = create_machine_name(field['Field Label'])

                if field_type is None:
                    field_type = 'text'
                elif field_type == 'address':
                    # TODO: inject "address" to INSTALLED_APPS
                    if "from address.models import AddressField" not in self.imports['models']:
                        self.imports['models'].append("from address.models import AddressField")
                    if "pip install django-address" not in self.requirements:
                        self.requirements.append("pip install django-address")
                elif field_type == 'price':
                    # TODO: inject "djmoney" to INSTALLED_APPS
                    if "from djmoney.models.fields import MoneyField" not in self.imports['models']:
                        self.imports['models'].append("from djmoney.models.fields import MoneyField")
                    if "pip install django-money" not in self.requirements:
                        self.requirements.append("pip install django-money")

                model_type = infer_field_type(field_type, field)
                if field['Required'].strip() == '' or int(field['Required']) < 1:
                    model_type = addArgs(model_type, ['blank=True', 'null=True'])
                if field['Default'].strip() != '':
                    if field_type == "integer" or field_type == 'decimal':
                        model_type = addArgs(model_type, [f"default={field['Default']}"])
                    else:
                        model_type = addArgs(model_type, [f"default=\"{field['Default']}\""])

                if field_type == 'enum':
                    capitalized = capitalize(field_name)
                    bc = build_choices(capitalized, field)
                    self.functions_and_classes['models'].append(bc)
                    model_type = addArgs(model_type, [f"choices={capitalized}Choices.choices"])
                elif field_type == 'phone' and "validate_phone_number" not in code:

                    if "from django.core.exceptions import ValidationError" not in self.imports['models']:
                        #The presence of "from django.core.exceptions import ValidationError" is the flag to add or not the phone code
                        self.imports['models'].append("import re")
                        self.imports['models'].append("from django.core.exceptions import ValidationError")
                        self.functions_and_classes['models'].append("""def validate_phone_number(value):
    phone_regex = re.compile(r'^\+?1?\d{9,15}$')
    if not phone_regex.match(value):
        raise ValidationError("Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")""")
                code += f"    {field_name} = {model_type}\n"

            code += f"admin.site.register({model_name})\n"

        functions_and_classes = "\n".join(self.functions_and_classes["models"])
        imports = "\n".join(self.imports["models"])
        model_file_path = os.path.join(self.output_dir, f'models.py')
        with open(model_file_path, 'w') as f:
            if len(imports) > 0:
                f.write(imports)
                f.write("\n")
            with open(templates_path / 'models.py', 'r') as fm:
                f.writelines(fm.readlines())
            f.write("\n")
            if len(functions_and_classes) > 0:
                f.write(functions_and_classes)
                f.write("\n")
            f.write(code)

        if len(self.requirements) > 0:
            cmds = "\n".join(self.requirements)
            logger.warning(f"You must run these commands at the root of your project {self.output_dir} \n\n {cmds}\n")


    def build_serializers(self):
        code = "\n".join(self.imports["serializers"])
        with open(templates_path / 'serializers.py', 'r') as fm:
            serializerTpl = fm.read()
        for class_name in self.json:
            model_name = create_object_name(class_name)
            code += "\n"
            code += serializerTpl.replace('__CLASSNAME__', model_name)
            code += "\n"

        outpath = os.path.join(self.output_dir, 'serializers.py')
        inject_generated_code(outpath, code, 'SERIALIZERS')

    def build_urls(self):
        code = "\n".join(self.imports["urls"])
        code += "\n"
        with open(templates_path / 'urls.py', 'r') as fm:
            code += fm.read()
        code += "\n"
        for class_name in self.json:
            path_name = create_machine_name(class_name)
            model_name = create_object_name(class_name)
            code += f"router.register(r'api/{path_name}', views.{model_name}ViewSet, basename='{path_name}')\n"

        code += "\n".join(self.code_at_end["urls"])
        code += "\n"
        outpath = os.path.join(self.output_dir, 'urls.py')
        inject_generated_code(outpath, code, 'URLS')

    def build_viewsets(self):
        with open(templates_path / 'views.py', 'r') as fm:
            viewsetTpl = fm.read()
        code = '\n'.join(self.imports['views'])
        code += '\n'
        code += '\n'.join(self.functions_and_classes['views'])
        code += '\n'
        for class_name in self.json:
            model_name = create_object_name(class_name)
            code += "\n"
            code += viewsetTpl.replace('__CLASSNAME__', model_name)
            code += "\n"

        outpath = os.path.join(self.output_dir, 'views.py')
        inject_generated_code(outpath, code, 'VIEWSETS')
