from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.test import TestCase

from person import helpers
from person.tests.factory import create_role, create_person


class HelperTests(TestCase):

    def setUp(self):
        self.person = create_person()
        self.role1 = create_role()
        self.role2 = create_role()

    def test_update_group(self):
        # ``init_count`` == 1 ; b/c when a Role is created, the
        # Person is auto-enrolled in the Group for that Role.
        init_count = self.person.groups.count()
        self.assertIsInstance(self.person.groups.first(), Group)
        # Add to initial Group
        helpers.update_group(person=self.person, group=self.role1.group)
        self.assertEqual(self.person.groups.count(), init_count)
        orig_group = self.person.groups.first()
        # Adding to a New Group will remove them from the original
        helpers.update_group(person=self.person, group=self.role2.group)
        self.assertEqual(self.person.groups.count(), init_count)
        new_group = self.person.groups.first()
        self.assertNotEqual(orig_group, new_group)


class PermissionInfoTests(TestCase):

    def test_codenames(self):
        for p in helpers.PermissionInfo.PERMS:
            for m in helpers.PermissionInfo.MODELS:
                self.assertIn('{}_{}'.format(p, m),
                              helpers.PermissionInfo.CODENAMES)

    def test_all_defaults(self):
        raw_ret = {}
        for m in helpers.PermissionInfo.MODELS:
            for p in helpers.PermissionInfo.PERMS:
                raw_ret["{}_{}".format(p, m)] = False
        raw_ret['view_provider'] = False

        ret = helpers.PermissionInfo.ALL_DEFAULTS

        self.assertIsInstance(ret, dict)
        self.assertEqual(len(ret), 25, '25 possible permissions')
        for k,v in ret.items():
            self.assertFalse(v)
            self.assertEqual(v, raw_ret[k])

    def test_setUp(self):
        perm_info = helpers.PermissionInfo()

        self.assertEqual(
            Permission.objects.filter(codename__startswith='view_').count(), 0)

        perm_info.setUp()

        ret = perm_info.all()
        self.assertEqual(ret.count(), 25)
        for p in helpers.PermissionInfo.PERMS:
            for m in helpers.PermissionInfo.MODELS:
                self.assertIsInstance(ret.get(codename="{}_{}".format(p,m)),
                                      Permission)

    def test_all(self):
        perm_info = helpers.PermissionInfo()
        perm_info.setUp()

        ret = perm_info.all()

        self.assertIsInstance(ret, models.query.QuerySet)
        self.assertEqual(ret.count(), 25)
        for r in ret:
            self.assertIsInstance(r, Permission)
            perm, model = r.codename.split('_')
            # self.assertEqual(r.name, 'Can {} {}'.format(perm, model))
            self.assertIn(perm, helpers.PermissionInfo.PERMS)
            self.assertIn(model, helpers.PermissionInfo.MODELS + ['provider'])
            # ContentType
            content_type = ContentType.objects.get(model=model)
            self.assertEqual(content_type.model, model)
