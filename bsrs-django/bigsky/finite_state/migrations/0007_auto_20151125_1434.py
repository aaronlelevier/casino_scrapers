# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finite_state', '0006_auto_20151125_1426'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workrequeststatus',
            name='id',
            field=models.CharField(serialize=False, default='def11673-d4ab-41a6-a37f-0c6846b96006', max_length=50, editable=False, primary_key=True),
        ),
    ]
