from django.db import models


class DominoRole(models.Model):
    name = models.TextField()
    selection = models.TextField(blank=True, null=True)
    categories = models.TextField(blank=True, null=True)
    manage_role_names = models.TextField(blank=True, null=True)
    tsg_start_point = models.TextField(blank=True, null=True)
