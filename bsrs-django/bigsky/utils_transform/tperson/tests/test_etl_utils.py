from decimal import Decimal

from django.conf import settings
from django.test import TestCase

from person.models import Person
from person.tests.factory import create_person_status, create_role
from location.tests.factory import create_location_level
from contact.tests.factory import create_phone_number_type, create_email_type
from utils_transform.tperson.management.commands._etl_utils import create_person, run_person_migrations
from utils_transform.tperson.tests.factory import create_domino_person
from location.models import Location, LocationLevel
from contact.models import PhoneNumber, Email
from accounting.models import Currency

LOCATIONNUMBERS = "11;12;13"
PHONENUMBER = "987-654-3210"
EMAILADDRESS = "emailtest@testee.com"

class EtlUtilTests(TestCase):

    def setUp(self):
        #status required
        create_person_status('admin.person.status.active')
        create_phone_number_type(name='admin.phonenumbertype.telephone')
        create_email_type(name='admin.emailtype.personal')
        create_email_type(name='admin.emailtype.sms')
        Currency.objects.create()
        company_location = Location.objects.create_top_level()
        
        create_role(name='Internal Audit', location_level=company_location.location_level, category=None)
        

    def test_create_person(self):
        domino_person = create_domino_person()
    
        person_ = create_person(domino_person)
        person_location = person_.locations.all()[0]

        self.assertIsInstance(person_, Person)
        self.assertEqual(person_.username, domino_person.username)
        self.assertEqual(person_.role.name, 'Internal Audit')
        self.assertEqual(person_.status.name, 'admin.person.status.active')
        self.assertEqual(person_.middle_initial, domino_person.middle_initial[:1])
        self.assertEqual(person_location.name, settings.LOCATION_TOP_LEVEL_NAME)

    def test_run_person_migrations(self):
        domino_person = create_domino_person()

        run_person_migrations()

        person = Person.objects.get(username__exact=domino_person.username)
        self.assertEqual(person.role.name, 'Internal Audit')
        self.assertEqual(person.status.name, 'admin.person.status.active')
        self.assertEqual(person.auth_amount, Decimal('92826.33'))

    def test_blank_middle_initial(self):
        domino_person = create_domino_person()
        domino_person.middle_initial = None
        
        person_ = create_person(domino_person)

        self.assertEqual(person_.middle_initial, None)

    def test_long_middle_initial(self):
        domino_person = create_domino_person()
        domino_person.middle_initial = "1234567890"
        
        person_ = create_person(domino_person)

        self.assertEqual(person_.middle_initial, domino_person.middle_initial[:1])

    def test_person_location(self):
        domino_person = create_domino_person()
        domino_person.locations = LOCATIONNUMBERS
        domino_person.role = "Store Manager"
        
        store_location_level = create_location_level(name='Store')

        Location.objects.create(location_level=store_location_level, name='loc1', number='11')
        Location.objects.create(location_level=store_location_level, name='loc1', number='12')
        Location.objects.create(location_level=store_location_level, name='loc1', number='13')
        
        create_role(name='Store Manager', location_level=store_location_level, category=None)

        person_ = create_person(domino_person)

        person_location = person_.locations.all()[0]
        
        self.assertIsInstance(person_location, Location)
        self.assertEqual(person_.locations.count(), 3)
        
    def test_person_bad_location(self):
        domino_person = create_domino_person()
        domino_person.locations = '3534534'
        domino_person.role = "Store Manager"
        
        store_location_level = create_location_level(name='Store')

        create_role(name='Store Manager', location_level=store_location_level, category=None)

        person_ = create_person(domino_person)

        self.assertIsNone(person_)
        
    def test_person_missing_location(self):
        domino_person = create_domino_person()
        domino_person.locations = None
        domino_person.role = "Store Manager"
        
        store_location_level = create_location_level(name='Store')

        create_role(name='Store Manager', location_level=store_location_level, category=None)

        person_ = create_person(domino_person)

        self.assertIsNone(person_)
        
    def test_person_extra_location(self):
        domino_person = create_domino_person()
        domino_person.locations = "32344"
        domino_person.role = "Internal Audit"
        
        store_location_level = create_location_level(name='Store')

        create_role(name='Store Manager', location_level=store_location_level, category=None)

        person_ = create_person(domino_person)

        self.assertIsNone(person_)

    def test_person_phonenumber(self):
        domino_person = create_domino_person()
        
        person_ = create_person(domino_person)

        person_phonenumber = person_.phone_numbers.all()[0]
        
        self.assertIsInstance(person_phonenumber, PhoneNumber)
        self.assertEqual(person_phonenumber.number, PHONENUMBER)
        
    def test_person_email(self):
        domino_person = create_domino_person()
        
        person_ = create_person(domino_person)

        person_email_address = person_.emails.all()[0]
        
        self.assertIsInstance(person_email_address, Email)
        self.assertEqual(person_email_address.email, EMAILADDRESS)
        
        