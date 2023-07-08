//Loads the script only when all assets have completely loaded;
window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 720;
    //Array for spawning multiple enemy characters
    let enemies = [];
    let meats = [];
    //variable for the score
    let score = 0;
    //variable for HP
    let hp = 3;
    //variable for meat collected
    let meatCollected = 0;
    //distance variable
    let distance = 0;
    //gameOver variable
    let gameOver = false;
    //fullsccreen button
    const fullScreen = document.getElementById('fullscreen');
    //mute button
    const muteButton = document.getElementById('mute');
    const musicButton = document.getElementById('music');
    //dinosaur sound effects
    let dinoSfx = new Audio("assets/audio/dinosaur-2-86565.mp3");
    let rexSfx = new Audio("assets/audio/JurassicPark-Tyrannosaurus_rex-Roaring.wav");
    let trexSfx = new Audio("assets/audio/T-Rex10.mp3");
    let titleAudio = new Audio("assets/audio/titlescreen.mp3");
    let gameAudio = new Audio("assets/audio/rungame.mp3");

    // Class listens for keyboard event "arrowKeys" pushes them into the this.keys array and the removes it on keyUp event.
    class Controls {
        constructor() {
            this.keys = [];
            this.touchY = '';
            this.touchX = '';
            this.touchThreshhold = 30;
            this.touchX = 0; //min of a 30px swipe to make character Jump to ensure jumps dont accidently occur. calculated between touch start and touch end
            window.addEventListener('keydown', a => {
                if ((a.key === 'ArrowDown' ||
                    a.key === 'ArrowUp' ||
                    a.key === 'ArrowLeft' ||
                    a.key === 'ArrowRight')
                    && this.keys.indexOf(a.key) === -1) {
                    this.keys.push(a.key);
                } else if (a.key === 'Shift' && gameOver) {
                    restartGame();
                }
            });
            window.addEventListener('keyup', a => {
                if (a.key === 'ArrowDown' ||
                    a.key === 'ArrowUp' ||
                    a.key === 'ArrowLeft' ||
                    a.key === 'ArrowRight') {
                    this.keys.splice(this.keys.indexOf(a.key), 1);
                }
            });
            //Mobile controls - console.log(a) - Inspect and get value of changeTouches, index 0, page Y.
            window.addEventListener('touchstart', a => {
                this.touchY = a.changedTouches[0].pageY;
                this.touchX = a.changedTouches[0].pageX;
                if (this.touchX > canvas.width / 2 && this.keys.indexOf('moveRight') === -1) {
                    this.keys.push('moveRight');
                } else if (this.touchX < canvas.width / 2 && this.keys.indexOf('moveLeft') === -1) {
                    this.keys.push('moveLeft');
                }
            });
            window.addEventListener('touchmove', a => {
                const swipeDist = a.changedTouches[0].pageY - this.touchY; // calculates the distance of Y touch start and touch end.
                if (swipeDist < -this.touchThreshhold && this.keys.indexOf('swipeUp') === -1) {
                    this.keys.push('swipeUp'); //pushes swipe up if swipe up distance is less than -Touch threshold and also checks it's not already in the this.keys array
                    if (gameOver) returnHome();
                } else if (swipeDist > this.touchThreshhold && this.keys.indexOf('swipeDown') === -1) {
                    this.keys.push('swipeDown'); //pushes swipe down if disantace is more than touchthreshold and also checks it's not already in the this.keys array
                    if (gameOver) restartGame(); // resets game on gameOver by swiping down.
                }
            });

            window.addEventListener('touchend', a => {
                this.keys.splice(this.keys.indexOf('swipeUp'), 1); //removes the swipe from array after touchend
                this.keys.splice(this.keys.indexOf('swipeDown'), 1);
                this.keys.splice(this.keys.indexOf('moveRight'), 1);
                this.keys.splice(this.keys.indexOf('moveLeft'), 1);
            });
        }
    };

    //Class to create the Player character object with 2 arguments to keep the character within the game. 
    class Rex {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 265; //SpriteWidth
            this.height = 136; //SpriteHeight
            this.x = 2;
            this.y = this.gameHeight - this.height; // stands the character at bottom of screen
            this.image = document.getElementById('rex-char');
            this.frameX = 0; //frame of the animation (horizontal)
            this.frameY = 0; // frame of the animation (verticle)
            this.maxFrame = 2;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 1; // movement of the sprite(rex)
            this.velocityY = 0;
            this.gravity = 1;
            this.sound = dinoSfx;
            this.hitSfx = trexSfx;
            this.roar = rexSfx;
        }
        restart() {
            this.x = 0;
            this.y = this.gameHeight - 60 - this.height;
        }
        /**parameters for the rex char to be drawn */
        draw(context) {
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y - 60, this.width, this.height);
        }
        update(input, deltaTime, enemies, meats) {
            //collision detection for meat object.
            meats.forEach(meat => {
                //Start by imagining there is a right angle triangle between the two circles: the verticle line of the triangle is distance x = meat.x - rex.x(this.x)
                const dx = (meat.x + meat.width / 2) - (this.x + this.width / 3);
                // distance y the verticle line is distance y = meat.y - rex.y(this.y) 
                const dy = (meat.y + meat.height / 2) - (this.y - 60 + this.height / 2);
                // hypotenuse distance is the square root of distanceX squared + distanceY squared
                const dh = Math.sqrt(dx * dx + dy * dy);
                //if statement to check if a collision occured + if it does increment meat score and delete the meat object.
                if (dh < meat.width / 2 + this.width / 3) {
                    meatCollected++;
                    meat.markedForRemove = true;
                    this.sound.play();
                };
            });
            enemies.forEach(enemy => {
                //calculates the width of characters into the collision
                const dx = (enemy.x + enemy.width / 3) - (this.x + this.width / 3);
                const dy = (enemy.y - 60 + enemy.height / 2) - (this.y - 60 + this.height / 2);
                const dh = Math.sqrt(dx * dx + dy * dy); // first compares the width and height of the circles for a collison
                if (dh < enemy.width / 3 + this.width / 3) { // then checks the radius of the circles for a collision
                    hp--;
                    enemy.markedForRemove = true;
                    this.hitSfx.play();
                };
                if (hp === 0) {
                    gameOver = true;
                };
            });
            //animation for the rex character
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            };
            // controls for the rex char 
            if (input.keys.indexOf('ArrowRight') > -1 || input.keys.indexOf('moveRight') > -1) {
                this.speed = 5;
            } else if (input.keys.indexOf('ArrowLeft') > -1 || input.keys.indexOf('moveLeft') > -1) {
                this.speed = -5;
            } else if ((input.keys.indexOf('ArrowUp') > -1 || input.keys.indexOf('swipeUp') > -1) && this.onGround()) {
                this.velocityY -= 35;
            } else if (input.keys.indexOf('ArrowDown') > -1 || input.keys.indexOf('swipeDown') > -1) {
                this.roar.play();
            } else {
                this.speed = 0;
            };
            //Horizontal movement, bounds the character to the canvas width;
            this.x += this.speed;
            if (this.x < 0) this.x = 0;
            else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;
            //Verticle movement, applies gravity to the player and prevents them from leaving the height of the screen
            this.y += this.velocityY;
            // this if will only let you jump if you are at the this.y which is also the "ground".
            if (!this.onGround()) {
                this.velocityY += this.gravity;
            } else {
                this.velocityY = 0;
            }
            if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height;
        }
        //checks if the sprite is on the bottom of the screen. 
        onGround() {
            return this.y >= this.gameHeight - this.height;
        }
    };

    //class to create the background object.
    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('background');
            this.x = 0;
            this.y = 0;
            this.width = 3550;
            this.height = 720;
            this.speed = 5;
        };
        draw(context) {
            //draws 2 images for a never ending background - this is called in the update method in animate. 
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
        }
        update() {
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;
        };
        restart() {
            this.x = 0;
        }
    };

    //Class structure for the Egg enemies.
    class EggEnemy {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 150;
            this.height = 150;
            this.image = document.getElementById('eggenemy');
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxFrame = 6;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = Math.random() * 5 + 5; // speed of egg animations
            this.markedForRemove = false;
        };
        draw(context) {
            //(image, sx, sy, sw, sh, dx, dy, dw, dh) - crops and places the spritesheet
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y - 60, this.width, this.height);
        }
        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0; //value increased by 1 up to max of 7, this is then multiplied in thre sourceX to continuously swap the position of the spritesheet which animates it.
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            this.x -= this.speed; //Moves enemies in from the left at the interval of what this.speed is.
            if (this.x < 0 - this.width) {
                this.markedForRemove = true; //removes egg enemy from array once they hit the 0 co-ordinate on X-axis.
                score++;
            };
        }
    };

    //Meat collectible object
    class Meat {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 120;
            this.height = 120;
            this.x = this.gameWidth - 100;
            this.y = this.gameHeight - this.height + Math.random() * 100 - 500;
            this.image = document.getElementById('meat');
            this.speed = 10;
            this.markedForRemove = false;
        };
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        };
        update() {
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.markedForRemove = true;
            distance++;// removes meat object from array when it leaves screen
        };
    };

    /**Pushes new egg enemy into the array every time eggTimer hits the eggInteveral variable and resets it back to 0 to count again when it does.*/
    function Spawns(deltaTime) {
        if (eggTimer > eggInterval + randomInterval) {
            enemies.push(new EggEnemy(canvas.width, canvas.height));
            eggTimer = 0;
        } else {
            eggTimer += deltaTime;
        }
        enemies.forEach(egg => {
            egg.draw(ctx);
            egg.update(deltaTime);
        });
        enemies = enemies.filter(egg => !egg.markedForRemove);
        if (meatCollected >= 20) {
            eggInterval = Math.random() * 900 + 400;
            meatInterval = Math.random() * 1000 + 800;
            randomInterval = Math.random() * 900 + 400;
        } else if (meatCollected >= 40) {
            eggInterval = Math.random() * 800 + 300;
            meatInterval = Math.random() * 900 + 600;
            randomInterval = Math.random() * 800 + 200;
        } else if (meatCollected >= 60) {
            eggInterval = Math.random() * 700 + 200;
            meatInterval = Math.random() * 800 + 400;
            randomInterval = Math.random() * 700 + 200;
        } else if (meatCollected >= 80) {
            eggInterval = Math.random() * 600 + 100;
            meatInterval = Math.random() * 700 + 200;
            randomInterval = Math.random() * 600 + 100;
        }
    };


    //handles the spawn times of the meat object
    function SpawnMeat(deltaTime) {
        if (meatTimer > meatInterval + randomInterval) {
            meats.push(new Meat(canvas.width, canvas.height));
            meatTimer = 0;
        } else {
            meatTimer += deltaTime;
        }
        meats.forEach(meat => {
            meat.draw(ctx);
            meat.update();
        });
        meats = meats.filter(meat => !meat.markedForRemove);
    };

    // variables for the meat images for statusText function.
    let meatImg = document.getElementById('meat');
    let heartImg = document.getElementById('heart');
    let angryEgg = document.getElementById('angry-egg');
    /**
     *  Displays the HP and Meat collected status. also displays message when the game ends.
     * the text is written twice to create a shadow effect.
     */
    function statusText(context) {
        context.font = '25px Cursive';
        context.drawImage(meatImg, 20, 20, 40, 40);
        context.drawImage(heartImg, 5, 50, 80, 80);
        context.fillStyle = 'black';
        context.fillText('x ' + meatCollected, 70, 40);
        context.fillText('x ' + hp, 70, 90);
        //white shadow
        context.fillStyle = 'white';
        context.fillText('x ' + meatCollected, 73, 43);
        context.fillText('x ' + hp, 73, 93);
        if (gameOver) {
            canvas.textAlign = "center";
            context.drawImage(angryEgg, 390, 260, 80, 80);
            context.drawImage(meatImg, 390, 340, 80, 80);
            context.fillStyle = 'black';
            context.fillText('Game Over, You Ran Out Of Lives!', 200, 260);
            context.fillText('You dodged: ', 220, 310);
            context.fillText('x ' + score + ' Eggs', 470, 310);
            context.fillText('You Collected: ', 220, 380);
            context.fillText('x ' + meatCollected + ' Pieces Of Meat', 470, 380);
            context.fillText('Press Shift Or Swipe Down to restart', 220, 450);
            context.fillText('Press TAB or Swipe Up to return to title', 220, 40);
            //red Text
            context.fillStyle = 'red';
            context.fillText('Game Over, You Ran Out Of Lives!', 202, 262);
            context.fillText('You dodged: ', 222, 312);
            context.fillText('x ' + score + ' Eggs', 472, 312);
            context.fillText('You Collected: ', 222, 382);
            context.fillText('x ' + meatCollected + ' Pieces Of Meat', 472, 382);
            context.fillText('Press Shift Or Swipe Down to restart', 222, 452);
            context.fillText('Press TAB or Swipe Up to return to title', 222, 42);
        }
    };

    /** Restarts the game.*/
    function restartGame() {
        gameOver = false;
        rexChar.restart();
        background.restart();
        enemies = [];
        meats = [];
        hp = 3;
        score = 0;
        meatCollected = 0;
        gameAudio.currentTime = 0;
        animate(0);
    };

    /** Toggles fullscreen on canvas.*/
    function toggleFullScreen() {
        if (!document.fullscreenElement) { // requests the fullscreenElement and returns an error if it cannot connect. 
            startScreen.requestFullscreen().catch(err => {
                alert(`There was an error making the game FullScreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };
    //Event listener for the fullScreen Button
    fullScreen.addEventListener('click', toggleFullScreen);

    /**Toggles Mute */
    function Mute() {
        if (dinoSfx.muted) {
            dinoSfx.muted = false;
            rexSfx.muted = false;
            trexSfx.muted = false;
            muteButton.innerHTML = "SFX On";
        } else {
            dinoSfx.muted = true;
            rexSfx.muted = true;
            trexSfx.muted = true;
            muteButton.innerHTML = "SFX Off";
        };
    }
    //Event listener for the Mute button
    muteButton.addEventListener('click', Mute);

    function toggleMusic() {
        if (gameAudio.muted) {
            gameAudio.muted = false;
            musicButton.innerHTML = "Music On";
        } else {
            gameAudio.muted = true;
            musicButton.innerHTML = "Music Off";
        };
    }
    musicButton.addEventListener('click', toggleMusic);
    //Adds the variables to the different assets of the game so they can be called in the animate function.
    const input = new Controls();
    const rexChar = new Rex(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);
    const eggEnemy = new EggEnemy(canvas.width, canvas.height);
    const meat = new Meat(canvas.width, canvas.height);

    //time for when last spawn was done.
    let lastTime = 0;
    // egg specific times
    let eggTimer = 0;
    let eggInterval = Math.random() * 1000 + 500; // adds new enemy every 1000 ms
    //meat specific times
    let meatTimer = 0;
    let meatInterval = Math.random() * 1000 + 1000;
    //can add to spawn methods to have random intervals for spawns.
    let randomInterval = Math.random() * 1000 + 500;
    //variables for the title screen
    let startScreen = document.getElementById('start-screen');
    let startButton = document.getElementById('start-game');

    /**
     * Start game function
     */
    function startGame() {
        canvas.style.display = "block";
        startScreen.style.display = "none";
        gameOver = false;
        animate(0); // needs a starting value for the animate "timestamp" or it's 1st value will be undefined.
    };
    startButton.addEventListener('click', startGame);

    /**
     * Back to Homepage - Restarts all values to starting point
     */
    function returnHome() {
        canvas.style.display = "none";
        startScreen.style.display = "block";
        gameOver = false;
        rexChar.restart();
        background.restart();
        enemies = [];
        meats = [];
        hp = 3;
        score = 0;
        meatCollected = 0;
        gameAudio.pause();
        gameAudio.currentTime = 0;
    };
    window.addEventListener('keydown', a => {
        if (a.key === 'Tab' && gameOver) returnHome();
    });

    /**
     * Runs the animation loop by repeatedly calling the animate function block.
     */
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime; // calculated by subtracting time from this loop and the time from the last loop;
        lastTime = timeStamp; //Calculated automatically by the requestAnimationFrame(animate) loop;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        background.update();
        rexChar.draw(ctx);
        rexChar.update(input, deltaTime, enemies, meats);
        Spawns(deltaTime);
        SpawnMeat(deltaTime);
        statusText(ctx);
        if (Mute) gameAudio.play();
        if (!gameOver) requestAnimationFrame(animate);
    };
});

