const canvas = document.getElementById('canvas1');
const context = canvas.getContext('2d');

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

context.lineWidth = 2;
context.lineCap = 'round';
context.strokeStyle = '#ffffff';
context.fillStyle = 'rgba(0,0,0,.01)';

let points = [];
let paths = [];

const divergeChance = 50;
const speed = 1;
const maxPoints = 10000;

const seeingDistance = 3;

let paused = true;

let rgby = Math.floor(Math.random() * 4);

class Point
{
    constructor(x, y, direction)
    {
        this.x = x ?? 0;
        this.y = y ?? 0;
        this.direction = direction ?? 0;

        this.divergeA = (Math.random() * .5) * Math.PI;

        this.last = {
            x: this.x,
            y: this.y
        }

        this.stopped = false;

        this.speed = speed;

        // this.color = `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)})`;
        let colorRand = Math.floor(Math.random() * 155) + 100;
        switch(rgby) {
            case 0:
                this.color = `rgb(${colorRand}, 0, 0)`;
                break;
            case 1:
                this.color = `rgb(0, ${colorRand}, 0)`;
                break;
            case 2:
                this.color = `rgb(0, 0, ${colorRand})`;
                break;
            case 3:
                this.color = `rgb(${colorRand}, ${colorRand}, 0)`;
                break;
        }

        this.sampler = {
            data: [ 0 , 0 , 0 ],
        };

        this.index = points.length;
        points.push(this);
    }

    move()
    {
        if (this.stopped == false)
        {
            if (
                this.sampler.data[0] != 0 ||
                this.sampler.data[1] != 0 ||
                this.sampler.data[2] != 0
                )
            {
                this.stopped = true;
            }
            else if (Math.floor(Math.random() * divergeChance) == 0)
            {
                // this.stopped = true;

                if (Math.floor(Math.random() * 2) == 0)
                {
                    let newP = new Point(this.x, this.y, this.direction + this.divergeA);
                    this.direction -= this.divergeA;
                }
                else
                {
                    let newP = new Point(this.x, this.y, this.direction - this.divergeA);
                    this.direction += this.divergeA;
                }
            }
            else
            {
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
                )
                {
                    this.stopped = true;
                }
            }
        }
    }

    draw()
    {
        context.strokeStyle = this.color;

        context.beginPath();
        context.moveTo(this.last.x, this.last.y);
        context.lineTo(this.x, this.y);
        context.stroke();
    }
}

let p1 = new Point(0, 0, .25 * Math.PI)
let p2 = new Point(canvas.width, canvas.height, 1.25 * Math.PI)

function loop()
{
    // context.fillRect(0, 0, canvas.width, canvas.height);

    for (let p of points)
    {
        p.move();
    }

    for (let p of points)
    {
        p.draw();
    }

    for (let i = 0; i < points.length; i++)
    {
        let p = points[i];
        if (p.stopped == true)
        {
            points.splice(i, 1);
        }
        else {
            p.index = i;
        }
    }

    if (paused == false && points.length < maxPoints && points.length > 0)
    {
        window.requestAnimationFrame(loop);
    }
    else
    {
        console.log('Paused');
        paused = true;
    }
}

window.addEventListener('keydown', e => {
    if (e.key == 'Enter')
    {
        if (paused == false)
        {
            console.log('Paused');
            paused = true;
        }
        else
        {
            console.log('Starting');
            paused = false;
            loop();
        }
    }
})