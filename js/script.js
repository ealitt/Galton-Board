var Physics = Physics || {};

let color = '#ffffff';

let Environment = function(pageHeight, pageWidth) {
    this.height = pageHeight;
    this.width = pageWidth;
    this.centerX = this.width/2;
    this.centerY = this.height/2;
}

let BallSettings = function() {
    this.size = 10;
    this.friction = 0.00001;
    this.frictionAir = 0.001;
    this.density = 0.01;
    this.restitution = 0.4;
    this.sleepThreshold = 25;
}

let PegSettings = function() {
    this.pegSize = 14;
    this.colSpacing = 145;
    this.rowSpacing = 70;
    this.rows = 15;
}

let DividerSettings = function(environment) {
    this.wallHeight = 1200;
    this.wallWidth = 10;
    this.num = 30;
    this.spacing = environment.centerX/this.num*2;
}

Physics.sandbox = function() {
    let Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Common = Matter.Common,
    Events = Matter.Events,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Vector = Matter.Vector;

    let engine = Engine.create({
        enableSleeping: true
    }),
    world = engine.world;

    let pageHeight = document.body.clientHeight*2,
    pageWidth = document.body.clientWidth*2;
    
    let environment = new Environment(pageHeight, pageWidth);

    let render = Render.create({
        element: document.body,
        engine: engine,
        options: {
            width: environment.width,
            height: environment.height,
            wireframes: false
        }
    });

    Render.run(render);
    
    let runner = Runner.create();
    Runner.run(runner, engine);

    let ball,
    ballSettings = new BallSettings();

    setInterval(() => {
        ball = createBall(Bodies, environment, ballSettings);
        Matter.Events.on(ball, "sleepStart", () => {Matter.Body.setStatic(ball, true)});
        World.add(engine.world, ball);
    }, 50);

    let floor = createFloor(Bodies);

    let walls = [createWall(Bodies,environment.height,0,environment.centerY),createWall(Bodies,environment.height,environment.width,environment.centerY)];

    let pegSettings = new PegSettings(),
    pegs = createPegs(Bodies,environment,pegSettings);

    let dividerSettings = new DividerSettings(environment),
    dividers = createDividers(Bodies, environment, dividerSettings);

    World.add(world, floor);
    World.add(world, walls);
    World.add(world,pegs);
    World.add(world,dividers);
}

function createBall(Bodies, environment, ballSettings){
    return ball = Bodies.circle(environment.centerX+(-0.5 + Math.random()),0,ballSize, {
        friction: ballSettings.friction,
        frictionAir: ballSettings.frictionAir,
        density: ballSettings.density,
        restitution: ballSettings.restitution,
        sleepThreshold: ballSettings.sleepThreshold
    });
}

function createFloor(Bodies, environment) {
    return Bodies.rectangle(environment.centerX,environment.centerY*2,pageWidth,40, {
        render: {
            fillStyle: color,
            strokeStyle: 'C'
        },
    isStatic: true
    });
}

function createWalls(Bodies, pageHeight, x, y) {
    let wallThickness = 40;
    return Bodies.rectangle(x,y,wallThickness,pageHeight, {
        render: {
            fillStyle: color,
            strokeStyle: 'C'
        },
        isStatic: true
    })
}

function createPegs(Bodies, environment, pegSettings) {
    let pegs = []
    for (i = 0; i < rows; i++){
        for(j=0; j <= i; j++){
            pegs.push(
                Bodies.circle(environment.centerX-pegSettings.colSpacing*((i)/2)+pegSettings.colSpacing*j, 200+i*pegSettings.rowSpacing, pegSettings.pegSize, {
                    render: {
                        fillStyle: color,
                        strokeStyle: '#ffffff',
                        lineWidth: 3
                    },
                    isStatic: true
                })
            )
        }
    }
    return pegs
}

function createDividers(Bodies, environment, dividerSettings) {
    let dividers = [];

    for(let i = 0; i<num; i++){
        dividers.push(
            Bodies.rectangle(centerX-spacing/2-spacing*i,pageHeight-100,wallWidth,wallHeight, {
                render: {
                    fillStyle: color,
                    strokeStyle: 'C'
                },
                isStatic: true
            })
        );
        dividers.push(
            Bodies.rectangle(centerX+spacing/2+spacing*i,pageHeight-100,wallWidth,wallHeight, {
                render: {
                    fillStyle: color,
                    strokeStyle: 'C'
                },
                isStatic: true
            })
        );
    }
    return dividers;
}

window.onload = function() {
    Physics.sandbox();
}