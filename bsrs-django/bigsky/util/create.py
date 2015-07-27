import random

from django.db import IntegrityError
from django.contrib.auth.models import ContentType, Group, Permission

from util.permissions import perms_map


def _get_groups_and_perms():
    "contenttypes and sites must be added to installed_apps to use."
    ct = ContentType.objects.get(app_label='person', model='role')

    groups = ['Manager', 'SrManager']
    for ea in groups:
        group, created = Group.objects.get_or_create(name=ea)
        if created:
            perm = Permission.objects.create(name=ea, codename="is_"+ea, content_type=ct)
            group.permissions.add(perm)
            group.save()


def _create_model_view_permissions():
    '''
    Create 'view_(model_name)' Permission for all models.

    Run this when adding a new Model to the DB.
    '''
    for ct in ContentType.objects.all():

        name = 'Can view {}'.format(ct.name)
        codename = 'view_{}'.format(ct.name)

        # create a single instance to be used in all 3 view types
        for i in perms_map.keys():
            if i in ['HEAD', 'OPTIONS', 'GET']:
                try:
                    Permission.objects.create(name=name, codename=codename, content_type=ct)
                except IntegrityError:
                    pass


def _generate_ph():
    return ''.join([str(random.randrange(0,10)) for x in range(10)])