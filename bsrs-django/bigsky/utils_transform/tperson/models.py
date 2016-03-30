'''
Model for staging table to hold data exported from Domino

username - unique username
first_name - user's first name (e.g. "Thomas")
middle_initial - user's middle initial (e.g. "J")
last_name - user's last name (e.g. "Krier")
role - User's role (e.g. "Facility Manager")
status - Active or Inactive (set to admin.person.status.active, etc.)
locations - location numbers separated by a semicolon (e.g. "202;203;204")
employee_id - employee id number (e.g. "34234")
title - user's title (e.g. "Director Facilities")
phone_number - single phone number (link type to admin.phonenumbertype.office)
email_address - single e-mail address (link type to admin.emailtype.work)
sms_address - single e-mail address (link type to admin.emailtype.sms)
auth_amount - dollar amount as a string (e.g. 1212.22)
next_approver - full name of user who is the next approver
'''
from django.db import models

class DominoPerson(models.Model):
    name = models.TextField()
    username = models.TextField()
    first_name = models.TextField(blank=True, null=True)
    middle_initial = models.TextField(blank=True, null=True)
    last_name = models.TextField(blank=True, null=True)
    role = models.TextField()
    status = models.TextField()
    locations = models.TextField(blank=True, null=True)
    employee_id = models.TextField(blank=True, null=True)
    title = models.TextField(blank=True, null=True)
    phone_number = models.TextField(blank=True, null=True)
    email_address = models.TextField(blank=True, null=True)
    sms_address = models.TextField(blank=True, null=True)
    auth_amount = models.TextField(blank=True, null=True)
    next_approver = models.TextField(blank=True, null=True)
