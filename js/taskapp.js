/*global Vue, Sortable */
Vue.component('taskList' , {
	template: "#task-list-tpl",
	props: [
		'list'				// template binding: list = root.tasks
	],
	
	data: function() {
		return {
			addFormVisible: false,
			search: '',
			selectedId: null,
			editingId: null
		};
	},
	
	computed: {
		remaining: function() {
			return this.list.filter(this.notCompleted).length;
		},
		
		nextTaskId: function() {	// must always increment to avoid duplication of ids
		// Set next available TaskId as last item's id + 1:
			var task,
				max = 0;
			for (task in this.list) {
				var tid = parseInt(this.list[task].id, 10);
				if (tid > max) {
					max = tid;
				}
			}
			return max + 1;			// should initialise to 3
		}
	},
	
	watch: {
		selectedId: function() {
			console.log('item with index', this.selectedId, 'selected');
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
			var index = this.list.indexOf(task);
			this.list.splice(index, 1);
		},
		clearCompleted: function() {
			// Set list as only our incomplete tasks (others will simply vanish)
			this.list = this.list.filter(this.notCompleted);
		},
		toggleAddForm: function() {
			this.addFormVisible = !this.addFormVisible;
			if (this.addFormVisible) {
				document.querySelector('input[name=new-task]').focus();	// FOCUS NOT WORKING
			}
		},
		addTask: function(newTaskBody) {
			// Validation:
			if (!newTaskBody) { return false; }	// Will simply do nothing
			// Build task:
			var newTask = {
				id: this.nextTaskId,
				body: newTaskBody,
				completed: false,
				tags: [],
				colours: []
			};
			// Add task:
			this.list.push(newTask);
			console.log('task with id', newTask.id, 'added');
			// Increment id tracker:
			this.nextTaskId++;
			// Reset & hide form:
			this.newTaskBody = '';
			this.toggleAddForm();
		},
		edit: function(taskId) {
			// Finish editing if already editing:
			if (taskId === this.editingId) {
				this.editingId = null;
			}
			else {
				// Now set selected item:
				this.editingId = taskId;
			}
		},
		select: function(taskId) {
			// Deselect item if already selected:
			if (taskId === this.selectedId) {
				this.selectedId = null;
			}
			else {
				// Now set selected item:
				this.selectedId = taskId;
			}
		},
		addTag: function(tag) {
			// Check something selected:
			if (this.selectedId) {
				// Check it doesn't exist:
				if (this.list[this.selectedId].tags.indexOf(tag) === -1) {
					// Update data:
					this.list[this.selectedId].tags.push(tag);
				}
			}
		},
		addColour: function(colour) {
			// Check something selected:
			if (this.selectedId) {
				// Check it doesn't exist:
				if (this.list[this.selectedId].colours.indexOf(colour) === -1) {
					// Update data:
					this.list[this.selectedId].colours.push(colour);
				}
			}
		},
		deleteTag: function(tag) {
			var i = this.list[this.selectedId].tags.indexOf(tag);
			this.list[this.selectedId].tags.splice(i, 1);			
		},
		deleteColour: function(colour) {
			var i = this.list[this.selectedId].colours.indexOf(colour);
			this.list[this.selectedId].colours.splice(i, 1);
		}
	}
});

var tasks = [
	{ id: 0, body: 'Go to the bank', completed: false, tags: ['30min'], colours: ['red'] },
	{ id: 1, body: 'Go to the bonk', completed: false, tags: ['1h'], colours: ['blue'] },
	{ id: 2, body: 'Go to the bunk', completed: false, tags: ['2h+'], colours: ['orange', 'green'] }
];

var vm = new Vue({
	config: {
		debug: true
	},
	el: "#app",
	
	data: {
		tasks: tasks
	},
	
	ready: function() {
		// load state when app loads:
		if (localStorage.taskAppData) {
			this.loadAll();
		}
	},
	
	watch: {
		// save state when data.tasks changes:
		tasks: {
			handler: function(newData, oldData) {
				this.saveAll();
			},
			deep: true
		}
	},
	
	methods: {
		saveAll: function() {
			localStorage.setItem('taskAppData', JSON.stringify(this.tasks));
			console.info('Data saved.');
		},
		loadAll: function() {
			this.tasks = JSON.parse(localStorage.getItem('taskAppData'));
			console.info('Data loaded.');
		}
	}
});


// Sortable.js
var list = document.getElementById("task-ul");
Sortable.create(list, {
	// Reposition the dragged list item within the original data array:
	onSort: function(evt) {
		console.log(evt.oldIndex + ' > ' + evt.newIndex);
		// Switcharoo:
		var moved = vm.$refs.foo.list.splice(evt.oldIndex, 1);
		vm.$refs.foo.list.splice(evt.newIndex, 0, moved[0]);
	}
});

