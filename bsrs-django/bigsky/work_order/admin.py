from django.contrib import admin

from work_order import models


@admin.register(models.WorkOrder)
class WorkOrderAdmin(admin.ModelAdmin):
    pass

@admin.register(models.WorkOrderStatus)
class WorkOrderStatusAdmin(admin.ModelAdmin):
    pass

@admin.register(models.WorkOrderPriority)
class WorkOrderPriorityAdmin(admin.ModelAdmin):
    pass
