# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0005_auto_20150714_1553'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='inv_wait',
            field=models.PositiveIntegerField(null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='role',
            name='wo_days_backdate',
            field=models.PositiveIntegerField(null=True, blank=True),
        ),
    ]
