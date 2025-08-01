class SuperModel(models.Model):
	created_at = models.DateTimeField(auto_now_add=True)
	modified_at = models.DateTimeField(auto_now=True)
	author = models.ForeignKey(get_user_model(), on_delete=models.SET_NULL, null=True, blank=True, related_name='+')
	class Meta:
		abstract = True
		ordering = ['modified_at']

	def save(self, *args, **kwargs):
		self.modified_at = now()
		super().save(*args, **kwargs)

	def __str__(self):
		if hasattr(self, "title"):
			return self.title
		elif hasattr(self, "name"):
			return self.name
		elif hasattr(self, "slug"):
			return self.slug

		return super().__str__()

	@classmethod
	def get_current_user(cls, request):
		if hasattr(request, 'user') and request.user.is_authenticated:
			return request.user
		return None

class UploadToField:
    def __init__(self, field_name):
        self.field_name = field_name

    def __call__(self, instance, filename):
        ext = filename.split('.')[-1]
        base_filename = os.path.basename(filename).rsplit('.', 1)[0]

        # Get model name (lowercase)
        model_name = instance.__class__.__name__.lower()

        # Check if we're running inside a management command
        is_management_command = False
        stack = inspect.stack()
        for frame_info in stack:
            module = inspect.getmodule(frame_info[0])
            if module and ('management/commands' in module.__file__ or 'BaseCommand' in str(module.__file__)):
                is_management_command = True
                break

        if 'manage.py' in sys.argv[0] and any(cmd in sys.argv for cmd in ['import_cities', 'fake_users']):
             is_management_command = True

        if not is_management_command:
            new_filename = f"{base_filename}_{timezone.now().strftime('%Y%m%d%H%M%S')}.{ext}"
        else:
            new_filename = f"{base_filename}.{ext}"

        # Construct the final upload path: "uploads/<model_name>/<field_name>/<yyyy-mm>/<filename>"
        date_folder = timezone.now().strftime('%Y-%m')
        return os.path.join('uploads', model_name, self.field_name, date_folder, new_filename)

    def deconstruct(self):
        return ('inspectordeck_app.models.UploadToField', [self.field_name], {}) # Replace <your_app_name> with your app's name
