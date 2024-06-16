class __CLASSNAME__Serializer(serializers.ModelSerializer):
    class Meta:
        model = __CLASSNAME__
        fields = '__all__'
        # exclude = ()  # Default: empty tuple, no fields excluded
        # depth = 0  # Default: 0, no nested serialization
        # read_only_fields = ()  # Default: empty tuple, no read-only fields
        # write_only_fields = ()  # Default: empty tuple, no write-only fields
        # extra_kwargs = {}  # Default: empty dictionary, no extra field configurations
        # validators = []  # Default: empty list, no validators defined
        # error_messages = {}  # Default: empty dictionary, no custom error messages
