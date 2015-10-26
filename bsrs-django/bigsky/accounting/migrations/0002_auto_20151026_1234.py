# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import utils.fields


class Migration(migrations.Migration):

    dependencies = [
        ('accounting', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='currency',
            options={'verbose_name_plural': 'Currencies'},
        ),
        migrations.AlterField(
            model_name='currency',
            name='code',
            field=utils.fields.UpperCaseCharField(help_text='i.e. USD, JPY, etc...', unique=True, max_length=3),
        ),
    ]
