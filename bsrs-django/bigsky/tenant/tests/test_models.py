from django.test import TestCase

from accounting.models import Currency
from tenant.models import Tenant
from tenant.tests.factory import get_or_create_tenant

class TenantTests(TestCase):

    def test_sc_fields(self):
        self.assertEqual(
            Tenant.SC_FIELDS,
            ['company_code', 'company_name', 'billing_contact', 'billing_address',
             'billing_email', 'billing_phone_number', 'implementation_contact_initial',
             'implementation_email']
        )

    def test_defaults(self):
        tenant = get_or_create_tenant()
        usd = Currency.objects.default()

        self.assertTrue(tenant.company_code)
        self.assertTrue(tenant.company_name)
        self.assertEqual(tenant.dashboard_text, "Welcome")
        self.assertIsNone(tenant.dt_start)
        self.assertEqual(tenant.default_currency, usd)
        self.assertFalse(tenant.test_mode)

    def test_sc_post_data(self):
        tenant = get_or_create_tenant()
        raw_ret = {
            "Address1": tenant.billing_address.address,
            "Address2": "",
            "Country": tenant.billing_address.country.common_name,
            "City": tenant.billing_address.city,
            "Zip": tenant.billing_address.postal_code,
            "Email": tenant.implementation_email.email,
            "Phone": tenant.billing_phone_number.number,
            "Fax": "",
            "ContactName": tenant.implementation_contact_initial,
        }

        ret = tenant.sc_post_data

        self.assertEqual(ret, raw_ret)
