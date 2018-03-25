/**
 * 选择测试卷
 */
var app = window.sunburst;
app.vue = null;
new Vue({
	el: "#app",
	data: function() {
		return {
			config: window.sunburst.config,
			subjects: window.sunburst.config.papers[window.sunburst.config.version],
			currentSubject: 0,
			showPaper: false,
		}
	},
	mounted: function() {
		app.vue = this;
		Metro.init();
	},
	methods: {
		handleSubjectTabClick(event) {
			app.vue.currentSubject = $(event.target).parent().index();
		}
	}
})

/**
 * 跳转模拟测试页
 * @param {Object} node
 * @param {Object} listview
 */
function openPaper(node, listview) {
	window.sunburst.vue.showPaper = true;
	var subjectIndex = app.vue.currentSubject
	var paperTypeName = node.data("type");
	var paperIndex = node.data("index");
}

/**
 * 跳转首页
 */
function openHome() {
	window.sunburst.vue.showPaper = false;
}