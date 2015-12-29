# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
from django.conf import settings
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('third_party', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('location', '0003_auto_20151228_1544'),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkOrder',
            fields=[
                ('id', models.UUIDField(primary_key=True, editable=False, serialize=False, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('date_due', models.DateTimeField(blank=True, null=True)),
                ('assignee', models.ForeignKey(null=True, blank=True, related_name='assignee_work_order', to=settings.AUTH_USER_MODEL)),
                ('location', models.ForeignKey(to='location.Location')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='WorkOrderPriority',
            fields=[
                ('id', models.UUIDField(primary_key=True, editable=False, serialize=False, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
            ],
            options={
                'verbose_name_plural': 'Work Order Priorities',
            },
        ),
        migrations.CreateModel(
            name='WorkOrderStatus',
            fields=[
                ('id', models.UUIDField(primary_key=True, editable=False, serialize=False, default=uuid.uuid4)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(blank=True, help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
            ],
            options={
                'verbose_name_plural': 'Work Order Statuses',
            },
        ),
        migrations.AddField(
            model_name='workorder',
            name='priority',
            field=models.ForeignKey(null=True, blank=True, to='work_order.WorkOrderPriority'),
        ),
        migrations.AddField(
            model_name='workorder',
            name='requester',
            field=models.ForeignKey(null=True, blank=True, related_name='requester_work_order', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='workorder',
            name='status',
            field=models.ForeignKey(null=True, blank=True, to='work_order.WorkOrderStatus'),
        ),
        migrations.AddField(
            model_name='workorder',
            name='third_party',
            field=models.ForeignKey(null=True, blank=True, to='third_party.ThirdParty'),
        ),
    ]
