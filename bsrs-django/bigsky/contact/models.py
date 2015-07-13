from django.db import models
from django.utils.encoding import python_2_unicode_compatible

from person.models import Person
from location.models import Location
from util.models import AbstractNameOrder, BaseModel
from util import exceptions as excp


################
# PHONE NUMBER #
################

class PhoneNumberType(AbstractNameOrder):
    pass


@python_2_unicode_compatible
class BasePhoneNumber(BaseModel):
    '''
    TODO: Will use this "phone number lib" for validation:

    https://github.com/daviddrysdale/python-phonenumbers
    '''
    # keys
    type = models.ForeignKey(PhoneNumberType)
    # fields
    number = models.CharField(max_length=32, unique=True)
    
    class Meta:
        abstract = True
        ordering = ('type', 'number',)

    def __str__(self):
        return self.number


class PersonPhoneNumber(BasePhoneNumber):
    person = models.ForeignKey(Person, related_name='phone_numbers')


class LocationPhoneNumber(BasePhoneNumber):
    location = models.ForeignKey(Location, related_name='phone_numbers', null=True, blank=True)


###########
# ADDRESS #
###########

class AddressType(AbstractNameOrder):
    pass


@python_2_unicode_compatible
class BaseAddress(BaseModel):
    '''
    Not every field is required to be a valid address.
    '''
    # keys
    type = models.ForeignKey(AddressType)
    # fields
    address1 = models.CharField(max_length=200, null=True, blank=True)
    address2 = models.CharField(max_length=200, null=True, blank=True)
    address3 = models.CharField(max_length=200, null=True, blank=True)
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    postalcode = models.CharField(max_length=32, null=True, blank=True)

    class Meta:
        abstract = True
        ordering = ('type',)
        
    def __str__(self):
        if self.address1:
            return self.address1
        else:
            return ""


class PersonAddress(BaseAddress):
    person = models.ForeignKey(Person, related_name='addresses')


class LocationAddress(BaseAddress):
    location = models.ForeignKey(Location, related_name='addresses')



#########
# EMAIL #
#########

class EmailType(AbstractNameOrder):
    pass


@python_2_unicode_compatible
class BaseEmail(BaseModel):
    # keys
    type = models.ForeignKey(EmailType)
    # fields
    email = models.EmailField(max_length=255, unique=True)
    
    class Meta:
        abstract = True
        ordering = ('type', 'email',)

    def __str__(self):
        return self.email


class PersonEmail(BaseEmail):
    person = models.ForeignKey(Person)


class LocationEmail(BaseEmail):
    location = models.ForeignKey(Location)