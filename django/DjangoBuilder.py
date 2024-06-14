import os

from utils import inject_generated_code, create_machine_name, create_object_name, addArgs, infer_field_type, \
    build_json_from_csv


class DjangoBuilder:
    def __init__(self, csv_file, output_dir):
        self.output_dir = output_dir

        # TODO: build list dynamically and inject add the end
        self.imports = {"models": ["from django.db import models",
                                   "from django.contrib.auth.models import User",
                                   "from django.contrib import admin",
                                   "from django.utils import timezone",
                                   "from django.contrib.auth import get_user_model",
                                   "from address.models import AddressField"
                                   ],
                        "serializers": ["from rest_framework import serializers"],
                        "urls": ["from rest_framework.routers import DefaultRouter"],
                        "viewsets": ["from rest_framework import viewsets"]
                        }

        self.serializerTpl = """class __CLASSNAME__Serializer(serializers.ModelSerializer):
    class Meta:
        model = __CLASSNAME__
        fields = '__all__'    
        """

        # TODO: implement `permission_classes` via Roles from Permissions Matrix
        # TODO: generate CRUD query methods based on Permissions Matrix
        self.viewsetTpl = """class __CLASSNAME__ViewSet(viewsets.ModelViewSet):
    queryset = __CLASSNAME__.objects.all()
    serializer_class = __CLASSNAME__Serializer
    permission_classes = [permissions.IsAuthenticated]

    # Add pagination
    pagination_class = CustomPagination

    def get_queryset(self):
        return __CLASSNAME__.objects.all()

    @action(detail=True, methods=['get'])
    @method_decorator(cache_page(60 * 3))
    def custom_list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    # Add error handling for specific methods
    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        """

        self.modelTpl = """
class SuperModel(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True, blank=True)
    class Meta:
        abstract = True
    def __str__(self):
        if hasattr(self, "title"):
            return self.title
        elif hasattr(self, "name"):
            return self.name
        return self.__class__


    def get_current_user(self, request):
        if hasattr(request, 'user') and request.user.is_authenticated:
            return request.user
        return None
    def save(self, *args, **kwargs):
        if not self.id and hasattr(self, 'author') and not self.author_id:
            request = kwargs.pop('request', None)  # Remove 'request' from kwargs
            if request:
                self.author = self.get_current_user(request)
        super().save(*args, **kwargs)
        """

        self.json = build_json_from_csv(csv_file)
        self.build_models(self.imports['models'])
        self.build_serializers(self.imports['serializers'])
        self.build_viewsets(self.imports['viewsets'])
        self.build_urls(self.imports['urls'])

    def build_models(self, imports_list):

        code = "{0}\n{1}\n".format('\n'.join(imports_list), self.modelTpl)
        for class_name in self.json:
            title_field = False
            model_name = create_object_name(class_name)

            code += f"\nclass {model_name}(SuperModel):\n"

            for field in self.json[class_name]:
                field_type = field['Field Type']
                field_name = field['Field Name']
                if field_name is None or field_name == '':
                    field_name = create_machine_name(field['Field Label'])

                if field_name == 'title':
                    title_field = field_name
                elif field_name == 'name':
                    title_field = field_name

                if field_type is None:
                    field_type = 'text'
                model_type = infer_field_type(field_type, field)
                if field['Required'].strip() == '' or int(field['Required']) < 1:
                    model_type = addArgs(model_type, ['blank=True', 'null=True'])
                if field['Default'].strip() != '':
                    model_type = addArgs(model_type, [f"default={field['Default']}"])

                code += f"    {field_name} = {model_type}\n"

            code += f"admin.site.register({model_name})\n"

        model_file_path = os.path.join(self.output_dir, f'models.py')
        inject_generated_code(model_file_path, code, 'MODELS')





    def build_serializers(self, imports_list):
        code = "{0}\n".format('\n'.join(imports_list))
        for class_name in self.json:
            model_name = create_object_name(class_name)
            code += "\n"
            code += self.serializerTpl.replace('__CLASSNAME__', model_name)
            code += "\n"

        outpath = os.path.join(self.output_dir, 'serializers.py')
        inject_generated_code(outpath, code, 'SERIALIZERS')

    def build_urls(self, imports_list):
        code = "{0}\n{1}\n".format('\n'.join(imports_list), "\nrouter = DefaultRouter()\n")
        for class_name in self.json:
            path_name = create_machine_name(class_name)
            model_name = create_object_name(class_name)
            code += f"router.register(r'api/{path_name}', {model_name}ViewSet, basename='{path_name}')\n"

        outpath = os.path.join(self.output_dir, 'urls.py')
        inject_generated_code(outpath, code, 'URLS')

    def build_viewsets(self, imports_list):
        code = "{0}\n".format('\n'.join(imports_list))
        for class_name in self.json:
            model_name = create_object_name(class_name)
            code += "\n"
            code += self.viewsetTpl.replace('__CLASSNAME__', model_name)
            code += "\n"

        outpath = os.path.join(self.output_dir, 'views.py')
        inject_generated_code(outpath, code, 'VIEWSETS')
