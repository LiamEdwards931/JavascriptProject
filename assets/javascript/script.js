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
            this.width = 267; //SpriteWidth
            this.height = 150; //SpriteHeight
            this.x = 0;
            this.y = this.gameHeight - this.height; // stands the character at bottom of screen
            this.image = document.getElementById('rex-char');
            this.frameX = 0;
            this.frameY = 3;
        }
        /**parameters for the rex char to be drawn */
        draw(context) {
            context.fillStyle = 'white';
            context.fillRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update() {
            this.x++;
        }
    }
    const Input = new Controls();
    const rexChar = new Rex(canvas.width, canvas.height);

    /**
     * Runs the animation loop by repeatedly calling the animate function block.
     */
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rexChar.draw(ctx);
        rexChar.update(ctx);
        requestAnimationFrame(animate);
    };
    animate();
});

