# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-01-18 20:54
from __future__ import unicode_literals

import django.db.models.deletion
import django.utils.datetime_safe
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('category', '0005_auto_20170117_1956'),
        ('accounting', '0001_initial'),
        ('provider', '0002_auto_20170111_2215'),
        ('work_order', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='workorder',
            name='date_due',
        ),
        migrations.RemoveField(
            model_name='workorder',
            name='third_party',
        ),
        migrations.AddField(
            model_name='workorder',
            name='approval_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='workorder',
            name='approver',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='approver_work_orders', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='workorder',
            name='category',
            field=models.ForeignKey(default='882d8cd2-1ed9-4787-a429-1b98d92196cd', help_text='SC field: Category, Required for SC API, broader than TradeName', on_delete=django.db.models.deletion.CASCADE, related_name='work_orders', to='category.Category'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='workorder',
            name='completed_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='workorder',
            name='cost_estimate',
            field=models.DecimalField(decimal_places=2, default=0, help_text='SC field: Nte', max_digits=9),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='workorder',
            name='cost_estimate_currency',
            field=models.ForeignKey(default='35bea0a9-2f36-4056-ad83-6832f6b9543f', on_delete=django.db.models.deletion.CASCADE, to='accounting.Currency'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='workorder',
            name='expiration_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='workorder',
            name='instructions',
            field=models.TextField(default='Description is required for SC API', help_text='SC field: Description, Required for SC API'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='workorder',
            name='provider',
            field=models.ForeignKey(default='82344a71-7360-460d-9224-0bc62f77fef4', help_text='SC field: ContractInfo/ProviderId, Required for SC API', on_delete=django.db.models.deletion.CASCADE, related_name='work_orders', to='provider.Provider'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='workorder',
            name='scheduled_date',
            field=models.DateTimeField(default=django.utils.timezone.now, help_text='Due Date, SC field: ScheduledDate'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='workorder',
            name='assignee',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='assignee_work_orders', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='workorder',
            name='location',
            field=models.ForeignKey(help_text='SC field: ContractInfo/LocationId, Required for SC API', on_delete=django.db.models.deletion.CASCADE, related_name='work_orders', to='location.Location'),
        ),
        migrations.AlterField(
            model_name='workorder',
            name='priority',
            field=models.ForeignKey(help_text='SC field: Priority, Required for SC API', null=True, on_delete=django.db.models.deletion.CASCADE, to='work_order.WorkOrderPriority'),
        ),
        migrations.AlterField(
            model_name='workorder',
            name='requester',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='requester_work_orders', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='workorder',
            name='status',
            field=models.ForeignKey(help_text='SC field: Status', null=True, on_delete=django.db.models.deletion.CASCADE, to='work_order.WorkOrderStatus'),
        ),
    ]
