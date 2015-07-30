# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0003_auto_20150730_1104'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='default_auth_amount',
            field=models.DecimalField(default=0, help_text=b'The default amount here will be eventually set by system settings.', max_digits=15, decimal_places=4, blank=True),
        ),
        migrations.AlterField(
            model_name='role',
            name='default_auth_amount_currency',
            field=models.ForeignKey(blank=True, to='accounting.Currency', help_text=b"The default currency is 'usd'."),
        ),
    ]
