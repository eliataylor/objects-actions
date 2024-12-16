# parse src/examples/democrasee-permissions.csv

"""
# loop over roles:
    # create them
    editor_group, created = Group.objects.get_or_create(name='Editor')

# loop over CRUD and custom endpoints
    # add required groups
"""

