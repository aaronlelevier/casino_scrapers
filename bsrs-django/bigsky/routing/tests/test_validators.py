import json
import uuid

from rest_framework.test import APITestCase

from location.models import Location
from location.tests.factory import create_top_level_location
from person.tests.factory import create_single_person, PASSWORD
from routing.serializers import AssignmentCreateUpdateSerializer
from routing.tests.mixins import ViewTestSetupMixin
from routing.tests.factory import create_ticket_location_filter
from tenant.tests.factory import get_or_create_tenant


class ProfileFilterFieldValidatorTests(ViewTestSetupMixin, APITestCase):

    def setUp(self):
        super(ProfileFilterFieldValidatorTests, self).setUp()

        self.data['id'] = str(uuid.uuid4())
        self.data['description'] = 'foo'
        self.invalid_id= str(uuid.uuid4())
        self.invalid_key = 'biz'
        self.invalid_context = 'foo'
        self.invalid_field = 'bar'
        self.invalid_criteria_id = str(uuid.uuid4())
        self.data['filters'] = [{
            'id': self.invalid_id,
            'key': self.invalid_key,
            'context': self.invalid_context,
            'field': self.invalid_field,
            'criteria': [self.invalid_criteria_id]
        }]

    def test_is_valid_field_filter(self):
        self.data['filters'][0].update({
            'source': self.source.id
        })

        response = self.client.post('/api/admin/assignments/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['filters'][0]['non_field_errors'][0],
            "'{}' is not a valid id for '{}'".format([self.invalid_criteria_id], Location.__name__)
        )

    def test_is_valid_field_filter__uuid_list(self):
        criteria = 'x'
        self.data['filters'][0].update({
            'source': self.source.id,
            'criteria': criteria
        })

        response = self.client.post('/api/admin/assignments/', self.data, format='json')

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
        location_filter.lookups = {'location_level': str(location_level.id)}
        location_filter.save()
        self.assignment.filters.add(location_filter)
        self.data = AssignmentCreateUpdateSerializer(self.assignment).data

        self.data['id'] = str(uuid.uuid4())
        self.data['description'] = 'foo'
        self.data.pop('order', None)
        self.data.pop('tenant', None)

    def test_non_dynamic_filter(self):
        dupe_field = 'priority'
        profile_filter = self.assignment.filters.filter(source__field=dupe_field)[0]
        for f in self.data['filters']:
            if f['id'] == str(profile_filter.id):
                profile_filter_data = f
        self.data['filters'].append(profile_filter_data)

        response = self.client.post('/api/admin/assignments/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['non_field_errors'][0],
            "Duplicate filter(s): {}".format(dupe_field)
        )

    def test_dynamic_filter(self):
        dupe_field = 'location'
        location_filter = self.assignment.filters.filter(source__field=dupe_field)[0]
        for f in self.data['filters']:
            if f['id'] == str(location_filter.id):
                location_filter_data = f
        self.data['filters'].append(location_filter_data)

        response = self.client.post('/api/admin/assignments/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['non_field_errors'][0],
            "Duplicate filter(s): {}-location_level-{}"
                .format(dupe_field, location_filter.lookups['location_level'])
        )


class UniqueByTenantValidatorTests(ViewTestSetupMixin, APITestCase):

    def test_not_unique_by_tenant(self):
        self.assertEqual(self.assignment.order, 1)
        self.data['id'] = str(uuid.uuid4())
        self.data['order'] = 1

        response = self.client.post('/api/admin/assignments/', self.data, format='json')

        self.assertEqual(response.status_code, 400)
        msg = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            msg['non_field_errors'][0],
            "order: '{}' already exists for Tenant: '{}'".format(self.data['order'],
                                                                 self.tenant.id)
        )
        self.assertEqual(
            msg['non_field_errors'][1],
            "description: '{}' already exists for Tenant: '{}'".format(self.data['description'],
                                                                       self.tenant.id)
        )

    def test_unique_by_tenant_but_not_unique_accross_model(self):
        # this is fine, 'order' only needs to be unique by Tenant
        self.assertEqual(self.assignment.order, 1)
        tenant_two = get_or_create_tenant('foo')
        person = create_single_person()
        person.role.tenant = tenant_two
        person.role.save()
        self.client.logout()
        self.client.login(username=person.username, password=PASSWORD)

        self.data['id'] = str(uuid.uuid4())
        self.data['order'] = 1

        response = self.client.post('/api/admin/assignments/', self.data, format='json')

        self.assertEqual(response.status_code, 201)
