'''
Model for staging table to hold ticket data exported from Domino

    ref_number - domino reference number (unique within a store)
    location_number - store number
    wo_number - work order number (may not exist)
    status - status number (need to map into bsrs ticket status)
    priority - priority number (need to map into bsrs ticket priority)
    type - domino type (map into top level category)
    trade - domino trade (map into category which is child of type. If it can't be found leave out)
    issue - domino trade (map into category which is child of trade. If it can't be found leave out)
    subject - domino subject (add to beginning of request)
    request - domino request
    notes - domino Notes (don't use for now)
    assigned_to - name of assigned user (try to find user with same name? employee number might be better?)
    requester - name of requester (not tied to a Person in bsrs)
    create_date - date/time request was created including timezone
    complete_date - date/time request was completed including timezone
'''

from django.db import models


class DominoTicket(models.Model):
    ref_number = models.TextField()
    location_number = models.TextField()
    wo_number = models.TextField(blank=True, null=True)
    status = models.TextField()
    priority = models.TextField()

    # Categories by level
    type = models.TextField()
    trade = models.TextField(blank=True, null=True)
    issue = models.TextField(blank=True, null=True)

    # concat **subject** - request into 'request' django field
    subject = models.TextField(blank=True, null=True)
    request = models.TextField(blank=True, null=True)

    # skip
    notes = models.TextField(blank=True, null=True)
    # person's fullname
    assigned_to = models.TextField(blank=True, null=True)

    requester = models.TextField(blank=True, null=True)
    create_date = models.DateTimeField()
    complete_date = models.DateTimeField(blank=True, null=True)
    