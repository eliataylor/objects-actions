import os

from loguru import logger

from ModelBuilder import ModelBuilder
from UserBuilder import UserBuilder
from utils import inject_generated_code, create_machine_name, create_object_name, build_json_from_csv, find_object_by_key_value


class DjangoBuilder:
    def __init__(self, csv_file, output_dir):
        self.output_dir = output_dir

        self.templates_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')) + '/templates/django/'

        self.global_function = {"models": [], "serializers": [], "views": [], "urls": []}
        self.imports = {"admin": ["from django.contrib import admin",
                                  "from django.utils.translation import gettext_lazy as _",
                                  "from django.contrib.auth.admin import UserAdmin as BaseUserAdmin"],
                        "models": ["from django.db import models",
                                   "from django.contrib.auth.models import AbstractUser",
                                   "from django.contrib.auth import get_user_model",
                                   "from utils.models import BumpParentsModelMixin",
                                   "from allauth.account.models import EmailAddress",
                                   "from django.dispatch import receiver",
                                   "from allauth.account.signals import email_confirmed",
                                   "from django.utils.timezone import now",
                                   "from django.core.exceptions import ValidationError"],
                        "serializers": ["from rest_framework import serializers",
                                        "from django.core.exceptions import ObjectDoesNotExist",
                                        "from django.db.models import ManyToManyField"],
                        "views": ["from rest_framework import viewsets, permissions, filters",
                                  "from rest_framework.pagination import PageNumberPagination",
                                  "from django.http import JsonResponse",
                                  "from django.core.management import call_command"],
                        "urls": [
                            "from rest_framework.routers import DefaultRouter",
                            "from django.urls import include, path",
                            "from .views import migrate, collectstatic"
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
            if isinstance(val, list):
                for v in val:
                    self.append_import(key, v)
            else:
                self.imports[key].append(val)

    def append_global(self, key, val):
        if val not in self.global_function[key]:
            if isinstance(val, list):
                for v in val:
                    self.append_global(key, v)
            else:
                self.global_function[key].append(val)

    def build_models(self):

        model_file_path = os.path.join(self.output_dir, f'models.py')
        admin_file_path = os.path.join(self.output_dir, f'admin.py')
        parts = []
        admin_parts = []

        with open(self.templates_dir + '/models.py', 'r') as fm:
            parts.append(fm.read())

        for class_name in self.json:
            model_name = create_object_name(class_name)
            if class_name.lower() == 'users':
                mbuilder = UserBuilder(class_name)
                mbuilder.build_fields(self.json[class_name])
                parts.insert(0, mbuilder.to_string())  # before SuperModel
            else:
                mbuilder = ModelBuilder(class_name)
                mbuilder.build_fields(self.json[class_name])
                parts.append(mbuilder.to_string())

            self.append_import("admin", f"from .models import {model_name}")
            admin_parts.append(mbuilder.admin_string())

            self.append_global('models', mbuilder.get_functions())
            self.append_import('models', mbuilder.get_imports())

        if len(self.global_function['models']) > 0:
            parts.insert(0, "\n\t".join(self.global_function['models']).strip())

        inject_generated_code(model_file_path, "\n".join(self.imports['models']).strip(), 'MODELS_IMPORTS')
        inject_generated_code(model_file_path, "\n\n".join(parts).strip(), 'MODELS')

        inject_generated_code(admin_file_path, "\n".join(self.imports['admin']).strip(), 'ADMIN_IMPORTS')
        inject_generated_code(admin_file_path, "\n\n".join(admin_parts).strip(), 'ADMIN_MODELS')

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

        code += """urlpatterns = [
    path('migrate/', migrate, name='migrate'),
    path('collectstatic/', collectstatic, name='collectstatic'),
    path('', include(router.urls)),
]"""

        inject_generated_code(outpath, code.strip(), 'URLS')

    def build_serializers(self):
        outpath = os.path.join(self.output_dir, 'serializers.py')

        with open(self.templates_dir + '/serializer.py', 'r') as fm:
            tpl = fm.read().strip()
        with open(self.templates_dir + '/serializers.py', 'r') as fm:
            serializers_helpers = fm.read().strip()

        parts = []
        for class_name in self.json:
            model_name = create_object_name(class_name)
            parts.append(tpl.replace('__CLASSNAME__', model_name))
            self.append_import("serializers", f"from .models import {model_name}")

        inject_generated_code(outpath, '\n'.join(self.imports["serializers"]), 'SERIALIZER-IMPORTS')
        inject_generated_code(outpath, serializers_helpers + "\n" + "\n".join(parts).strip(), 'SERIALIZERS')

    def build_viewsets(self):
        outpath = os.path.join(self.output_dir, 'views.py')

        with open(self.templates_dir + '/view.py', 'r') as fm:
            tpl = fm.read().strip()

        parts = []
        for class_name in self.json:
            model_name = create_object_name(class_name)
            code = tpl.replace('__CLASSNAME__', model_name)

            search_fields = []
            if find_object_by_key_value(self.json[class_name], "Field Name", "title") is not None:
                search_fields.append('title')
            elif find_object_by_key_value(self.json[class_name], "Field Name", "name") is not None:
                search_fields.append('name')
            else:
                for obj in self.json[class_name]:
                    if obj['Field Type'] in ["vocabulary reference", "type reference", "user profile"]:
                        # TODO: find title / name field of Relationship. Guessing for now:
                        rel_model = self.json[obj['Relationship']]
                        if find_object_by_key_value(rel_model, "Field Name", "title") is not None:
                            search_fields.append(f"{obj['Field Name']}__title")
                        elif find_object_by_key_value(rel_model, "Field Name", "name") is not None:
                            search_fields.append(f"{obj['Field Name']}__name")

                    elif obj['Field Type'] == "user_account":
                        search_fields.append('first_name')
                        search_fields.append('last_name')

            if len(search_fields) > 0:
                code = code.replace("__FILTERING__",
                                    f"""filter_backends = [filters.SearchFilter]
    search_fields = [{', '.join([f"'{s}'" for s in search_fields])}]\n""")
            else:
                code = code.replace("__FILTERING__", "")

            parts.append(code)
            self.append_import("views", f"from .models import {model_name}")
            self.append_import("views", f"from .serializers import {model_name}Serializer")

        inject_generated_code(outpath, '\n'.join(self.imports["views"]).strip(), 'VIEWSET-IMPORTS')

        with open(self.templates_dir + '/views.py', 'r') as fm:
            core = fm.read()
            inject_generated_code(outpath, core.strip(), 'CORE')

        inject_generated_code(outpath, "\n".join(parts).strip(), 'VIEWSETS')
