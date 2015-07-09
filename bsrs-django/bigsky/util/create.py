def _get_groups_and_perms():
    "contenttypes and sites must be added to installed_apps to use."
    ct = ContentType.objects.get(app_label='main', model='userprofile')

    groups = ['admin', 'manager']
    for ea in groups:
        group = Group.objects.create(name=ea)
        perm = Permission.objects.create(name=ea, codename="is_"+ea, content_type=ct)
        group.permissions.add(perm)
        group.save()
