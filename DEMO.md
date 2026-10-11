# Frame Call demo script

About two minutes. No login. Record against the public fixture:

https://er-s-an.github.io/frame-call/

The banner will say FIXTURE. Speak the lines in quotes. Point at the screen for the rest. Do not show an API key, a terminal with a key, or a network panel that reveals `X-Api-Key`. Devpost does not require this recording. The same clicks are the judge path in `SUBMISSION.md`.

## 0:00 Open the home page

The brief is already filled in: a Hong Kong independent coffee brand, 15-second opening film.

"The banner says FIXTURE. QLOO_API_KEY is not set. These IDs start with fixture: and the scores were written for the demo. They are not a Qloo response."

"Left column: a generic answer. Lo-fi, slow push-in, warm bokeh. No entity ID. Take Qloo away and this is all that remains."

"Right column: the call. Hong Kong and The Coffee Academics go in. Tatsuro Yamashita and In the Mood for Love come out, each with a contributor score. The rule on the slip is 0.10."

## 0:25 Open the request trace

Click "Request trace".

Every row says NOT SENT. Read the two insights rows: one filter type is `urn:entity:artist`, the other is `urn:entity:movie`, and both carry `feature.explainability=true`.

"Search, tags, then two insights calls. Destination and brand in, artist and movie out. On this host nothing was sent."

## 0:50 Withdraw it

Click **Contrast brief**.

The line changes to a Tokyo record shop, 15 seconds. The right side becomes "Nothing to call." The footer says "Nothing to sign." There is no artist, no film, and the coffee entities are gone.

"This second line is the control. Frame Call will not borrow the coffee entities, and it will not search Tokyo."

The left column still has adjectives and still has no ID.

## 1:15 Restore it

Click **Demo scene**.

The Hong Kong slip comes back. Click "Signed summary of these IDs".

The check page says HOLDS. Mode says "Fixture. Not a live Qloo response." The music ID and the camera ID match the slip.

"The signature uses a demo key that ships in the repo. It is not the Qloo key, and it does not mean the film will work."

## 1:40 Close

"Aggregate affinity is not a viewer's profile, a sync license, or a prediction. Remove Qloo and the right column has nothing to commit."

Go back to the slip. Stop.

License on the repository is MIT: https://github.com/er-s-an/frame-call
