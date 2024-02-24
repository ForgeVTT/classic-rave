This package can be used as a drop-in replacement for `classic-level` and it uses `rave-level` and extends it with the few missing methods from `ClassicLevel` which aren't in `RaveLevel`. It also exports the class as `ClassicLevel` so it can be used with no change to the code.
In order to make any project work with multiple clients trying to access the same classic-level database but without being hindered by the locking mechanism, we just need to replace the classic-level package in its `node_modules` folder.
There are however a couple of restrictions:
- The two clients trying to access the same leveldb, must be running on the same machine, since rave-level uses unix sockets to communicate and they do not work in a distributed file storage system for example
- The file paths to the leveldb database must be the same in all instances (i.e: opening the same db). If you use symbolic links, it would cause the paths to be different and it would fail. Use `fs.realpath` on the location before opening it in that case
- This has been tested on Linux and Windows machines, and while we expect it to work just the same on macOS, it has not been tested
- The rave-level files get stored in /tmp (on linux) as we need to build a hash of the leveldb file location and use a short path due to unix socket's 108 character filename restriction.
- We do not currently have a method to delete these temporary files when the database is closed, so keep an eye on your /tmp folder in case it grows too much (we once ran out of inodes on a server as it had over 1.5 million leftover socket files)

To install, we use the following simple script:
```
rm -rf node_modules/classic-level && \
mv classic-rave node_modules/classic-level && \
(cd node_modules/classic-level && npm install)
```

This package was written by [The Forge](https://forge-vtt.com) for use with Foundry Virtual Tabletop.
