from django.db import models
from django.contrib.contenttypes.models import ContentType

from utils.fields import MyGenericForeignKey
from utils.models import BaseNameModel, BaseNameOrderModel, BaseModel


class State(BaseNameModel):
    abbr = models.CharField(max_length=2)

    def to_dict(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'abbr': self.abbr
        }

class Country(BaseNameModel):

    class Meta:
        verbose_name_plural = 'Countries'


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
