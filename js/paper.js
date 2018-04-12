/**
 * 题目
 */
function question() {
	/**
	 * 题号
	 */
	this.num = 0;

	/**
	 * 题目描述
	 */
	this.desc = "";

	/**
	 * 选项列表
	 */
	this.options = [];

	/**
	 * 答案
	 */
	this.key = "";

	/**
	 * 答案要点
	 */
	this.point = [];
}

/**
 * 试卷
 * @param {int} _version
 */
function paper(_version) {
	var self = this;

	/**
	 * 版本
	 */
	this.version = _version;

	/**
	 * 加载文件
	 */
	this.load = function(filePath, callback) {
		var fileMd5 = Metro.utils.md5(filePath);
		var data = localStorage.getItem(fileMd5);
		if(data != null) {
			self.questions = JSON.parse(data);
			if(callback) {
				callback(self)
			}
			return;
		}
		$.ajax({
			url: filePath,
			dataType: "text",
			success: function(data) {
				var parser = self;
				parser.parse(data);

				localStorage.setItem(fileMd5, JSON.stringify(self.questions));

				if(callback) {
					callback(self)
				}
			}
		});
	}

	/**
	 * 试题
	 */
	this.questions;

	/**
	 * 解析数据
	 * @param {string[]} _data
	 * @return {question[]}
	 */
	this.parse = function(_data) {
		var datas = _data.split("\n");
		var questions = new Array();

		var headReg = /^(\d+?)\.(.+)/;
		var optionReg = /^[A-Z]\.(.+)/;
		var keyReg = /^Answer.([A-Z]+)/;
		var pointReg = /^答案要点.(.+)/;

		// 用于存放题目解析出的数据
		var obj = null;
		for(var index = 0; index < datas.length; index++) {
			// 一行字符串
			var targetData = datas[index];
			// 判断空行
			var dataEmpty = targetData.length == 0 || targetData.charCodeAt(0) == 13;
			// 当前题目解析完成的状态
			var objClose = dataEmpty && (obj != null);

			if(dataEmpty) {
				if(objClose) {
					questions.push(obj)
					obj = null;
				}
				continue;
			}

			// 新的题目
			if(obj == null) {
				obj = new question();
				var value = headReg.exec(targetData);
				if(value != null) {
					obj.num = value[1];
					obj.desc = value[2];
				}
				continue;
			}

			// 选项列表
			var value = optionReg.exec(targetData);
			if(value != null) {
				obj.options.push(value[0]);
				continue;
			}

			// 答案
			var value = keyReg.exec(targetData);
			if(value != null) {
				obj.key = value[1];
				continue;
			}

			// 答案要点
			var value = pointReg.exec(targetData);
			if(value != null) {
				obj.point.push(value[1]);
			} else {
				obj.point.push(targetData);
			}
		}

		self.questions = questions;
	}
}