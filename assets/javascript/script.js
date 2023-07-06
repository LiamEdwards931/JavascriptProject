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
    //gameOver variable
    let gameOver = false;
    //fullsccreen button
    const fullScreen = document.getElementById('fullscreen');
    //mute button
    const muteButton = document.getElementById('mute');
    let dinoSfx = new Audio("assets/audio/dinosaur-2-86565.mp3");




    // Class listens for keyboard event "arrowKeys" pushes them into the this.keys array and the removes it on keyUp event.
    class Controls {
        constructor() {
            this.keys = [];
            this.touchY = '';
            this.touchThreshhold = 30; //min of a 30px swipe to make character Jump to ensure jumps dont accidently occur. calculated between touch start and touch end
            window.addEventListener('keydown', a => {
                if ((a.key === 'ArrowDown' ||
                    a.key === 'ArrowUp' ||
                    a.key === 'ArrowLeft' ||
                    a.key === 'ArrowRight')
                    && this.keys.indexOf(a.key) === -1) {
                    this.keys.push(a.key);
                } else if (a.key === 'Enter' && gameOver) {
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
            });
            window.addEventListener('touchmove', a => {
                const swipeDist = a.changedTouches[0].pageY - this.touchY; // calculates the distance between touch start and touch end.
                if (swipeDist < -this.touchThreshhold && this.keys.indexOf('swipeUp') === -1) {
                    this.keys.push('swipeUp'); //pushes swipe up if swipe up distance is less than -Touch threshold and also checks it's not already in the this.keys array
                } else if (swipeDist > this.touchThreshhold && this.keys.indexOf('swipeDown') === -1) {
                    this.keys.push('swipeDown'); //pushes swipe down if disantace is more than touchthreshold and also checks it's not already in the this.keys array
                    if (gameOver) restartGame();
                }
            });

            window.addEventListener('touchend', a => {
                this.keys.splice(this.keys.indexOf('swipeUp'), 1); //removes the swipe from array after touchend
                this.keys.splice(this.keys.indexOf('swipeDown'), 1);
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
                };
                if (hp === 0) {
                    gameOver = true;
                };
                if (meatCollected >= 15) {
                    enemy.speed = 12;
                } else if (meatCollected >= 30) {
                    enemy.speed = 14;
                } else if (meatCollected >= 45) {
                    enemy.speed = 16;
                }
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
            if (input.keys.indexOf('ArrowRight') > -1) {
                this.speed = 5;
            } else if (input.keys.indexOf('ArrowLeft') > -1) {
                this.speed = -5;
            } else if ((input.keys.indexOf('ArrowUp') > -1 || input.keys.indexOf('swipeUp') > -1) && this.onGround()) {
                this.velocityY -= 35;
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
    }
    //class to create the background object.
    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('background');
            this.x = 0;
            this.y = 0;
            this.width = 1800;
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
            if (this.x < 0 - this.width) this.markedForRemove = true;// removes meat object from array when it leaves screen
        };
    };
    /**Pushed new enemies into the array every time eggTimer hits the eggInteveral variable and resets it back to 0 to count again when it does.
     */
    function Spawns(deltaTime) {
        // egg spawns
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
     * Displays the HP and Meat collected status. also displays message when the game ends.
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
            context.fillText('Press Enter Or Swipe Down to restart', 220, 450);
            //red Text
            context.fillStyle = 'red';
            context.fillText('Game Over, You Ran Out Of Lives!', 202, 262);
            context.fillText('You dodged: ', 222, 312);
            context.fillText('x ' + score + ' Eggs', 472, 312);
            context.fillText('You Collected: ', 222, 382);
            context.fillText('x ' + meatCollected + ' Pieces Of Meat', 472, 382);
            context.fillText('Press Enter Or Swipe Down to restart', 222, 452);
        }
    };
    /**
     * Restarts the game.
     */
    function restartGame() {
        gameOver = false;
        rexChar.restart();
        background.restart();
        enemies = [];
        meats = [];
        hp = 3;
        score = 0;
        meatCollected = 0;
        animate(0);
    };

    /**
     * Toggles fullscreen on canvas.
     */
    function toggleFullScreen() {
        console.log(document.fullscreenElement);
        if (!document.fullscreenElement) { // requests the fullscreenElement and returns an error if it cannot connect. 
            canvas.requestFullscreen().catch(err => { //.catch is follow up code on the requestFullScreen to ensure that the game can be broswed in fullscreen
                alert(`There was an error making the game FullScreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
    //Event listener for the fullScreenButton
    fullScreen.addEventListener('click', toggleFullScreen);

    /**Toggles Mute */
    function Mute() {
        if (dinoSfx.muted) {
            dinoSfx.muted = false;
            muteButton.innerHTML = "mute";
        } else {
            dinoSfx.muted = true;
            muteButton.innerHTML = "unmute";
        };
    }
    muteButton.addEventListener('click', Mute);
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
    let eggInterval = Math.random() * 200 + 100; // adds new enemy every 1000 ms
    //meat specific times
    let meatTimer = 0;
    let meatInterval = Math.random() * 2000 + 1000;
    //can add to spawn methods to have random intervals for spawns.
    let randomInterval = Math.random() * 1000 + 500;
    //variables for the title screen
    let startScreen = document.getElementById('start-screen')
    let startButton = document.getElementById('start-game');
    /**
     * Start game function
     */
    function startGame(){
        canvas.style.display = "block";
        startScreen.style.display = "none";
        startButton.style.display = "none";
        animate(0); // needs a starting value for the animate "timestamp" or it's 1st value will be undefined.
    };
   startButton.addEventListener('click', startGame);
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
        if (!gameOver) requestAnimationFrame(animate);
    };
});

