var Physics = Physics || {};

let color = '#ffffff';

let environment,
ballSettings,
pegSettings,
dividerSettings;

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


class Environment {
    constructor(pageHeight, pageWidth) {
        this.height = pageHeight;
        this.width = pageWidth;
        this.centerX = this.width/2;
        this.centerY = this.height/2;
    }
}

class BallSettings {
    constructor() {
        this.ballCount = 1000;
        this.size = 10;
        this.friction = 0.00001;
        this.airFriction = 0.001;
        this.density = 0.01;
        this.bounciness = 0.4;
        this.sleepThreshold = 35;
        this.frequency = 50;
    }
}

class PegSettings {
    constructor() {
        this.shape = "polygon";
        this.pegSize = 30;
        this.colSpacing = 200;
        this.rowSpacing = 70;
        this.rows = 15;
    }
}

class DividerSettings {
    constructor(environment) {
        this.wallHeight = 1200;
        this.wallWidth = 10;
        this.num = 20;
        this.spacing = environment.centerX/this.num*2;
    }
}

function guiSetup(pageHeight, pageWidth) {
    environment = new Environment(pageHeight, pageWidth);
    ballSettings = new BallSettings();
    pegSettings = new PegSettings();
    dividerSettings = new DividerSettings(environment);

    let gui = new dat.GUI();

    let ballData = gui.addFolder('Ball Settings');
    ballData.add(ballSettings, 'ballCount', 100, 5000, 10);    
    ballData.add(ballSettings, 'size', 1, 50, 1);
    ballData.add(ballSettings, 'bounciness', 0.01, 1.5, 0.01);
    ballData.add(ballSettings, 'friction', 0.00001, 1, 0.00001);
    ballData.add(ballSettings, 'airFriction', 0.0001, 1, 0.0001);
    ballData.add(ballSettings, 'density', 0.001, 1, 0.001);
    ballData.add(ballSettings, 'sleepThreshold', 0, 100, 1);
    ballData.add(ballSettings, 'frequency', 0, 500, 1);
}

Physics.sandbox = function() {
    let engine = Engine.create({
        enableSleeping: true
    }),
    world = engine.world;

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

    let count = 0;

    setInterval(() => {
        if(count < ballSettings.ballCount){
            let ball = createBall(Bodies, environment, ballSettings);
            Matter.Events.on(ball, "sleepStart", () => { Matter.Body.setStatic(ball, true) });
            World.add(engine.world, ball);
            count += 1;
        }
    }, ballSettings.frequency);

    let floor = [createFloor(Bodies,environment)];

    let walls = [createWall(Bodies,environment.height,0,environment.centerY),createWall(Bodies,environment.height,environment.width,environment.centerY)];

    pegs = createPegs(Bodies,environment,pegSettings);

    dividers = createDividers(Bodies, environment, dividerSettings);

    World.add(world, floor);
    World.add(world, walls);
    World.add(world, pegs);
    World.add(world, dividers);
}

function createBall(Bodies, environment, ballSettings){
    return ball = Bodies.circle(environment.centerX+(-0.5 + Math.random()),0,ballSettings.size, {
        friction: ballSettings.friction,
        frictionAir: ballSettings.airFriction,
        density: ballSettings.density,
        restitution: ballSettings.bounciness,
        sleepThreshold: ballSettings.sleepThreshold
    })
}

function createFloor(Bodies, environment) {
    let wallThickness = 40;
    return Bodies.rectangle(environment.centerX,environment.height,environment.width,wallThickness, {
        render: {
            fillStyle: color,
            strokeStyle: 'C'
        },
    isStatic: true
    })
}

function createWall(Bodies, pageHeight, x, y) {
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
    for (i = 0; i < pegSettings.rows; i++){
        for(j=0; j <= i; j++){
            if(pegSettings.shape == "circle") {
                pegs.push(
                    Bodies.circle(environment.centerX-pegSettings.colSpacing*((i)/2)+pegSettings.colSpacing*j, 200+i*pegSettings.rowSpacing, pegSettings.pegSize, {
                        render: {
                            strokeStyle: '#ffffff',
                            lineWidth: 3
                        },
                        isStatic: true
                    })
                )
            }
            if(pegSettings.shape == "polygon") {
                pegs.push(
                    Bodies.polygon(environment.centerX-pegSettings.colSpacing*((i)/2)+pegSettings.colSpacing*j, 200+i*pegSettings.rowSpacing,6,pegSettings.pegSize, {
                        render: {
                            strokeStyle: '#ffffff',
                            lineWidth: 3
                        },
                        isStatic: true
                    })
                )
            }
        }
    }
    return pegs
}

function createDividers(Bodies, environment, dividerSettings) {
    let dividers = [];

    for(let i = 0; i < dividerSettings.num; i++){
        dividers.push(
            Bodies.rectangle(environment.centerX-dividerSettings.spacing/2-dividerSettings.spacing*i,environment.height-100,dividerSettings.wallWidth,dividerSettings.wallHeight, {
                render: {
                    fillStyle: color,
                    strokeStyle: 'C'
                },
                isStatic: true
            })
        );
        dividers.push(
            Bodies.rectangle(environment.centerX+dividerSettings.spacing/2+dividerSettings.spacing*i,environment.height-100,dividerSettings.wallWidth,dividerSettings.wallHeight, {
                render: {
                    fillStyle: color,
                    strokeStyle: 'C'
                },
                isStatic: true
            })
        );
    }
    return dividers
}

function resetWorld() {
    World.clear(engine.world);
    Engine.clear(engine);
    runner = Engine.run(engine);
}

window.onload = function() {
    let pageHeight = document.body.clientHeight*2,
    pageWidth = document.body.clientWidth*2;

    guiSetup(pageHeight, pageWidth);
    Physics.sandbox();
}