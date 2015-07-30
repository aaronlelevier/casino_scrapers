'''
Created on Apr 7, 2015

@author: tkrier
'''
from rest_framework.permissions import DjangoModelPermissions


class BSModelPermissions(DjangoModelPermissions):
    """
    Overrdide DjangoModelPermissions to include the view options.

    To use this ``perms_map``:

    - Globlally create these permissions on the Model objects using:
        
        - ``util.create._create_model_view_permissions``

    - Enroll the User in each permission for the Model:

    ```
    ct = ContentType.objects.get(app_label='person', model='role')
    perms = Permission.objects.filter(content_type=ct)
    for p in perms:
        person.user_permissions.add(p)
    person.save()
    ```
    """

perms_map = {
    'GET': ['%(app_label)s.view_%(model_name)s'],
    'OPTIONS': ['%(app_label)s.view_%(model_name)s'],
    'HEAD': ['%(app_label)s.view_%(model_name)s'],
    'POST': ['%(app_label)s.add_%(model_name)s'],
    'PUT': ['%(app_label)s.change_%(model_name)s'],
    'PATCH': ['%(app_label)s.change_%(model_name)s'],
    'DELETE': ['%(app_label)s.delete_%(model_name)s'],
}
