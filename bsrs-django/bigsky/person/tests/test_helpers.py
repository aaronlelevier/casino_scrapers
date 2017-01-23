from django.contrib.auth.models import Group
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
