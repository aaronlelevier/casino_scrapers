from django.contrib.auth.models import ContentType, Group, Permission


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

'''

from util.create import _get_groups_and_perms
_get_groups_and_perms()
from django.contrib.auth.models import Group
groups = Group.objects.all()
groups

'''