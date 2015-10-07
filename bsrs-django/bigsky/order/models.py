from django.db import models

from utils.models import BaseNameModel


class WorkOrderStatus(BaseNameModel):
    pass
    

class WorkOrder(BaseNameModel):
    amount = models.PositiveIntegerField()
