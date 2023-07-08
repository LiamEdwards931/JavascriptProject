![CI logo](https://codeinstitute.s3.amazonaws.com/fullstack/ci_logo_small.png)

## Rex-Dash
Rex Dash is an endless sidescroll game, the purpose of it is to collect the meat that fly across the screen and to dodge the enemy egg characters, 
this game was designed for anybody of any age to play! it is fully optimised for PC and mobile devices alike and is intented for audiences of all backgrounds.

## Live deployment
The final project that is stored on gitHub is located [here](https://liamedwards931.github.io/JavascriptProject/)

![Responsive screen shot of the project](assets/images/readmeimg/responsivescreen.png)

## Contents

[Title](#rex-run)
[Live deployment](#live-deployment)
[Markup](#markup)
[Testing](#testing)
[bugs](#bugs)
[credits](#credits)

## Markup

- Code is written using Tab key spacing on Html, CSS and Javascript.

## Testing

- Code was tested on Microsoft Edge, FireFox and Google Chrome browser.
- Testing involved running the game loop and looking at bugs with the web development tools the following criteria have all been tested:
  - Tested Player Rex for hit markers, jump height, animation speed, "gravity" factor to bring rex back down, move left + right speeds, and SFX on Arrow down for the rex roar,found some bugs that are documented in the [bugs](#bugs) section of the README. All tested for PC use and Mobile use.
  - Tested eggEnemy intervals to make sure the game was beginner friendly, had a friend who is inexperienced at games to play to see if the game was intuitve and easy to play.
  - tested the difficulty increase to ensure that the code was in fact increasing the spawn rate of enemies as you collected more Meat objects.
  - Tested Meat collection to ensure that it was collecting properly and increasing the meatCollected score and playing the correct SFX on collection.
  - Tested background to ensure that the scroll speed and "parralax effect" is working correctly.
  - Tested GameOver to ensure that it activates when hp value reached 0.
  - Tested restartGame to enure that when shift is pressed when it is gameOver the game restarts from beginning.
  - Tested Mute function and ensured that all sounds are muted when button is clicked.
  - Tested fullscreen function and ensured that when clicked both the title screen and the canvas both went into the full screen state.
  - had issues with the movement on phone not registering swipe left and right during a swipe up jump (fixed) - this.touchX was registered as variable twice and was resetting initial swipe position instead of registering a swipe.

## Bugs

- Array for the keys wasn't deleting the key after input (fixed) - There was a typo on splice method and was spelt 'spilce'
- Player Rex character would float back to the left edge of screen after continuous key presses (fixed) - was a result of a missing bracket on the event listener in the If statement for the keydown.
- Player character wasn't animating correctly (fixed) - was missing a statement to reset frame interval back to 0 after it had stopped counting.
- Meat was incrementing the score by 20 each time collected (fixed) - was missing a second statement to remove the meat after it had been collected.
- Meat was being collected without a collision (fixed) - removed the division from the this.x and this.y in the meat collision calculation.
- the Y axis position of the rex wasn't being calculated correctly in the collision detection (fixed) - adjusted the y axis formula to correctly mark where the rex was sitting on the canvas.
- enter key wasn't working to reset the game on gameOver (fixed) - set the wrong variable for rexchar in the gameOver function, changed it back to normal to make it work.
- Changed the reset game button to shift as there was a problem with the mute button activating when game was resetting.
- canvas and title screen jumped when swiping on mobile (fixed) - set the CSS property of canvas and title screen to "touch-action:none".
- When fullscreen button was clicked it would only go to fullscreen on the Canvas (fixed) - set the property the fullscreen was looking for to the window of the document and not the canvas specifically.
- Bug where back to title screen button would keep the canvas in the same state it was when button was pressed (fixed) - set the same values as restart game minus the animate(0) call to reset everything when back to home

## Credits

- T-rex spritesheet was taken from [pngkey](https://www.pngkey.com/download/u2e6o0o0o0w7w7a9_dinosaur-trex-dino-sprite-sheet/)
- Egg enemy character was taken from [bevoulin](https://bevouliin.com/category/game-asset/game-characters/page/3/)
- Audio for rex was taken from [pixabay](https://pixabay.com/sound-effects/search/t-rex/)
- Audio for collecting the meat was taken from[Memozee](http://animal.memozee.com/animal/SOUND/JurassicPark-Tyrannosaurus_rex-Roaring.wav)
- Audio for getting hit by the eggs was taken from [Film Masters](https://www.youtube.com/watch?v=b3NYvwd8vBI)
- The meat image was taken from [superautopets](https://superautopets.fandom.com/wiki/Meat_Bone)
- the heart image was taken from [etsy](https://etsy.com)
- Audio for title screen and Game run was taken from [PixaBay](https://pixabay.com/music/search/dinosaur/)
- Animation techniques/Movement techniques were learned from Youtube [Franks Laboratory](https://www.youtube.com/watch?v=GFO_txvwK_c)
