from django.db import models


class Location(models.Model):
    number = models.CharField(max_length=1000)
    name = models.CharField(max_length=1000)
    manager = models.CharField(max_length=1000)
    address1 = models.CharField(max_length=1000)
    address2 = models.CharField(max_length=1000)
    city = models.CharField(max_length=1000)
    state = models.CharField(max_length=1000)
    zip = models.CharField(max_length=1000)
    country = models.CharField(max_length=1000)
    telephone = models.CharField(max_length=1000)
    fax = models.CharField(max_length=1000)
    email = models.CharField(max_length=1000)
    carphone = models.CharField(max_length=1000)
    comments = models.CharField(max_length=1000)
