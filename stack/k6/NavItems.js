export const NAVITEMS = [
  {
    "singular": "Topic",
    "plural": "Topics",
    "type": "Topics",
    "segment": "topics",
    "api": "/api/topics",
    "search_fields": [
      "name"
    ],
    "model_type": "vocabulary"
  },
  {
    "singular": "Resource Type",
    "plural": "Resource Types",
    "type": "ResourceTypes",
    "segment": "resource-types",
    "api": "/api/resource-types",
    "search_fields": [
      "name"
    ],
    "model_type": "vocabulary"
  },
  {
    "singular": "Meeting Type",
    "plural": "Meeting Types",
    "type": "MeetingTypes",
    "segment": "meeting-types",
    "api": "/api/meeting-types",
    "search_fields": [
      "name"
    ],
    "model_type": "vocabulary"
  },
  {
    "singular": "State",
    "plural": "States",
    "type": "States",
    "segment": "states",
    "api": "/api/states",
    "search_fields": [
      "name"
    ],
    "model_type": "vocabulary"
  },
  {
    "singular": "Party",
    "plural": "Parties",
    "type": "Parties",
    "segment": "parties",
    "api": "/api/parties",
    "search_fields": [
      "name"
    ],
    "model_type": "vocabulary"
  },
  {
    "singular": "Stakeholder",
    "plural": "Stakeholders",
    "type": "Stakeholders",
    "segment": "stakeholders",
    "api": "/api/stakeholders",
    "search_fields": [
      "name"
    ],
    "model_type": "vocabulary"
  },
  {
    "singular": "Resource",
    "plural": "Resources",
    "type": "Resources",
    "segment": "resources",
    "api": "/api/resources",
    "search_fields": [
      "title"
    ]
  },
  {
    "singular": "User",
    "plural": "Users",
    "type": "Users",
    "segment": "users",
    "api": "/api/users",
    "search_fields": [
      "first_name",
      "last_name"
    ]
  },
  {
    "singular": "City",
    "plural": "Cities",
    "type": "Cities",
    "segment": "cities",
    "api": "/api/cities",
    "search_fields": [
      "name"
    ]
  },
  {
    "singular": "Official",
    "plural": "Officials",
    "type": "Officials",
    "segment": "officials",
    "api": "/api/officials",
    "search_fields": [
      "title"
    ]
  },
  {
    "singular": "Rally",
    "plural": "Rallies",
    "type": "Rallies",
    "segment": "rallies",
    "api": "/api/rallies",
    "search_fields": [
      "title"
    ]
  },
  {
    "singular": "Action Plan",
    "plural": "Action Plans",
    "type": "ActionPlans",
    "segment": "action-plans",
    "api": "/api/action-plans",
    "search_fields": [
      "title"
    ]
  },
  {
    "singular": "Meeting",
    "plural": "Meetings",
    "type": "Meetings",
    "segment": "meetings",
    "api": "/api/meetings",
    "search_fields": [
      "title"
    ]
  },
  {
    "singular": "Invite",
    "plural": "Invites",
    "type": "Invites",
    "segment": "invites",
    "api": "/api/invites",
    "search_fields": [
      "meeting__title"
    ]
  },
  {
    "singular": "Subscription",
    "plural": "Subscriptions",
    "type": "Subscriptions",
    "segment": "subscriptions",
    "api": "/api/subscriptions",
    "search_fields": [
      "rally__title",
      "meeting__title"
    ]
  },
  {
    "singular": "Room",
    "plural": "Rooms",
    "type": "Rooms",
    "segment": "rooms",
    "api": "/api/rooms",
    "search_fields": [
      "rally__title",
      "meeting__title"
    ]
  },
  {
    "singular": "Attendee",
    "plural": "Attendees",
    "type": "Attendees",
    "segment": "attendees",
    "api": "/api/attendees",
    "search_fields": []
  }
]
