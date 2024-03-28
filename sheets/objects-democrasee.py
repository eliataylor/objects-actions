from django.db import models

class Users(models.Model):
    id = models.TextField()
    email = models.TextField()
    real_name = models.CharField(max_length=255)
    website = models.URLField()
    bio = models.TextField()
    picture = models.ImageField()
    cover_photo = models.ImageField()
    resources = models.TextField()

class Officials(models.Model):
    job_title = models.CharField(max_length=255)
    office_phone = models.TextField()
    office_email = models.TextField()
    social_links = models.URLField()
    party_affiliation = models.TextField()
    city = models.TextField()

class Cities(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    postal_address = models.CharField(max_length=2555)
    picture = models.CharField(max_length=255)
    cover_photo = models.ImageField()
    sponsors = models.TextField()
    website = models.URLField()
    population = models.IntegerField()
    altitude = models.IntegerField()
    county = models.CharField(max_length=255)
    state_term_id = models.TextField()
    officials = models.TextField()
    land_area = models.IntegerField()
    water_area = models.IntegerField()
    total_area = models.IntegerField()
    density = models.IntegerField()
    timezone = models.CharField(max_length=255)

class Rallies(models.Model):
    title = models.CharField(max_length=255)
    desc = models.TextField()
    field_media = models.FileField(upload_to='media/')
    topics = models.TextField()
    field_comments = models.TextField()

class Publication(models.Model):
    title = models.CharField(max_length=255)
    desc = models.TextField()
    relationships = models.TextField()
    field_media = models.FileField(upload_to='media/')
    field_comments = models.TextField()

class Action Plan(models.Model):
    title = models.CharField(max_length=255)
    recommendation = models.TextField()
    exe_summary = models.TextField()
    analysis = models.TextField()
    background = models.TextField()
    coauthors = models.TextField()
    pro_argument = models.TextField()
    con_argument = models.TextField()
    prequesites = models.TextField()
    timeline = models.TextField()
    rally = models.TextField()

class Meetings(models.Model):
    title = models.CharField(max_length=255)
    field_rally = models.TextField()
    meeting_type = models.TextField()
    speakers = models.TextField()
    moderators = models.TextField()
    sponsors = models.TextField()
    field_location = models.CharField(max_length=2555)
    field_rooms = models.TextField()
    field_date_range = models.TextField()
    field_agenda_json = models.JSONField()
    duration = models.IntegerField()
    privacy = models.IntegerField()

class Resources(models.Model):
    title = models.CharField(max_length=255)
    description_html = models.TextField()
    image = models.ImageField()
    postal_address = models.CharField(max_length=255)
    price_ccoin = models.IntegerField()
    resource_type = models.TextField()

class Page(models.Model):
    title = models.CharField(max_length=255)
    description_html = models.TextField()

class Invites(models.Model):
    meeting = models.TextField()
    user = models.TextField()
    invited_by = models.TextField()
    status = models.TextField()

class Subscriptions(models.Model):
    subscriber = models.TextField()
    rally = models.TextField()
    meeting = models.TextField()
    status = models.TextField()
    modified = models.TextField()
    created = models.TextField()

class Rooms(models.Model):
    id = models.IntegerField()
    owner = models.TextField()
    created = models.TextField()
    modified = models.TextField()
    start_end_times = models.TextField()
    rally = models.TextField()
    meeting = models.TextField()
    privacy = models.TextField()
    status = models.TextField()
    chat_thread = models.TextField()
    recording = models.FileField(upload_to='videos/')

class Attendees(models.Model):
    room_id = models.TextField()
    user_id = models.TextField()
    display_name = models.CharField(max_length=255)
    display_bg = models.ImageField()
    role = models.TextField()
    stream = models.CharField(max_length=255)
    is_muted = models.BooleanField()
    sharing_video = models.BooleanField()
    sharing_audio = models.BooleanField()
    sharing_screen = models.BooleanField()
    hand_raised = models.BooleanField()
    is_typing = models.BooleanField()
