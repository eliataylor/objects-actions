## This Django App prompts OpenAI for schema suggestions on any app idea.

- Responses are stored by Django in **two parts**: __Reasoning__ and __Schema__ both are fields in the [SchemaVersions](https://github.com/eliataylor/objects-actions/blob/main/stack/django/oasheets_app/models.py#L24) model. 
- You can adjust the Assistant's instructions in the [assistant_manager.py](https://github.com/eliataylor/objects-actions/blob/main/stack/django/oasheets_app/services/assistant_manager.py#L167) or in the OpenAI playground once it's been created after your first run. https://platform.openai.com/assistants/thread_YOURTHREADID

---

## TODO:
- The [version_tree](https://github.com/eliataylor/objects-actions/blob/main/stack/django/oasheets_app/models.py#L94) needs to be rebuilt when a specific version in the tree is deleted or made private. Could be done in [Serializer](https://github.com/eliataylor/objects-actions/blob/main/stack/django/oasheets_app/serializers.py#L33) instead
- Often the schema fails to generate in the same request as the reasoning. I run [this fallback](https://github.com/eliataylor/objects-actions/blob/main/stack/django/oasheets_app/services/generator_service.py#L104) prompt but it's still sometimes fails to generate.
