from django.conf import settings
from django.test import TestCase

from contact.models import (
    Email, EmailType, Address, AddressType, PhoneNumber, PhoneNumberType, State, Country)
from dtd.models import TreeData, DTD_START_KEY
from dtd.tests.factory import create_tree_data
from person.models import Person
from person.tests.factory import create_single_person
from tenant.models import Tenant
from tenant.tests import factory


class TenantTests(TestCase):

    def test_get_or_create(self):
        create_tree_data(key=DTD_START_KEY)

        ret = factory.get_or_create_tenant()

        self.assertIsNone(ret.scid)
        self.assertIsInstance(ret, Tenant)
        self.assertIsInstance(ret.dt_start, TreeData)
        self.assertEqual(ret.company_name, settings.DEFAULT_TENANT_COMPANY_NAME)
        self.assertTrue(ret.company_code)
        self.assertEqual(ret.countries.count(), 1)
        self.assertEqual(ret.countries.first().states.count(), 2)
        # contacts
        self.assertIsNone(ret.implementation_contact)
        self.assertIsInstance(ret.implementation_email, Email)
        self.assertIsInstance(ret.implementation_email.type, EmailType)
        self.assertIsInstance(ret.billing_email, Email)
        self.assertIsInstance(ret.billing_email.type, EmailType)
        self.assertIsInstance(ret.billing_phone_number, PhoneNumber)
        self.assertIsInstance(ret.billing_phone_number.type, PhoneNumberType)
        self.assertIsInstance(ret.billing_address, Address)
        self.assertIsInstance(ret.billing_address.type, AddressType)
        self.assertIsInstance(ret.billing_address.state, State)
        self.assertIsInstance(ret.billing_address.country, Country)
        self.assertEqual(ret.countries.count(), 1)

    def test_id(self):
        ret = factory.get_or_create_tenant()
        # always ends in a 1 b/c this uses: ``utils.helpers.generate_uuid``
        self.assertEqual(str(ret.id)[-1], '1')

    def test_get_existing(self):
        ret = factory.get_or_create_tenant()
        ret_two = factory.get_or_create_tenant()
        self.assertEqual(ret, ret_two)

    def test_create(self):
        ret = factory.get_or_create_tenant()
        ret_two = factory.get_or_create_tenant('foo')
        self.assertNotEqual(ret, ret_two)

    def test_implementation_contact(self):
        person = create_single_person()

        ret = factory.get_or_create_tenant(implementation_contact=person)

        self.assertEqual(ret.implementation_contact, person)

    def test_sc_subscriber_post_data(self):
        raw_sc_subscriber_post_data = {
            "PrimaryUser": "foo",
            "Password": "bar",
            "ClientName": "biz",
            "Address1": "9246 Lightwave Ave.",
            "Address2": "",
            "Country": "United States",
            "City": "San Diego",
            "Zip": "92123",
            "Email": "test@email.com",
            "Phone": "858-715-5000",
            "Fax": "858-715-5001",
            "ContactName": "Bob",
            "IsActive": True
        }

        self.assertEqual(factory.SC_SUBSCRIBER_POST_DATA, raw_sc_subscriber_post_data)
