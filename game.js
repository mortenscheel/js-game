/**
 * Created by morten on 05/07/16.
 */

var Game = function (params) {
/**
* Ny kommentar
*/
	var self = this;
	this.fps = params.fps || 60;
	this.board = new Board(params.canvas);
	this.gameLoop = {
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
	this.update = function (delta) {
		self.board.update(delta);
	}
	this.render = function () {
		self.board.render();
	}
	this.start = function () {
		self.gameLoop.start();
		self.board.init();
	}
	this.stop = function () {
		self.gameLoop.stop();
	}
	this.dump = function () {
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
	this.canvas = document.getElementById(canvas_id);
	this.context = this.canvas.getContext('2d');
	this.width = this.canvas.width;
	this.height = this.canvas.height;
	this.entities = [];
	this.state = 'aim';
	this.update = function (delta) {
		for (var i in self.entities) {
			if (self.entities.hasOwnProperty(i)) {
				var entity = self.entities[i];
				entity.update(delta);
				if (!entity.alive){
					// remove
					self.entities.splice(self.entities.indexOf(entity), 1);
					continue;
				}
				for (var j in self.entities) {
					if (self.entities.hasOwnProperty(j)) {
						var otherEntity = self.entities[j];
						if (otherEntity == entity) {
							continue;
						}
						if (entity.collidesWith(otherEntity)) {
							entity.onCollission(otherEntity);
						}
					}
				}
			}
		}
	}
	this.render = function () {
		self.context.clearRect(0, 0, self.width, self.height);
		for (var i in self.entities) {
			if (self.entities.hasOwnProperty(i)) {
				var entity = self.entities[i];
				entity.render();
			}
		}
	}
	this.init = function () {
		// Paddle
		var paddle = new Entity({
			x      : 100,
			y      : self.height - 50,
			w      : 150,
			h      : 10,
			dx     : 0,
			dy     : 0,
			context: self.context,
			color  : '#fff'
		});
		self.entities.push(paddle);
		self.canvas.addEventListener('mousemove', function (event) {
			var x         = event.layerX,
			    halfWidth = paddle.w / 2;
			if (x > halfWidth && x < self.width - halfWidth) {
				paddle.x = x - halfWidth;
			}
		});
		// Ball
		var ball = new Entity({
			w      : 10,
			h      : 10,
			dx     : 0,
			dy     : 0,
			context: self.context,
			color  : '#0f0'
		});
		self.entities.push(ball);
		self.canvas.addEventListener('mousemove', function () {
			if (self.state == 'aim') {
				ball.x = paddle.x + (paddle.w / 2 - ball.w / 2);
				ball.y = paddle.y - ball.h;
			}
		});
		ball.update = function (delta) {
			if (self.state == 'flying') {
				// hit ground
				if (ball.y >= self.height - ball.h) {
					alert('you died');
					ball.dx = 0;
					ball.dy = 0;
					self.state = 'aim';
				}
				// hit ceiling
				if (ball.y <= ball.h) {
					ball.dy *= -1;
				}
				// hit wall
				if (ball.x <= ball.w || ball.x >= self.width - ball.w) {
					ball.dx *= -1;
				}
				ball.x += ball.dx * delta;
				ball.y += ball.dy * delta;
			}
		}
		ball.onCollission = function () {
			ball.dy *= -1;
		}
		// launch ball
		self.canvas.addEventListener('mouseup', function () {
			if (self.state == 'aim') {
				console.log('go');
				self.state = 'flying';
				// random horizontal direction
				ball.dx = Game.rnd(1) - 0.5;
				ball.dy = -0.3;
			}
		});

		// Bricks
		var wrapperWidth = self.width / 6,
		    margin       = wrapperWidth / 10,
		    brickWidth   = wrapperWidth * 0.8;
		for (var i = 0; i < 6; i++) {
			for (var j = 0 ; j < 4 ; j++){
				var brick = new Entity({
					x      : i * wrapperWidth + margin,
					y      : 50 + j * 50,
					w      : brickWidth,
					h      : 30,
					context: self.context,
					color  : '#f4b',
					onCollission: function () {
						this.alive = false;
					}
				});
				self.entities.push(brick);
			}
		}
	}
}

var Entity = function (params) {
	var self = this;
	this.alive = true;
	this.name = params.name || 'No name';
	this.context = params.context;
	this.x = params.x || 0;
	this.y = params.y || 0;
	this.w = params.w || 10;
	this.h = params.h || 10;
	this.dx = params.dx || 0;
	this.dy = params.dy || 0;
	this.color = params.color || '#000';
	this.onCollission = params.onCollission || function (other) {
		self.dx *= -1;
		self.dy *= -1;
	}
	this.update = function (delta) {
		self.x += self.dx * delta;
		self.y += self.dy * delta;
	}
	this.render = function () {
		self.context.fillStyle = self.color;
		self.context.fillRect(self.x, self.y, self.w, self.h);
	}
	this.collidesWith = function (other) {
		return self.x + self.w >= other.x && self.x <= other.x + other.w && self.y + self.h >= other.y && self.y <= other.y + other.h;
	}
}
