from django.test import TestCase

from utils_transform.tperson.models import DominoPerson
from utils_transform.tperson.tests import factory


class FactoryTests(TestCase):

    def test_get_person_none_id_fields(self):
        raw_ret = [f.name for f in DominoPerson._meta.get_fields()
                   if f.name != 'id']

        ret = factory.get_person_none_id_fields()

        self.assertEqual(raw_ret, ret)

    def test_get_random_data(self):
        fields = factory.get_person_none_id_fields()

        ret = factory.get_random_data(fields)

        for f in fields:
            self.assertIsInstance(ret[f], str)
            self.assertEqual(len(ret[f]), 10)

    def test_create_person(self):
        dom_person = factory.create_domino_person()

        self.assertIsInstance(dom_person, DominoPerson)
        self.assertEqual(dom_person.role, factory.ROLE_NAME)
        self.assertEqual(dom_person.status, factory.PERSON_STATUS)
        self.assertEqual(dom_person.auth_amount, factory.AUTH_AMOUNT)
        self.assertEqual(dom_person.phone_number, factory.PHONE_NUMBER)
        self.assertEqual(dom_person.email_address, factory.EMAIL_ADDRESS)
        self.assertEqual(dom_person.sms_address, factory.SMS_ADDRESS)
        self.assertIsNone(dom_person.locations)