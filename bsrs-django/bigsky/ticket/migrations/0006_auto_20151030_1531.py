# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('generic', '0002_auto_20151029_1621'),
        ('ticket', '0005_auto_20151030_1449'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ticketactivity',
            name='attachments',
        ),
        migrations.AddField(
            model_name='ticket',
            name='attachments',
            field=models.ManyToManyField(related_name='ticket_activities', to='generic.Attachment'),
        ),
    ]
