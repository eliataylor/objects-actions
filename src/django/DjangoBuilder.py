import json
import os
import sys
from loguru import logger
from utils.utils import inject_generated_code, build_permissions_from_csv, create_machine_name, create_object_name, build_types_from_csv, find_search_fields, find_object_by_key_value, capitalize

from .ModelBuilder import ModelBuilder
from .UserBuilder import UserBuilder


class DjangoBuilder:
    def __init__(self, types_path, matrix_path, output_dir):
        self.output_dir = output_dir
        self.app_name = os.path.basename(output_dir)

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
                        "views": ["from rest_framework import viewsets, permissions, filters, generics",
                                  "from rest_framework.pagination import PageNumberPagination",
                                  "from rest_framework.views import APIView",
                                  "from django.http import JsonResponse",
                                  "from django.core.management import call_command",
                                  "from django.apps import apps",
                                  "from django.http import HttpResponse",
                                  "from django.shortcuts import redirect",
                                  "from django.utils import timezone",
                                  "import re", "import os",
                                  "from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse"
                                  ],
                        "urls": [
                            "from django.urls import re_path",
                            "from rest_framework.routers import DefaultRouter",
                            "from django.urls import include, path",
                            "from .views import UserModelListView",
                            "from .views import UserStatsView",
                            "from .views import RenderFrontendIndex",
                            "from .views import redirect_to_frontend",
                        ],
                        "permissions": [
                            "from rest_framework import permissions",
                            "from rest_framework.permissions import BasePermission"
                        ]}

        self.requirements = []

        # TODO: on CREATE / UPDATE, upsert any Foreign Key relationships when the full object is passed

        # TODO: implement `permission_classes` via Roles from Permissions Matrix
        # TODO: generate CRUD query methods based on Permissions Matrix
        # TODO: personalize the CustomPagination class

        if types_path or not os.path.exists(types_path):
            self.json = build_types_from_csv(types_path)
            self.build_models()
            self.build_serializers()
            self.build_viewsets()
            self.build_urls()
        else:
            logger.warning(f'Cannot find Object Types {types_path}')
            sys.exit(0)

        if matrix_path and os.path.exists(matrix_path):
            self.matrix_path = matrix_path
            self.build_permissions()
        else:
            logger.warning(f'Cannot find Permissions Matrix {matrix_path}')
            sys.exit(0)

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
            admin_parts.append(mbuilder.admin_string(self.json[class_name]))

            self.append_global('models', mbuilder.get_functions())
            self.append_import('models', mbuilder.get_imports())

        if len(self.global_function['models']) > 0:
            parts.insert(0, "\n\t".join(self.global_function['models']).strip())

        inject_generated_code(model_file_path, "\n".join(self.imports['models']), 'MODELS_IMPORTS')
        inject_generated_code(model_file_path, "\n\n".join(parts), 'MODELS')

        inject_generated_code(admin_file_path, "\n".join(self.imports['admin']), 'ADMIN_IMPORTS')
        inject_generated_code(admin_file_path, "\n\n".join(admin_parts), 'ADMIN_MODELS')

        if len(self.requirements) > 0:
            cmds = "\n".join(self.requirements)
            logger.warning(
                f"Do not forget to run these commands at the root of your project {self.output_dir} \n\n {cmds}\n")

    def build_urls(self):

        outpath = os.path.join(self.output_dir, 'urls.py')
        extra_patterns = []

        self.append_import("urls", f"from .oa_testing import OATesterUserViewSet")
        code = ("\nOARouter = DefaultRouter(trailing_slash=False)\nOARouter.register(r'oa-testers', OATesterUserViewSet, basename='oa-tester')\n")
        for class_name in self.json:
            path_name = create_machine_name(class_name, True, '-')
            model_name = create_object_name(class_name)
            code += f"OARouter.register('{path_name}', {model_name}ViewSet, basename='{path_name}')\n"
            self.append_import("urls", f"from .views import {model_name}ViewSet")

            has_slug = find_object_by_key_value(self.json[class_name], "Field Type", "slug")
            if has_slug:
                self.append_import("urls", f"from .views import {model_name}AliasView")
                extra_patterns.append(f"path('u/{model_name.lower()}/<slug:{has_slug["Field Name"]}>/', {model_name}AliasView.as_view(), name='{model_name.lower()}-alias-view')")

        inject_generated_code(outpath, '\n'.join(self.imports["urls"]), 'URL-IMPORTS')

        code += f"""\nif urlpatterns is None:
    urlpatterns = []
    
urlpatterns += [
    re_path(r'^account/.*$', redirect_to_frontend, name='provider_callback_no_provider'),
    {(",\n\t").join(extra_patterns) + ',' if len(extra_patterns) > 0 else ''}    
    path('api/users/<int:user_id>/<str:model_name>/list', UserModelListView.as_view(), name='user-model-list'),
    path('api/users/<int:user_id>/<str:model_name>/stats', UserStatsView.as_view(), name='user-model-stats'),
    path('api/', include(OARouter.urls)),
]"""

        inject_generated_code(outpath, code, 'URLS')

    def build_serializers(self):
        outpath = os.path.join(self.output_dir, 'serializers.py')

        with open(self.templates_dir + '/serializer.py', 'r') as fm:
            tpl = fm.read().strip()
        with open(self.templates_dir + '/serializers.py', 'r') as fm:
            serializers_helpers = fm.read().strip()

        parts = []
        for class_name in self.json:
            model_name = create_object_name(class_name)
            code = tpl.replace('__CLASSNAME__', model_name)
            if model_name == 'Users':
                code = code.replace("fields = '__all__'",
                                    "fields = [field.name for field in Users._meta.fields if field.name not in ('password', 'email')]")
            parts.append(code)

            self.append_import("serializers", f"from .models import {model_name}")

        inject_generated_code(outpath, '\n'.join(self.imports["serializers"]), 'SERIALIZER-IMPORTS')
        inject_generated_code(outpath, serializers_helpers + "\n" + "\n".join(parts), 'SERIALIZERS')

    def build_viewsets(self):
        outpath = os.path.join(self.output_dir, 'views.py')

        with open(self.templates_dir + '/view.py', 'r') as fm:
            tpl = fm.read().strip()

        serialModelMap = []
        searchFieldMap = {}

        parts = []
        for class_name in self.json:
            model_name = create_object_name(class_name)
            code = tpl.replace('__CLASSNAME__', model_name)
            code = code.replace('__PERMISSIONS__', "") # TODO!!!

            search_fields = find_search_fields(self.json, class_name)
            searchFieldMap[model_name] = search_fields
            serialModelMap.append(f'"{model_name}": {model_name}Serializer')

            if len(search_fields) > 0:
                code = code.replace("__FILTERING__",
                                    f"""filter_backends = [filters.SearchFilter]
    search_fields = [{', '.join([f"'{s}'" for s in search_fields])}]\n""")
            else:
                code = code.replace("__FILTERING__", "")

            parts.append(code)

            has_slug = find_object_by_key_value(self.json[class_name], "Field Type", "slug")
            if has_slug:
                parts.append(f"""class {model_name}AliasView(generics.RetrieveAPIView):
    queryset = {model_name}.objects.all()
    serializer_class = {model_name}Serializer
    lookup_field = '{has_slug['Field Name']}'""")

            self.append_import("views", f"from .models import {model_name}")
            self.append_import("views", f"from .serializers import {model_name}Serializer")

        inject_generated_code(outpath, '\n'.join(self.imports["views"]), 'VIEWSET-IMPORTS')

        with open(self.templates_dir + '/views.py', 'r') as fm:
            core = fm.read()
            core = core.replace("__SERIALIZER_MODEL_MAP__", f'{{ {",".join(serialModelMap)} }}')
            core = core.replace("__SEARCHFIELD_MAP__", json.dumps(searchFieldMap, indent=2).strip())
            core = core.replace("__DJANGO_APPNAME__", self.app_name)

            inject_generated_code(outpath, core, 'CORE')

        inject_generated_code(outpath, "\n".join(parts), 'VIEWSETS')

    def build_permissions(self):
        matrix = build_permissions_from_csv(self.matrix_path, self.json)
        if matrix is None or 'permissions' not in matrix:
            return None

        outpath = os.path.join(self.output_dir, 'permissions.py')

        with open(self.templates_dir + '/permission.py', 'r') as fm:
            tpl = fm.read().strip()
        with open(self.templates_dir + '/permissions.py', 'r') as fm:
            permissions_helpers = fm.read().strip()

        parts = []
        for role in matrix['all_roles']:
            class_key = f"Is{create_object_name(capitalize(role))}User"
            model_name = create_object_name(role)

            code = tpl.replace('__ROLE_CLASS__', class_key)
            code = code.replace('__ROLE_NAME__', role)
            parts.append(code)

            # import to Views to use??
            self.append_import("views", f"from .models import {class_key}")

        inject_generated_code(outpath, '\n'.join(self.imports["permissions"]), 'PERMISSIONS-IMPORTS')
        inject_generated_code(outpath, permissions_helpers + "\n" + "\n".join(parts), 'PERMISSIONS')
