window.sunburst = window.sunburst ? window.sunburst : {};
var app = window.sunburst;
app.vue = null;

new Vue({
	el: "#app",
	data: function() {
		return {
			config: app.config,
			subjects: app.config.papers.subjects,
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
			 * single - 专项 单选
			 * multipe - 专项 多选
			 * tureOrFalse - 专项 判断
			 * sim - 模拟
			 */
			paperTypeName: "",
			/**
			 * 当前选择的试卷类型是测试卷的第几张的索引值
			 */
			// testPaperIndex: -1,
			/**
			 * 题库下载中状态
			 */
			downloadState: true,
			/**
			 * 防止异步下载造成的问题
			 */
			downloadToken: 0,

			/**
			 * 已下载的文件数量
			 */
			downloaded: 0,
			/**
			 * 需要下载的文件数量
			 */
			downloadCount: 0,

			/**
			 * 答题选项序号
			 */
			optionIndex: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M']
		}
	},
	computed: {
		/**
		 * 当前试卷的科目名称
		 */
		currentSubjectName: function() {
			return this.subjects[this.currentSubjectIndex];
		},

		/**
		 * 当前试卷答题进度
		 */
		currentProgress: function() {
			if (this.questions.length == 0) return "";
			return (this.currentQuestionNumber + 1) + "/" + this.questions.length;
		},

		/**
		 * 当前题的题型名称
		 */
		currentQuestionType: function() {
			if (this.questions.length == 0) return "";
			var target = this.questions[this.currentQuestionNumber];
			return target.type
		},

		/**
		 * 当前题目的描述
		 */
		currentQuestionDesc: function() {
			if (this.questions.length == 0) return "";
			return this.questions[this.currentQuestionNumber].desc;
		},

		/**
		 * 当前题目的选项
		 */
		currentQuestionOptions: function() {
			if (this.questions.length == 0) return (new Array());
			return this.questions[this.currentQuestionNumber].options;
		},

		/**
		 * 当前题目的用户选择
		 */
		currentOptionSelected: function() {
			var length = this.optionSelected.length;
			if (length == 0 || length <= this.currentQuestionNumber) return -1;
			return this.optionSelected[this.currentQuestionNumber];
		},

		/**
		 * 当前题目的正确答案
		 */
		currentQuestionKey: function() {
			if (this.questions.length == 0) return "";
			return this.questions[this.currentQuestionNumber].key;
		},
		/**
		 * 当前题目的答案要点
		 */
		currentQuestionPoint: function() {
			if (this.questions.length == 0) return (new Array());
			return this.questions[this.currentQuestionNumber].point;
		},
		/**
		 * 试卷下载进度
		 */
		downloadProgress: function() {
			return (this.downloaded / this.downloadCount * 100).toFixed(0) + "%";
		}
	},
	mounted: function() {
		app.vue = this;
		Metro.init();
		$(".loadingHide").show(500);
	},
	methods: {
		// 选择学科
		handleSubjectTabClick: function(event) {
			this.currentSubjectIndex = $(event.target).parent().index();
		},
		// 上一题
		handleLastQuestion: function(e) {
			if (this.currentQuestionNumber - 1 >= 0) {
				this.saveUserSelect();
				this.currentQuestionNumber--;
				this.resetQuestionPointDisplay();
				this.checkUserSelect();
			} else {
				Metro.toast.create("已经到第一题了")
			}
		},
		// 下一题
		handleNextQuestion: function(e) {
			if (this.currentQuestionNumber + 1 < this.questions.length) {
				this.saveUserSelect();
				this.currentQuestionNumber++;
				this.resetQuestionPointDisplay();
				this.checkUserSelect();
			} else {
				Metro.toast.create("这是最后一道题")
			}
		},
		//  题目导航
		handleJumpQuestion: function(index) {
			if (this.currentQuestionNumber == index) return;
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
			if (selected < 0) return;

			var options = $(".question-option input");
			var userSelect = selected.split("");
			if (options.length <= userSelect.length) return;

			for (var i = 0; i < userSelect.length; i++) {
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
			if (userSelect.length == 0) {
				this.updateQuestionState(this.currentQuestionNumber, 1)
			} else {
				// todo 判断对错
				var key = this.currentQuestionKey;
				var keyString = "";
				for (var i = 0; i < key.length; i++) {
					var code = key[i].charCodeAt() - 65;
					keyString += code;
				}
				if (keyString == userSelect) {
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
		questionStatesColor: function(stateIndex, index) {
			if (index == this.currentQuestionNumber)
				return "bg-lightBlue"
			switch (stateIndex) {
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
		resetQuestionStates: function() {
			// 回答状态
			var states = new Array(this.questions.length)
			for (var i = 0; i < states.length; i++) {
				states[i] = 0;
			}
			this.questionStates = states;
			// 被选的选项
			var selected = new Array(this.questions.length)
			for (var i = 0; i < selected.length; i++) {
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
		beginTest: function() {
			this.currentQuestionNumber = 0;
			this.resetQuestionStates();
			this.resetQuestionPointDisplay()
			this.showPaper = true;
			$("body").addClass("eyeColor");
		}
	}
})


/**
 * 从 currentPaper 中随机取出 count 个 question
 * @param {Object} paper
 * @param {Object} type
 * @param {Object} count
 * @param {Object} questions
 */
function randomQuestions(currentPaper, type, count, questions) {
	var currentQuestionsIndex = []
	while (currentQuestionsIndex.length < count) {
		var questionIndex = Metro.utils.random(0, currentPaper.length - 1)
		if (currentQuestionsIndex.indexOf(questionIndex) >= 0) {
			continue
		}
		currentQuestionsIndex.push(questionIndex)
	}
	for (var i = 0; i < currentQuestionsIndex.length; i++) {
		var question = currentPaper[currentQuestionsIndex[i]];

		if (type != "判断")
			randomQuestionOption(question)

		questions.push(question);
	}
}

/**
 * 打乱选项
 * @param {Object} question
 */
function randomQuestionOption(question) {
	// 正确选项的索引位置
	var keyCount = question.key.length;
	var optionCount = question.options.length;
	// 正确答案的个数与选项个数相同, 无需交互
	var isKeysNoChange = keyCount === optionCount

	var keysIndex = []
	for (var i = 0; i < keyCount; i++) {
		keysIndex.push(question.key[i].charCodeAt() - 65)
	}

	for (var j = 0; j < optionCount; j++) {
		var currentIndex = j;
		var nextIndex = Metro.utils.random(0, optionCount - 1);
		if (nextIndex === currentIndex) {
			continue
		}
		// 当前遍历的选项如果是正确选项, 检出索引位置
		var currentIndexAtKeysIndex = keysIndex.indexOf(currentIndex)
		var nextIndexAtKeysIndex = keysIndex.indexOf(nextIndex)

		// 交换选项内容
		var _temp = question.options[currentIndex]
		question.options[currentIndex] = question.options[nextIndex]
		question.options[nextIndex] = _temp

		// 更新正确答案
		// 情况0: 正确答案的个数与选项个数相同, 无需交互
		if (isKeysNoChange) {
			continue
		}
		// 情况1: 都是正确选项
		if (currentIndexAtKeysIndex > -1 && nextIndexAtKeysIndex > -1) {
			continue
		}
		// 情况2: 当前索引被交换
		if (currentIndexAtKeysIndex > -1 && nextIndexAtKeysIndex === -1) {
			keysIndex[currentIndexAtKeysIndex] = nextIndex
		}
		// 情况2: 随机索引被交换
		if (currentIndexAtKeysIndex === -1 && nextIndexAtKeysIndex > -1) {
			keysIndex[nextIndexAtKeysIndex] = currentIndex
		}
	}

	// 正确答案的个数与选项个数相同, 无需交互
	// 对答案排序
	if (!isKeysNoChange) {
		var newKey = []
		for (var k = 0; k < keysIndex.length; k++) {
			newKey.push(String.fromCharCode(keysIndex[k] + 65))
		}
		newKey.sort()
		question.key = newKey.join("")
	}
}

/**
 * 对话框,生成模拟试卷
 * @param {Object} node
 * @param {Object} listview
 */
function openPaper(node, listview) {
	var vue = app.vue;
	var subjectIndex = vue.currentSubjectIndex;
	var subjectDirName = vue.subjects[subjectIndex];
	var paperTypeName = vue.paperTypeName = node.attr('data-type');

	Metro.dialog.open('#downloadDialog');
	vue.downloadState = true;
	vue.downloadCount = 0;
	vue.downloaded = 0;

	var thisDownloadToken = ++vue.downloadToken;

	// 专项复习
	if (paperTypeName !== "模拟") {
		vue.downloadCount = 1;
		vue.downloaded = 0;
		var path = "./papers/" + subjectDirName + "/" + paperTypeName + ".txt";
		var newPaper = new paper(paperTypeName);
		newPaper.load(path, function(paper) {
			// 用户点了取消
			if (thisDownloadToken != vue.downloadToken || !Metro.dialog.isOpen("#downloadDialog")) {
				return;
			}
			vue.downloaded++;
			var questions = [];			 
			randomQuestions(paper.questions, paperTypeName, paper.questions.length, questions)
			vue.questions = questions;
			vue.downloadState = false;
		});
		return null;
	}

	// 模拟测试
	vue.downloadCount = 3; // 单选  多选 判断;
	// 存放题库
	var papers = {}
	/**
	 * 生成仿真试卷
	 */
	var generatPaper = function() {
		if (papers.length == 0) return;
		var questions = [];

		// 随机 60 个 单选 
		randomQuestions(papers["单选"], "单选", 60, questions)
		// 随机 10 个 多选
		randomQuestions(papers["多选"], "多选", 10, questions)
		// 随机 30 个 判断
		randomQuestions(papers["判断"], "判断", 30, questions)

		vue.questions = questions;
	}

	// 加载结果回调
	var paperLoadedCallback = function(paper) {
		// 用户点了取消
		if (thisDownloadToken !== vue.downloadToken || !Metro.dialog.isOpen("#downloadDialog")) {
			return;
		}
		papers[paper.questionType] = paper.questions
		vue.downloaded++;
		if (vue.downloadCount === vue.downloaded) {
			generatPaper();
			vue.downloadState = false;
		}
	}
	// 异步加载学科下全部文件	
	new paper("单选").load("./papers/" + subjectDirName + "/单选.txt", paperLoadedCallback);
	new paper("多选").load("./papers/" + subjectDirName + "/多选.txt", paperLoadedCallback);
	new paper("判断").load("./papers/" + subjectDirName + "/判断.txt", paperLoadedCallback);
}

/**
 * 跳转首页
 */
function openHome() {
	Metro.dialog.close("#downloadDialog");
	$("body").removeClass("eyeColor");
	$("#home>div ul li.current-select").removeClass("current-select")
	window.sunburst.vue.showPaper = false;
}
