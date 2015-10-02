from django.db import models

from utils.models import AbstractName


class WorkOrderStatus(AbstractName):
    pass
    

class WorkOrder(AbstractName):
    amount = models.PositiveIntegerField()
