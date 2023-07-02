//Loads the script only when all assets have completely loaded;
window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 720;
    //Array for spawning multiple enemy characters
    let enemies = [];

    // Class listens for keyboard event "arrowKeys" pushes them into the this.keys array and the removes it on keyUp event.
    class Controls {
        constructor() {
            this.keys = [];
            window.addEventListener('keydown', a => {
                if (a.key === 'ArrowDown' ||
                    a.key === 'ArrowUp' ||
                    a.key === 'ArrowLeft' ||
                    a.key === 'ArrowRight'
                    && this.keys.indexOf(a.key) === -1) {
                    this.keys.push(a.key);
                    console.log(this.keys,a.key);
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
        }
        /**parameters for the rex char to be drawn */
        draw(context) {
            //context.fillStyle = 'white';
            //context.fillRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(input, deltaTime) {
            //animation for the rex character
            if(this.frameTimer > this.frameInterval){
            if (this.frameX >= this.maxFrame) this.frameX = 0;
            else this.frameX++;
            this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime
            };
          // controls for the rex char 
            if (input.keys.indexOf('ArrowRight') > -1) {
                this.speed = 5;
            } else if (input.keys.indexOf('ArrowLeft') > -1) {
                this.speed = -5;
            } else if (input.keys.indexOf('ArrowUp') > -1 && this.onGround()) {
                this.velocityY -= 30;
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
            this.speed = 5;

        }
        draw(context) {
            //(image, sx, sy, sw, sh, dx, dy, dw, dh) - crops and places the spritesheet
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(deltaTime) {
            if(this.frameTimer > this.frameInterval){
                if (this.frameX >= this.maxFrame) this.frameX = 0; //value increased by 1 up to max of 7, this is then multiplied in thre sourceX to continuously swap the position of the spritesheet which animates it.
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            this.x -= this.speed; //Moves enemies in from the left at the interval of what this.speed is.
        }
    };
    //Meat collectible object
    class Meat {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.x = 0;
            this.y = 0;
            this.width = 180;
            this.height = 180;
            this.image = document.getElementById('meat');
        }
    }
    /**Pushed new enemies into the array every time eggTimer hits the eggInteveral variable and resets it back to 0 to count again when it does.
     */
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

    }
    //Adds the variables to the different assets of the game so they can be called in the animate function.
    const input = new Controls();
    const rexChar = new Rex(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);
    const eggEnemy = new EggEnemy(canvas.width, canvas.height);
    const meat = new Meat();

    //time for when last egg spawn was done.
    let lastTime = 0;
    let eggTimer = 0;
    let eggInterval = 2000;
    //can add to spawn methods to have random intervals for spawns.
    let randomInterval = Math.floor(Math.random() * 1000 + 450);

    /**
     * Runs the animation loop by repeatedly calling the animate function block.
     */
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime; // gets the timestamp from built in function on JS that is taken from the repeated 'animate' function.
        lastTime = timeStamp; //6ms on personal computer.
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        background.update();
        rexChar.draw(ctx);
        rexChar.update(input, deltaTime);
        Spawns(deltaTime);
        requestAnimationFrame(animate);
    };
    animate(0); // needs a starting value for the animate "timestamp" or it's 1st value will be undefined.
});

