import json
import random

from pretend import stub
from rest_framework.exceptions import ValidationError

from contact.models import Address, AddressType, PhoneNumber, PhoneNumberType
from location.models import LOCATION_DISTRICT, LOCATION_REGION, Location
from sc.oauth import (DEV_SC_LOCATIONS_URL, DEV_SC_SUBSCRIBERS_URL,
                      DEV_SC_WORKORDERS_URL, BsOAuthSession)
from utils.create import _generate_ph


class BaseEtlAdapter(object):
    """
    Base class to hold ETL logic between BS and SC. Each class
    using a BS app name holds the ETL logic for that module.
    """
    def __init__(self, instance):
        """
        :param instance: Model instance to be sent via ETL
        """
        self.instance = instance

    @property
    def data(self):
        raise NotImplementedError(".data must be implemented")

    def post(self):
        raise NotImplementedError(".post() must be implemented")

    def put(self):
        raise NotImplementedError(".put() must be implemented")

    def get(self):
        raise NotImplementedError(".get() must be implemented")

    @property
    def list_url(self):
        raise NotImplementedError(".list_url must be implemented")

    @property
    def detail_url(self):
        raise NotImplementedError(".detail_url must be implemented")


class LocationEtlAdapter(BaseEtlAdapter):
    """
    Handle generating `Location` module payload data
    for SC API Endpoint requests
    """
    @property
    def data(self):
        """
        Same data structure is used for POST / PUT
        """
        ret =  {
            'StoreId': self.instance.number,
            'Name': self.instance.name,
            'Latitude': None,
            'Longitude': None,
            'Distance': None,
            'ClosedDate': None,
            'OpenDate': None,
            'Contact': None,
            'LocationTypeId': str(self.instance.location_level.id)
        }

        ret.update(self._get_parent_location('Region', LOCATION_REGION))
        ret.update(self._get_parent_location('District', LOCATION_DISTRICT))
        ret.update(self._address_fields)
        ret.update(self._email)
        ret.update(self._get_phone('Phone', PhoneNumberType.TELEPHONE))
        ret.update(self._get_phone('FaxNumber', PhoneNumberType.FAX))

        return ret

    def _get_parent_location(self, key, name):
        try:
            location = (Location.objects.get_all_parents(self.instance)
                                      .get(location_level__name=name))
        except Location.DoesNotExist:
            return {key: None}
        except Location.MultipleObjectsReturned:
            location = (Location.objects.get_all_parents(self.instance)
                                      .filter(location_level__name=name)[0])
        return {key: location.name}

    @property
    def _address_fields(self):
        try:
            address = self.instance.addresses.get(type__name=AddressType.STORE)
        # TODO: May have to handle this exception unless we restrict the
        # number of related address by type to one
        except Address.MultipleObjectsReturned:
            address = self.instance.addresses.filter(type__name=AddressType.STORE)[0]
        except Address.DoesNotExist:
            return {
                'Address1': None,
                'Address2': None,
                'City': None,
                'State': None,
                'Zip': None,
                'Country': None
            }

        return {
            'Address1': address.address,
            'Address2': None,
            'City': address.city,
            'State': address.state.state_code,
            'Zip': address.postal_code,
            'Country': address.country.common_name
        }

    @property
    def _email(self):
        email = self.instance.emails.first()
        if email:
            return {'Email': email.email}
        return {'Email': None}

    def _get_phone(self, key, name):
        try:
            ph = self.instance.phone_numbers.get(type__name=name)
        except PhoneNumber.MultipleObjectsReturned:
            ph = self.instance.phone_numbers.filter(type__name=name)[0]
        except PhoneNumber.DoesNotExist:
            return {key: None}
        return {key: ph.number}

    @property
    def list_url(self):
        return "{}?impersonateUserInfo[username]={}".format(
            DEV_SC_LOCATIONS_URL,
            self.instance.location_level.tenant.implementation_email.email)

    @property
    def detail_url(self):
        return "{}/{}".format(DEV_SC_LOCATIONS_URL, self.instance.scid)

    def post(self):
        if self.instance.is_store:
            response = BsOAuthSession().post(self.list_url,
                                             data=self.data)

            if response.status_code == 201:
                data = json.loads(response.content.decode('utf8'))
                self.instance.scid = data
                self.instance.save()

            return response

    def put(self):
        if self.instance.is_store:
            return BsOAuthSession().put(self.detail_url,
                                        data=self.data)

    def get(self):
        return BsOAuthSession().get(self.detail_url)


