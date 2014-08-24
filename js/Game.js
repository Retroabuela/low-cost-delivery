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

		this.load.physics('physicsData', 'assets/physics/object-shapes.json');
	},

	create : function() {
		fuelCapacity = 100;
		this.game.world.setBounds(0 , 0, 600, 3200);
		this.game.physics.startSystem(Phaser.Physics.P2JS);
		//this.game.physics.p2.defaultRestitution = 0.8;
		this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);

		this.starfield = this.game.add.tileSprite(0, 0, 600, 800, 'stars');
   		this.starfield.fixedToCamera = true;

		//Bitmap data to print things
		this.bmd = this.game.add.bitmapData(600, 3200);
		this.bmd.context.fillStyle = '#ffffff';
		this.game.add.sprite(0, 0, this.bmd);

		this.ship = this.game.add.sprite(300, 3150,'ship');
		this.game.physics.p2.enable(this.ship, false);
		this.game.camera.follow(this.ship);

		this.ship.body.clearShapes();
		this.ship.body.loadPolygon('physicsData', 'ship');

		this.planets = this.game.add.group();
		planet1 = this.planets.create(150, 2800, 'planet-1');
		planet2 = this.planets.create(450, 2500, 'planet-2');

		this.game.physics.p2.enable([planet1, planet2]);

		planet1.body.static = true;
		planet2.body.static = true;

		//Array of rotation force for each planet
		this.rotationForce = {};
		this.rotationForce[planet1.body.id] = -.25;
		this.rotationForce[planet2.body.id] = .35;

		//Draw planet orbit
	    this.planets.forEach(this.drawPlanetOrbit, this);
	    this.bmd.dirty = true;

	    //Create some asteroids
	    this.asteroids = this.game.add.group();
	    asteroid1 = this.asteroids.create(2, 2200, 'asteroid-1');
	    asteroid2 = this.asteroids.create(42, 2000, 'asteroid-3');
	    asteroid3 = this.asteroids.create(500, 1993, 'asteroid-2');

	    this.game.physics.p2.enable([asteroid1, asteroid2, asteroid3]);

	    //Add the HUD layer
	    //this.hud = this.game.add.bitmapData(600, 800);
	    //this.hud.context.fillStyle = '#fff';
	    //this.game.add.sprite(0,0, this.hud);
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
	    this.bmd.context.fillRect(this.ship.body.x, this.ship.body.y, 2, 2);
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
		this.bmd.context.arc(planet.position.x, planet.position.y, (planet.width/2)*3, 0, Math.PI*2);
		this.bmd.context.stroke();
	},

	restart: function() {
		this.state.restart();
	},

	outOfFuel: function() {
		this.state.start('Main.GameOver');
	} 
};