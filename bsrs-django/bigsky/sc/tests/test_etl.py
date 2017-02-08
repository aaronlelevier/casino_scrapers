import json
import random
import uuid

from django.test import TestCase
from mock import patch
from pretend import stub
from rest_framework.exceptions import ValidationError
from rest_framework.test import APITestCase

from category.tests.factory import create_single_category, get_sc_category_or_none
from contact.models import (Address, AddressType, Email, PhoneNumber,
                            PhoneNumberType)
from contact.tests.factory import (create_address_type, create_contact,
                                   create_contact_country,
                                   create_contact_state,
                                   create_phone_number_type)
from location.models import LOCATION_DISTRICT, LOCATION_REGION, Location
from location.serializers import LocationCreateUpdateSerializer
from location.tests.factory import SAN_DIEGO, create_locations
from person.tests.factory import PASSWORD, create_single_person
from sc.etl import (LocationEtlAdapter, TenantEtlAdapter, TenantEtlDataAdapter,
                    WorkOrderEtlDataAdapter)
from sc.oauth import DEV_SC_LOCATIONS_URL, DEV_SC_SUBSCRIBERS_URL, DEV_SC_WORKORDERS_URL
from tenant.tests.factory import get_or_create_tenant
from ticket.tests.factory import create_ticket
from utils import create
from utils.tests.mixins import MockPermissionsAllowAnyMixin
from work_order.tests.factory import create_work_order


class SetupMixin(object):

    def setUp(self):
        super(SetupMixin, self).setUp()

        create_locations()
        self.store = Location.objects.get(name=SAN_DIEGO)
        self.district = self.store.parents.filter(location_level__name=LOCATION_DISTRICT).first()
        self.region = self.district.parents.filter(location_level__name=LOCATION_REGION).first()
        # phone
        telephone_phone_type = create_phone_number_type(PhoneNumberType.TELEPHONE)
        self.phone = create_contact(PhoneNumber, self.store, telephone_phone_type)
        fax_phone_type = create_phone_number_type(PhoneNumberType.FAX)
        self.fax = create_contact(PhoneNumber, self.store, fax_phone_type)
        # address
        store_address_type = create_address_type(AddressType.STORE)
        self.address = create_contact(Address, self.store, store_address_type)
        self.address.state = create_contact_state()
        self.address.country = create_contact_country()
        self.address.save()
        # email
        self.email = create_contact(Email, self.store)
        self.person = create_single_person()
        self.tenant = self.person.role.tenant