class TenantEtlAdapter(BaseEtlAdapter):
    """
    Handle generating `Tenant` module payload data for SC API
    Endpoint requests
    """
    @property
    def data(self):
        """
        Same data structure is used for POST / PUT
        """
        return {
            "Name": self.instance.company_name,
            "Address1": self.instance.billing_address.address,
            "Address2": "",
            "Country": self.instance.billing_address.country.common_name,
            "State": self.instance.billing_address.state.name,
            "City": self.instance.billing_address.city,
            "Zip": self.instance.billing_address.postal_code,
            "Email": self.instance.implementation_email.email,
            "Phone": self.instance.billing_phone_number.number,
            "Fax": "",
            "ContactName": self.instance.implementation_contact_initial,
            "TaxId": "123456789",
            "IsPersonalTaxId": False,
            "SysadminContactFixxbook": {
                "Name": self.instance.company_name,
                "JobTitle": "admin",
                "Email": self.instance.implementation_email.email,
                "WorkPhone": self.instance.billing_phone_number.number,
                "MobilePhone": self.instance.billing_phone_number.number,
                "Fax": ""
            }
        }

    @property
    def list_url(self):
        return DEV_SC_SUBSCRIBERS_URL

    @property
    def detail_url(self):
        return "{}/{}/".format(DEV_SC_SUBSCRIBERS_URL, self.instance.scid)

    def post(self):
        """
        `TenantEtlDataAdapter.post` now used as hook in Tenant Create
        API to send data to SC, but leave this method, as it can be
        a helper method, or used to sync both systems if the create
        hook isn't coming from the BS API.
        """
        response = BsOAuthSession().post(self.list_url,
                                         data=self.data)

        if response.status_code == 201:
            data = json.loads(response.content.decode('utf8'))
            self.instance.scid = data['id']
            self.instance.save()

            self._send_mail(self.instance.implementation_email.email)

        return response

    # TODO: this method should send the standard django 1x reset
    # password email, but in a Bigsky template with other first
    # time signup info
    def _send_mail(self, email):
        pass

    def put(self):
        return BsOAuthSession().put(self.detail_url, data=self.data)

    def get(self):
        return BsOAuthSession().get(self.detail_url)


class TenantEtlDataAdapter(object):
    """
    Used for Tenant data where a Tenant model instance
    doesn't yet exist.
    """
    def __init__(self, validated_data):
        """
        :param validated_data: dict of validated data from DRF Serializer instance
        """
        self._data = validated_data

    @property
    def data(self):
        return {
            "Name": self._data['company_name'],
            "Address1": self._data['billing_address'].address,
            "Address2": "",
            "Country": self._data['billing_address'].country.common_name,
            "State": self._data['billing_address'].state.name,
            "City": self._data['billing_address'].city,
            "Zip": self._data['billing_address'].postal_code,
            "Email": self._data['implementation_email'].email,
            "Phone": self._data['billing_phone_number'].number,
            "Fax": "",
            "ContactName": self._data['implementation_contact_initial'],
            "TaxId": _generate_ph(9),
            "IsPersonalTaxId": False,
            "SysadminContactFixxbook": {
                "Name": self._data['company_name'],
                "JobTitle": "admin",
                "Email": self._data['implementation_email'].email,
                "WorkPhone": self._data['billing_phone_number'].number,
                "MobilePhone": self._data['billing_phone_number'].number,
                "Fax": ""
            }
        }

    @property
    def list_url(self):
        return DEV_SC_SUBSCRIBERS_URL

    def post(self):
        """
        :return scid: Integer id of Subscriber in SC
        """
        response = BsOAuthSession().post(self.list_url, data=self.data)
        data = json.loads(response.content.decode('utf8'))

        if response.status_code == 400:
            if data["ErrorCode"] == 0: # no returning a diff error msg, so just checking for 'ErrorCode'
                                       # SC Api still not in sync
                #this is the current error message fron Fixxbook when not working on the dev server
                return
            raise ValidationError(data['ErrorMessage'])

        if response.status_code == 406:
            raise ValidationError(data['Reason'])

        return data['id']


class WorkOrderEtlDataAdapter(object):
    """
    Used for WorkOrder data where a WorkOrder model instance
    doesn't yet exist.
    """
    def __init__(self, validated_data):
        """
        :person: Person model instance
        :param validated_data: dict of validated data from DRF Serializer instance
        """
        self._data = validated_data
        self._person = validated_data['requester']

    @property
    def data(self):
        return {
            "ContractInfo": {
                "SubscriberId": self._person.role.tenant.scid,
                "LocationId": self._data['ticket'].location.scid,
                "StoreId": self._data['ticket'].location.number,
                "ProviderId": self._data['provider'].fbid,
                "TradeName": self._data['category'].sc_category.sc_name
            },
            "Category": self._data['category'].sc_category.sc_name,
            "Priority": self._data['ticket'].priority.name,
            "CallDate": self._data['expiration_date'],
            "Description": self._data['instructions'],
            "ProblemCode": self._data['category'].name,
            "Status": {
                "Primary": self._data['ticket'].status.name,
                "Extended": self._data['ticket'].status.name,
                "PrimaryStatusValue": self._data['ticket'].status.name
            }
        }

    @property
    def list_url(self):
        return DEV_SC_WORKORDERS_URL

    def post(self):
        """
        This method is stubbed until we integrate with SC

        :return scid: Integer id of WorkOrder in SC
        """
        # TODO: this is a mock response until we integrate with SC
        # response = BsOAuthSession().post(self.list_url, data=self.data)
        return random.randint(100,1000)
