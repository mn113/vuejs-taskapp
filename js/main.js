var vm = new Vue({
	config: { debug: true },
	el: "#app",

	data: {
		tasks: [
			{ body: 'Go to the bank', completed: false },
			{ body: 'Go to the bonk', completed: true },
			{ body: 'Go to the bunk', completed: false }
		],
		addFormVisible: false,
		newTask: {}
	},
	
	components: {
		taskList: {
			template: "#task-list",
			props: [
				'list',				// binding: list = root.tasks
				'addFormVisible',	// synced binding
				'newTask'
			],
			data: function() {
				return {};
			},
			computed: {
				remaining: function() {
					return this.list.filter(this.notCompleted).length;
				}
			},
			methods: {
				toggleCompleted: function(task) {
					task.completed = !task.completed;
				},
				isCompleted: function(task) {
					return task.completed;
				},
				notCompleted: function(task) {
					return !task.completed;
				},
				deleteTask: function(task) {
//					this.list.$remove(task);
					var index = this.list.indexOf(task);
					this.list.splice(index, 1);
				},
				clearCompleted: function() {
					// Set list as only our incomplete tasks (others will simply vanish)
					this.list = this.list.filter(this.notCompleted);
				},
				toggleAddForm: function() {
					this.addFormVisible = !this.addFormVisible;
				},
				addTask: function(newTaskBody) {
					var newTask = {
						body: newTaskBody,
						completed: false
					};
					this.list.push(newTask);
					// reset form
					this.toggleAddForm();
				}
			}
		}
	}
});
