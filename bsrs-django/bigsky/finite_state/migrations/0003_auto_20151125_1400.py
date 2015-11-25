# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finite_state', '0002_auto_20151125_1345'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workrequeststatus',
            name='name',
            field=models.CharField(blank=True, max_length=254, help_text="String value of the ID 'key'."),
        ),
    ]
