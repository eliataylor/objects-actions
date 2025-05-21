import datetime
import logging
import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from oaexample_app.models import MeetingTypes, Rallies, Meetings, Topics

User = get_user_model()
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Import realistic Meeting data with appropriate relationships'

    # Meeting types to ensure exist in the system
    MEETING_TYPES = [
        'In Person',
        'Virtual',
        'Conference',
        'Town Hall',
        'Committee Meeting',
        'Workshop',
        'Public Hearing',
        'Council Meeting',
        'Board Meeting',
        'Community Forum'
    ]

    # Political action rally titles for creating rallies
    RALLY_TITLES = [
        'Clean Energy Initiative',
        'Education Funding Reform',
        'Healthcare Access Coalition',
        'Criminal Justice Reform',
        'Affordable Housing Action',
        'Public Transportation Expansion',
        'Minimum Wage Increase',
        'Voting Rights Protection',
        'Tax Reform Proposal',
        'Environmental Protection Act',
        'Gun Safety Legislation',
        'Immigration Policy Reform',
        'Equal Pay Initiative',
        'Child Care Subsidy Program',
        'Labor Rights Enforcement',
        'Data Privacy Protection',
        'Public Land Conservation',
        'Municipal Budget Transparency',
        'Mental Health Services Expansion',
        'Small Business Support Act'
    ]

    # Common agenda templates for different meeting types
    AGENDA_TEMPLATES = {
        'In Person': [
            {'time': '00:00', 'duration': 15, 'title': 'Welcome and Introductions',
             'description': 'Opening remarks and introductions of key attendees'},
            {'time': '00:15', 'duration': 30, 'title': 'Main Topic Discussion',
             'description': 'Discussion of the primary meeting topic'},
            {'time': '00:45', 'duration': 20, 'title': 'Q&A Session', 'description': 'Audience questions and answers'},
            {'time': '01:05', 'duration': 10, 'title': 'Break', 'description': 'Short refreshment break'},
            {'time': '01:15', 'duration': 30, 'title': 'Action Items',
             'description': 'Review of action items and assignments'},
            {'time': '01:45', 'duration': 15, 'title': 'Closing Remarks',
             'description': 'Summary and closing statements'}
        ],
        'Virtual': [
            {'time': '00:00', 'duration': 10, 'title': 'Technical Check & Welcome',
             'description': 'Ensure all participants are connected properly'},
            {'time': '00:10', 'duration': 20, 'title': 'Presentation',
             'description': 'Main presentation of the meeting topic'},
            {'time': '00:30', 'duration': 20, 'title': 'Discussion',
             'description': 'Group discussion on the presentation'},
            {'time': '00:50', 'duration': 25, 'title': 'Q&A', 'description': 'Participant questions via chat or voice'},
            {'time': '01:15', 'duration': 15, 'title': 'Next Steps',
             'description': 'Plan for follow-up actions and subsequent meetings'}
        ],
        'Conference': [
            {'time': '00:00', 'duration': 25, 'title': 'Keynote Address',
             'description': 'Opening keynote by the main speaker'},
            {'time': '00:25', 'duration': 40, 'title': 'Panel Discussion',
             'description': 'Expert panel discussion on the conference theme'},
            {'time': '01:05', 'duration': 20, 'title': 'Break', 'description': 'Networking break with refreshments'},
            {'time': '01:25', 'duration': 45, 'title': 'Breakout Sessions',
             'description': 'Parallel sessions on specific topics'},
            {'time': '02:10', 'duration': 20, 'title': 'Plenary Session',
             'description': 'Summary of breakout sessions and closing remarks'}
        ],
        'Town Hall': [
            {'time': '00:00', 'duration': 15, 'title': 'Welcome Address',
             'description': 'Opening remarks by the mayor or council member'},
            {'time': '00:15', 'duration': 30, 'title': 'Community Updates',
             'description': 'Updates on ongoing community projects and initiatives'},
            {'time': '00:45', 'duration': 60, 'title': 'Public Comment Period',
             'description': 'Community members voice concerns and questions'},
            {'time': '01:45', 'duration': 15, 'title': 'Response & Action Items',
             'description': 'Officials respond to concerns and outline next steps'}
        ],
        'default': [
            {'time': '00:00', 'duration': 10, 'title': 'Opening', 'description': 'Opening remarks'},
            {'time': '00:10', 'duration': 30, 'title': 'Main Discussion', 'description': 'Primary topic discussion'},
            {'time': '00:40', 'duration': 15, 'title': 'Q&A', 'description': 'Questions and answers'},
            {'time': '00:55', 'duration': 5, 'title': 'Closing', 'description': 'Closing remarks and next steps'}
        ]
    }

    # Common locations for physical meetings
    MEETING_LOCATIONS = {
        'In Person': [
            '{street}, City Hall, {city}, {state}',
            '{street}, Community Center, {city}, {state}',
            '{street}, Business Center, {city}, {state}'
        ],
        'Conference': [
            '{street}, Convention Center, {city}, {state}',
            '{street}, Grand Hotel, {city}, {state}',
            '{street}, Conference Center, {city}, {state}'
        ],
        'Town Hall': [
            '{street}, City Hall, {city}, {state}',
            '{street}, Community Center, {city}, {state}',
            '{street}, Public Library, {city}, {state}'
        ],
        'Committee Meeting': [
            '{street}, Government Building, {city}, {state}',
            '{street}, Office Building, {city}, {state}',
            '{street}, Municipal Center, {city}, {state}'
        ],
        'Workshop': [
            '{street}, Training Center, {city}, {state}',
            '{street}, Business Center, {city}, {state}',
            '{street}, Education Building, {city}, {state}'
        ],
        'Public Hearing': [
            '{street}, City Hall, {city}, {state}',
            '{street}, Courthouse, {city}, {state}',
            '{street}, Government Center, {city}, {state}'
        ],
        'Council Meeting': [
            '{street}, City Hall, {city}, {state}',
            '{street}, Council Chambers, {city}, {state}',
            '{street}, Municipal Building, {city}, {state}'
        ],
        'Board Meeting': [
            '{street}, Corporate Office, {city}, {state}',
            '{street}, Headquarters, {city}, {state}',
            '{street}, Executive Suite, {city}, {state}'
        ],
        'Community Forum': [
            '{street}, Community Center, {city}, {state}',
            '{street}, Public Library, {city}, {state}',
            '{street}, School Auditorium, {city}, {state}'
        ]
    }

    # Virtual meeting URL templates
    VIRTUAL_MEETING_URLS = [
        'https://zoom.us/j/{meeting_id}',
        'https://teams.microsoft.com/l/meetup-join/{meeting_id}',
        'https://meet.google.com/{meeting_id}',
        'https://webex.com/meet/{meeting_id}'
    ]

    # Street name components for generating addresses
    STREET_NUMBERS = list(range(100, 9999))
    STREET_NAMES = [
        'Main St', 'Oak Ave', 'Maple St', 'Washington Blvd', 'Park Ave',
        'Broadway', 'Cedar Ln', 'Lake St', 'Pine St', 'River Rd',
        'Church St', 'Highland Ave', 'Elm St', 'Walnut St', 'Spring St',
        'Market St', 'Jefferson Ave', 'Lincoln Ave', 'Franklin St', 'Madison Ave'
    ]

    # Cities and states for physical addresses
    CITIES_AND_STATES = [
        ('New York', 'NY'), ('Los Angeles', 'CA'), ('Chicago', 'IL'),
        ('Houston', 'TX'), ('Phoenix', 'AZ'), ('Philadelphia', 'PA'),
        ('San Antonio', 'TX'), ('San Diego', 'CA'), ('Dallas', 'TX'),
        ('San Jose', 'CA'), ('Austin', 'TX'), ('Jacksonville', 'FL'),
        ('Fort Worth', 'TX'), ('Columbus', 'OH'), ('Charlotte', 'NC'),
        ('San Francisco', 'CA'), ('Indianapolis', 'IN'), ('Seattle', 'WA'),
        ('Denver', 'CO'), ('Boston', 'MA')
    ]

    def add_arguments(self, parser):
        parser.add_argument('--count', type=int, default=50, help='Number of meetings to create')

    def handle(self, *args, **options):
        count = options['count']
        self.stdout.write(self.style.SUCCESS(f'Starting to import {count} meetings'))

        # Ensure meeting types exist
        self.ensure_meeting_types()

        # Ensure rallies exist
        self.ensure_rallies()

        # Create meetings
        self.create_meetings(count)

        self.stdout.write(self.style.SUCCESS('Meeting import completed'))

    @transaction.atomic
    def ensure_meeting_types(self):
        """Create meeting types if they don't exist"""
        for type_name in self.MEETING_TYPES:
            meeting_type, created = MeetingTypes.objects.get_or_create(name=type_name)
            if created:
                self.stdout.write(f"Created meeting type: {type_name}")
            else:
                self.stdout.write(f"Meeting type already exists: {type_name}")

    @transaction.atomic
    def ensure_rallies(self):
        """Create rallies if they don't exist"""
        # Get or create some topics for rallies
        topics = []
        common_topics = ["Education", "Environment", "Healthcare", "Economy",
                         "Housing", "Transportation", "Justice", "Civil Rights"]

        for topic_name in common_topics:
            topic, created = Topics.objects.get_or_create(name=topic_name)
            topics.append(topic)

        existing_rally_titles = set(Rallies.objects.values_list('title', flat=True))

        # Create any missing rallies
        for title in self.RALLY_TITLES:
            if title not in existing_rally_titles:
                # Get a random author
                authors = list(User.objects.all()[:10])  # Limit to first 10 users for efficiency
                if not authors:
                    self.stdout.write(self.style.WARNING('No users found for rally author. Skipping rally creation.'))
                    continue

                author = random.choice(authors)

                # Create the rally
                rally = Rallies.objects.create(
                    title=title,
                    description=f"Political action campaign for {title}",
                    author=author,
                )

                # Add 1-3 random topics
                selected_topics = random.sample(topics, min(random.randint(1, 3), len(topics)))
                rally.topics.set(selected_topics)

                self.stdout.write(f"Created rally: {title}")
            else:
                self.stdout.write(f"Rally already exists: {title}")

    def create_meetings(self, count):
        """Create meetings with realistic data"""
        meeting_types = list(MeetingTypes.objects.all())
        rallies = list(Rallies.objects.all())
        users = list(User.objects.all()[:30])  # Limit to first 30 users for efficiency

        if not meeting_types:
            self.stdout.write(self.style.ERROR('No meeting types found. Run with --ensure-types first.'))
            return

        if not rallies:
            self.stdout.write(self.style.ERROR('No rallies found. Run with --ensure-rallies first.'))
            return

        if not users:
            self.stdout.write(self.style.ERROR('No users found for meeting participants.'))
            return

        success_count = 0
        error_count = 0

        for i in range(count):
            try:
                with transaction.atomic():
                    # Select a random meeting type
                    meeting_type = random.choice(meeting_types)

                    # Select a random rally (80% chance to have a rally)
                    rally = random.choice(rallies) if random.random() < 0.8 else None

                    # Generate meeting title
                    if rally:
                        title = f"{meeting_type.name} Meeting: {rally.title}"
                    else:
                        topics = ["Planning", "Discussion", "Review", "Update",
                                  "Strategy", "Implementation", "Feedback", "Coordination"]
                        title = f"{meeting_type.name} Meeting: {random.choice(topics)}"

                    # Generate meeting time (between now and 3 months in the future)
                    future_days = random.randint(3, 90)
                    future_date = timezone.now() + datetime.timedelta(days=future_days)

                    # Set meeting times based on meeting type
                    start_time = self.generate_meeting_time(meeting_type.name, future_date)

                    # Set duration based on meeting type
                    duration_minutes = self.get_meeting_duration(meeting_type.name)

                    # Calculate end time
                    end_time = start_time + datetime.timedelta(minutes=duration_minutes)

                    # Generate address based on meeting type
                    address = self.generate_address(meeting_type.name)

                    # Generate agenda
                    agenda_json = self.generate_agenda(meeting_type.name, duration_minutes)

                    # Set privacy level (0: Public, 1: Private, 2: Invite Only)
                    privacy = self.get_privacy_level(meeting_type.name)

                    # Get author (the same as rally author if possible)
                    author = rally.author if rally else random.choice(users)

                    # Create the meeting
                    meeting = Meetings.objects.create(
                        title=title,
                        rally=rally,
                        meeting_type=meeting_type,
                        address=address,
                        start=start_time,
                        end=end_time,
                        agenda_json=agenda_json,
                        duration=duration_minutes,
                        privacy=privacy,
                        author=author
                    )

                    # Add moderators (0-1)
                    if random.random() < 0.7:  # 70% chance to have a moderator
                        # Prefer users that are subscribed to the rally if it exists
                        potential_moderators = users
                        moderator = random.choice(potential_moderators)
                        meeting.moderators.add(moderator)

                    # Add sponsors (0-1)
                    if random.random() < 0.4:  # 40% chance to have a sponsor
                        potential_sponsors = users
                        sponsor = random.choice(potential_sponsors)
                        meeting.sponsors.add(sponsor)

                    # Add speakers (0-7)
                    speaker_count = random.randint(0, min(7, len(users)))
                    potential_speakers = users.copy()
                    random.shuffle(potential_speakers)
                    for j in range(speaker_count):
                        if j < len(potential_speakers):
                            meeting.speakers.add(potential_speakers[j])

                    self.stdout.write(f"Created meeting: {title}")
                    success_count += 1

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error creating meeting: {str(e)}"))
                error_count += 1

            # Log progress
            if (i + 1) % 10 == 0 or i == count - 1:
                self.stdout.write(f"Progress: {i + 1}/{count} (success: {success_count}, errors: {error_count})")

        self.stdout.write(
            self.style.SUCCESS(f"Meeting import completed. Success: {success_count}, Errors: {error_count}"))

    def generate_meeting_time(self, meeting_type, base_date):
        """Generate a realistic meeting time based on meeting type"""
        # Reset hour and minute to start of day
        base_date = base_date.replace(hour=0, minute=0, second=0, microsecond=0)

        if meeting_type == 'Virtual':
            # Virtual meetings during work hours (9 AM - 4 PM)
            hours = random.randint(9, 16)
            minutes = random.choice([0, 15, 30, 45])
        elif meeting_type == 'Conference':
            # Conferences start in morning (8-10 AM)
            hours = random.randint(8, 10)
            minutes = random.choice([0, 15, 30])
        elif meeting_type == 'Town Hall':
            # Town halls in evenings (5-7 PM)
            hours = random.randint(17, 19)
            minutes = random.choice([0, 15, 30])
        else:
            # Default for other meeting types (8 AM - 5 PM)
            hours = random.randint(8, 17)
            minutes = random.choice([0, 15, 30, 45])

        return base_date + datetime.timedelta(hours=hours, minutes=minutes)

    def get_meeting_duration(self, meeting_type):
        """Get a realistic duration in minutes based on meeting type"""
        if meeting_type == 'Virtual':
            # Virtual meetings tend to be shorter (30 min to 2 hours)
            return random.randint(30, 120)
        elif meeting_type == 'Conference':
            # Conferences can be quite long (3 to 8 hours)
            return random.randint(180, 480)
        elif meeting_type == 'Town Hall':
            # Town halls typically 1.5 to 3 hours
            return random.randint(90, 180)
        else:
            # Standard meetings typically 1 to 2 hours
            return random.randint(60, 120)

    def generate_address(self, meeting_type):
        """Generate a realistic address based on meeting type"""
        if meeting_type == 'Virtual':
            # Generate a virtual meeting URL
            template = random.choice(self.VIRTUAL_MEETING_URLS)
            meeting_id = ''.join(random.choice('0123456789abcdefghijklmnopqrstuvwxyz') for _ in range(10))
            return template.format(meeting_id=meeting_id)
        else:
            # Generate a physical address
            street_number = random.choice(self.STREET_NUMBERS)
            street_name = random.choice(self.STREET_NAMES)
            city, state = random.choice(self.CITIES_AND_STATES)

            # Get location template based on meeting type
            location_templates = self.MEETING_LOCATIONS.get(meeting_type, self.MEETING_LOCATIONS['default'])
            location_template = random.choice(location_templates) if location_templates else '{street}, {city}, {state}'

            street = f"{street_number} {street_name}"
            return location_template.format(street=street, city=city, state=state)

    def generate_agenda(self, meeting_type, duration_minutes):
        """Generate a realistic agenda JSON based on meeting type and duration"""
        # Get the appropriate template or use default
        template = self.AGENDA_TEMPLATES.get(meeting_type, self.AGENDA_TEMPLATES['default'])

        # Calculate total template duration
        template_duration = sum(item['duration'] for item in template)

        # Adjust the template based on the actual meeting duration
        scale_factor = duration_minutes / template_duration if template_duration > 0 else 1

        # Create a new agenda with adjusted durations
        agenda = []
        current_minutes = 0

        for item in template:
            adjusted_duration = int(item['duration'] * scale_factor)
            if adjusted_duration <= 0:
                adjusted_duration = 5  # Minimum duration

            # Format the time field
            hours = current_minutes // 60
            minutes = current_minutes % 60
            time_str = f"{hours:02d}:{minutes:02d}"

            # Add description suffix for variety
            description_suffixes = [
                " with group discussion to follow.",
                " including Q&A.",
                " with time for feedback.",
                " covering recent developments.",
                " addressing key concerns.",
                " with visual presentation."
            ]

            description = item['description']
            if random.random() < 0.5:
                description += random.choice(description_suffixes)

            agenda.append({
                'time': time_str,
                'duration': adjusted_duration,
                'title': item['title'],
                'description': description
            })

            current_minutes += adjusted_duration

        # Add notes field
        notes = None
        if random.random() < 0.3:  # 30% chance to have notes
            note_options = [
                "Please review materials before the meeting.",
                "Bring any relevant documentation.",
                "Remote participants should test connection beforehand.",
                "Minutes will be distributed after the meeting.",
                "Refreshments will be provided.",
                "Parking available in the main lot."
            ]
            notes = random.choice(note_options)

        return {
            'items': agenda,
            'notes': notes
        }

    def get_privacy_level(self, meeting_type):
        """Determine appropriate privacy level based on meeting type"""
        if meeting_type == 'Board Meeting':
            # Board meetings more likely to be private
            return random.choices([0, 1, 2], weights=[0.2, 0.6, 0.2])[0]
        elif meeting_type in ['Town Hall', 'Public Hearing', 'Community Forum']:
            # Public meetings almost always public
            return random.choices([0, 1, 2], weights=[0.9, 0.05, 0.05])[0]
        else:
            # Default distribution
            return random.choices([0, 1, 2], weights=[0.7, 0.2, 0.1])[0]
