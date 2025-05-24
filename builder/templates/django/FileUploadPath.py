import inspect
import os
import sys
from django.utils import timezone

class FileUploadPath:
    """
    Callable class that generates upload paths with model name, field name,
    and date organization. Supports CLI management command detection.
    """

    def __init__(self, field_name):
        self.field_name = field_name

    def __call__(self, instance, filename):
        ext = filename.split('.')[-1]  # e.g. "jpg"
        base_filename = os.path.basename(filename).rsplit('.', 1)[0]  # Get filename without extension

        # Get model name (lowercase)
        model_name = instance.__class__.__name__.lower()

        # Check if we're running inside a management command
        is_management_command = False

        # Get current call stack
        stack = inspect.stack()

        # Look through the stack to find management command execution
        for frame_info in stack:
            module = inspect.getmodule(frame_info[0])
            if module and ('management/commands' in module.__file__ or 'BaseCommand' in str(module.__file__)):
                is_management_command = True
                break

        # Alternative approach: check sys.argv[0]
        if 'manage.py' in sys.argv[0] and any(cmd in sys.argv for cmd in
                                              ['import_cities', 'fake_users', 'import_nonprofits', 'import_meetings']):
            is_management_command = True

        # Only add datetime suffix for regular API/Admin usage, not for management commands
        if not is_management_command:
            new_filename = f"{base_filename}_{timezone.now().strftime('%Y%m%d%H%M%S')}.{ext}"
        else:
            # For management commands, keep the original filename to enable overwriting
            new_filename = f"{base_filename}.{ext}"

        # Use strftime to create a "year-month" folder dynamically
        date_folder = timezone.now().strftime('%Y-%m')

        # Construct the final upload path: "uploads/<model_name>/<field_name>/<yyyy-mm>/<filename>"
        return os.path.join('uploads', model_name, self.field_name, date_folder, new_filename)

    def __repr__(self):
        return f"FileUploadPath('{self.field_name}')"

# Usage in your models:
# picture = models.ImageField(upload_to=FileUploadPath('picture'), ...)
# cover_photo = models.ImageField(upload_to=FileUploadPath('cover_photo'), ...)
# icon = models.ImageField(upload_to=FileUploadPath('icon'), ...)
# etc.
