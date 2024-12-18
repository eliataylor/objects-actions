from twilio.rest import Client

from _base import settings

def send_sms(to, body):
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    message = client.messages.create(
        body=body,
        from_=settings.TWILIO_PHONE_NUMBER,
        to=to
    )
    return message.sid

from django.db import connection
from django.db.utils import DatabaseError


def fetch_dict_query(query, params=None):
    """
    Executes a SQL query and returns results as a list of dictionaries.

    Args:
        query (str): The SQL query to execute.
        params (tuple, optional): Parameters to use with the query.

    Returns:
        list of dict: Query results where each row is represented as a dictionary.
    """
    results = []
    params = params or ()

    try:
        with connection.cursor() as cursor:
            # Use cursor with DictCursor if available
            if hasattr(cursor, 'dictfetchall'):
                cursor.execute(query, params)
                results = cursor.dictfetchall()
            else:
                # For custom databases, handle fetching as dict
                cursor.execute(query, params)
                column_names = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                results = [dict(zip(column_names, row)) for row in rows]
    except DatabaseError as e:
        # Handle database errors
        print(f"Database error: {e}")

    return results
