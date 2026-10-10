# Frame Call demo script

About two minutes. No login. Speak the lines in quotes. Point at the screen for the rest.

If the banner says FIXTURE, say so. Those IDs start with `fixture:` and were written for the demo. If it says LIVE, the IDs on this request came from `hackathon.api.qloo.com`. Do not show the API key, a terminal with the key, or a network panel that reveals the `X-Api-Key` header.

## 0:00 Open the home page

The brief is already filled in: a Hong Kong independent coffee brand, 15-second opening film.

"Left column: a generic answer. Lo-fi, slow push-in, warm bokeh. No entity ID. Take Qloo away and this is all that remains."

"Right column: the call. Hong Kong and The Coffee Academics go in. An artist and a film come out, each with a contributor score. The rule is written on the slip: a commit needs a contributor of at least 0.10."

## 0:25 Open the request trace

Click "Request trace".

In fixture mode every row says NOT SENT. Read the two insights rows: one filter type is `urn:entity:artist`, the other is `urn:entity:movie`, and both carry `feature.explainability=true`.

In live mode those rows say SENT.

"Search, tags, then two insights calls. Destination and brand in, artist and movie out. That is the whole product."

## 0:50 Withdraw it

Click **Contrast brief**.

The line changes to a Tokyo record shop, 15 seconds. The right side becomes "Nothing to call." There is no artist, no film, and nothing to sign. The coffee entities are gone.

"This second line is only the control. It is not another city. Frame Call will not borrow the coffee entities, and it will not search Tokyo."

The left column still has adjectives and still has no ID.

## 1:15 Restore it

Click **Demo scene**.

The Hong Kong slip comes back. Click "Signed summary of these IDs".

The check page says HOLDS. The music ID and the camera ID match the slip.

"The signature shows this server recorded these IDs together. It uses a demo key that ships in the repo. It is not the Qloo key, and it does not mean the film will work."

## 1:40 Close

"Aggregate affinity is not a viewer's profile, a sync license, or a prediction. Remove Qloo and the right column has nothing to commit."

Go back to the slip. Stop.
