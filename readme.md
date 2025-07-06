### chirp.mean

This is my own step-by-step implementation of the Chirp app.

Here is the tutorial series: https://www.youtube.com/playlist?list=PLbYsIzrAgAKgMb8oYsgRbDmVNt1y-h9fv

#### Run containerised:

Build and up all:

```shell
docker compose up -d --build
```

Result:

```
[+] Running 5/5
 ✔ chirp                               Built
 ✔ Network chirpmeanstack_default      Created
 ✔ Volume "chirpmeanstack_mongo-data"  Created
 ✔ Container chirpmeanstack-mongo-1    Started
 ✔ Container chirpmeanstack-chirp-1    Started
```

Shutdown:

```shell
docker compose down --volumes
```
