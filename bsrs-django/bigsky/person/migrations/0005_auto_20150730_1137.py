# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('person', '0004_auto_20150730_1136'),
    ]

    operations = [
        migrations.AlterField(
            model_name='role',
            name='default_auth_amount_currency',
            field=models.ForeignKey(blank=True, to='accounting.Currency', help_text=b"The default currency is 'usd'.", null=True),
        ),
    ]
