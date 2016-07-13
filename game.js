/**
 * Created by morten on 05/07/16.
 */

var Game = function (params) {
	var self = this;
	self.fps = params.fps || 60;
	self.board = new Board(params.canvas);
	self.gameLoop = {
		start: function () {
			self.gameLoop.startedAt = Game.ts();
			self.gameLoop.previous = self.gameLoop.startedAt;
			self.gameLoop.frames = 0;
			self.gameLoop.timer = setInterval(function () {
				self.gameLoop.frames++;
				var delta = Game.ts() - self.gameLoop.previous;
				self.update(delta);
				self.render();
				self.gameLoop.previous = Game.ts();
				self.gameLoop.previousDelta = delta;
			}, (1000 / self.fps));
			self.gameLoop.fpsTimer = setInterval(function () {
				var currentFps = self.gameLoop.frames;
				self.gameLoop.frames = 0;
				$("#label").html(currentFps + ' FPS, ' + self.board.entities.length + ' entities');
			}, 1000);
		},
		stop : function () {
			clearInterval(self.gameLoop.timer);
			clearInterval(self.gameLoop.fpsTimer);
		}
	}
	self.update = function (delta) {
		self.board.update(delta);
	}
	self.render = function () {
		self.board.render();
	}
	self.start = function () {
		self.gameLoop.start();
		self.board.init();
	}
	self.stop = function () {
		self.gameLoop.stop();
	}
	self.dump = function () {
		console.log(self);
	}
}
Game.ts = function () {
	return new Date().getTime();
}
Game.rnd = function (max, round) {
	var number = Math.random() * (max || 1);
	return round ? Math.round(number) : number;
}

var Board = function (canvas_id) {
	var self = this;
	self.canvas = document.getElementById(canvas_id);
	self.context = self.canvas.getContext('2d');
	self.width = self.canvas.width;
	self.height = self.canvas.height;
	self.entities = []
	self.update = function (delta) {
		var debugMessage = "";
		for (var i in self.entities) {
			if (self.entities.hasOwnProperty(i)) {
				var entity = self.entities[i];
				entity.update(delta);
				debugMessage += entity.name + ': (' + Math.floor(entity.x) + ', ' + Math.floor(entity.y) + ')\n';
				if (entity.x <= 0 || entity.x + entity.w >= self.width) {
					entity.dx *= -1;
				}
				if (entity.y <= 0 || entity.y + entity.h >= self.width) {
					entity.dy *= -1;
				}
				for (var j in self.entities) {
					if (self.entities.hasOwnProperty(j)) {
						var otherEntity = self.entities[j];
						if (otherEntity == entity) {
							continue;
						}
						if (entity.collidesWith(otherEntity)) {
							entity.dx *= -1;
							entity.dy *= -1;
							//otherEntity.dx *= -1;
							//otherEntity.dy *= -1;
							console.log('collission at ' + entity.x + ', ' + entity.y);
						}
					}
				}
			}
		}
		//$("#debug").html(debugMessage);
	}
	self.render = function () {
		self.context.clearRect(0, 0, self.width, self.height);
		for (var i in self.entities) {
			if (self.entities.hasOwnProperty(i)) {
				var entity = self.entities[i];
				entity.render();
			}
		}
	}
	self.init = function () {
		self.canvas.addEventListener('click', function (event) {
			var r      = Game.rnd(255, true),
			    g      = Game.rnd(255, true),
			    b      = Game.rnd(255, true),
			    a      = 1, //0.5 + Game.rnd(0.5, true),
			    entity = new Entity({
				    context: self.context,
				    x      : event.layerX,
				    y      : event.layerY,
				    w      : Game.rnd(100, true),
				    h      : Game.rnd(100, true),
				    dx     : Game.rnd(0.1),
				    dy     : Game.rnd(0.1),
				    color  : 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
			    });
			if (Game.rnd(2) > 1){
				entity.dx *= -1;
			}
			if (Game.rnd(2) > 1){
				entity.dy *= -1;
			}
			console.log('entity added', entity);
			self.entities.push(entity)
		})
	}
}

var Entity = function (params) {
	var self = this;
	self.name = params.name || 'No name';
	self.context = params.context;
	self.x = params.x || 0;
	self.y = params.y || 0;
	self.w = params.w || 10;
	self.h = params.h || 10;
	self.dx = params.dx || 0;
	self.dy = params.dy || 0;
	self.color = params.color || '#000';
	self.update = function (delta) {
		self.x += self.dx * delta;
		self.y += self.dy * delta;
	}
	self.render = function () {
		self.context.fillStyle = self.color;
		self.context.fillRect(self.x, self.y, self.w, self.h);
	}
	self.collidesWith = function (other) {
		return self.x + self.w >= other.x && self.x <= other.x + other.w && self.y + self.h >= other.y && self.y <= other.y + other.h;
	}
}