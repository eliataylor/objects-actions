import openai
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import find_json, SpreadsheetDefinitionSerializer, BotPromptSerializer
from .models import SpreadsheetDefinition

User = get_user_model()


class SchemaGeneratorViewSet(viewsets.ModelViewSet):
    queryset = SpreadsheetDefinition.objects.all()
    serializer_class = SpreadsheetDefinitionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SpreadsheetDefinition.objects.filter(created_by=self.request.user)

    @action(detail=False, methods=['post'])
    def generate(self, request):
        serializer = BotPromptSerializer(data=request.data)
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
                2C: Foreign Key: (set "relationship" with related model Name)
            3. Include field constraints: Required, How Many (cardinality), Default value, Example (list choices), or relationship name for foreign keys
            4. Return the schema a JSON object described this TypeScript:
            {
                "content_types": [
                    {
                        "model_name": "string",
                        "fields": [
                            {
                                label: string;
                                machine_name: string;
                                field_type: string;
                                cardinality: number | typeof Infinity;
                                required: boolean;
                                relationship?: ModelName;
                                default: string;
                                example: string;
                            }
                        ]
                    }
                ]
            }
            """

            # Create the completion request
            response = client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user",
                     "content": f"Create a database schema based on this application idea: {prompt_data['prompt']}"}
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
            schema_definition = SpreadsheetDefinition.objects.create(**tosave)

            return Response({
                'success': True,
                'data': SpreadsheetDefinitionSerializer(schema_definition).data
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
