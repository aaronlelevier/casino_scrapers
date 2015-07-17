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


class ContactBaseModel(BaseModel):
    '''
    `Person` and/or `Location` FK must be defined on all classes 
    this model because the contact obj must belong to something.
    '''
    pass

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self._valid_person_or_location()
        return super(ContactBaseModel, self).save(*args, **kwargs)

    def _valid_person_or_location(self):
        if not (self.person or self.location):
            raise excp.PersonOrLocationRequired("Must have either a Person or Location FK.")


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
    number = models.CharField(max_length=32, unique=True)
    
    class Meta:
        ordering = ('type', 'number',)

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
    address1 = models.CharField(max_length=200, null=True, blank=True)
    address2 = models.CharField(max_length=200, null=True, blank=True)
    address3 = models.CharField(max_length=200, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    postalcode = models.CharField(max_length=32, null=True, blank=True)

    class Meta:
        ordering = ('type',)
        
    def __str__(self):
        if self.address1:
            return self.address1
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
    email = models.EmailField(max_length=255, unique=True)
    
    class Meta:
        ordering = ('type', 'email',)

    def __str__(self):
        return self.email