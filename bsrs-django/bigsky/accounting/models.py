from django.db import models
from django.utils.encoding import python_2_unicode_compatible

from util.models import BaseModel


@python_2_unicode_compatible
class Currency(BaseModel):
    "Accepted Currencies"
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=3)
    symbol = models.CharField(max_length=1, help_text="$, ")
    format = models.CharField(max_length=10, help_text="$00.00 for 'USD' for example")

    def __str__(self):
        return self.name