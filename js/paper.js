/**
 * 题目
 */
function question() {
	/**
	 * 题号
	 */
	this.num = 0;

	/**
	 * 题型: 单选 多选 判断
	 */
	this.type = ""

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
 */
function paper(questionType) {
	var self = this;
	
	// 题型
	this.questionType = questionType;
	
	/**
	 * 加载文件
	 * @param {Object} filePath
	 * @param {Object} callback
	 */
	this.load = function(filePath, callback) {
		var fileMd5 = Metro.utils.md5(filePath + "2020");
		var data = localStorage.getItem(fileMd5);
		if (data != null) {
			self.questions = JSON.parse(data);
			if (callback) {
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

				if (callback) {
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
	 * 解析本文数据
	 * @param {string[]} _data
	 * @return {question[]}
	 */
	this.parse = function(_data) {
		var datas = _data.split("\n");
		var questions = new Array();

		// 题号
		var headReg = /^(\d+?)\.(.+)/;
		// 选项
		var optionReg = /^[A-Z]\.(.+)/;
		// 答案
		var keyReg = /^Answer:([A-Z]+)/;

		var pointToken = "题库练习知识点：";
		var descToken = "题目内容：" 

		// 用于存放题目解析出的数据
		var obj = null;
		for (var index = 0; index < datas.length; index++) {
			// 一行字符串
			var targetData = datas[index];
			// 判断空行
			var dataEmpty = targetData.length == 0 || targetData.charCodeAt(0) == 13;
			// 当前题目解析完成的状态
			var objClose = dataEmpty && (obj != null) && (obj.key !== "");

			if (dataEmpty) {
				if (objClose) {
					questions.push(obj)
					console.log("push", JSON.stringify(obj))
					obj = null;
				}
				continue;
			}

			// 新的题目
			if (obj == null) {
				console.log("new",  questions.length)
				obj = new question();
				obj.type = self.questionType
				var value = headReg.exec(targetData);
				if (value != null) {
					obj.num = value[1];
					var desc = value[2]
					// 题号后面的内容是题库练习知识点
					if (desc.indexOf(pointToken) > -1) {
						obj.point.push(desc)
					} else {
						var questionDescIndex = desc.indexOf(descToken)
						if (questionDescIndex > -1) {
							obj.desc = desc.slice(descToken.length)
						} else {
							obj.desc = desc;
						}
					}
				}
				continue;
			}

			// 题目内容
			var descTokenIndex = targetData.indexOf(descToken)
			if (descTokenIndex > -1) {
				obj.desc = targetData.slice(descToken.length)
			}

			// 选项列表
			var value = optionReg.exec(targetData);
			if (value != null) {
				obj.options.push(value[1]);
				continue;
			}

			// 答案
			var value = keyReg.exec(targetData);
			if (value != null) {
				obj.key = value[1];
				continue;
			}
		}
		
		//  判断最后一道题
		if((obj != null) && (obj.key !== "")){
			questions.push(obj)
			obj = null;
		}
		
		self.questions = questions;
	}
}
