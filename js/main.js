var Main = {};

Main.Boot = function(game) {
	this.game = game;
}

Main.Boot.prototype = {
	preload : function() {

	},

	create : function() {
 		var text = "Hello with Phaser";
    	var style = { font: "25px Arial", fill: "#ff0000", align: "center" };

    	var t = this.game.add.text(this.game.world.centerX, 0, text, style);
	},

	update : function() {

	},
}