import json
import uuid
from rest_framework.test import APITestCase
from person.tests.factory import create_single_person, PASSWORD
from provider.tests.factory import create_providers
from provider.models import Provider
from category.models import Category
from model_mommy import mommy
from django.contrib.auth.models import Permission
from django.contrib import auth


class UserWithPrivilegeProviderTest(APITestCase):
    """
    Scenario 1: Successful request for provider list, with results
    Given a GET request to the /api/providers endpoint with a parameter for: ?category_id=<String> (by trade)
    Then filter the provider data set per subscriber/location by the matching trade (by name)
    When the filtered query set is not empty
    then respond with 200 OK and the result set of providers, include attributes: id, name

    Scenario 2: Successful request for provider list, without any results
    Given a GET request to the /api/providers endpoint with a parameter for: ?category=<String>
    Then filter the provider data set per subscriber/location by the matching trade (by name)
    When the filtered query set is empty
    Then respond with a 200 OK and an empty array in the JSON body

    Scenario 3: Successful request for provider list, with results
    Given a GET request to the /api/providers endpoint with a parameter for: ?category=<id> (by trade)
    When the request include a param to search by a provider's name, &name__icontains=<String>
    Then filter the provider data set per subscriber/location by the matching trade (by name)
    And the result set is filtered by providers with matching names
    """

    def setUp(self):
        self.person = create_single_person()
        permission = mommy.make(Permission, codename='view_provider')
        self.person.role.group.permissions.add(permission)
        self.client.login(username=self.person.username, password=PASSWORD)
        create_providers()
        self.category_id = Provider.objects.last().category.id

    def tearDown(self):
        self.client.logout()


    def test_provider_filtered_by_category(self):
        self.assertIn('view_provider', self.person.permissions)

        response = self.client.get('/api/providers/?category={id}'.format(id=self.category_id))

        self.assertIn('application/json', response._headers['content-type'][1])
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['count'], 2)

        for p in data['results']:
            provider = Provider.objects.get(id=p['id'])
            self.assertEqual(provider.category.id, self.category_id)

    def test_provider_data_includes_id_and_name(self):
        self.assertIn('view_provider', self.person.permissions)

        response = self.client.get('/api/providers/?category={id}'.format(id=self.category_id))
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(response.status_code, 200)
        self.assertIn('id', data['results'][0])
        self.assertIn('name', data['results'][0])

    def test_provider_data_is_empty_with_non_matching_trade(self):
        self.assertIn('view_provider', self.person.permissions)
        category_id = mommy.make(Category).id

        response = self.client.get('/api/providers/?category={id}'.format(id=category_id))
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['count'], 0)

    def test_provider_filtered_by_category_and_name(self):
        self.assertIn('view_provider', self.person.permissions)
        name = Provider.objects.last().name
        query = name[:-1]

        response = self.client.get('/api/providers/?category={id}&name__icontains={s}'.format(id=self.category_id, s=query))
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(data['count'], 1)
        self.assertEqual(data['results'][0]['name'], name)

    def test_provider_filtered_with_no_matching_name(self):
        self.assertIn('view_provider', self.person.permissions)

        response = self.client.get('/api/providers/?category={id}&name__icontains={s}'.format(id=self.category_id, s='GGG'))
        data = json.loads(response.content.decode('utf8'))

        self.assertEqual(data['count'], 0)

    def test_provider_must_have_category_param(self):
        response = self.client.get('/api/providers/')

        self.assertEqual(response.status_code, 400)

        msg = json.loads(response.content.decode('utf-8'))[0]
        self.assertEqual(msg, 'errors.client.category_param_missing')


    def test_provider_with_invalid_category_id_is_a_bad_request(self):
        response = self.client.get('/api/providers/?category={id}'.format(id=uuid.uuid4()))

        self.assertEqual(response.status_code, 400)

        msg = json.loads(response.content.decode('utf-8'))[0]
        self.assertEqual(msg, 'errors.client.category_not_found')


class UserUnauthenticatedProviderTest(APITestCase):
    """
    Scenario 4: Failed request for provider list, invalid/missing Denali token/session
    Given a POST request to the /api/providers endpoint
    When the user's session or csrf cookies are not valid
    Then respond with 403, Forbidden (no body)
    """

    def setUp(self):
        self.person = create_single_person()
        create_providers()
        self.category_id = Provider.objects.last().category.id

    def test_unauthenticated_request_for_provider_list(self):
        person = auth.get_user(self.client)
        self.assertFalse(person.is_authenticated())

        response = self.client.get('/api/providers/?category={id}'.format(id=self.category_id))

        self.assertEqual(response.status_code, 403)


class UserWithoutPrivilegeProviderTest(APITestCase):
    """
    Scenario 5: Failed request for provider list, insufficient privilege(s)
    Given a POST request to the /api/providers endpoint
    When the user does not have view_provider privileges
    Then respond with 404, Not Found
    """

    def setUp(self):
        self.person = create_single_person()
        self.client.login(username=self.person.username, password=PASSWORD)
        create_providers()
        self.category_id = Provider.objects.last().category.id

    def tearDown(self):
        self.client.logout()


    def test_insufficient_permission_to_view(self):
        self.assertTrue(self.person.is_authenticated())
        self.assertNotIn('view_provider', self.person.permissions)

        response = self.client.get('/api/providers/?category={id}'.format(id=self.category_id))

        self.assertEqual(response.status_code, 404)