class LocationEtlAdapterTests(SetupMixin, TestCase):

    def test_post_data(self):
        self.assertEqual(self.address.type.name, AddressType.STORE)
        adapter = LocationEtlAdapter(self.store)

        ret = adapter.data

        self.assertEqual(ret['StoreId'], self.store.number)
        self.assertEqual(ret['Name'], self.store.name)
        self.assertIsNone(ret['Latitude'])
        self.assertIsNone(ret['Longitude'])
        self.assertIsNone(ret['Distance'])
        self.assertEqual(ret['Address1'], self.address.address)
        self.assertIsNone(ret['Address2'])
        self.assertEqual(ret['City'], self.address.city)
        self.assertEqual(ret['State'], self.address.state.state_code)
        self.assertEqual(ret['Region'], self.region.name)
        self.assertEqual(ret['District'], self.district.name)
        self.assertEqual(ret['Zip'], self.address.postal_code)
        self.assertEqual(ret['Country'], self.address.country.common_name)
        self.assertIsNone(ret['ClosedDate'])
        self.assertIsNone(ret['OpenDate'])
        self.assertEqual(ret['Email'], self.email.email)
        self.assertEqual(ret['Phone'], self.phone.number)
        self.assertIsNone(ret['Contact'])
        self.assertEqual(ret['FaxNumber'], self.fax.number)
        self.assertEqual(ret['LocationTypeId'], str(self.store.location_level.id))

    def test_post_data__no_district_or_region(self):
        Location.objects.get_all_parents(self.store).delete()
        adapter = LocationEtlAdapter(self.store)

        ret = adapter.data

        self.assertIsNone(ret['Region'])
        self.assertIsNone(ret['District'])

    def test_post_data__no_store_address_type(self):
        self.store.addresses.clear()
        adapter = LocationEtlAdapter(self.store)

        ret = adapter.data

        self.assertIsNone(ret['Address1'])
        self.assertIsNone(ret['Address2'])
        self.assertIsNone(ret['City'])
        self.assertIsNone(ret['State'])
        self.assertIsNone(ret['Zip'])
        self.assertIsNone(ret['Country'])

    def test_post_data__no_email(self):
        self.store.emails.clear()
        adapter = LocationEtlAdapter(self.store)

        ret = adapter.data

        self.assertIsNone(ret['Email'])

    def test_post_data__no_phone_numbers(self):
        self.store.phone_numbers.clear()
        adapter = LocationEtlAdapter(self.store)

        ret = adapter.data

        self.assertIsNone(ret['Phone'])
        self.assertIsNone(ret['FaxNumber'])

    @patch("sc.etl.BsOAuthSession.post")
    def test_post(self, mock_func):
        self.assertTrue(self.store.is_store)
        scid = random.randint(0,100)
        mock_func.return_value = stub(status_code=201, content=json.dumps(scid).encode('utf8'))
        adapter = LocationEtlAdapter(self.store)
        self.assertIsNone(self.store.scid)

        response = adapter.post()

        self.assertEqual(
            mock_func.call_args[0][0],
            adapter.list_url
        )
        self.assertEqual(
            sorted(mock_func.call_args[1]['data'].keys()),
            sorted(adapter.data.keys())
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.store.scid, scid)

    @patch("sc.etl.BsOAuthSession.post")
    def test_post__dont_sync_to_SC_if_not_store(self, mock_func):
        adapter = LocationEtlAdapter(self.region)
        self.assertFalse(self.region.is_store)

        adapter.post()

        self.assertFalse(mock_func.called)

    @patch("sc.etl.BsOAuthSession.put")
    def test_put(self, mock_func):
        mock_func.return_value = stub(status_code=200)
        self.assertTrue(self.store.is_store)
        adapter = LocationEtlAdapter(self.store)

        response = adapter.put()

        self.assertEqual(
            mock_func.call_args[0][0],
            adapter.detail_url
        )
        self.assertEqual(
            sorted(mock_func.call_args[1]['data'].keys()),
            sorted(adapter.data.keys())
        )
        self.assertEqual(response.status_code, 200)

    @patch("sc.etl.BsOAuthSession.put")
    def test_put__dont_sync_to_SC_if_not_store(self, mock_func):
        adapter = LocationEtlAdapter(self.region)
        self.assertFalse(self.region.is_store)

        adapter.put()

        self.assertFalse(mock_func.called)

    def test_list_url(self):
        raw_ret = "{}?impersonateUserInfo[username]={}".format(
            DEV_SC_LOCATIONS_URL,
            self.store.location_level.tenant.implementation_email.email)

        ret = LocationEtlAdapter(self.store).list_url

        self.assertEqual(ret, raw_ret)

    def test_detail_url(self):
        self.store.scid = 123
        raw_ret = "{}/{}".format(DEV_SC_LOCATIONS_URL, self.store.scid)

        ret = LocationEtlAdapter(self.store).detail_url

        self.assertEqual(ret, raw_ret)

    @patch("sc.etl.BsOAuthSession.get")
    def test_get(self, mock_func):
        adapter = LocationEtlAdapter(self.store)
        mock_func.return_value = stub(status_code=200, content=json.dumps(adapter.data).encode('utf8'))
        self.assertTrue(self.store.is_store)

        response = adapter.get()

        self.assertEqual(
            mock_func.call_args[0][0],
            adapter.detail_url
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.content)


class LocationScApiTests(MockPermissionsAllowAnyMixin, SetupMixin, APITestCase):

    def setUp(self):
        super(LocationScApiTests, self).setUp()

        # Login
        self.client.login(username=self.person.username, password=PASSWORD)
        # Data: base data to update unique fields on and POST to test CREATEs
        serializer = LocationCreateUpdateSerializer(self.store)
        self.data = serializer.data

    def tearDown(self):
        super(LocationScApiTests, self).tearDown()

        self.client.logout()

    def test_setup(self):
        self.assertIsInstance(self.district, Location)
        self.assertIsInstance(self.region, Location)

    @patch("location.serializers.LocationEtlAdapter.post")
    def test_post(self, mock_func):
        # location.scid to set
        scid = 1
        mock_func.return_value = scid
        self.data.update({
            'id': str(uuid.uuid4()),
            'number': create._generate_chars()
        })

        response = self.client.post('/api/admin/locations/', self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 201)
        location = Location.objects.get(id=data['id'])
        self.assertTrue(data['phone_numbers'])
        self.assertTrue(data['emails'])
        self.assertTrue(data['addresses'])
        self.assertTrue(data['parents'])
        # mock SC API POST
        self.assertTrue(mock_func.called)

    @patch("location.serializers.LocationEtlAdapter.put")
    def test_put(self, mock_func):
        self.data.update({
            'name': self.store.name[:3]
        })

        response = self.client.put('/api/admin/locations/{}/'.format(self.store.id),
            self.data, format='json')

        data = json.loads(response.content.decode('utf8'))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['phone_numbers'])
        self.assertTrue(data['emails'])
        self.assertTrue(data['addresses'])
        self.assertTrue(data['parents'])
        # mock SC API POST
        self.assertTrue(mock_func.called)


