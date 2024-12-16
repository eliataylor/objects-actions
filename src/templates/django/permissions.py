from django.contrib.auth.decorators import permission_required

@permission_required('app.change_post', raise_exception=True)
def edit_post(request, post_id):
    # View logic here
    pass


