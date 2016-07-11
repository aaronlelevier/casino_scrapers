from django.conf import settings
from django.test import TestCase

from dtd.models import TreeData, DTD_START_ID
from dtd.tests.factory import create_tree_data
from tenant.models import Tenant
from tenant.tests import factory


class TenantTests(TestCase):

    def test_get_or_create(self):
        create_tree_data(id=DTD_START_ID)

        ret = factory.get_or_create_tenant()

        self.assertIsInstance(ret, Tenant)
        self.assertIsInstance(ret.dt_start, TreeData)
        # get-or-create, so 2nd call returns original
        ret_two = factory.get_or_create_tenant()
        self.assertEqual(ret, ret_two)
        # fields
        self.assertEqual(ret.company_name, settings.DEFAULT_TENANT_COMPANY_NAME)
        self.assertEqual(ret.company_code, settings.DEFAULT_TENANT_COMPANY_CODE)
