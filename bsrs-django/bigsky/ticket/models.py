from django.db import models

from utils.models import BaseModel


class Ticket(BaseModel):
    subject = models.TextField(max_length=100, blank=True, null=True)
