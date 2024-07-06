# Object Actions world builder

#### Start App template
```sh
cp .env.public .env 
npm install
npm start
```



---
#### To purge test data:
python manage.py shell

from djmote_app.models import Song
from djmote_app.models import Playlist
from djmote_app.models import PlaylistSongs
from djmote_app.models import EventPlaylists
from djmote_app.models import Venue
from djmote_app.models import Event
from djmote_app.models import Friendship
from djmote_app.models import Invites
from djmote_app.models import ActivityLog
from djmote_app.models import SongRequests
from djmote_app.models import EventCheckins
from djmote_app.models import Likes

Song.objects.all().delete()
Playlist.objects.all().delete()
PlaylistSongs.objects.all().delete()
EventPlaylists.objects.all().delete()
Friendship.objects.all().delete()
Invites.objects.all().delete()
ActivityLog.objects.all().delete()
EventCheckins.objects.all().delete()
SongRequests.objects.all().delete()
Likes.objects.all().delete()