var Game = {};

Game = function(game) {
	this.game = game;
};

Game.prototype = {
	preload : function() {
		this.load.image('fuel','assets/fuelIcon.png');
		this.load.image('planet-1','assets/planet1.png');
		this.load.image('planet-2','assets/planet2.png');
		this.load.image('planet-3','assets/planet3.png');
		this.load.image('planet-4','assets/planet4.png');
		this.load.image('asteroid-1','assets/asteroid1.png');
		this.load.image('asteroid-2','assets/asteroid2.png');
		this.load.image('asteroid-3','assets/asteroid3.png');
		this.load.image('stars', 'assets/starfield.png');
		this.load.image('ship','assets/ship.png');
		this.load.image('station','assets/station.png');

		this.load.physics('physicsData', 'assets/physics/object-shapes.json');
		//this.load.audio('rocket', 'assets/audio/rocket.wav');
	},

	create : function() {
		fuelCapacity = 100;
		hitByAsteroid = false;

		//this.rocketSound = this.game.add.audio('rocket');
		//this.rocketSound.volume = 0.2;

		this.game.world.setBounds(-100 , 0, 800, 3200);
		this.game.physics.startSystem(Phaser.Physics.P2JS);
		//this.game.physics.p2.defaultRestitution = 0.3;
		this.game.physics.p2.setImpactEvents(true);

		this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);

		this.starfield = this.game.add.tileSprite(0, 0, 600, 800, 'stars');
   		this.starfield.fixedToCamera = true;

		//Create collision groups
		this.shipCollision = this.game.physics.p2.createCollisionGroup();
		this.planetCollision = this.game.physics.p2.createCollisionGroup();
		this.asteroidsCollision = this.game.physics.p2.createCollisionGroup();
		this.stationCollision = this.game.physics.p2.createCollisionGroup();

		//Bitmap data to print things
		this.bmd = this.game.add.bitmapData(800, 3200);
		this.bmd.context.fillStyle = '#ffffff';
		this.game.add.sprite(-100, 0, this.bmd);

		this.ship = this.game.add.sprite(300, 3150,'ship');
		this.game.physics.p2.enable(this.ship, false);
		this.game.camera.follow(this.ship);

		this.ship.body.clearShapes();
		this.ship.body.loadPolygon('physicsData', 'ship');
		this.ship.body.setCollisionGroup(this.shipCollision);

		//Create planets
		this.planets = this.game.add.group();
		this.planets.enableBody = true;
		this.planets.physicsBodyType = Phaser.Physics.P2JS;

		planet1 = this.planets.create(150, 2800, 'planet-1');
		planet2 = this.planets.create(450, 2400, 'planet-2');
		planet3 = this.planets.create(215, 2000, 'planet-4');
		planet4 = this.planets.create(400, 1700, 'planet-3');
		//Asteroid belt
		planet5 = this.planets.create(430, 1020, 'planet-1');
		//another asteroid
		planet6 = this.planets.create(135, 800, 'planet-3');
		planet7 = this.planets.create(365, 500, 'planet-2');

		this.game.physics.p2.enable([planet1, planet2, planet3, planet4, planet5, planet6, planet7]);

		planet1.body.static = true;
		planet2.body.static = true;
		planet3.body.static = true;
		planet4.body.static = true;
		planet5.body.static = true;
		planet6.body.static = true;
		planet7.body.static = true;

		planet1.body.collides(this.shipCollision);
		planet2.body.collides(this.shipCollision);
		planet3.body.collides(this.shipCollision);
		planet4.body.collides(this.shipCollision);
		planet5.body.collides(this.shipCollision);
		planet6.body.collides(this.shipCollision);
		planet7.body.collides(this.shipCollision);

		planet1.body.setCollisionGroup(this.planetCollision);
		planet2.body.setCollisionGroup(this.planetCollision);
		planet3.body.setCollisionGroup(this.planetCollision);
		planet4.body.setCollisionGroup(this.planetCollision);
		planet5.body.setCollisionGroup(this.planetCollision);
		planet6.body.setCollisionGroup(this.planetCollision);
		planet7.body.setCollisionGroup(this.planetCollision);

		//Array of rotation force for each planet
		this.rotationForce = {};
		this.rotationForce[planet1.body.id] = -.25;
		this.rotationForce[planet2.body.id] = .35;
		this.rotationForce[planet3.body.id] = .55;
		this.rotationForce[planet4.body.id] = .40;
		this.rotationForce[planet5.body.id] = -.10;
		this.rotationForce[planet6.body.id] = .15;
		this.rotationForce[planet7.body.id] = -.20;

		//Draw planet orbit
	    this.planets.forEach(this.drawPlanetOrbit, this);
	    this.bmd.dirty = true;

	    //Create some asteroids
	    this.game.physics.p2.updateBoundsCollisionGroup();

	    this.asteroids = this.game.add.group();
	    asteroid1 = this.asteroids.create(550, 1500, 'asteroid-1');
	    asteroid2 = this.asteroids.create(142, 1360, 'asteroid-3');
	    asteroid3 = this.asteroids.create(750, 850, 'asteroid-2');

	    this.game.physics.p2.enable([asteroid1, asteroid2, asteroid3]);

	    asteroid1.body.setCollisionGroup(this.asteroidsCollision);
	    asteroid2.body.setCollisionGroup(this.asteroidsCollision);
	    asteroid3.body.setCollisionGroup(this.asteroidsCollision);

	    asteroid1.body.collides(this.shipCollision, this.hitAsteroid, this);
	    asteroid2.body.collides(this.shipCollision, this.hitAsteroid, this);
	    asteroid3.body.collides(this.shipCollision, this.hitAsteroid, this);

	    this.ship.body.collides([this.asteroidsCollision, this.planetCollision, this.stationCollision]);

	    asteroid1.body.kinematic = true;
	    asteroid2.body.kinematic = true;
	    asteroid3.body.kinematic = true;

	    asteroid1.body.velocity.x = -130;
	    asteroid2.body.velocity.x = 100;
	    asteroid3.body.velocity.x = -250;

	    //Finally, add the destination
		station = this.game.add.sprite(75, 135, 'station');
		this.game.physics.p2.enable(station, false);
		station.body.static = true;
		station.body.setCollisionGroup(this.stationCollision);
		station.body.collides(this.shipCollision, this.arrivesStation, this);

	    //Add the HUD layer
	    var style = {font: "30px Arial", fill: "#fff"};
	    var text = this.game.add.text(410, 750, "Esc - Restart", style);
	    text.fixedToCamera = true;

	    //Fuel indicator
	    fuelIcon = this.game.add.sprite(550, 230, 'fuel');
	    fuelIcon.fixedToCamera = true;
	    
	    this.fuelIndicator = this.game.add.graphics(0,0);
	    this.fuelIndicator.fixedToCamera = true;
	    this.fuelIndicator.beginFill(0x00FF00, 1);
	    this.fuelIndicator.drawRect(560, 10, 15, 210);

		this.cursors = this.game.input.keyboard.createCursorKeys();
		restartButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
		restartButton.onDown.add(this.restart, this);

		this.game.time.events.loop(Phaser.Timer.SECOND * 5, this.changeAsteroidDirection, this);
	},

	update : function() {
		//Handle cursors
		if (this.cursors.left.isDown) {
			this.ship.body.rotateLeft(60);
		}
		else if(this.cursors.right.isDown) {
			this.ship.body.rotateRight(60);
		}			
		else {
			this.ship.body.setZeroRotation();
		}

		if(this.cursors.up.isDown) {
			//this.rocketSound.play();
			this.ship.body.thrust(200);
			
			if (fuelCapacity > 0) {
				fuelCapacity -= 1;
				
				this.fuelIndicator.clear();
				red = (fuelCapacity > 50)? (1 - 2*(fuelCapacity-50)/100)*255 : 255;
				green = (fuelCapacity > 50)? 255 : (2*(fuelCapacity)/100)*255;
				color = Phaser.Color.RGBtoString(red, green, 0);
				//console.log(color);
				this.fuelIndicator.beginFill(color.replace('#','0x'), 1);
				consumedBar = (1 - (fuelCapacity/100))*210;

	    		this.fuelIndicator.drawRect(560, 10 + consumedBar, 15, 210 - consumedBar);
			}
			else {
				this.outOfFuel();
			}
		}

		//Handle background moving
		if (!this.game.camera.atLimit.x) {
	        this.starfield.tilePosition.x += (this.ship.body.velocity.x * 16) * this.game.time.physicsElapsed;
	    }

	    if (!this.game.camera.atLimit.y) {
	        this.starfield.tilePosition.y += (this.ship.body.velocity.y * 16) * this.game.time.physicsElapsed;
	    }

	    //Apply gravity force to ship
	    this.planets.forEach(this.applyPlanetGravity, this);

	    //Draw trajectory line
	    this.bmd.context.fillStyle = '#ffff00';
	    this.bmd.context.fillRect(this.ship.body.x + 100, this.ship.body.y, 2, 2);
	    this.bmd.dirty = true;
	},

	//Method for computing planet gravity taken from: 
	//http://www.emanueleferonato.com/2012/03/28/simulate-radial-gravity-also-know-as-planet-gravity-with-box2d-as-seen-on-angry-birds-space/
	applyPlanetGravity: function(planet) {
		center = planet.position;

		radius = planet.width/2;
		shipCenter = this.ship.position;

		//Calculate distance between planet and ship
		planetDistance = Phaser.Point.distance(center, shipCenter, true);

		if (planetDistance <= radius * 3) {
			planetDistanceVector = new Phaser.Point();
			Phaser.Point.add(planetDistanceVector, shipCenter, planetDistanceVector);
			Phaser.Point.subtract(planetDistanceVector, center, planetDistanceVector);

			//Add some sort of rotation here (This is a workaround, fix with actual physics)
			//
			perpend = Phaser.Point.multiplyAdd(new Phaser.Point(), Phaser.Point.rperp(planetDistanceVector), this.rotationForce[planet.body.id]);
			//

			planetDistanceVector = Phaser.Point.negative(planetDistanceVector);
			vecSum = Math.abs(planetDistanceVector.x) + Math.abs(planetDistanceVector.y);

			planetDistanceVector = Phaser.Point.multiplyAdd(new Phaser.Point(), planetDistanceVector, (1/vecSum)*radius/planetDistance);

			this.ship.body.applyForce([-planetDistanceVector.x * 30 + perpend.x, -planetDistanceVector.y * 30 + perpend.y], shipCenter.x, shipCenter.y);
			//console.log('force to apply ' + planetDistanceVector);
		}
	},

	drawPlanetOrbit: function(planet) {
		this.bmd.context.strokeStyle = '#FF0000';
		this.bmd.context.lineWidth = 1;
		this.bmd.context.beginPath();
		this.bmd.context.arc(planet.position.x + 100, planet.position.y, (planet.width/2)*3, 0, Math.PI*2);
		this.bmd.context.stroke();
	},

	changeAsteroidDirection: function() {
		this.asteroids.forEach(this.switchDirection, this);
	},

	switchDirection : function(asteroid) {
		asteroid.body.velocity.x = this.game.physics.p2.mpxi(asteroid.body.velocity.x) * -1;
	},

	hitAsteroid: function(body1, body2) {
		//TODO: Explosion sound?
		hitByAsteroid = true;
		this.state.start('Main.GameOver');
	},

	arrivesStation: function(body1, body2) {
		this.state.start('Main.Arrived');
	},

	restart: function() {
		this.state.restart();
	},

	outOfFuel: function() {
		//this.state.start('Main.GameOver');
	} 
};