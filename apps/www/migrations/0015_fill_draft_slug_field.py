
# Generated by Django 5.1.7 on 2025-05-27 16:53

import uuid
from django.db import migrations, models

# Source: https://docs.djangoproject.com/en/5.1/howto/writing-migrations/#migrations-that-add-unique-fields
def get_uuid_generator(app, model, field):
    def gen_uuid(apps, schema_editor):
        ActiveModel = apps.get_model(app, model)

        for entry in ActiveModel.objects.all():
            setattr(entry, field, uuid.uuid4())
            entry.save(update_fields=[field])

    return gen_uuid



class Migration(migrations.Migration):

    dependencies = [
        ('www', '0014_article_draft_slug_article_is_draft'),
    ]

    operations = [
        migrations.RunPython(
            get_uuid_generator('www', 'article', 'draft_slug'),
            reverse_code=migrations.RunPython.noop,
        ),
    ]

