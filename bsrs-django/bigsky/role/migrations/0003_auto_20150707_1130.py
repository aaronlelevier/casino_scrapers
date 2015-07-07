# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('role', '0002_auto_20150707_1127'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='location_level',
            field=models.ForeignKey(blank=True, to='location.LocationLevel', null=True),
        ),
    ]
