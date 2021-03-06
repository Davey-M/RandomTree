const canvas = document.getElementById('canvas1');
const context = canvas.getContext('2d');

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

context.lineWidth = 1;
context.lineCap = 'round';
context.strokeStyle = '#ffffff';
context.fillStyle = 'rgba(0,0,0,.01)';

let points = [];
let paths = [];

const divergeChance = 20;
const speed = 1;
const maxPoints = 10000;

// How far ahead will the points look for collisions
const seeingDistance = 3;

let paused = true;
const startingDegree = Math.floor(Math.random() * 360);

class Point {
    constructor(x, y, direction, starter = false, degrees) {
        this.x = x ?? 0;
        this.y = y ?? 0;
        this.direction = direction ?? 0;

        this.divergeA = (Math.random() * .3) * Math.PI;

        this.starter = starter;

        this.last = {
            x: this.x,
            y: this.y
        }

        this.stopped = false;

        this.speed = speed;

        this.degrees = degrees ?? 0;

        this.setColor(this.degrees);

        this.sampler = {
            data: [0, 0, 0],
        };

        this.index = points.length;
        points.push(this);
    }

    setColor(degrees) {
        this.color = `hsl(${degrees}, 100%, 50%)`;
    }

    move() {
        if (this.stopped == false) {
            if (
                this.sampler.data[0] != 0 ||
                this.sampler.data[1] != 0 ||
                this.sampler.data[2] != 0
            ) {
                this.stop();
            }
            else if (this.starter === true) {
                this.movePointStraight();
            }
            else if (Math.floor(Math.random() * divergeChance) == 0) {
                // this.stop();
                let choice = Math.floor(Math.random() * 3);

                if (choice == 0) {
                    new Point(this.x, this.y, this.direction + this.divergeA, false, this.degrees);
                    this.direction -= this.divergeA;
                }
                else if (choice == 1) {
                    new Point(this.x, this.y, this.direction + this.divergeA, false, this.degrees);
                    new Point(this.x, this.y, this.direction - this.divergeA, false, this.degrees);
                }
                else {
                    new Point(this.x, this.y, this.direction - this.divergeA, false, this.degrees);
                    this.direction += this.divergeA;
                }
            }
            else {
                this.movePointsRandomly();
            }
        }
    }

    movePointsRandomly() {
        this.last.x = JSON.stringify(JSON.parse(this.x));
        this.last.y = JSON.stringify(JSON.parse(this.y));

        this.x = Math.sin(this.direction) * this.speed + this.x;
        this.y = Math.cos(this.direction) * this.speed + this.y;

        this.direction += (Math.random() * .4) - .2;

        this.sampler = context.getImageData(Math.sin(this.direction) * seeingDistance + this.x, Math.cos(this.direction) * seeingDistance + this.y, 1, 1);

        if (
            this.x < 0 ||
            this.x > canvas.width ||
            this.y < 0 ||
            this.y > canvas.height
        ) {
            this.stop();
        }
    }

    movePointStraight() {
        this.last.x = JSON.stringify(JSON.parse(this.x));
        this.last.y = JSON.stringify(JSON.parse(this.y));

        this.x = Math.sin(this.direction) * this.speed + this.x;
        this.y = Math.cos(this.direction) * this.speed + this.y;

        this.sampler = context.getImageData(Math.sin(this.direction) * seeingDistance + this.x, Math.cos(this.direction) * seeingDistance + this.y, 1, 1);

        if (
            this.x < 0 ||
            this.x > canvas.width ||
            this.y < 0 ||
            this.y > canvas.height
        ) {
            this.stop();
        }
    }

    draw() {
        this.setColor(this.degrees);
        this.degrees = this.degrees < 360 ? this.degrees + .1 : 0;

        context.strokeStyle = this.color;

        context.beginPath();
        context.moveTo(this.last.x, this.last.y);
        context.lineTo(this.x, this.y);
        context.stroke();
    }

    setMovementTimeout() {
        if (this.starter === true) {
            setTimeout(() => {
                this.starter = false;
            }, 1000);    
        }
    }

    stop() {
        this.stopped = true;
    }
}

function setup() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    points = [];

    // let p1 = new Point(1, 1, .25 * Math.PI, true, startingDegree);
    // let p2 = new Point(canvas.width - 1, canvas.height - 1, 1.25 * Math.PI, true, startingDegree);
    // let p3 = new Point(canvas.width - 1, 1, 1.75 * Math.PI, true, startingDegree);
    // let p4 = new Point(1, canvas.height - 1, .75 * Math.PI, true, startingDegree);

    // new Point(1, 1, .25 * Math.PI, true, Math.floor(Math.random() * 360));
    // new Point(canvas.width - 1, canvas.height - 1, 1.25 * Math.PI, true, Math.floor(Math.random() * 360));
    // new Point(canvas.width - 1, 1, 1.75 * Math.PI, true, Math.floor(Math.random() * 360));
    // new Point(1, canvas.height - 1, .75 * Math.PI, true, Math.floor(Math.random() * 360));

    // let canvasChunk = canvas.width / 9;
    // for (let i = 1; i <= 8; i++) {
    //     new Point(i * canvasChunk, 1, 0, true, startingDegree);
    // }

    for (let i = 0; i < 100; i++) {
        new Point(Math.floor(Math.random() * canvas.width), Math.floor(Math.random() * canvas.height), Math.floor(Math.random() * (2 * Math.PI)), false, Math.floor(Math.random() * 360));
    }

    loop();
}

setup();

function loop() {
    // context.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < points.length; i++) {
        let p = points[i];

        p.move()

        p.draw()

        if (p.stopped == true) {
            points.splice(i, 1);
        }
        else {
            p.index = i;
        }
    }

    if (paused == false && points.length < maxPoints && points.length > 0) {
        window.requestAnimationFrame(loop);
    }
    else {
        console.log('Paused');
        paused = true;
    }
}

function reset() {
    paused = true;
    setup();
}

window.addEventListener('keydown', async e => {
    if (e.key == 'Enter') {
        if (paused == false) {
            console.log('Paused');
            paused = true;
        }
        else {
            console.log('Starting');
            paused = false;
            loop();

            for (let p of points) {
                p.setMovementTimeout();
            }
        }
    }
})