# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0003_auto_20150818_1436'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='currency',
            options={'verbose_name_plural': 'Currencies'},
        ),
        migrations.AddField(
            model_name='currency',
            name='decimal_digits',
            field=models.IntegerField(default=0, blank=True),
        ),
        migrations.AddField(
            model_name='currency',
            name='name_plural',
            field=models.CharField(help_text=b'US Dollars', max_length=50, blank=True),
        ),
        migrations.AddField(
            model_name='currency',
            name='rounding',
            field=models.IntegerField(default=0, blank=True),
        ),
        migrations.AddField(
            model_name='currency',
            name='symbol_native',
            field=models.CharField(help_text=b'$', max_length=1, blank=True),
        ),
    ]
