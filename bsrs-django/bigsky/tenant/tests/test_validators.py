import json
import uuid

from rest_framework.test import APITestCase

from person.tests.factory import create_single_person, PASSWORD
from tenant.serializers import TenantCreateSerializer
from tenant.validators import TenantEmailValidator
from tenant.tests.factory import get_or_create_tenant


class TenantEmailValidatorTests(APITestCase):

    def setUp(self):
        self.person = create_single_person()
        self.tenant = get_or_create_tenant()
        # login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_setup(self):
        self.assertIsInstance(
            self.tenant.implementation_email.email, str)

    def test_post__duplicate_email_raises_error(self):
        email = self.tenant.implementation_email.email
        # data
        new_id = str(uuid.uuid4())
        new_company_code = 'foo'
        new_company_name = 'bar'
        init_data = TenantCreateSerializer(self.tenant).data
        init_data.update({
            'id': new_id,
            'company_code': new_company_code,
            'company_name': new_company_name
        })
        self.assertEqual(
            init_data['implementation_email']['email'],
            email
        )

        response = self.client.post('/api/admin/tenants/', init_data,
                                    format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            json.loads(response.content.decode('utf8'))['non_field_errors'][0],
            TenantEmailValidator.message.format(email=email)
        )
