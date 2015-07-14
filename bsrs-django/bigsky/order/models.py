from django.db import models

from util.models import AbstractName


class WorkOrderStatus(AbstractName):
    pass
    

class WorkOrder(AbstractName):
    amount = models.PositiveIntegerField()
