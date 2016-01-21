# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0002_auto_20160111_1727'),
    ]

    operations = [
        migrations.AlterField(
            model_name='category',
            name='cost_amount',
            field=models.DecimalField(default=0, blank=True, null=True, decimal_places=4, max_digits=15),
        ),
    ]
