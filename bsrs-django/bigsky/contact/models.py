'''
All contact Models: PhoneNumber, Address, and Email must have 
a ForeignKey to ``location`` or ``person`` but not both.
'''

from django.db import models
from django.utils.encoding import python_2_unicode_compatible

from person.models import Person
from location.models import Location
from util.models import AbstractNameOrder, BaseModel
from util import exceptions as excp


class PhoneNumberType(AbstractNameOrder):
    '''
    Ex- mobile, cell, home, fax.
    '''
    pass


@python_2_unicode_compatible
class PhoneNumber(BaseModel):
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
    
    class Meta:
        ordering = ('type', 'number',)

    def __str__(self):
        return self.number


class AddressType(AbstractNameOrder):
    pass


@python_2_unicode_compatible
class Address(BaseModel):
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

    class Meta:
        ordering = ('type',)
        
    def __str__(self):
        if self.address:
            return self.address
        else:
            return ""


class EmailType(AbstractNameOrder):
    pass


@python_2_unicode_compatible
class Email(BaseModel):
    # keys
    type = models.ForeignKey(EmailType)
    location = models.ForeignKey(Location, related_name='emails', null=True, blank=True)
    person = models.ForeignKey(Person, related_name='emails', null=True, blank=True)
    # fields
    email = models.EmailField(max_length=255)
    
    class Meta:
        ordering = ('type', 'email',)

    def __str__(self):
        return self.email
