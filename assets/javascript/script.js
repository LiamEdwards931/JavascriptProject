//Loads the script only when all assets have completely loaded;
window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 720;

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
                    console.log(a.key);
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
            this.speed = 1; // movement of the sprite(rex)
            this.velocityY = 0;
            this.gravity = 1;
        }
        /**parameters for the dog char to be drawn */
        draw(context) {
            context.fillStyle = 'white';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(input) {
            // controls for the rex char 
            if (input.keys.indexOf('ArrowRight') > -1) {
                this.speed = 5;
            } else if (input.keys.indexOf('ArrowLeft') > -1) {
                this.speed = -5;
            } else if (input.keys.indexOf('ArrowUp') > -1 && this.onGround()) {
                this.velocityY -= 20;
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
        onGround() {
            return this.y >= this.gameHeight - this.height;
        }
    }

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

    class EggEnemy {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.x = 0;
            this.y = 0;
            this.width = 150;
            this.height = 150;
            this.image = document.getElementById('eggenemy');
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y);
        }
        update() {

        }
    };
    const input = new Controls();
    const rexChar = new Rex(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);
    const eggEnemy = new EggEnemy();

    /**
     * Runs the animation loop by repeatedly calling the animate function block.
     */
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        background.update();
        rexChar.draw(ctx);
        rexChar.update(input);
        eggEnemy.draw(ctx);
        requestAnimationFrame(animate);
    };
    animate();
});

