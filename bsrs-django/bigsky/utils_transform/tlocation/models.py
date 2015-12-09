from django.db import models


class Location(models.Model):
    number = models.TextField()
    name = models.TextField()
    manager = models.TextField()
    address1 = models.TextField()
    address2 = models.TextField()
    city = models.TextField()
    state = models.TextField()
    zip = models.TextField()
    country = models.TextField()
    telephone = models.TextField()
    fax = models.TextField()
    email = models.TextField()
    carphone = models.TextField()
    comments = models.TextField()
