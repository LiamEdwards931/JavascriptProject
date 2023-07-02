![CI logo](https://codeinstitute.s3.amazonaws.com/fullstack/ci_logo_small.png)

## Bugs
- Player Rex character would float back to the left edge of screen after continuous key presses (fixed) - was a result of a missing bracket on the event listener IF for the keydown.
- Player character wasn't animating correctly (fixed) - was missing a statement to reset frame interval back to 0 after it had stopped counting.