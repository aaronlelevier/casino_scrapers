'''
Model for staging table to hold data exported from Domino

name - Role name
selection - Role selection e.g. "FMU Manager"
categories - List of Types separated by comma and space e.g. "Repair, Capex, LP"
manage_role_names - Boolean whether role is used by name or location level e.g. "Yes" or "No"
tsg_start_point - Starting point for troubleshooting guide e.g. "1.2.New Store"
'''
from django.db import models


class DominoRole(models.Model):
    name = models.TextField()
    selection = models.TextField(blank=True, null=True)
    categories = models.TextField(blank=True, null=True)
    manage_role_names = models.TextField(blank=True, null=True)
    tsg_start_point = models.TextField(blank=True, null=True)
