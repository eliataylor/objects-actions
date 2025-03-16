import json
import os
import sys
from loguru import logger
from utils.utils import inject_generated_code, build_permissions_from_csv, create_machine_name, create_object_name, build_types_from_csv, find_search_fields, find_object_by_key_value, capitalize

from .ModelBuilder import ModelBuilder
from .UserBuilder import UserBuilder


class DjangoBuilder:
    def __init__(self, output_dir):
        self.output_dir = output_dir if output_dir.endswith('/') else f"{output_dir}/"
        self.app_name = os.path.basename(output_dir)
        self.templates_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..')) + '/templates/django'

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
                                  "from rest_framework.pagination import LimitOffsetPagination",
                                  "from rest_framework import viewsets, permissions, filters, generics",
                                  "from rest_framework.views import APIView",
                                  "from django.http import JsonResponse",
                                  "from django.core.management import call_command",
                                  "from django.apps import apps",
                                  "from django.http import HttpResponse",
                                  "from django.shortcuts import redirect",
                                  "from django.utils import timezone",
                                  "from .services import send_sms",
                                  "import random", "import re", "import os",
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

    def build_django(self, types_path, default_perm):
        if os.path.exists(types_path):
            self.json = build_types_from_csv(types_path)
            self.build_models()
            self.build_serializers()
            self.build_viewsets(default_perm)
            self.build_urls()
        else:
            logger.warning(f'Cannot find Object Types {types_path}')
            sys.exit(0)


    # python generate.py chatbot --types=examples/object-fields-demo.csv --output_dir=../stack/django/oasheets_app/fixtures
    def build_chatbot_structures(self, types_path):
        if os.path.exists(types_path):
            logger.warning(f'Cannot find Object Types {types_path}')
            sys.exit(0)

        self.json = build_types_from_csv(types_path)

        newjson = {
            "content_types": []
        }

        for class_name in self.json:

            model_name = create_object_name(class_name)
            content_type = {
                "name": class_name,
                "model": model_name,
                "fields": self.json[class_name]
            }
            newjson["content_types"].append(content_type)

        with open(os.path.join(self.output_dir, f'example_schema.json'), 'w') as file:
            file.write(json.dumps(newjson, indent=2))


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
                code = code.replace("CustomSerializer", "CustomUsersSerializer")
                code = code.replace("fields = '__all__'",
                                    "exclude = ('password', 'email', 'is_active', 'is_staff', 'is_superuser')")
            parts.append(code)

            self.append_import("serializers", f"from .models import {model_name}")

        inject_generated_code(outpath, '\n'.join(self.imports["serializers"]), 'SERIALIZER-IMPORTS')
        inject_generated_code(outpath, serializers_helpers + "\n" + "\n".join(parts), 'SERIALIZERS')

    def build_viewsets(self, default_perm):
        outpath = os.path.join(self.output_dir, 'views.py')

        with open(self.templates_dir + '/view.py', 'r') as fm:
            tpl = fm.read().strip()

        tpl = tpl.replace('IsAuthenticatedOrReadOnly', default_perm)

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


            self.append_import("views", f"from .serializers import {model_name}Serializer")
            self.append_import("views", f"from .models import {model_name}")

        inject_generated_code(outpath, '\n'.join(self.imports["views"]), 'VIEWSET-IMPORTS')

        with open(self.templates_dir + '/views.py', 'r') as fm:
            core = fm.read()
            core = core.replace("__SERIALIZER_MODEL_MAP__", f'{{ {",".join(serialModelMap)} }}')
            core = core.replace("__SEARCHFIELD_MAP__", json.dumps(searchFieldMap, indent=2).strip())
            core = core.replace("__DJANGO_APPNAME__", self.app_name)

            inject_generated_code(outpath, core, 'CORE')

        inject_generated_code(outpath, "\n".join(parts), 'VIEWSETS')

    def build_permissions(self, matrix_path, default_perm):
        matrix = build_permissions_from_csv(matrix_path, self.json) if matrix_path is not None else None
        if matrix is None or 'permissions' not in matrix:
            return

        # Prepare output paths
        permissions_file_path = os.path.join(self.output_dir, 'permissions.py')

        # Read templates
        with open(self.templates_dir + '/permissions.py', 'r') as fm:
            perms_tpl = fm.read().strip()

        # Initialize imports and code blocks
        self.append_import("permissions", [
            "from rest_framework import permissions",
            "from rest_framework.permissions import BasePermission",
            "from django.contrib.auth import get_user_model"
        ])

        # Group permissions by context (model type)
        context_perms = {}
        for perm in matrix['permissions']:
            context = "-".join(perm['context'])
            if context not in context_perms:
                context_perms[context] = []
            context_perms[context].append(perm)

        # Generate permission classes for each context
        permission_classes = []
        view_permissions = {}

        for context, perms in context_perms.items():
            model_name = create_object_name(context)
            view_permissions[model_name] = {}

            for perm in perms:
                verb = perm['verb']
                ownership = perm['ownership']
                roles = perm['roles']

                # Create class name for permission
                class_name = f"can_{verb}_{create_machine_name(model_name, True)}"

                # Skip if class was already created
                if class_name in [p.split('(')[0] for p in permission_classes]:
                    continue

                # Create permission class code
                if ownership == "own" or ownership == "others":
                    # Check if object permission is needed
                    has_object_check = True

                    # Create base permission class
                    perm_code = f"class {class_name}(BasePermission):\n"
                    perm_code += "    def has_permission(self, request, view):\n"

                    # Add authentication check if needed
                    if "anonymous" not in roles:
                        perm_code += "        if not request.user or not request.user.is_authenticated:\n"
                        perm_code += "            return False\n"

                    # Add role checks if needed
                    if roles and "anonymous" not in roles:
                        role_checks = []
                        for role in roles:
                            if role == "authenticated":
                                role_checks.append("request.user.is_authenticated")
                            elif role == "verified":
                                role_checks.append("request.user.groups.filter(name='IsVerified').exists()")
                            elif role == "admin":
                                role_checks.append("request.user.groups.filter(name='IsAdmin').exists()")
                            elif role == "rally attendee":
                                role_checks.append("request.user.groups.filter(name='IsRallyAttendee').exists()")
                            elif role == "city sponsor":
                                role_checks.append("request.user.groups.filter(name='IsCitySponsor').exists()")
                            elif role == "city official":
                                role_checks.append("request.user.groups.filter(name='IsCityOfficial').exists()")
                            elif role == "rally speaker":
                                role_checks.append("request.user.groups.filter(name='IsRallySpeaker').exists()")
                            elif role == "rally moderator":
                                role_checks.append("request.user.groups.filter(name='IsRallyModerator').exists()")
                            elif role == "paid user":
                                role_checks.append("request.user.groups.filter(name='IsPaidUser').exists()")

                        if role_checks:
                            perm_code += f"        return {' or '.join(role_checks)}\n"
                        else:
                            perm_code += "        return True\n"
                    else:
                        perm_code += "        return True\n"

                    # Add object permission check
                    if has_object_check:
                        perm_code += "\n    def has_object_permission(self, request, view, obj):\n"

                        if context == "Users":
                            perm_code += "        if request.user.id != obj.id:\n"
                        else:
                            perm_code += "        if request.user.id != obj.author.id:\n"

                        if ownership == "others":
                            # Check roles for accessing others' objects
                            other_role_checks = []
                            for role in roles:
                                if role == "verified":
                                    other_role_checks.append("request.user.groups.filter(name='IsVerified').exists()")
                                elif role == "admin":
                                    other_role_checks.append("request.user.groups.filter(name='IsAdmin').exists()")
                                elif role == "rally attendee":
                                    other_role_checks.append(
                                        "request.user.groups.filter(name='IsRallyAttendee').exists()")
                                elif role == "city sponsor":
                                    other_role_checks.append(
                                        "request.user.groups.filter(name='IsCitySponsor').exists()")
                                elif role == "city official":
                                    other_role_checks.append(
                                        "request.user.groups.filter(name='IsCityOfficial').exists()")
                                elif role == "rally speaker":
                                    other_role_checks.append(
                                        "request.user.groups.filter(name='IsRallySpeaker').exists()")
                                elif role == "rally moderator":
                                    other_role_checks.append(
                                        "request.user.groups.filter(name='IsRallyModerator').exists()")
                                elif role == "paid user":
                                    other_role_checks.append("request.user.groups.filter(name='IsPaidUser').exists()")

                            if verb == "block" and context == "Users":
                                perm_code += "            # You cannot block yourself\n"
                                perm_code += "            return False\n"
                                perm_code += "        else:\n"
                                if other_role_checks:
                                    perm_code += f"            # Others requires roles: {', '.join(roles)}\n"
                                    perm_code += f"            return {' or '.join(other_role_checks)}\n"
                                else:
                                    perm_code += "            return True\n"
                            else:
                                if other_role_checks:
                                    perm_code += f"            # Others requires roles: {', '.join(roles)}\n"
                                    perm_code += f"            return {' or '.join(other_role_checks)}\n"
                                else:
                                    perm_code += "            return False\n"
                                perm_code += "        else:\n"
                                perm_code += "            return True\n"
                        else:  # ownership == "own"
                            # Own objects
                            own_role_checks = []
                            for role in roles:
                                if role == "verified":
                                    own_role_checks.append("request.user.groups.filter(name='IsVerified').exists()")
                                elif role == "admin":
                                    own_role_checks.append("request.user.groups.filter(name='IsAdmin').exists()")

                            if own_role_checks:
                                perm_code += f"            # Others not allowed\n"
                                perm_code += "            return False\n"
                                perm_code += "        else:\n"
                                perm_code += f"            # Own requires roles: {', '.join(roles)}\n"
                                perm_code += f"            return {' or '.join(own_role_checks)}\n"
                            else:
                                perm_code += "            return False\n"
                                perm_code += "        else:\n"
                                perm_code += "            return True\n"
                else:
                    # Simple permission class without object-level checks
                    perm_code = f"class {class_name}(BasePermission):\n"
                    perm_code += "    def has_permission(self, request, view):\n"

                    # Add authentication check if needed
                    if "anonymous" not in roles:
                        perm_code += "        if not request.user or not request.user.is_authenticated:\n"
                        perm_code += "            return False\n"

                    # Add role checks
                    if roles and "anonymous" not in roles:
                        role_checks = []
                        for role in roles:
                            if role == "authenticated":
                                role_checks.append("request.user.is_authenticated")
                            elif role == "verified":
                                role_checks.append("request.user.groups.filter(name='IsVerified').exists()")
                            elif role == "admin":
                                role_checks.append("request.user.groups.filter(name='IsAdmin').exists()")

                        if role_checks:
                            perm_code += f"        return {' or '.join(role_checks)}\n"
                        else:
                            perm_code += "        return True\n"
                    else:
                        perm_code += "        return True\n"

                permission_classes.append(perm_code)

                # Map actions to permission classes for views
                action_map = {
                    "view_list": "list",
                    "view_profile": "retrieve",
                    "view": "retrieve",
                    "add": "create",
                    "edit": "update",
                    "delete": "destroy"
                }

                if verb in action_map:
                    view_permissions[model_name][action_map[verb]] = class_name

        # Generate get_permissions methods for views
        view_permission_methods = []
        for model_name, actions in view_permissions.items():
            if not actions:
                continue

            method_code = f"def get_permissions(self):\n"
            method_code += "    if self.action == 'list':\n"

            if "list" in actions:
                method_code += f"        permission_classes = [{actions['list']}]\n"
            else:
                method_code += f"        permission_classes = [permissions.{default_perm}]\n"

            method_code += "    elif self.action == 'retrieve':\n"
            if "retrieve" in actions:
                method_code += f"        permission_classes = [{actions['retrieve']}]\n"
            else:
                method_code += f"        permission_classes = [permissions.{default_perm}]\n"

            method_code += "    elif self.action == 'create':\n"
            if "create" in actions:
                method_code += f"        permission_classes = [{actions['create']}]\n"
            else:
                method_code += f"        permission_classes = [permissions.{default_perm}]\n"

            method_code += "    elif self.action in ['update', 'partial_update']:\n"
            if "update" in actions:
                method_code += f"        permission_classes = [{actions['update']}]\n"
            else:
                method_code += f"        permission_classes = [permissions.{default_perm}]\n"

            method_code += "    elif self.action == 'destroy':\n"
            if "destroy" in actions:
                method_code += f"        permission_classes = [{actions['destroy']}]\n"
            else:
                method_code += f"        permission_classes = [permissions.{default_perm}]\n"

            method_code += "    else:\n"
            method_code += f"        permission_classes = [permissions.{default_perm}]\n"
            method_code += "    return [permission() for permission in permission_classes]"

            view_permission_methods.append((model_name, method_code))

        # Write permissions.py file
        permissions_content = "\n\n".join(permission_classes)
        inject_generated_code(permissions_file_path, '\n'.join(self.imports["permissions"]), 'PERMISSIONS-IMPORTS')
        inject_generated_code(permissions_file_path, permissions_content, 'PERMISSIONS')

        # Update viewsets in views.py file
        views_file_path = os.path.join(self.output_dir, 'views.py')

        # Add imports for permission classes
        permission_imports = []
        for model_name, _ in view_permission_methods:
            actions = view_permissions[model_name]
            permission_classes = list(actions.values())
            if permission_classes:
                permission_imports.extend(permission_classes)

        if permission_imports:
            permission_import_str = ", ".join(set(permission_imports))
            self.append_import("views", f"from .permissions import {permission_import_str}")
            inject_generated_code(views_file_path, '\n'.join(self.imports["views"]), 'VIEWSET-IMPORTS')

        # Update the get_permissions methods in viewsets
        for model_name, method_code in view_permission_methods:
            viewset_name = f"{model_name}ViewSet"

            # Look for the viewset class in views.py
            with open(views_file_path, 'r') as file:
                views_content = file.read()

            viewset_pattern = f"class {viewset_name}\\(.*?\\):"
            match = re.search(viewset_pattern, views_content)

            if match:
                viewset_start = match.start()

                # Find existing get_permissions method or insert a new one
                get_perms_pattern = f"def get_permissions\\(self\\):.*?(def |class |$)"
                get_perms_match = re.search(get_perms_pattern, views_content[viewset_start:], re.DOTALL)

                if get_perms_match:
                    # Replace existing get_permissions
                    start_idx = viewset_start + get_perms_match.start()
                    end_idx = viewset_start + get_perms_match.end() - len(get_perms_match.group(1))

                    new_content = views_content[:start_idx] + method_code + views_content[end_idx:]

                    with open(views_file_path, 'w') as file:
                        file.write(new_content)
                else:
                    # Insert new get_permissions method
                    class_content_pattern = f"class {viewset_name}\\(.*?\\):.*?(def |class |$)"
                    class_match = re.search(class_content_pattern, views_content[viewset_start:], re.DOTALL)

                    if class_match:
                        insert_idx = viewset_start + class_match.end() - len(class_match.group(1))

                        indented_method = "\n    " + method_code.replace("\n", "\n    ") + "\n\n"
                        new_content = views_content[:insert_idx] + indented_method + views_content[insert_idx:]

                        with open(views_file_path, 'w') as file:
                            file.write(new_content)

        logger.info(f"Permissions built successfully for {len(permission_classes)} classes.")
