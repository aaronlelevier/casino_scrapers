import uuid

from model_mommy import mommy
from rest_framework.test import APITestCase

from category.tests.factory import create_single_category
from location.models import Location, LocationLevel
from location.tests.factory import create_location
from person.models import Person
from person.serializers import RoleCreateUpdateSerializer, PersonUpdateSerializer
from person.tests.factory import PASSWORD, create_single_person, create_role
from utils.tests.mixins import MockPermissionsAllowAnyMixin


class RoleLocationValidatorTests(MockPermissionsAllowAnyMixin, APITestCase):

    def setUp(self):
        super(RoleLocationValidatorTests, self).setUp()
        self.role = create_role()
        self.location = create_location(location_level=self.role.location_level)
        self.person = create_single_person()
        # data
        serializer = PersonUpdateSerializer(self.person)
        self.data = serializer.data
        # login
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        super(RoleLocationValidatorTests, self).tearDown()
        self.client.logout()

    def test_location_level_not_equal_init_role(self):
        location_level = mommy.make(LocationLevel)
        location = mommy.make(Location, location_level=location_level)
        self.assertNotEqual(self.person.role.location_level, location_level)
        self.data['locations'].append(str(location.id))

        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertNotIn(
            location.id,
            Person.objects.get(id=self.data['id']).locations.values_list('id', flat=True)
        )

    def test_location_level_not_equal_new_role(self):
        location = mommy.make(Location, location_level=self.person.role.location_level)
        self.data['locations'].append(str(location.id))
        location_level = mommy.make(LocationLevel)
        new_role = create_role(name='new', location_level=location_level)
        self.data['role'] = str(new_role.id)

        response = self.client.put('/api/admin/people/{}/'.format(self.person.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertNotIn(
            location.id,
            Person.objects.get(id=self.data['id']).locations.values_list('id', flat=True)
        )


class RoleCategoryValidatorTests(MockPermissionsAllowAnyMixin, APITestCase):

    def setUp(self):
        super(RoleCategoryValidatorTests, self).setUp()
        self.parent_category = create_single_category()
        self.child_category = create_single_category(parent=self.parent_category)
        # data
        self.role = create_role()
        serializer = RoleCreateUpdateSerializer(self.role)
        self.data = serializer.data
        # Login
        self.person = create_single_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        super(RoleCategoryValidatorTests, self).tearDown()
        self.client.logout()

    def test_validation__create(self):
        role_name = 'Serious Role'
        self.data.update({
            'id': uuid.uuid4(),
            'name': role_name,
            'categories': [str(self.child_category.id)]
        })

        response = self.client.post('/api/admin/roles/', self.data, format='json')

        self.assertEqual(response.status_code, 400)

    def test_validation__update(self):
        [self.role.categories.remove(x) for x in self.role.categories.all()]
        self.data['categories'] = [str(self.child_category.id)]

        response = self.client.put('/api/admin/roles/{}/'.format(self.role.id),
            self.data, format='json')

        self.assertEqual(response.status_code, 400)
