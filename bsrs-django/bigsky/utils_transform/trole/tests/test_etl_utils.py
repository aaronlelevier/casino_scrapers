from django.test import TestCase

from person.models import Role
from utils_transform.trole.management.commands._etl_utils import create_role, run_role_migrations
from utils_transform.trole.tests.factory import create_domino_role


class EtlUtilTests(TestCase):

    def test_create_role(self):
        domino_role = create_domino_role()

        role_ = create_role(domino_role)

        self.assertIsInstance(role_, Role)
        self.assertEqual(role_.name, domino_role.name)
        self.assertEqual(role_.role_type, "admin.role.internal")
        self.assertEqual(role_.location_level.name, "Region")

    def test_run_role_migrations(self):
        domino_role = create_domino_role()

        run_role_migrations()

        role = Role.objects.get(name=domino_role.name)
        self.assertEqual(role.role_type, "admin.role.internal")
        self.assertEqual(role.location_level.name, "Region")
        self.assertEqual(role.categories.count(), 2)
