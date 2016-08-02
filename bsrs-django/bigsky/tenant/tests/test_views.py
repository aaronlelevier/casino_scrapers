import json

from rest_framework.test import APITestCase

from model_mommy import mommy

from accounting.models import Currency
from dtd.models import TreeData, DTD_START_KEY
from person.tests.factory import PASSWORD, create_single_person
from tenant.models import Tenant


class TenantViewTests(APITestCase):

    def setUp(self):
        mommy.make(TreeData, key=DTD_START_KEY)
        self.person = create_single_person()
        self.tenant = self.person.role.tenant

        self.person_two = create_single_person()
        self.tenant_two = mommy.make(Tenant)
        self.person_two.role.tenant = self.tenant_two
        self.person_two.role.save()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_detail(self):
        response = self.client.get('/api/admin/tenant/{}/'.format(self.tenant.id))

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.tenant.id))
        self.assertEqual(data['company_code'], self.tenant.company_code)
        self.assertEqual(data['company_name'], self.tenant.company_name)
        self.assertEqual(data['dashboard_text'], self.tenant.dashboard_text)
        self.assertEqual(data['dt_start_id'], str(self.tenant.dt_start.id))
        self.assertEqual(data['dt_start']['id'], str(self.tenant.dt_start.id))
        self.assertEqual(data['dt_start']['key'], self.tenant.dt_start.key)
        self.assertEqual(data['default_currency_id'], str(self.tenant.default_currency.id))
        self.assertEqual(data['test_mode'], self.tenant.test_mode)

    def test_update(self):
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

        response = self.client.put('/api/admin/tenant/{}/'.format(self.tenant.id), updated_data, format='json')

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.tenant.id))
        self.assertEqual(data['company_code'], updated_data['company_code'])
        self.assertEqual(data['company_name'], updated_data['company_name'])
        self.assertEqual(data['dashboard_text'], updated_data['dashboard_text'])
        self.assertEqual(data['dt_start'], updated_data['dt_start'])
        self.assertEqual(data['default_currency'], updated_data['default_currency'])
        self.assertEqual(data['test_mode'], updated_data['test_mode'])

    def test_list(self):
        response = self.client.get('/api/admin/tenant/')
        self.assertEqual(response.status_code, 405)

    def test_create(self):
        response = self.client.post('/api/admin/tenant/')
        self.assertEqual(response.status_code, 405)

    def test_delete(self):
        response = self.client.delete('/api/admin/tenant/{}/'.format(self.tenant.id))
        self.assertEqual(response.status_code, 405)

    def test_permissions__if_diff_tenant(self):
        self.client.logout()
        self.client.login(username=self.person_two.username, password=PASSWORD)
        self.assertNotEqual(self.person.role.tenant, self.person_two.role.tenant)

        response = self.client.get('/api/admin/tenant/{}/'.format(self.tenant.id))

        self.assertEqual(response.status_code, 403)

    def test_permissions__diff_tenant_ok_if_staff(self):
        self.client.logout()
        self.person_two.is_staff = True
        self.person_two.save()
        self.client.login(username=self.person_two.username, password=PASSWORD)
        self.assertNotEqual(self.person.role.tenant, self.person_two.role.tenant)

        response = self.client.get('/api/admin/tenant/{}/'.format(self.tenant.id))

        self.assertEqual(response.status_code, 200)
