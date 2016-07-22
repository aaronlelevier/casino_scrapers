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
        self.assertEqual(ret.company_name, settings.DEFAULT_TENANT_COMPANY_NAME)
        self.assertTrue(ret.company_code)

    def test_id(self):
        ret = factory.get_or_create_tenant()
        # always ends in a 1 b/c this uses: ``utils.helpers.generate_uuid``
        self.assertEqual(str(ret.id)[-1], '1')

    def test_get_existing(self):
        ret = factory.get_or_create_tenant()
        ret_two = factory.get_or_create_tenant()
        self.assertEqual(ret, ret_two)

    def test_create(self):
        ret = factory.get_or_create_tenant()
        ret_two = factory.get_or_create_tenant('foo')
        self.assertNotEqual(ret, ret_two)
