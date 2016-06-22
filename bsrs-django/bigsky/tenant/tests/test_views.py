import json

from rest_framework.test import APITestCase

from model_mommy import mommy

from accounting.models import Currency
from dtd.models import TreeData
from person.tests.factory import PASSWORD, create_single_person


class TenantViewTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        self.tenant = self.person.role.tenant
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_tenant_get(self):
        response = self.client.get('/api/admin/tenant/get/')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.tenant.id))
        self.assertEqual(data['company_code'], self.tenant.company_code)
        self.assertEqual(data['company_name'], self.tenant.company_name)
        self.assertEqual(data['dashboard_text'], self.tenant.dashboard_text)
        self.assertEqual(data['dt_start'], str(self.tenant.dt_start.id))
        self.assertEqual(data['default_currency'], str(self.tenant.default_currency.id))
        self.assertEqual(data['test_mode'], self.tenant.test_mode)

    def test_tenant_put(self):
        dtd = mommy.make(TreeData)
        currency = mommy.make(Currency, code='FOO')
        updated_data = {
            'id': str(self.tenant.id),
            'company_code': 'foo',
            'company_name': 'bar',
            'dashboard_text': 'biz',
            'dt_start': str(dtd.id),
            'default_currency': str(currency.id),
            'test_mode': False
        }

        response = self.client.put('/api/admin/tenant/put/', updated_data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.tenant.id))
        self.assertEqual(data['company_code'], updated_data['company_code'])
        self.assertEqual(data['company_name'], updated_data['company_name'])
        self.assertEqual(data['dashboard_text'], updated_data['dashboard_text'])
        self.assertEqual(data['dt_start'], updated_data['dt_start'])
        self.assertEqual(data['default_currency'], updated_data['default_currency'])
        self.assertEqual(data['test_mode'], updated_data['test_mode'])

    def test_detail(self):
        response = self.client.get('/api/admin/tenant/{}/'.format(self.tenant.id))
        self.assertEqual(response.status_code, 405)

    def test_list(self):
        response = self.client.get('/api/admin/tenant/')
        self.assertEqual(response.status_code, 405)

    def test_create(self):
        response = self.client.post('/api/admin/tenant/')
        self.assertEqual(response.status_code, 405)

    def test_update(self):
        response = self.client.put('/api/admin/tenant/{}/'.format(self.tenant.id))
        self.assertEqual(response.status_code, 405)

    def test_partial_update(self):
        response = self.client.patch('/api/admin/tenant/{}/'.format(self.tenant.id))
        self.assertEqual(response.status_code, 405)

    def test_delete(self):
        response = self.client.delete('/api/admin/tenant/{}/'.format(self.tenant.id))
        self.assertEqual(response.status_code, 405)
