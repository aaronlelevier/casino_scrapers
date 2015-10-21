# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0003_auto_20151020_0956'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ticket',
            name='categories',
            field=models.ManyToManyField(to='category.Category'),
        ),
    ]
