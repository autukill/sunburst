function bingPicture() {
	var self = this;
	var image = null;
	this.load = function() {
		var path = "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1";
		$.ajax({
			type: "get",
			url: path,
			dataType: "json",
			jsonpCallback: "onBack",
			success: function(data) {
				self.image = data.images[0];
				var picturePath = "https://www.bing.com" + self.image.url;
				$("body").css("background-image", "url(" + picturePath + ")");
				$("body").css("background-position", "center center", "background-repeat": "no-repeat", "background-size", "cover", "background-color", "#666", "background-attachment", "fixed");
			}
		});
	}
}

$(new bingPicture().load())