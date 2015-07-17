# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0002_auto_20150717_0927'),
    ]

    operations = [
        migrations.AlterField(
            model_name='person',
            name='auth_amount',
            field=models.PositiveIntegerField(default=0, blank=True),
        ),
        migrations.AlterField(
            model_name='person',
            name='location',
            field=models.ForeignKey(blank=True, to='location.Location', null=True),
        ),
    ]
