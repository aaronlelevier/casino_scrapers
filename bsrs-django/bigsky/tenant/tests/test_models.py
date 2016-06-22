from accounting.models import Currency
from tenant.models import Tenant


class TenantTests(TestCase):

    def test_defaults(self):
        tenant = mommy.make(Tenant)
        usd = Currency.objects.default()

        self.assertTrue(tenant.company_code)
        self.assertTrue(tenant.company_name)
        self.assertEqual(tenant.dashboard_text, "Welcome")
        self.assertIsNone(tenant.dt_start)
        self.assertEqual(tenant.default_currency, usd)
        self.assertTrue(tenant.test_mode)
