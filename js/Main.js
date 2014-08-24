var Main = {};

Main.Boot = function(game) {
	this.game = game;
};

Main.Boot.prototype = {
	preload : function() {

	},

	create : function() {
     	var style = { font: "30px Arial", fill: "#fff", align: "center" };
		this.game.add.text(300 - 130, 400 - 150, "Low-cost Delivery", style);

		style = { font: "24px Arial", fill: "#fff", align: "center" };			
     	this.game.add.text(this.game.world.centerX - 150, 750, "Press the spacebar to start", style);

     	startButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		startButton.onDown.add(this.startGame, this);
	},

	startGame: function() {
		this.state.start('Game');
	}
};

Main.GameOver = function(game) {};

Main.GameOver.prototype = {
	create: function() {
     	if (fuelCapacity === 0) {
     		style = { font: "30px Arial", fill: "#fff", align: "center" };
			this.game.add.text(300 - 130, 400 - 150, "Rocket fuel burns fast.\nUse it wisely.", style);
     	}
     	else if(hitByAsteroid) {
     	    style = { font: "30px Arial", fill: "#fff", align: "center" };
			this.game.add.text(300 - 160, 400 - 150, "Be careful with asteroids,\nthey might break your ship.", style);	
     	}

		style = { font: "24px Arial", fill: "#fff", align: "center" };
     	this.game.add.text(300 - 165, 750, "Press the spacebar to try again", style);

     	startButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		startButton.onDown.add(this.restartGame, this);
	},

	restartGame: function() {
		this.state.start('Game');
	}
};