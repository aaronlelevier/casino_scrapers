'''
Big Sky Retail Systems Framework
Contact models

Created on Jan 21, 2015

@author: tkrier

'''
from django.db import models

from person.models import Person
from location.models import Location
from util.models import AbstractNameOrder


class PhoneNumberType(AbstractNameOrder):
    pass


class PhoneNumber(models.Model):
    # keys
    type = models.ForeignKey(PhoneNumberType, related_name='phone_numbers')
    location = models.ForeignKey(Location, related_name='phone_numbers', null=True, blank=True)
    person = models.ForeignKey(Person, related_name='phone_numbers', null=True, blank=True)
    # fields
    number = models.CharField(max_length=32)
    
    class Meta:
        ordering = ('type', 'number',)

    def __unicode__(self):
        return self.number


class AddressType(AbstractNameOrder):
    pass


class Address(models.Model):
    # keys
    type = models.ForeignKey(AddressType, related_name='addresses')
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
        
    def __unicode__(self):
        if self.address1:
            return self.address1
        else:
            return ""


class EmailType(AbstractNameOrder):
    pass


class Email(models.Model):
    # keys
    type = models.ForeignKey(EmailType, related_name='emails')
    location = models.ForeignKey(Location, related_name='emails', null=True, blank=True)
    person = models.ForeignKey(Person, related_name='emails', null=True, blank=True)
    # fields
    email = models.EmailField(max_length=255)
    
    class Meta:
        ordering = ('type', 'email',)

    def __unicode__(self):
        return self.email
