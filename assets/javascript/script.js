//Loads the script only when all assets have completely loaded;
window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
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

    // Class listens for keyboard event "arrowKeys" pushes them into the this.keys array and the removes it on keyUp event.
    class Controls {
        constructor() {
            this.keys = [];
            window.addEventListener('keydown', a => {
                if ((a.key === 'ArrowDown' ||
                    a.key === 'ArrowUp' ||
                    a.key === 'ArrowLeft' ||
                    a.key === 'ArrowRight')
                    && this.keys.indexOf(a.key) === -1) {
                    this.keys.push(a.key);
                    console.log(this.keys, a.key);
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
        }
    }

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
            this.sound = new Audio();
            this.sound.src = "assets/audio/dinosaur-2-86565.mp3";
        }
        /**parameters for the rex char to be drawn */
        draw(context) {
            context.strokeStlye = 'white';
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y - 60 + this.height / 4, this.width / 2, 0, Math.PI * 2);
            context.stroke(); // draws circle around Rex for collision detection
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y - 60, this.width, this.height);
        }
        update(input, deltaTime, enemies, meats) {
            //collision detection for meat object.
            meats.forEach(meat => {
                //Start by imagining there is a right angle triangle between the two circles: the verticle line of the triangle is distance x = meat.x - rex.x(this.x)
                const dx = meat.x - this.x;
                // distance y the verticle line is distance y = meat.y - rex.y(this.y) 
                const dy = meat.y - this.y;
                // hypotenuse distance is the square root of distanceX squared + distanceY squared
                const dh = Math.sqrt(dx * dx + dy * dy);
                //if statement to check if a collision occured + if it does increment meat score and delete the meat object.
                if (dh < meat.width / 2 + this.width / 2) {
                    meatCollected++;
                    meat.markedForRemove = true;
                    this.sound.play();
                };
            });
            enemies.forEach(enemy => {
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const dh = Math.sqrt(dx * dx + dy * dy);
                if (dh < enemy.width / 2 + this.width / 2) {
                    hp--;
                    enemy.markedForRemove = true;
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
            if (input.keys.indexOf('ArrowRight') > -1) {
                this.speed = 5;
            } else if (input.keys.indexOf('ArrowLeft') > -1) {
                this.speed = -5;
            } else if (input.keys.indexOf('ArrowUp') > -1 && this.onGround()) {
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
        }
        draw(context) {
            //draws 2 images for a never ending background - this is called in the update method in animate. 
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
        }
        update() {
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0;
        }
    }
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

        }
        draw(context) {
            //(image, sx, sy, sw, sh, dx, dy, dw, dh) - crops and places the spritesheet
            context.strokeStlye = 'white';
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y - 60 + this.height / 2, this.width / 2, 0, Math.PI * 2);
            context.stroke(); // draws circle around the egg for collision detection
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
                this.markedForRemove = true;
                score++;
            }
            //removes egg enemy from array once they hit the 0 co-ordinate on X-axis.

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
        }
        draw(context) {
            context.strokeStlye = 'white';
            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            context.stroke(); //draws circles around the meat for collision detection
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
        update() {
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.markedForRemove = true;// removes meat object from array when it leaves screen
        }
    }
    /**Pushed new enemies into the array every time eggTimer hits the eggInteveral variable and resets it back to 0 to count again when it does.
     */
    function Spawns(deltaTime) {
        // egg spawns
        if (eggTimer > eggInterval + randomInterval) {
            enemies.push(new EggEnemy(canvas.width, canvas.height));
            console.log(enemies);
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
            console.log(meats);
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
            //white shadow
            context.fillStyle = 'red';
            context.fillText('Game Over, You Ran Out Of Lives!', 202, 262);
            context.fillText('You dodged: ', 222, 312);
            context.fillText('x ' + score + ' Eggs', 472, 312);
            context.fillText('You Collected: ', 222, 382);
            context.fillText('x ' + meatCollected + ' Pieces Of Meat', 472, 382);


        }
    };

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
    let eggInterval = 1000; // adds new enemy every 2000 ms
    //meat specific times
    let meatTimer = 0;
    let meatInterval = Math.random() * 2000 + 1000;
    //can add to spawn methods to have random intervals for spawns.
    let randomInterval = Math.random() * 1000 + 500;

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
    animate(0); // needs a starting value for the animate "timestamp" or it's 1st value will be undefined.
});

