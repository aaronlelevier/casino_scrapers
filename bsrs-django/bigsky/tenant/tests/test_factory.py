from django.test import TestCase

from dtd.models import TreeData
from tenant.models import Tenant
from tenant.tests import factory


class TenantTests(TestCase):

    def test_get_or_create(self):
        ret = factory.get_or_create_tenant()

        self.assertIsInstance(ret, Tenant)
        self.assertIsInstance(ret.dt_start, TreeData)

        # get-or-create, so 2nd call returns original
        ret_two = factory.get_or_create_tenant()
        self.assertEqual(ret, ret_two)
