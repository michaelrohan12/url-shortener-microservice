# URL Shortener Microservice

This is the boilerplate code for the URL Shortener Microservice project.

- A request to /api/shorturl with a valid url should return a JSON object with a original url key that is the original url that was sent to be shortened and a shorturl key that signifies the target index to be used in /api/shorturl/:target to retreive original url

- A request to /api/shorturl/:target with a valid shorturl index should redirect to the original url

- If the input url doesn't follow the valid http://www.example.com format, the JSON response will contain { error: 'invalid url' }

- Server errors, invalid target index and missing url errors have been handled

## API Reference

#### POST original url to get short url index

```http
  POST /api/shorturl
```

| Parameter      | Type     | Description                               |
| :------------- | :------- | :---------------------------------------- |
| `req.body.url` | `string` | url of the form, 'http://www.example.com' |

#### Get original url page via short url index

```http
  GET /api/shorturl/:target
```

| Parameter           | Type     | Description                                           |
| :------------------ | :------- | :---------------------------------------------------- |
| `req.params.target` | `Number` | Redirect to original url using short url target index |
