## What is it?

A wrapper around [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) which changes the behavior in the following ways:

### Difference #1

Instead of an instance of [`Response`](https://developer.mozilla.org/en-US/docs/Web/API/Response), `fetch-for-redux` resolves with a POJO representation of a response suitable for dispatching as part of an action. Here's an example response from [the github api](https://api.github.com/users/gavacho).

```json
{
  "status": 200,
  "headers": {
    //_other_headers_not_shown
    "content-type": [
      "application/json; charset=utf-8"
    ]
  },
  "body": {
    "login": "gavacho",
    "id": 106077,
    "avatar_url": "https://avatars.githubusercontent.com/u/106077?v=3",
    "gravatar_id": "",
    "url": "https://api.github.com/users/gavacho",
    "html_url": "https://github.com/gavacho",
    "followers_url": "https://api.github.com/users/gavacho/followers",
    "following_url": "https://api.github.com/users/gavacho/following{/other_user}",
    "gists_url": "https://api.github.com/users/gavacho/gists{/gist_id}",
    "starred_url": "https://api.github.com/users/gavacho/starred{/owner}{/repo}",
    "subscriptions_url": "https://api.github.com/users/gavacho/subscriptions",
    "organizations_url": "https://api.github.com/users/gavacho/orgs",
    "repos_url": "https://api.github.com/users/gavacho/repos",
    "events_url": "https://api.github.com/users/gavacho/events{/privacy}",
    "received_events_url": "https://api.github.com/users/gavacho/received_events",
    "type": "User",
    "site_admin": false,
    "name": "Ken Browning",
    "company": "HauteLook",
    "blog": null,
    "location": "Los Angeles",
    "email": null,
    "hireable": null,
    "bio": null,
    "public_repos": 30,
    "public_gists": 9,
    "followers": 15,
    "following": 6,
    "created_at": "2009-07-17T18:03:11Z",
    "updated_at": "2016-05-16T22:41:21Z"
  }
}
```

The response object has three properties: `status`, `headers` & `body`.

The `status` property will always be a javascript Number.

The `headers` property will always be a javascript Object with lowercased header names as keys and an array of Strings as values.

The `body` property will be a String unless the response's `Content-Type` header indicates a JSON response.

### Difference #2

A response is always resolved, even when `fetch` would have rejected (e.g. when the network has dropped).

```json
{
  "status": 0,
  "headers": {},
  "body": "request to https://api.github.com/users/gavacho failed, reason: getaddrinfo ENOTFOUND api.github.com api.github.com:443"
}
```

## Motivation

I wanted to keep decision logic (about how to handle ajax responses) in reducers because reducers are very easy to test.  I also wanted testing with fixture responses to be very simple.

```js
// example action creator

export default fetchWidgets() {
  // assumes usage of redux-thunk
  return (dispatch) => {
    dispatch({
      type: 'WIDGETS_REQUEST_SENT',
    });

    fetchForRedux(widgetsUrl).then(response => dispatch({
      type: 'WIDGETS_RESPONSE_RECEIVED',
      payload: { response },
    }));
  };
};


// example reducer

const initialState = {
  isFetching: false,
  widgets: [],
  errorMessage: null,
};

export default function someReducer(state = initialState, action = {}) {
  switch(action.type) {
    case 'WIDGETS_REQUEST_SENT':
      return {
        ...state,
        isFetching: true,
      };

    case 'WIDGETS_RESPONSE_RECEIVED':
      // Here we can inspect the status code to
      // know what kind of response we received.
      if (action.payload.response.status === 200) {
        return {
          ...state,
          isFetching: false,
          widgets: action.payload.response.body.widgets,
          errorMessage: null,
        };
      }

      return {
        ...state,
        isFetching: false,
        errorMessage: 'Oops!  Something didn\'t work...  Wanna try again?',
      };

    default:
      return state;
  }
}
```
