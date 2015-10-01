from django.db import models
from django.utils.encoding import python_2_unicode_compatible

from person.models import Person
from location.models import Location
from utils import exceptions as excp
from utils.models import AbstractNameOrder, BaseModel


class ContactBaseModel(BaseModel):
    '''
    All contact Models: PhoneNumber, Address, and Email must have
    a ForeignKey to ``location`` or ``person`` but not both.
    '''
    pass

    class Meta:
        ordering = ('id',)
        abstract = True

    def save(self, *args, **kwargs):
        self._valid_person_or_location()
        return super(ContactBaseModel, self).save(*args, **kwargs)

    def _valid_person_or_location(self):
        if not (self.person or self.location):
            raise excp.PersonOrLocationRequiredExcp(
                "Must have either a Person or Location FK.")
        if self.person and self.location:
            raise excp.PersonAndLocationKeysExcp(
                "Can't have both a Person and Location.")


class PhoneNumberType(AbstractNameOrder):
    '''
    Ex- mobile, cell, home, fax.
    '''
    pass


@python_2_unicode_compatible
class PhoneNumber(ContactBaseModel):
    '''
    TODO: Will use this "phone number lib" for validation:

    https://github.com/daviddrysdale/python-phonenumbers
    '''
    # keys
    type = models.ForeignKey(PhoneNumberType)
    location = models.ForeignKey(Location, related_name='phone_numbers', null=True, blank=True)
    person = models.ForeignKey(Person, related_name='phone_numbers', null=True, blank=True)
    # fields
    number = models.CharField(max_length=32)
    
    def __str__(self):
        return self.number


class AddressType(AbstractNameOrder):
    pass


@python_2_unicode_compatible
class Address(ContactBaseModel):
    '''
    Not every field is required to be a valid address, but at 
    least one "non-foreign-key" field must be populated.

    ForeignKey Reqs: either the `location` or `person` FK must be 
    populated, but not both.
    '''
    # keys
    type = models.ForeignKey(AddressType)
    location = models.ForeignKey(Location, related_name='addresses', null=True, blank=True)
    person = models.ForeignKey(Person, related_name='addresses', null=True, blank=True)
    # fields
    address = models.CharField(max_length=200, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    postal_code = models.CharField(max_length=32, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        if self.address:
            return self.address
        else:
            return ""


class EmailType(AbstractNameOrder):
    pass


@python_2_unicode_compatible
class Email(ContactBaseModel):
    # keys
    type = models.ForeignKey(EmailType)
    location = models.ForeignKey(Location, related_name='emails', null=True, blank=True)
    person = models.ForeignKey(Person, related_name='emails', null=True, blank=True)
    # fields
    email = models.EmailField(max_length=255)
    
    def __str__(self):
        return self.email
