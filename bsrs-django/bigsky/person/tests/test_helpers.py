from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.test import TestCase

from collections import namedtuple

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

    def test_all_defaults(self):
        raw_ret = {}
        for m in helpers.PermissionInfo.MODELS:
            for p in helpers.PermissionInfo.PERMS:
                raw_ret["{}_{}".format(p, m)] = False

        ret = helpers.PermissionInfo.ALL_DEFAULTS

        self.assertIsInstance(ret, dict)
        self.assertEqual(len(ret), 24,
                         '6 models * 4 types = 24 possible permissions')
        for k,v in ret.items():
            self.assertFalse(v)
            self.assertEqual(v, raw_ret[k])

    def test_codenames(self):
        for p in helpers.PermissionInfo.PERMS:
            for m in helpers.PermissionInfo.MODELS:
                self.assertIn('{}_{}'.format(p, m),
                              helpers.PermissionInfo.CODENAMES)

    def test_setUp(self):
        self.assertEqual(
            Permission.objects.filter(codename__startswith='view_').count(), 0)

        helpers.PermissionInfo().setUp()

        post_perms = Permission.objects.filter(codename__startswith='view_')
        self.assertEqual(post_perms.count(), 6)
        for p in post_perms:
            self.assertIn(
                p.codename,
                ['view_{}'.format(x) for x in helpers.PermissionInfo.MODELS])

    def test_all(self):
        perm_info = helpers.PermissionInfo()
        perm_info.setUp()

        ret = perm_info.all()

        self.assertIsInstance(ret, models.query.QuerySet)
        self.assertEqual(ret.count(), 24)
        for r in ret:
            self.assertIsInstance(r, Permission)
            perm, model = r.codename.split('_')
            self.assertIn(perm, helpers.PermissionInfo.PERMS)
            self.assertIn(model, helpers.PermissionInfo.MODELS)
            # ContentType
            content_type = ContentType.objects.get(model=model)
            self.assertEqual(content_type.model, model)

    def test_content_types(self):
        ret = helpers.PermissionInfo().content_types()

        self.assertEqual(ret.count(), 6)
        for x in helpers.PermissionInfo.CONTENT_TYPE_FIELDS:
            ModelFieldData = namedtuple('ModelFieldData', ['app_label', 'model'])

            data = ModelFieldData._make(x)._asdict()
            self.assertIsInstance(
                ret.get(**data), ContentType,
                '{app_label}.{model} not returned'.format(**data))