class TenantEtlAdapterTests(TestCase):

    def setUp(self):
        self.tenant = get_or_create_tenant()
        self.tenant.scid = None
        self.tenant.save()

        self.adapter = TenantEtlAdapter(self.tenant)

    def test_data(self):
        raw_ret = {
            "Name": self.tenant.company_name,
            "Address1": self.tenant.billing_address.address,
            "Address2": "",
            "Country": self.tenant.billing_address.country.common_name,
            "State": self.tenant.billing_address.state.name,
            "City": self.tenant.billing_address.city,
            "Zip": self.tenant.billing_address.postal_code,
            "Email": self.tenant.implementation_email.email,
            "Phone": self.tenant.billing_phone_number.number,
            "Fax": "",
            "ContactName": self.tenant.implementation_contact_initial,
            "TaxId": "123456789",
            "IsPersonalTaxId": False,
            "SysadminContactFixxbook": {
                "Name": self.tenant.company_name,
                "JobTitle": "admin",
                "Email": self.tenant.implementation_email.email,
                "WorkPhone": self.tenant.billing_phone_number.number,
                "MobilePhone": self.tenant.billing_phone_number.number,
                "Fax": ""
            }
        }

        ret = self.adapter.data

        self.assertEqual(ret, raw_ret)

    def test_list_url(self):
        self.assertEqual(
            self.adapter.list_url,
            DEV_SC_SUBSCRIBERS_URL
        )

    def test_detail_url(self):
        self.assertEqual(
            self.adapter.detail_url,
            "{}/{}/".format(DEV_SC_SUBSCRIBERS_URL, self.tenant.scid)
        )

    @patch("sc.etl.BsOAuthSession.post")
    def test_post(self, mock_func):
        scid = random.randint(0,100)
        response = stub(status_code=201, content=json.dumps({'id': scid}).encode('utf8'))
        mock_func.return_value = response
        self.assertIsNone(self.tenant.scid)
        adapter = TenantEtlAdapter(self.tenant)

        adapter.post()

        self.assertEqual(mock_func.call_args[0][0], adapter.list_url)
        self.assertEqual(
            mock_func.call_args[1]['data'],
            self.adapter.data
        )
        self.assertEqual(self.tenant.scid, scid)
        self.assertEqual(response.status_code, 201)

    @patch("sc.etl.TenantEtlAdapter._send_mail")
    @patch("sc.etl.BsOAuthSession.post")
    def test_post__fails(self, mock_post, mock_send_mail):
        mock_post.return_value = stub(status_code=400)

        response = self.adapter.post()

        self.assertEqual(response.status_code, 400)
        self.assertIsNone(self.tenant.scid)
        self.assertFalse(mock_send_mail.called)

    @patch("sc.etl.TenantEtlAdapter._send_mail")
    @patch("sc.etl.BsOAuthSession.post")
    def test_post__send_mail(self, mock_func, mock_send_mail):
        scid = random.randint(0,100)
        response = stub(status_code=201, content=json.dumps({'id': scid}).encode('utf8'))
        mock_func.return_value = response

        self.adapter.post()

        self.assertEqual(mock_send_mail.call_args[0][0], self.tenant.implementation_email.email)

    @patch("sc.etl.BsOAuthSession.put")
    def test_put(self, mock_func):
        mock_func.return_value = stub(status_code=200)
        adapter = TenantEtlAdapter(self.tenant)

        response = adapter.put()

        self.assertEqual(mock_func.call_args[0][0], adapter.detail_url)
        self.assertEqual(
            mock_func.call_args[1]['data'],
            self.adapter.data
        )
        self.assertEqual(response.status_code, 200)

    @patch("sc.etl.BsOAuthSession.get")
    def test_get(self, mock_func):
        adapter = TenantEtlAdapter(self.tenant)
        mock_func.return_value = stub(status_code=200, content=json.dumps(adapter.data).encode('utf8'))

        response = adapter.get()

        self.assertEqual(mock_func.call_args[0][0], adapter.detail_url)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.content)


