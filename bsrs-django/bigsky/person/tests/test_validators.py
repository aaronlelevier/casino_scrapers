import uuid

from rest_framework.test import APITestCase

from category.tests.factory import create_single_category
from person.serializers import RoleCreateSerializer
from person.tests.factory import PASSWORD, create_single_person, create_role


class RoleCategoryValidatorTests(APITestCase):

    def setUp(self):
        self.parent_category = create_single_category()
        self.child_category = create_single_category(parent=self.parent_category)
        # data
        self.role = create_role()
        serializer = RoleCreateSerializer(self.role)
        self.data = serializer.data
        # Login
        self.person = create_single_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
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
