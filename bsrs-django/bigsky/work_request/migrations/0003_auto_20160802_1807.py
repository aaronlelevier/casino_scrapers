# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-08-02 18:07
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import django_fsm


class Migration(migrations.Migration):

    dependencies = [
        ('work_request', '0002_auto_20160802_1753'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workrequest',
            name='status',
            field=django_fsm.FSMKeyField(default='new', on_delete=django.db.models.deletion.CASCADE, protected=True, to='work_request.WorkRequestStatus'),
        ),
        migrations.AlterField(
            model_name='workrequeststatus',
            name='id',
            field=models.CharField(default='new', editable=False, max_length=50, primary_key=True, serialize=False),
        ),
    ]