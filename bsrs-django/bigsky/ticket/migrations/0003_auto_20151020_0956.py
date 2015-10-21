# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('category', '0001_initial'),
        ('ticket', '0002_auto_20151020_0814'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ticket',
            name='category',
        ),
        migrations.AddField(
            model_name='ticket',
            name='categories',
            field=models.ManyToManyField(null=True, to='category.Category'),
        ),
    ]
