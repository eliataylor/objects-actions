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

from oaexample.models import Song
from oaexample.models import Playlist
from oaexample.models import PlaylistSongs
from oaexample.models import EventPlaylists
from oaexample.models import Venue
from oaexample.models import Event
from oaexample.models import Friendship
from oaexample.models import Invites
from oaexample.models import ActivityLog
from oaexample.models import SongRequests
from oaexample.models import EventCheckins
from oaexample.models import Likes

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