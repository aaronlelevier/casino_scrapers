from django.db import models

from location.models import (LOCATION_COMPANY, LOCATION_REGION, LOCATION_DISTRICT,
    LOCATION_STORE, LOCATION_FMU,)


class LocationRegion(models.Model):
    number = models.TextField()
    name = models.TextField()
    manager = models.TextField(blank=True, null=True)
    address1 = models.TextField(blank=True, null=True)
    address2 = models.TextField(blank=True, null=True)
    city = models.TextField(blank=True, null=True)
    state = models.TextField(blank=True, null=True)
    zip = models.TextField(blank=True, null=True)
    country = models.TextField(blank=True, null=True)
    telephone = models.TextField(blank=True, null=True)
    fax = models.TextField(blank=True, null=True)
    email = models.TextField(blank=True, null=True)
    carphone = models.TextField(blank=True, null=True)
    comments = models.TextField(blank=True, null=True)


class LocationDistrict(models.Model):
    number = models.TextField()
    name = models.TextField()
    regionnumber = models.TextField(blank=True, null=True)
    manager = models.TextField(blank=True, null=True)
    address1 = models.TextField(blank=True, null=True)
    address2 = models.TextField(blank=True, null=True)
    city = models.TextField(blank=True, null=True)
    state = models.TextField(blank=True, null=True)
    zip = models.TextField(blank=True, null=True)
    country = models.TextField(blank=True, null=True)
    telephone = models.TextField(blank=True, null=True)
    fax = models.TextField(blank=True, null=True)
    email = models.TextField(blank=True, null=True)
    carphone = models.TextField(blank=True, null=True)
    comments = models.TextField(blank=True, null=True)


class LocationStore(models.Model):
    number = models.TextField()
    name = models.TextField()
    distnumber = models.TextField(blank=True, null=True)
    manager = models.TextField(blank=True, null=True)
    address1 = models.TextField(blank=True, null=True)
    address2 = models.TextField(blank=True, null=True)
    city = models.TextField(blank=True, null=True)
    state = models.TextField(blank=True, null=True)
    zip = models.TextField(blank=True, null=True)
    country = models.TextField(blank=True, null=True)
    telephone = models.TextField(blank=True, null=True)
    fax = models.TextField(blank=True, null=True)
    email = models.TextField(blank=True, null=True)
    carphone = models.TextField(blank=True, null=True)
    costcode = models.TextField(blank=True, null=True)
    openingdate = models.DateField(blank=True, null=True)
    comments = models.TextField(blank=True, null=True)
