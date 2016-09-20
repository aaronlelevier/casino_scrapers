import json
import uuid

from rest_framework.test import APITestCase

from location.models import Location
from location.tests.factory import create_top_level_location
from person.tests.factory import create_single_person, PASSWORD
from routing.models import Automation
from routing.serializers import AutomationCreateUpdateSerializer
from routing.tests.mixins import ViewTestSetupMixin
from routing.tests.factory import create_ticket_location_filter
from tenant.tests.factory import get_or_create_tenant


class ProfileFilterFieldValidatorTests(ViewTestSetupMixin, APITestCase):

    def setUp(self):
        super(ProfileFilterFieldValidatorTests, self).setUp()

        self.data['id'] = str(uuid.uuid4())
        self.data['description'] = 'foo'
        self.invalid_id= str(uuid.uuid4())
        self.invalid_criteria_id = str(uuid.uuid4())
        self.data['filters'] = [{
            'id': str(uuid.uuid4()),
            'source': str(self.source.id),
            'criteria': [str(self.location.id)]
        }]

    def test_is_valid_field_filter(self):
        self.data['filters'][0].update({
            'criteria': [self.invalid_criteria_id]
        })

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['filters'][0]['non_field_errors'][0],
            "'{}' is not a valid id for '{}'".format([self.invalid_criteria_id], Location.__name__)
        )

    def test_is_valid_field_filter__uuid_list(self):
        criteria = 'x'
        self.data['filters'][0].update({
            'criteria': criteria
        })

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['filters'][0]['non_field_errors'][0],
            "'{}' not valid. Must be a list of UUIDs".format(criteria)
        )


class AvailableFilterValidatorTests(ViewTestSetupMixin, APITestCase):

    def setUp(self):
        super(AvailableFilterValidatorTests, self).setUp()

        location_filter = create_ticket_location_filter()
        location_level = create_top_level_location().location_level
        # simulate what an existing location_filter.lookup will hold
        location_filter.lookups = {'id': str(location_level.id)}
        location_filter.save()
        self.automation.filters.add(location_filter)
        self.data = AutomationCreateUpdateSerializer(self.automation).data

        self.data['id'] = str(uuid.uuid4())
        self.data['description'] = 'foo'
        self.data.pop('tenant', None)

    def test_non_dynamic_filter(self):
        dupe_field = 'priority'
        self.data['filters'] = [{
            'id': str(uuid.uuid4()),
            'source': str(self.priority_af.id),
            'criteria': [str(self.ticket_priority.id)]
        },{
            'id': str(uuid.uuid4()),
            'source': str(self.priority_af.id),
            'criteria': [str(self.ticket_priority.id)]
        }]

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['non_field_errors'][0],
            "Duplicate filter(s): {}".format(dupe_field)
        )

    def test_dynamic_filter(self):
        dupe_field = 'location'
        self.data['filters'] = [{
            'id': str(uuid.uuid4()),
            'source': str(self.source.id),
            'criteria': [str(self.location.id)],
            'lookups': {'id': str(self.location.location_level.id)}
        },{
            'id': str(uuid.uuid4()),
            'source': str(self.source.id),
            'criteria': [str(self.location.id)],
            'lookups': {'id': str(self.location.location_level.id)}
        }]

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['non_field_errors'][0],
            "Duplicate filter(s): {}-location_level-{}"
                .format(dupe_field, str(self.location.location_level.id))
        )


class UniqueByTenantValidatorTests(ViewTestSetupMixin, APITestCase):

    def test_not_unique_by_tenant(self):
        self.data['id'] = str(uuid.uuid4())

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['non_field_errors'][0],
            "description: '{}' already exists for Tenant: '{}'".format(self.data['description'],
                                                                       self.tenant.id)
        )

    def test_unique_by_tenant_but_not_unique_accross_model(self):
        # this is fine, 'description' only needs to be unique by Tenant
        tenant_two = get_or_create_tenant('foo')
        person = create_single_person()
        person.role.tenant = tenant_two
        person.role.save()
        self.client.logout()
        self.client.login(username=person.username, password=PASSWORD)

        self.data['id'] = str(uuid.uuid4())

        response = self.client.post('/api/admin/automations/', self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        # automation is unique by tenant,description
        automation = Automation.objects.get(id=data['id'])
        self.assertEqual(automation.description, self.automation.description)
        self.assertNotEqual(automation.tenant, self.automation.tenant)
