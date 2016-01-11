# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import uuid
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('location', '0001_initial'),
        ('third_party', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='WorkOrder',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('date_due', models.DateTimeField(blank=True, null=True)),
                ('assignee', models.ForeignKey(to=settings.AUTH_USER_MODEL, related_name='assignee_work_order', blank=True, null=True)),
                ('location', models.ForeignKey(to='location.Location')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='WorkOrderPriority',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
            ],
            options={
                'verbose_name_plural': 'Work Order Priorities',
            },
        ),
        migrations.CreateModel(
            name='WorkOrderStatus',
            fields=[
                ('id', models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, serialize=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('modified', models.DateTimeField(auto_now=True)),
                ('deleted', models.DateTimeField(help_text='If NULL the record is not deleted, otherwise this is the timestamp of when the record was deleted.', blank=True, null=True)),
                ('name', models.CharField(unique=True, max_length=100)),
            ],
            options={
                'verbose_name_plural': 'Work Order Statuses',
            },
        ),
        migrations.AddField(
            model_name='workorder',
            name='priority',
            field=models.ForeignKey(to='work_order.WorkOrderPriority', blank=True, null=True),
        ),
        migrations.AddField(
            model_name='workorder',
            name='requester',
            field=models.ForeignKey(to=settings.AUTH_USER_MODEL, related_name='requester_work_order', blank=True, null=True),
        ),
        migrations.AddField(
            model_name='workorder',
            name='status',
            field=models.ForeignKey(to='work_order.WorkOrderStatus', blank=True, null=True),
        ),
        migrations.AddField(
            model_name='workorder',
            name='third_party',
            field=models.ForeignKey(to='third_party.ThirdParty', blank=True, null=True),
        ),
    ]
