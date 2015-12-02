# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('location', '0002_auto_20151130_1552'),
    ]

    operations = [
        migrations.AlterField(
            model_name='location',
            name='status',
            field=models.ForeignKey(blank=True, to='location.LocationStatus', related_name='locations', null=True),
        ),
    ]
