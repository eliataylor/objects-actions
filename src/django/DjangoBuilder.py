import json
import os
import sys
import re
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
        self.json = None
        self.matrix = None
        self.default_perm = 'IsAuthenticatedOrReadOnly'

        # TODO: on CREATE / UPDATE, upsert any Foreign Key relationships when the full object is passed
        # TODO: personalize the CustomPagination class

    def build_django(self, types_path, matrix_path=None, default_perm='IsAuthenticatedOrReadOnly'):
        self.default_perm = default_perm

        # Process types if provided
        if types_path and os.path.exists(types_path):
            self.json = build_types_from_csv(types_path)
            self.build_models()
            self.build_serializers()
            self.build_viewsets()
            self.build_urls()
        elif types_path:
            logger.warning(f'Cannot find Object Types {types_path}')
            return

        # Process permissions if provided
        if matrix_path and os.path.exists(matrix_path):
            self.build_permissions(matrix_path, default_perm)
        elif matrix_path:
            logger.warning(f'Cannot find Permissions Matrix {matrix_path}')


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

    def build_viewsets(self):
        outpath = os.path.join(self.output_dir, 'views.py')

        with open(self.templates_dir + '/view.py', 'r') as fm:
            tpl = fm.read().strip()

        tpl = tpl.replace('IsAuthenticatedOrReadOnly', self.default_perm)

        serialModelMap = []
        searchFieldMap = {}

        viewsets = []
        for class_name in self.json:
            model_name = create_object_name(class_name)
            code = tpl.replace('__CLASSNAME__', model_name)
            code = code.replace('__PERMISSIONS__', "")  # Default empty, permissions handled separately

            search_fields = find_search_fields(self.json, class_name)
            searchFieldMap[model_name] = search_fields
            serialModelMap.append(f'"{model_name}": {model_name}Serializer')

            if len(search_fields) > 0:
                code = code.replace("__FILTERING__",
                                    f"""filter_backends = [filters.SearchFilter]
    search_fields = [{', '.join([f"'{s}'" for s in search_fields])}]\n""")
            else:
                code = code.replace("__FILTERING__", "")

            viewsets.append(code)

            has_slug = find_object_by_key_value(self.json[class_name], "Field Type", "slug")
            if has_slug:
                viewsets.append(f"""class {model_name}AliasView(generics.RetrieveAPIView):
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

        inject_generated_code(outpath, "\n".join(viewsets), 'VIEWSETS')

    def build_permissions(self, matrix_path, default_perm):
        """Main permission building method that orchestrates the process"""

        # Get the permission matrix from CSV if provided
        matrix = build_permissions_from_csv(matrix_path, self.json) if matrix_path is not None else None
        if matrix is None or 'permissions' not in matrix:
            return

        # Store matrix and prepare for permissions generation
        self.matrix = matrix

        self.build_group_initialization()

        # Build the permissions.py file
        self.build_permission_classes()

        # Update the viewsets with get_permissions methods
        self.build_viewset_permissions()

    def build_group_initialization(self):
        """Generate code to initialize Django permission groups in apps.py"""
        if self.matrix is None or 'all_roles' not in self.matrix:
            logger.warning("Unable to extract roles from permission matrix")
            return

        # Get all unique roles from the matrix
        all_roles = self.matrix['all_roles']
        apps_file_path = os.path.join(self.output_dir, 'apps.py')

        with open(self.templates_dir + '/apps.py', 'r') as fm:
            tpl = fm.read().strip()

        group_commands = []
        # Format the roles for Django group names (convert to PascalCase with 'Is' prefix)
        for role in all_roles:
            if role != 'anonymous' and role != 'authenticated':  # Skip built-in roles

                # Convert snake_case or space-separated roles to CamelCase with "Is" prefix
                group_name = ''.join(word.capitalize() for word in role.replace('_', ' ').split())

                group_creation_code = f"                Group.objects.get_or_create(name=\"Is{group_name}\")"
                group_commands.append(group_creation_code)

        new_apps = tpl.replace("__OA_PERM_ROLES__", "\n".join(group_commands))
        inject_generated_code(apps_file_path, new_apps, 'PERMISSIONS-ROLE-GROUPS')

        logger.info(f"Group initialization code added for all permission groups")

    def build_permission_classes(self):
        """Generate permission classes in permissions.py file with metadata for the exception handler"""
        if not self.matrix or 'permissions' not in self.matrix:
            return

        # Prepare output path
        permissions_file_path = os.path.join(self.output_dir, 'permissions.py')

        # Initialize imports
        self.append_import("permissions", [
            "from rest_framework import permissions",
            "from rest_framework.permissions import BasePermission",
            "from django.contrib.auth import get_user_model"
        ])

        # Group permissions by context and verb
        context_verb_perms = {}
        for perm in self.matrix['permissions']:
            context_key = "-".join(perm['context'])
            verb_key = perm['verb']
            group_key = f"{context_key}_{verb_key}"

            if group_key not in context_verb_perms:
                context_verb_perms[group_key] = {
                    'context': perm['context'],
                    'verb': verb_key,
                    'own': None,
                    'others': None
                }

            if perm['ownership'] == 'own':
                context_verb_perms[group_key]['own'] = perm
            elif perm['ownership'] == 'others':
                context_verb_perms[group_key]['others'] = perm

        # Generate permission classes
        permission_classes = []
        self.view_permissions = {}  # Store for use in build_viewset_permissions

        for group_key, perm_group in context_verb_perms.items():
            context = perm_group['context']
            verb = perm_group['verb']
            own_perm = perm_group['own']
            others_perm = perm_group['others']

            # Skip if both permissions are None
            if own_perm is None and others_perm is None:
                continue

            model_name = create_object_name(context[0])
            if model_name not in self.view_permissions:
                self.view_permissions[model_name] = {}

            # Create class name for permission
            class_name = f"can_{verb}_{create_machine_name(model_name, True)}"

            # Skip if class was already created
            if class_name in [p.split('(')[0] for p in permission_classes]:
                continue

            # Check if object permission is needed
            needs_object_check = False

            # If both own and others exist, check if roles are different
            if own_perm and others_perm:
                # If roles are different between own and others, need object check
                if set(own_perm['roles']) != set(others_perm['roles']):
                    needs_object_check = True
            # If only one of them exists, need object check
            elif own_perm or others_perm:
                needs_object_check = True

            # Create base permission class
            perm_code = f"class {class_name}(BasePermission):\n"

            # Add class docstring with metadata for oa_exception_handler
            perm_code += f'''    """Permission class for {verb} operations on {model_name}.
    '''
            if own_perm and own_perm['roles']:
                own_roles_str = ", ".join(own_perm['roles'])
                perm_code += f'    Own content: Allows {own_roles_str}\n'
            if others_perm and others_perm['roles']:
                others_roles_str = ", ".join(others_perm['roles'])
                perm_code += f'    Others\' content: Allows {others_roles_str}\n'
            perm_code += f'    """\n'

            # Add metadata for own permissions - used by oa_exception_handler
            if own_perm and own_perm['roles']:
                own_roles_str = repr(own_perm['roles'])
                perm_code += f"    required_roles_own = {own_roles_str}\n"
            else:
                perm_code += f"    required_roles_own = []\n"

            # Add metadata for others permissions
            if others_perm and others_perm['roles']:
                others_roles_str = repr(others_perm['roles'])
                perm_code += f"    required_roles_others = {others_roles_str}\n"
            else:
                perm_code += f"    required_roles_others = []\n"

            # Add help text if available
            if own_perm and 'help' in own_perm:
                help_text = own_perm['help'].replace("'", "\\'")
                perm_code += f"    help_text = '{help_text}'\n"
            elif others_perm and 'help' in others_perm:
                help_text = others_perm['help'].replace("'", "\\'")
                perm_code += f"    help_text = '{help_text}'\n"

            # Add context information
            perm_code += f"    context_info = {{'context': {repr(context)}, 'verb': '{verb}'}}\n"

            perm_code += "    def has_permission(self, request, view):\n"

            # Combine roles from own and others for general permission check
            all_roles = set()
            if own_perm and own_perm['roles']:
                all_roles.update(own_perm['roles'])
            if others_perm and others_perm['roles']:
                all_roles.update(others_perm['roles'])

            # Add authentication check if needed
            if "anonymous" not in all_roles:
                perm_code += "        if not request.user or not request.user.is_authenticated:\n"
                perm_code += "            return False\n"

            # Add role checks if needed
            if all_roles and "anonymous" not in all_roles:
                role_checks = []
                for role in all_roles:
                    if role == "authenticated":
                        role_checks.append("request.user.is_authenticated")
                    else:
                        # Convert snake_case or space-separated roles to CamelCase with "Is" prefix
                        group_name = ''.join(word.capitalize() for word in role.replace('_', ' ').split())
                        role_checks.append(f"request.user.groups.filter(name='Is{group_name}').exists()")

                if role_checks:
                    perm_code += f"        return {' or '.join(role_checks)}\n"
                else:
                    perm_code += "        return True\n"
            else:
                perm_code += "        return True\n"

            # Add object permission check if needed
            if needs_object_check:
                perm_code += "\n    def has_object_permission(self, request, view, obj):\n"

                # Check if the object belongs to the user
                if context[0] == "Users":
                    perm_code += "        is_own = request.user.id == obj.id\n"
                else:
                    perm_code += "        is_own = hasattr(obj, 'author') and request.user.id == obj.author.id\n"

                # Handle object permissions based on ownership
                if own_perm and others_perm:
                    perm_code += "        if is_own:\n"

                    # Add role checks for own objects
                    own_role_checks = []
                    for role in own_perm['roles']:
                        if role == "authenticated":
                            own_role_checks.append("request.user.is_authenticated")
                        elif role == "anonymous":
                            own_role_checks.append("True")
                        else:
                            group_name = ''.join(word.capitalize() for word in role.replace('_', ' ').split())
                            own_role_checks.append(f"request.user.groups.filter(name='Is{group_name}').exists()")

                    if own_role_checks:
                        perm_code += f"            return {' or '.join(own_role_checks)}\n"
                    else:
                        perm_code += "            return True\n"

                    perm_code += "        else:\n"

                    # Add role checks for others' objects
                    other_role_checks = []
                    for role in others_perm['roles']:
                        if role == "authenticated":
                            other_role_checks.append("request.user.is_authenticated")
                        elif role == "anonymous":
                            other_role_checks.append("True")
                        else:
                            group_name = ''.join(word.capitalize() for word in role.replace('_', ' ').split())
                            other_role_checks.append(f"request.user.groups.filter(name='Is{group_name}').exists()")

                    if other_role_checks:
                        perm_code += f"            return {' or '.join(other_role_checks)}\n"
                    else:
                        perm_code += "            return False\n"

                elif own_perm:
                    perm_code += "        if is_own:\n"

                    # Add role checks for own objects
                    own_role_checks = []
                    for role in own_perm['roles']:
                        if role == "authenticated":
                            own_role_checks.append("request.user.is_authenticated")
                        elif role == "anonymous":
                            own_role_checks.append("True")
                        else:
                            group_name = ''.join(word.capitalize() for word in role.replace('_', ' ').split())
                            own_role_checks.append(f"request.user.groups.filter(name='Is{group_name}').exists()")

                    if own_role_checks:
                        perm_code += f"            return {' or '.join(own_role_checks)}\n"
                    else:
                        perm_code += "            return True\n"

                    perm_code += "        else:\n"
                    perm_code += "            return False  # Others not allowed\n"

                elif others_perm:
                    perm_code += "        if not is_own:\n"

                    # Add role checks for others' objects
                    other_role_checks = []
                    for role in others_perm['roles']:
                        if role == "authenticated":
                            other_role_checks.append("request.user.is_authenticated")
                        elif role == "anonymous":
                            other_role_checks.append("True")
                        else:
                            group_name = ''.join(word.capitalize() for word in role.replace('_', ' ').split())
                            other_role_checks.append(f"request.user.groups.filter(name='Is{group_name}').exists()")

                    if other_role_checks:
                        perm_code += f"            return {' or '.join(other_role_checks)}\n"
                    else:
                        perm_code += "            return False\n"

                    perm_code += "        else:\n"
                    perm_code += "            return False  # Own not allowed\n"

            permission_classes.append(perm_code)

            # Map actions to permission classes for views
            action_map = {
                "view_list": "list",
                "view_profile": "retrieve",
                "view": "retrieve",
                "add": "create",
                "edit": "update",
                "delete": "destroy",
                "block": "block"  # This might need custom handling in the viewset
            }

            if verb in action_map:
                action = action_map[verb]
                self.view_permissions[model_name][action] = class_name

        # Write permissions.py file
        permissions_content = "\n\n".join(permission_classes)

        # Add a comment explaining generated permissions
        permissions_header = '''"""This file contains permission classes generated from the permissions matrix.
These classes are used by the DRF viewsets to control access to API endpoints.

Each permission class contains metadata used by the oa_exception_handler to create detailed error messages:
- required_roles_own: List of roles that can access their own content
- required_roles_others: List of roles that can access content owned by others
- context_info: Contains context (model) and verb information
- help_text: (Optional) Additional explanation about the permission

The oa_exception_handler constructs error messages based on this metadata,
adapting to the current user's authentication status and roles.
"""\n\n'''

        # Include the permissions header in the content
        permissions_content = permissions_header + permissions_content

        inject_generated_code(permissions_file_path, '\n'.join(self.imports["permissions"]), 'PERMISSIONS-IMPORTS')
        inject_generated_code(permissions_file_path, permissions_content, 'PERMISSIONS')

        logger.info(f"Permission classes built successfully: {len(permission_classes)} classes.")

    def build_viewset_permissions(self):
        """Update viewsets with get_permissions methods"""
        if not hasattr(self, 'view_permissions') or not self.view_permissions:
            return

        # Generate get_permissions methods for views
        view_permission_methods = {}
        perform_create_methods = {}

        for model_name, actions in self.view_permissions.items():
            if not actions:
                continue

            # Generate get_permissions method code
            method_code = "def get_permissions(self):"

            # Handle standard actions with if-elif chain for proper control flow
            method_code += "\n        if self.action == 'list':"
            if "list" in actions:
                method_code += f"\n            permission_classes = [{actions['list']}]"
            else:
                method_code += f"\n            permission_classes = [permissions.{self.default_perm}]"

            method_code += "\n        elif self.action == 'retrieve':"
            if "retrieve" in actions:
                method_code += f"\n            permission_classes = [{actions['retrieve']}]"
            else:
                method_code += f"\n            permission_classes = [permissions.{self.default_perm}]"

            method_code += "\n        elif self.action == 'create':"
            if "create" in actions:
                method_code += f"\n            permission_classes = [{actions['create']}]"
            else:
                method_code += f"\n            permission_classes = [permissions.{self.default_perm}]"

            method_code += "\n        elif self.action in ['update', 'partial_update']:"
            if "update" in actions:
                method_code += f"\n            permission_classes = [{actions['update']}]"
            else:
                method_code += f"\n            permission_classes = [permissions.{self.default_perm}]"

            method_code += "\n        elif self.action == 'destroy':"
            if "destroy" in actions:
                method_code += f"\n            permission_classes = [{actions['destroy']}]"
            else:
                method_code += f"\n            permission_classes = [permissions.{self.default_perm}]"

            # Handle any custom actions like 'block'
            if "block" in actions:
                method_code += "\n        elif self.action == 'block':"
                method_code += f"\n            permission_classes = [{actions['block']}]"

            # Default case
            method_code += "\n        else:"
            method_code += f"\n            permission_classes = [permissions.{self.default_perm}]"
            method_code += "\n        return [permission() for permission in permission_classes]"

            view_permission_methods[model_name] = method_code

            # Check if we should add perform_create method - determine if 'create' action has ownership constraints
            if "create" in actions and model_name != "Users":  # Skip for Users model
                # Find the original permission rule to check ownership
                create_rule = None
                create_rule_others = None

                for perm_group in self.matrix['permissions']:
                    context_key = "-".join(perm_group['context'])
                    if context_key == model_name and perm_group['verb'] == 'add':
                        if perm_group.get('ownership') == 'own':
                            create_rule = perm_group
                        elif perm_group.get('ownership') == 'others':
                            create_rule_others = perm_group

                # Get allowed roles for others (for admin check)
                admin_roles = []
                if create_rule_others and create_rule_others.get('roles'):
                    admin_roles = create_rule_others.get('roles', [])

                # Construct the admin check based on roles
                admin_checks = []
                for role in admin_roles:
                    if role == "admin":
                        admin_checks.append("self.request.user.groups.filter(name='IsAdmin').exists()")
                    elif role != "anonymous" and role != "authenticated":
                        # Convert snake_case or space-separated roles to CamelCase with "Is" prefix
                        group_name = ''.join(word.capitalize() for word in role.replace('_', ' ').split())
                        admin_checks.append(f"self.request.user.groups.filter(name='Is{group_name}').exists()")

                admin_check_str = " or ".join(
                    admin_checks) if admin_checks else "self.request.user.groups.filter(name='IsAdmin').exists()"

                # Need to enforce author ownership
                perform_create_code = f'''def perform_create(self, serializer):
            # Check if user has role that allows creating for others
            can_create_for_others = {admin_check_str}

            if not can_create_for_others:
                # Force author to be current user
                serializer.save(author=self.request.user)
            else:
                # Users with appropriate roles can specify any author or default to themselves
                author_id = self.request.data.get('author')
                if author_id:
                    author = get_object_or_404(get_user_model(), id=author_id)
                    serializer.save(author=author)
                else:
                    serializer.save(author=self.request.user)'''

                perform_create_methods[model_name] = perform_create_code

        # Update viewsets in views.py file
        views_file_path = os.path.join(self.output_dir, 'views.py')

        # Add imports for permission classes and other required imports
        permission_imports = []
        for model_name, actions in self.view_permissions.items():
            permission_classes = list(actions.values())
            if permission_classes:
                permission_imports.extend(permission_classes)

        # Add required imports
        if perform_create_methods:
            self.append_import("views", "from django.shortcuts import get_object_or_404")
            self.append_import("views", "from django.contrib.auth import get_user_model")

        if permission_imports:
            permission_import_str = ", ".join(set(permission_imports))
            self.append_import("views", f"from .permissions import {permission_import_str}")
            inject_generated_code(views_file_path, '\n'.join(self.imports["views"]), 'VIEWSET-IMPORTS')

        # Read the entire views file to analyze its indentation style
        with open(views_file_path, 'r') as file:
            views_content = file.read()

        # Keep track of modified viewsets to add extra spacing between them
        modified_viewsets = []

        # Process each viewset class
        for model_name in view_permission_methods:
            viewset_name = f"{model_name}ViewSet"

            # Find the viewset class
            class_pattern = f"class {viewset_name}\\(.*?\\):"
            class_match = re.search(class_pattern, views_content)

            if not class_match:
                logger.warning(f"Could not find viewset class {viewset_name} in views.py")
                continue

            class_start_pos = class_match.end()

            # Find next class to determine the end of current class
            next_class_match = re.search(r"class\s+\w+\(.*?\):", views_content[class_start_pos:])
            if next_class_match:
                class_end_pos = class_start_pos + next_class_match.start()
            else:
                class_end_pos = len(views_content)

            # Extract class content
            class_content = views_content[class_start_pos:class_end_pos]

            new_views_content = views_content

            # Add/replace get_permissions method
            if model_name in view_permission_methods:
                method_code = view_permission_methods[model_name]

                # Check if get_permissions already exists
                existing_method_match = re.search(r"\n\s*def\s+get_permissions\s*\(\s*self\s*\)\s*:", class_content)

                if existing_method_match:
                    # Find the end of the existing method
                    method_start_pos = class_start_pos + existing_method_match.start()

                    # Find the next method or class definition to determine the end of the current method
                    next_method_match = re.search(r"\n\s*def\s+[^(]+\(", class_content[existing_method_match.end():])
                    if next_method_match:
                        method_end_pos = class_start_pos + existing_method_match.end() + next_method_match.start()
                    else:
                        method_end_pos = class_end_pos

                    # Replace the existing method
                    indented_method = f"\n\n    {method_code}\n"
                    new_views_content = new_views_content[:method_start_pos] + indented_method + new_views_content[
                                                                                                 method_end_pos:]
                else:
                    # Insert new method after the last class property
                    # Look for pattern: last property line followed by empty line or another def

                    # First find all property assignments
                    properties_pattern = r"\n\s+\w+\s*=.*?(?=\n\s*\n|\n\s*def|\Z)"
                    properties_matches = list(re.finditer(properties_pattern, class_content, re.DOTALL))

                    if properties_matches:
                        # Insert after the last property
                        last_prop_end = class_start_pos + properties_matches[-1].end()
                        indented_method = f"\n\n    {method_code}\n"
                        new_views_content = new_views_content[:last_prop_end] + indented_method + new_views_content[
                                                                                                  last_prop_end:]
                    else:
                        # No properties found, insert right after class definition
                        indented_method = f"\n    {method_code}\n"
                        new_views_content = new_views_content[:class_start_pos] + indented_method + new_views_content[
                                                                                                    class_start_pos:]

                # Update views_content for next operations
                views_content = new_views_content

                # Re-extract class content with updated positions
                if next_class_match:
                    class_end_pos = class_start_pos + re.search(r"class\s+\w+\(.*?\):",
                                                                views_content[class_start_pos:]).start()
                else:
                    class_end_pos = len(views_content)
                class_content = views_content[class_start_pos:class_end_pos]

                # Mark this viewset as modified
                modified_viewsets.append(viewset_name)

            # Add perform_create method if needed
            if model_name in perform_create_methods:
                perform_code = perform_create_methods[model_name]

                # Check if perform_create already exists
                existing_method_match = re.search(r"\n\s*def\s+perform_create\s*\(\s*self\s*,\s*serializer\s*\)\s*:",
                                                  class_content)

                if existing_method_match:
                    # Find the end of the existing method
                    method_start_pos = class_start_pos + existing_method_match.start()

                    # Find the next method or class definition to determine the end of the current method
                    next_method_match = re.search(r"\n\s*def\s+[^(]+\(", class_content[existing_method_match.end():])
                    if next_method_match:
                        method_end_pos = class_start_pos + existing_method_match.end() + next_method_match.start()
                    else:
                        method_end_pos = class_end_pos

                    # Replace the existing method
                    indented_method = f"\n\n    {perform_code}\n"
                    views_content = views_content[:method_start_pos] + indented_method + views_content[method_end_pos:]
                else:
                    # Find a good position to insert the method, preferably after get_permissions
                    get_perms_match = re.search(r"\n\s*def\s+get_permissions\s*\(\s*self\s*\)\s*:", class_content)

                    if get_perms_match:
                        # Find the end of get_permissions method
                        perms_start_pos = class_start_pos + get_perms_match.start()

                        # Find the next method or class definition to determine the end
                        next_method_match = re.search(r"\n\s*def\s+[^(]+\(", class_content[get_perms_match.end():])
                        if next_method_match:
                            perms_end_pos = class_start_pos + get_perms_match.end() + next_method_match.start()

                            # Insert after get_permissions
                            indented_method = f"\n\n    {perform_code}\n"
                            views_content = views_content[:perms_end_pos] + indented_method + views_content[
                                                                                              perms_end_pos:]
                        else:
                            # No next method, insert at end of class
                            indented_method = f"\n\n    {perform_code}\n"
                            views_content = views_content[:class_end_pos] + indented_method + views_content[
                                                                                              class_end_pos:]
                    else:
                        # No get_permissions, insert at end of class
                        indented_method = f"\n\n    {perform_code}\n"
                        views_content = views_content[:class_end_pos] + indented_method + views_content[class_end_pos:]

                # Mark this viewset as modified
                if viewset_name not in modified_viewsets:
                    modified_viewsets.append(viewset_name)

        # Add extra newlines between modified viewsets for readability
        for viewset_name in modified_viewsets:
            class_pattern = f"class {viewset_name}\\(.*?\\):"
            class_match = re.search(class_pattern, views_content)

            if class_match and class_match.start() > 0:
                # Add extra newlines before the class definition
                # First, check if there's already enough space
                spaces_before = views_content[:class_match.start()].rstrip()
                newline_count = len(views_content[len(spaces_before):class_match.start()])

                if newline_count < 3:  # We want at least 3 newlines for separation
                    # Replace existing newlines with 3 newlines
                    views_content = spaces_before + "\n\n\n" + views_content[class_match.start():]

        # Write the updated content back to the file
        with open(views_file_path, 'w') as file:
            file.write(views_content)

        logger.info(f"Viewset permissions updated for {len(view_permission_methods)} viewsets.")
        if perform_create_methods:
            logger.info(f"Added perform_create methods to {len(perform_create_methods)} viewsets to enforce ownership.")
