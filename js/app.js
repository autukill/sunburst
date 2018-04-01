window.sunburst = window.sunburst ? window.sunburst : {};
var app = window.sunburst;
app.vue = null;

new Vue({
	el: "#app",
	data: function() {
		return {
			config: app.config,
			subjects: app.config.papers[app.config.version],
			/**
			 * 当前选择的科目索引值
			 */
			currentSubjectIndex: 0,
			showPaper: false,
			/**
			 * 当前试卷的全部题目
			 */
			questions: new Array(),
			/**
			 * 当前题号
			 */
			currentQuestionNumber: 0,
			/**
			 * 答题状态
			 * 0 - 未看题
			 * 1 - 已看题
			 * 2 - 正确
			 * 3 - 错误
			 */
			questionStates: new Array(),
			/**
			 * 每道题被选的选项
			 */
			optionSelected: new Array(),
			/**
			 * 试卷类型
			 * default - 测试卷
			 * single - 专项 单选
			 * multipe - 专项 多选
			 * tureOrFalse - 专项 判断
			 * sim - 模拟
			 */
			paperTypeName: "",
			/**
			 * 当前选择的试卷类型是测试卷的第几张的索引值
			 */
			testPaperIndex: -1,
		}
	},
	computed: {
		/**
		 * 当前试卷的题源
		 */
		currentQuestionSources: function() {
			if(this.paperTypeName == "")
				return "";

			if(this.paperTypeName == "default") {
				if(this.testPaperIndex >= 0) {
					return this.config.paperNames[this.testPaperIndex];
				}
			} else {
				var length = this.subjects[this.currentSubjectIndex].papers.length;
				var names = this.config.paperNames;
				return names.slice(0, length).join(",")
			}
		},

		/**
		 * 当前试卷的科目名称
		 */
		currentSubjectName: function() {
			return this.subjects[this.currentSubjectIndex].name;
		},

		/**
		 * 当前试卷答题进度
		 */
		currentProgress: function() {
			if(this.questions.length == 0) return "";
			return(this.currentQuestionNumber + 1) + "/" + this.questions.length;
		},

		/**
		 * 当前题的题型名称
		 */
		currentQuestionType: function() {
			if(this.questions.length == 0) return "";

			var target = this.questions[this.currentQuestionNumber];
			if(target["key"].length >= 2) {
				return "多选题";
			} else if(target["options"][0] == "错") {
				return "判断题";
			}
			return "单选题";
		},

		/**
		 * 当前题目的描述
		 */
		currentQuestionDesc: function() {
			if(this.questions.length == 0) return "";
			return this.questions[this.currentQuestionNumber].desc;
		},

		/**
		 * 当前题目的选项
		 */
		currentQuestionOptions: function() {
			if(this.questions.length == 0) return(new Array());
			return this.questions[this.currentQuestionNumber].options;
		},

		/**
		 * 当前题目的用户选择
		 */
		currentOptionSelected: function() {
			var length = this.optionSelected.length;
			if(length == 0 || length <= this.currentQuestionNumber) return -1;
			return this.optionSelected[this.currentQuestionNumber];
		},

		/**
		 * 当前题目的正确答案
		 */
		currentQuestionKey: function() {
			if(this.questions.length == 0) return "";
			return this.questions[this.currentQuestionNumber].key;
		},
		/**
		 * 当前题目的答案要点
		 */
		currentQuestionPoint: function() {
			if(this.questions.length == 0) return(new Array());
			return this.questions[this.currentQuestionNumber].point;
		},

	},
	mounted: function() {
		app.vue = this;
		Metro.init();
	},
	methods: {
		// 选择学科
		handleSubjectTabClick: function(event) {
			this.currentSubjectIndex = $(event.target).parent().index();
		},
		// 上一题
		handleLastQuestion: function(e) {
			if(this.currentQuestionNumber - 1 >= 0) {
				this.saveUserSelect();
				this.currentQuestionNumber--;
				this.resetQuestionPointDisplay();
				this.checkUserSelect();
			}
		},
		// 下一题
		handleNextQuestion: function(e) {
			if(this.currentQuestionNumber + 1 < this.questions.length) {
				this.saveUserSelect();
				this.currentQuestionNumber++;
				this.resetQuestionPointDisplay();
				this.checkUserSelect();
			}
		},
		//  题目导航
		handleJumpQuestion: function(index) {
			if(this.currentQuestionNumber == index) return;
			this.saveUserSelect();
			this.currentQuestionNumber = index;
			this.resetQuestionPointDisplay();
			this.checkUserSelect();
		},
		// 提交
		handleSubmitPaper: function(e) {
			alert("提交试卷")
			openHome();
		},
		// Check 被用户选中的选项
		checkUserSelect: function() {
			this.clearUserSelect();
			// 异步更新视图
			Vue.nextTick(this.setUserSelect);
		},
		// 清除用户check
		clearUserSelect: function() {
			$(".question-option input:checked").each(function(index, el) {
				el.checked = false;
			});
		},
		/**
		 * 选中用户之前选中的选项
		 * 异步更新视图
		 */
		setUserSelect: function() {
			var vue = app.vue;
			var selected = vue.currentOptionSelected;
			if(selected < 0) return;

			var options = $(".question-option input");
			var userSelect = selected.split("");
			if(options.length <= userSelect.length) return;

			for(var i = 0; i < userSelect.length; i++) {
				options[userSelect[i]].checked = true;
			}
		},
		// 记录当前用户选项
		saveUserSelect: function() {
			this.optionSelected[this.currentQuestionNumber] = "";
			$(".question-option input:checked").each(function(index, el) {
				var index = $(el).parent().parent().index();
				app.vue.optionSelected[app.vue.currentQuestionNumber] += index;
			})
			// 更新答题状态
			var userSelect = this.optionSelected[this.currentQuestionNumber];
			if(userSelect.length == 0) {
				this.updateQuestionState(this.currentQuestionNumber, 1)
			} else {
				// todo 判断对错
				var key = this.currentQuestionKey;
				var keyString = "";
				for(var i = 0; i < key.length; i++) {
					var code = key[i].charCodeAt() - 65;
					keyString += code;
				}
				if(keyString == userSelect) {
					this.updateQuestionState(this.currentQuestionNumber, 2)
				} else {
					this.updateQuestionState(this.currentQuestionNumber, 3)
				}
			}
		},
		/**
		 * 答题状态的颜色
		 * 0 - 未看题
		 * 1 - 已看题
		 * 2 - 正确
		 * 3 - 错误
		 */
		questionStatesColor: function(stateIndex) {
			switch(stateIndex) {
				case 0:
					return "";
				case 1:
					return "bg-yellow";
				case 2:
					return "bg-green";
				case 3:
					return "bg-red";
			}
		},
		/**
		 * 设置题目的回答状态
		 */
		updateQuestionState: function(index, stateIndex) {
			this.questionStates[index] = stateIndex;
		},
		/**
		 * 重置题目的回答状态
		 */
		resetQuestionStates: function(paper) {
			// 回答状态
			var states = new Array(this.questions.length)
			for(var i = 0; i < states.length; i++) {
				states[i] = 0;
			}
			this.questionStates = states;
			// 被选的选项
			var selected = new Array(this.questions.length)
			for(var i = 0; i < selected.length; i++) {
				selected[i] = -1;
			}
			this.optionSelected = selected;
			this.clearUserSelect();
		},
		/**
		 * 重置答案要点的显示
		 */
		resetQuestionPointDisplay: function() {
			$("#question-point").addClass("collapsed");
			$("#question-point").css("display", "none");
			$('html,body').animate({
				scrollTop: 0
			}, 0);
		},
		/**
		 * 开始答题
		 */
		beginTest: function(paper) {
			this.currentQuestionNumber = 0;
			this.questions = paper.questions;
			this.resetQuestionStates(paper);

			this.resetQuestionPointDisplay()
			this.showPaper = true;
			$("body").addClass("eyeColor");
		}
	}
})

/**
 * 跳转模拟测试页
 * @param {Object} node
 * @param {Object} listview
 */
function openPaper(node, listview) {
	var subjectIndex = app.vue.currentSubjectIndex;
	var paperTypeName = app.vue.paperTypeName = node.attr('date-type');
	
	switch(paperTypeName) {
		// 专项 单选题
		case "single":

			break;
			// 专项 多选题
		case "multipe":

			break;
			// 专项 判断题		
		case "tureOrFalse":

			break;
			// 模拟测试
		case "sim":

			break;
			// 复习卷
		default:
			var paperIndex = app.vue.testPaperIndex = node.data("index");
			var paperFileName = app.vue.subjects[subjectIndex].papers[paperIndex].file;
			var path = "./papers/" + app.config.version + "/" + app.vue.subjects[subjectIndex].dirName + "/" + paperFileName;
			var newPaper = new paper(app.config.version);
			newPaper.load(path, app.vue.beginTest)
			break;
	}
}

/**
 * 跳转首页
 */
function openHome() {
	$("body").removeClass("eyeColor");
	$("#home>div ul li.current-select").removeClass("current-select")
	window.sunburst.vue.showPaper = false;
}