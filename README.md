# facebook-gc-bot

# pre-requisite

## configuration
config/default.json
```
{
  "fb_user": "FB_USER",
  "fb_pass": "FB_PASS",
  "thread_id": "THREAD_ID"
}
```


## generate appstate.json

* modify credentials in config

```
npm run gen:appstate


// should generate appstate.json in root directory
```



## generate messages.json

* put all message.json files under /messages directory

```
npm run gen:appstate


// should generate messages.json in root directory
```