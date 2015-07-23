# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0004_auto_20150723_0942'),
    ]

    operations = [
        migrations.AlterField(
            model_name='person',
            name='auth_amount',
            field=models.DecimalField(default=0, max_digits=15, decimal_places=4, blank=True),
        ),
    ]
