from django.db import models
from django.contrib.contenttypes.models import ContentType

from utils.fields import MyGenericForeignKey
from utils.models import BaseNameModel, BaseNameOrderModel, BaseModel


class Country(BaseModel):
    sort_order = models.IntegerField()
    common_name = models.CharField(max_length=100, blank=True)
    formal_name = models.CharField(max_length=100, blank=True)
    type = models.CharField(max_length=100, blank=True)
    sub_type = models.CharField(max_length=100, blank=True)
    sovereignty = models.CharField(max_length=100, blank=True)
    capital = models.CharField(max_length=100, blank=True)
    currency_code = models.CharField("ISO 4217 Currency Code", max_length=100, blank=True)
    currency_name = models.CharField("ISO 4217 Currency Name", max_length=100, blank=True)
    telephone_code = models.CharField("ITU-T Telephone Code", max_length=100, blank=True)
    two_letter_code = models.CharField("ISO 3166-1 2 Letter Code", max_length=100, blank=True)
    three_letter_code = models.CharField("ISO 3166-1 3 Letter Code", max_length=100, blank=True)
    number = models.CharField("ISO 3166-1 Number", max_length=100, blank=True)
    country_code_tld = models.CharField("IANA Country Code TLD", max_length=100, blank=True)


class State(BaseModel):
    country = models.ForeignKey(Country, null=True)
    country_code = models.CharField(max_length=100, blank=True)
    state_code = models.CharField(max_length=100, blank=True)
    name = models.CharField(max_length=100, blank=True)
    classification = models.CharField(max_length=100, blank=True)

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'abbr': self.abbr
        }


class BaseContactModel(BaseModel):
    """
    GenericForeignKey fields that will be used for all Contact models.
    """
    content_type = models.ForeignKey(ContentType)
    object_id = models.UUIDField()
    content_object = MyGenericForeignKey('content_type', 'object_id')

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.object_id = self.content_object.id
        return super(BaseContactModel, self).save(*args, **kwargs)


PHONE_NUMBER_TYPES = [
    'admin.phonenumbertype.telephone',
    'admin.phonenumbertype.fax',
    'admin.phonenumbertype.cell',
    'admin.phonenumbertype.office',
    'admin.phonenumbertype.mobile',
]

class PhoneNumberType(BaseNameOrderModel):
    pass


class PhoneNumber(BaseContactModel):
    """
    TODO: Will use this "phone number lib" for validation:

    https://github.com/daviddrysdale/python-phonenumbers
    """
    type = models.ForeignKey(PhoneNumberType, blank=True, null=True)
    number = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ('number',)


ADDRESS_TYPES = [
    'admin.address_type.location',
    'admin.address_type.office',
    'admin.address_type.shipping',
]

class AddressType(BaseNameOrderModel):
    pass


class Address(BaseContactModel):
    """
    Not every field is required to be a valid address, but at 
    least one "non-foreign-key" field must be populated.

    ForeignKey Reqs: either the `location` or `person` FK must be 
    populated, but not both.
    """
    type = models.ForeignKey(AddressType, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.TextField(blank=True, null=True)
    state = models.ForeignKey(State, blank=True, null=True)
    postal_code = models.TextField(blank=True, null=True)
    country = models.ForeignKey(Country, blank=True, null=True)

    class Meta:
        ordering = ('address',)


EMAIL_TYPES = [
    'admin.emailtype.location',
    'admin.emailtype.work',
    'admin.emailtype.personal',
    'admin.emailtype.sms'
]

class EmailType(BaseNameOrderModel):
    pass


class Email(BaseContactModel):
    type = models.ForeignKey(EmailType, blank=True, null=True)
    email = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ('email',)




{
    "Sub Type": "",
    "ITU-T Telephone Code": "93",
    "ISO 3166-1 2 Letter Code": "AF",
    "Formal Name": "Islamic State of Afghanistan",
    "Common Name": "Afghanistan",
    "ISO 3166-1 3 Letter Code": "AFG",
    "IANA Country Code TLD": ".af",
    "Capital": "Kabul",
    "Sort Order": "1",
    "ISO 3166-1 Number": "4",
    "ISO 4217 Currency Name": "Afghani",
    "ISO 4217 Currency Code": "AFN",
    "Sovereignty": "",
    "Type": "Independent State"
}