class TenantEtlDataAdapterTests(TestCase):

    def setUp(self):
        self.tenant = get_or_create_tenant(with_scid=False)
        validated_data = {
            "company_name": self.tenant.company_name,
            "billing_address": self.tenant.billing_address,
            "Address2": "",
            "implementation_email": self.tenant.implementation_email,
            "billing_phone_number": self.tenant.billing_phone_number,
            "Fax": "",
            "implementation_contact_initial": self.tenant.implementation_contact_initial
        }
        self.adapter = TenantEtlDataAdapter(validated_data)

    def test_data(self):
        raw_ret = {
            "Name": self.tenant.company_name,
            "Address1": self.tenant.billing_address.address,
            "Address2": "",
            "Country": self.tenant.billing_address.country.common_name,
            "State": self.tenant.billing_address.state.name,
            "City": self.tenant.billing_address.city,
            "Zip": self.tenant.billing_address.postal_code,
            "Email": self.tenant.implementation_email.email,
            "Phone": self.tenant.billing_phone_number.number,
            "Fax": "",
            "ContactName": self.tenant.implementation_contact_initial,
            "TaxId": "123456789",
            "IsPersonalTaxId": False,
            "SysadminContactFixxbook": {
                "Name": self.tenant.company_name,
                "JobTitle": "admin",
                "Email": self.tenant.implementation_email.email,
                "WorkPhone": self.tenant.billing_phone_number.number,
                "MobilePhone": self.tenant.billing_phone_number.number,
                "Fax": ""
            }
        }

        ret = self.adapter.data

        self.assertEqual(ret, raw_ret)

    def test_list_url(self):
        self.assertEqual(self.adapter.list_url, DEV_SC_SUBSCRIBERS_URL)

    @patch("sc.etl.BsOAuthSession.post")
    def test_post(self, mock_func):
        scid = random.randint(1,100)
        mock_func.return_value = stub(status_code=201, content=json.dumps({'id': scid}).encode('utf8'))

        response = self.adapter.post()

        self.assertEqual(mock_func.call_args[0][0], self.adapter.list_url)
        self.assertEqual(
            mock_func.call_args[1]['data'],
            self.adapter.data
        )
        self.assertEqual(response, scid)

    @patch("sc.etl.BsOAuthSession.post")
    def test_error__400_bad_request(self, mock_func):
        mock_func.return_value = stub(status_code=400, content=json.dumps({'ErrorMessage': "Subscriber with such name already exists"}).encode('utf8'))

        with self.assertRaises(ValidationError):
            response = self.adapter.post()

    @patch("sc.etl.BsOAuthSession.post")
    def test_error__400_bad_request_sc_fixxbook_error(self, mock_func):
        mock_func.return_value = stub(status_code=400, content=json.dumps({'ErrorCode': 0, 'ErrorMessage': 'The remote server returned an error: (404) Not Found.', 'ErrorCodes': []}).encode('utf8'))

        response = self.adapter.post()

        self.assertIsNone(response)

    @patch("sc.etl.BsOAuthSession.post")
    def test_error__406_duplicate_request(self, mock_func):
        mock_func.return_value = stub(status_code=406, content=json.dumps({'Reason': "Duplicate request/request already processed"}).encode('utf8'))

        with self.assertRaises(ValidationError):
            response = self.adapter.post()


class WorkOrderEtlDataAdapterTests(TestCase):

    def setUp(self):
        self.maxDiff = None

        self.person = create_single_person()
        create_single_category()
        self.ticket = create_ticket()
        self.work_order = create_work_order()
        self.category = self.work_order.category
        self.category.sc_category = get_sc_category_or_none('foo')
        self.category.save()
        validated_data = {
            "id": str(uuid.uuid4()),
            "requester": self.person,
            "instructions": self.work_order.instructions,
            "approved_amount": self.work_order.cost_estimate,
            "cost_estimate": self.work_order.cost_estimate,
            "scheduled_date": self.work_order.scheduled_date,
            "expiration_date": self.work_order.expiration_date,
            "approval_date": self.work_order.approval_date,
            "category": self.work_order.category,
            "provider": self.work_order.provider,
            "ticket": self.ticket
        }
        self.adapter = WorkOrderEtlDataAdapter(validated_data)

    def test_data(self):
        raw_ret = {
            "ContractInfo": {
                "SubscriberId": self.person.role.tenant.scid,
                "LocationId": self.ticket.location.scid,
                "StoreId": self.ticket.location.number,
                "ProviderId": self.work_order.provider.fbid,
                "TradeName": self.category.sc_category.sc_name
            },
            "Category": self.category.sc_category.sc_name,
            "Priority": self.ticket.priority.name,
            "CallDate": self.work_order.expiration_date,
            "Description": self.work_order.instructions,
            "ProblemCode": self.work_order.category.name,
            "Status": {
                "Primary": self.ticket.status.name,
                "Extended": self.ticket.status.name,
                "PrimaryStatusValue": self.ticket.status.name
            }
        }

        ret = self.adapter.data

        self.assertEqual(ret, raw_ret)

    def test_list_url(self):
        self.assertEqual(self.adapter.list_url, DEV_SC_WORKORDERS_URL)

    def test_post(self):
        scid = self.adapter.post()

        self.assertIsInstance(scid, int)
