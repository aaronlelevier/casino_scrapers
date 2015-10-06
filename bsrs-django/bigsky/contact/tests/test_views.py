import json

from rest_framework import status
from rest_framework.test import APITestCase
from model_mommy import mommy

from contact.models import PhoneNumber, Address, Email
from contact.tests.factory import create_person_and_contacts
from person.models import Person
from person.tests.factory import PASSWORD, create_person, create_role


class PhoneNumberViewSetTests(APITestCase):

    def setUp(self):
        self.person = create_person()
        self.phone_number = mommy.make(PhoneNumber, person=self.person)
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get('/api/admin/phone_numbers/{}/'.format(self.phone_number.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['number'], self.phone_number.number)

    def test_list(self):
        # have 2 ph #'s total
        mommy.make(PhoneNumber, person=self.person)
        response = self.client.get('/api/admin/phone_numbers/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content.decode('utf8'))
        numbers = data['results']
        self.assertEqual(len(numbers), 2)


class PhoneNumberFilterTests(APITestCase):

    def setUp(self):
        # Role
        self.role = create_role()
        # Person Records w/ specific Username
        for i in range(15):
            name = self._get_name(i)
            person = Person.objects.create_user(name, 'myemail@mail.com', PASSWORD,
                first_name=name, role=self.role)
            # Contact Info
            create_person_and_contacts(person)

        self.people = Person.objects.count()
        # Login
        self.person = create_person(username='aaron')
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    @staticmethod
    def _get_name(record):
        # Generate regarless of letter case name/username function 
        # for "ordering" tests
        if record % 2 == 0:
            return "wat{}".format(chr(65+record))
        else:
            return "waT{}".format(chr(65+record))

    def test_related_filter(self):
        response = self.client.get('/api/admin/phone_numbers/?person__username={}'
            .format(self.person.username))
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(
            data['count'],
            PhoneNumber.objects.filter(person__username=self.person.username).count()
        )



class PhoneNumberTypeViewSetTests(APITestCase):

    def setUp(self):
        self.person = create_person()
        self.phone_number = mommy.make(PhoneNumber, person=self.person)
        self.type = self.phone_number.type
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get('/api/admin/phone_numbers/{}/'.format(self.phone_number.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['type'], str(self.type.pk))

    def test_list(self):
        # have 2 ph #'s total
        ph2 = mommy.make(PhoneNumber, person=self.person)
        type2 = ph2.type

        response = self.client.get('/api/admin/phone_number_types/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content.decode('utf8'))
        numbers = data['results']
        self.assertEqual(len(numbers), 2)


class AddressTests(APITestCase):

    def setUp(self):
        self.person = create_person()
        self.address = mommy.make(Address, person=self.person)
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get('/api/admin/addresses/{}/'.format(self.address.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.address.pk))


class EmailTests(APITestCase):

    def setUp(self):
        self.person = create_person()
        self.email = mommy.make(Email, person=self.person)
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()

    def test_get(self):
        response = self.client.get('/api/admin/emails/{}/'.format(self.email.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(data['id'], str(self.email.pk))
