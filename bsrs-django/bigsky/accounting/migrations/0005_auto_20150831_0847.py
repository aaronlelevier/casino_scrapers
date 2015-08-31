# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0004_auto_20150828_1635'),
    ]

    operations = [
        migrations.AlterField(
            model_name='currency',
            name='code',
            field=models.CharField(help_text=b'USD', max_length=3),
        ),
        migrations.AlterField(
            model_name='currency',
            name='symbol',
            field=models.CharField(help_text=b'$', max_length=10),
        ),
        migrations.AlterField(
            model_name='currency',
            name='symbol_native',
            field=models.CharField(help_text=b'$', max_length=10, blank=True),
        ),
        migrations.RemoveField(
            model_name='currency',
            name='format',
        ),
    ]
