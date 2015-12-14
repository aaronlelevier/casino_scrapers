from django.db import models
from django.contrib.contenttypes.models import ContentType

from utils.fields import MyGenericForeignKey
from utils.models import BaseNameOrderModel, BaseModel


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
    'telephone',
    'fax',
    'cell'
]

class PhoneNumberType(BaseNameOrderModel):
    pass


class PhoneNumber(BaseContactModel):
    """
    TODO: Will use this "phone number lib" for validation:

    https://github.com/daviddrysdale/python-phonenumbers
    """
    type = models.ForeignKey(PhoneNumberType, blank=True, null=True)
    number = models.CharField(max_length=32)

    class Meta:
        ordering = ('number',)


ADDRESS_TYPES = [
    'location'
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
    address1 = models.CharField(max_length=200, null=True, blank=True)
    address2 = models.CharField(max_length=200, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    zip = models.CharField(max_length=32, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        ordering = ('address1',)


EMAIL_TYPES = [
    'location'
]

class EmailType(BaseNameOrderModel):
    pass


class Email(BaseContactModel):
    type = models.ForeignKey(EmailType, blank=True, null=True)
    email = models.EmailField(max_length=255)

    class Meta:
        ordering = ('email',)
