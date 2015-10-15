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


class PhoneNumberType(BaseNameOrderModel):
    pass


class PhoneNumber(BaseContactModel):
    """
    TODO: Will use this "phone number lib" for validation:

    https://github.com/daviddrysdale/python-phonenumbers
    """
    type = models.ForeignKey(PhoneNumberType)
    number = models.CharField(max_length=32)

    class Meta:
        ordering = ('number',)


class AddressType(BaseNameOrderModel):
    pass


class Address(BaseContactModel):
    """
    Not every field is required to be a valid address, but at 
    least one "non-foreign-key" field must be populated.

    ForeignKey Reqs: either the `location` or `person` FK must be 
    populated, but not both.
    """
    type = models.ForeignKey(AddressType)
    address = models.CharField(max_length=200, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    postal_code = models.CharField(max_length=32, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        ordering = ('address',)


class EmailType(BaseNameOrderModel):
    pass


class Email(BaseContactModel):
    type = models.ForeignKey(EmailType)
    email = models.EmailField(max_length=255)

    class Meta:
        ordering = ('email',)