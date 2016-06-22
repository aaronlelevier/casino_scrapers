
from person.tests.factory import PASSWORD, create_single_person


class TenantViewTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        self.tenant = self.person.role.tenant
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_detail(self):
        response = self.client.get('/api/general-settings/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.tenant.id))
        self.assertEqual(data['company_code'], self.tenant.company_code)
        self.assertEqual(data['company_name'], self.tenant.company_name)
        self.assertEqual(data['dashboard_text'], self.tenant.dashboard_text)
        self.assertEqual(data['dt_start'], str(self.tenant.dt_start.id))
        self.assertEqual(data['default_currency'], str(self.tenant.default_currency.id))
        self.assertEqual(data['test_mode'], self.tenant.test_mode)
