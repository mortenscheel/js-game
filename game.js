/**
 * Created by morten on 05/07/16.
 */

var Game = function (params){
	var self = this;
	self.container = params.container || $("body");
	self.html = params.html || true;
	self.linebreak = self.html ? "<br>" : "\n";
	self.startedAt, self.timer, self.previous, self.frames, self.fpsTimer, self.fps;
	self.start = function () {
		self.startedAt = self.timestamp();
		self.previous = self.startedAt;
		self.frames = 0;
		self.timer = setInterval(function () {
			var now = self.timestamp();
			var delta = now - self.previous;
			self.previous = now;
			self.frames++;
			self.update(delta);
		},1);
		self.fpsTimer = setInterval(function () {
			self.fps = self.frames;
			self.frames = 0;
		}, 1000);
	}
	self.update = function (delta) {
		self.container.html(delta + " / " + self.fps);
	}
	self.timestamp = function () {
		return new Date().getTime();
	}
	self.stop = function () {
		clearTimeout(self.fpsTimer);
		clearTimeout(self.timer);
	}
	self.dump = function () {
		$("#debug").html(JSON.stringify(this));
	}
}