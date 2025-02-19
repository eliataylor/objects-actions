import json
import openai
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from rest_framework import serializers
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import SuperModel

User = get_user_model()

def find_json(string):
    start_index = min(string.find('{'), string.find('['))
    if start_index == -1:
        print('No JSON object found in the string.')
        return None
    end_char = ']' if string[start_index] == '[' else '}'
    end_index = string.rfind(end_char)
    if end_index == -1:
        print('Invalid JSON object format.')
        return None
    json_string = string[start_index:end_index + 1]
    try:
        json_object = json.loads(json_string)
        return json_object
    except json.JSONDecodeError as e:
        print('Error parsing JSON:', json_string, e)
        return None


def sanitize_value(val):
    if isinstance(val, float) and (val == float('inf') or val == float('-inf') or val != val):
        return 9999 if val > 0 else -9999
    return val


def sanitize_json(obj):
    if isinstance(obj, dict):
        return {k: sanitize_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_json(item) for item in obj]
    else:
        return sanitize_value(obj)


class SchemaDefinition(SuperModel):
    prompt = models.CharField(max_length=255)
    response = models.CharField(max_length=4000)
    schema = models.JSONField(blank=True, null=True)

    class Meta:
        abstract = False
        verbose_name = "Spreadsheet Builder"
        verbose_name_plural = "Spreadsheet Builders"

    def __str__(self):
        return f"{self.prompt}"

    def save(self, *args, **kwargs):
        # Ensure JSON compatibility before saving
        if self.schema:
            self.schema = sanitize_json(self.schema)

        super().save(*args, **kwargs)

class SchemaPromptSerializer(serializers.Serializer):
    prompt = serializers.CharField(required=True)


class SchemaDefinitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchemaDefinition
        fields = ['prompt', 'schema', 'response', 'created_at', 'modified_at']
        read_only_fields = ['created_at', 'modified_at']


class SchemaGeneratorViewSet(viewsets.ModelViewSet):
    queryset = SchemaDefinition.objects.all()
    serializer_class = SchemaDefinitionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SchemaDefinition.objects.filter(created_by=self.request.user)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        serializer = SchemaPromptSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        prompt_data = serializer.validated_data

        try:
            # Configure OpenAI client
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)

            # System message to guide the AI
            system_message = """
            You are a database schema designer. Generate content types and field definitions to support the prompted application, 
            following these rules:
            1. Only list standard fields - id, author, created_at, modified_at - if they might be more important than usual for that content type 
            2. Define each field as one of these types:  
                2A: ID: Auto Increment ID, UUID, Slug (unique) 
                2B. Data field: Text, TextArea, Integer, Decimal, Percent, Price, Boolean, Email, Phone, Address, Password, URL, Date, Date Time, Time, Date Range, Image, Audio, Video, Media, Enum, Flat List, JSON, Base64 String, Coordinates
                2C: Foreign Key: (set "relationship" with related model Name and set data_type with "RelEntity")
            3. Include field constraints: Required, How Many (cardinality), Default value, or relationship name for foreign keys
            4. Return the schema a JSON object described this TypeScript:
            type ITypeFieldSchema = {
              [K in ModelName]: {
                [fieldName: string]: FieldTypeDefinition;
              };
            }
            interface FieldTypeDefinition {
                machine: string;
                singular: string;
                plural: string;
                data_type: 'string' | 'number' | 'boolean' | 'object' | 'RelEntity';
                field_type: string;
                cardinality: number | typeof Infinity;
                relationship?: ModelName;
                required: boolean;
                default: string;
                example: string;
                options?: Array<{ label: string; id: string; }>;
            }
            """

            # Create the completion request
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": f"Create a database schema based on this application idea: {prompt_data['prompt']}"}
                ],
                temperature=0.7
            )

            tosave = {
                "prompt": prompt_data['prompt'],
                "response": response.choices[0].message.content,
                "author": request.user,
            }

            sanitized_schema = find_json(tosave['response'])
            if sanitized_schema is not None:
                tosave['schema'] = sanitized_schema

            # Create new schema definition
            schema_definition = SchemaDefinition.objects.create(**tosave)

            return Response({
                'success': True,
                'data': SchemaDefinitionSerializer(schema_definition).data
            })

        except openai.OpenAIError as e:
            return Response(
                {'error': f'OpenAI API error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def export_to_sheets(self, request, pk=None):
        schema_definition = self.get_object()

        try:
            # Here you would implement the Google Sheets API integration
            # This is a placeholder for the actual implementation
            return Response({
                'message': 'Schema exported to Google Sheets successfully',
                'schema_id': schema_definition.id
            })
        except Exception as e:
            return Response(
                {'error': f'Export failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
