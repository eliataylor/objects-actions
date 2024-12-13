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
