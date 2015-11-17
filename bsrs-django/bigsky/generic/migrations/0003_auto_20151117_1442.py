# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ticket', '0007_remove_ticket_attachments'),
        ('generic', '0002_auto_20151029_1621'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='attachment',
            name='model_id',
        ),
        migrations.AddField(
            model_name='attachment',
            name='ticket',
            field=models.ForeignKey(related_name='attachments', null=True, blank=True, to='ticket.Ticket'),
        ),
    ]
