/**
 * Created by morten on 05/07/16.
 */

var Game = function (params) {
	var self = this;
	self.fps = params.fps || 60;
	self.board = new Board(params.canvas);
	self.gameLoop = {
		start: function () {
			self.gameLoop.startedAt = self.ts();
			self.gameLoop.previous = self.gameLoop.startedAt;
			self.gameLoop.timer = setInterval(function () {
				var delta = self.ts() - self.gameLoop.previous;
				self.update(delta);
				self.render();
				self.gameLoop.previous = self.ts();
			}, (1000 / self.fps));
		},
		stop : function () {
			clearInterval(self.gameLoop.timer);
		}
	}
	self.update = function (delta) {
		var currentFps = Math.floor(1000 / delta);
		console.log('delta: ' + delta + ', fps: ' + currentFps);
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
		$("#debug").html(JSON.stringify(self));
	}
	self.ts = function () {
		return new Date().getTime();
	}
}

var Board = function (canvas_id) {
	var self = this;
	self.canvas = document.getElementById(canvas_id);
	self.context = self.canvas.getContext('2d');
	self.dimensions = {
		width : self.canvas.width,
		height: self.canvas.height
	}
	self.entities = []
	self.update = function (delta) {
		for (var i in self.entities) {
			if (self.entities.hasOwnProperty(i)) {
				var entity = self.entities[i];
				entity.update(delta);
			}
		}
	}
	self.render = function () {
		self.context.clearRect(0, 0, self.dimensions.width, self.dimensions.height);
		for (var i in self.entities) {
			if (self.entities.hasOwnProperty(i)) {
				var entity = self.entities[i];
				entity.render();
			}
		}
	}
	self.init = function () {
		self.entities.push(new Entity({
			name   : 'Test 1',
			context: self.context,
			x      : 100,
			y      : 100,
			w      : 20,
			h      : 20,
			dx     : 0.0001,
			dy     : 0.001,
			color  : '#ff0000'
		}));
		self.entities.push(new Entity({
			name   : 'Test 2',
			context: self.context,
			x      : 200,
			y      : 200,
			w      : 35,
			h      : 35,
			dx     : -0.003,
			dy     : -0.00011,
			color  : '#00f'
		}));
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
		self.y += self.dy;
	}
	self.render = function () {
		self.context.fillStyle = self.color;
		self.context.fillRect(self.x, self.y, self.w, self.h);
	}
}