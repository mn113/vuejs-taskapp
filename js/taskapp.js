/*global Vue, Sortable */
var vueListComponent = Vue.component('taskList' , {
	template: "#task-list-tpl",
	props: [
		'list'				// template binding: list = root.tasks
	],

	data: function() {
		return {
			addFormVisible: false,
			search: '',
			selectedId: null,
			editingId: null,
			trash: []
		};
	},

	created: function() {
		// Listen for message from the events bus:
		bus.$on('addTag', function(t) {
			this.addTag(t);
		}.bind(this));

		// Listen for message from the events bus:
		bus.$on('addColour', function(c) {
			this.addColour(c);
		}.bind(this));
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
			return max + 1;
		},

		filteredTasks: function() {
			return this.list.filter(function(task) {
  				var searchRegex = new RegExp(this.search, 'i');
				// Include if search term matches body or colours array:
				return searchRegex.test(task.body) || searchRegex.test(task.colours.toString());
			}.bind(this));
		}
	},

	watch: {
		selectedId: function() {
			console.log('item with task.id', this.selectedId, 'selected');
		}
	},

	methods: {
		toggleCompleted: function(taskId) {
			// Find referenced task by id:
			var task = this.list[this.findSelectedTask()];
			task.completed = !task.completed;
		},
		isCompleted: function(task) {
			return task.completed;
		},
		notCompleted: function(task) {
			return !task.completed;
		},
		deleteTask: function(taskId) {
			// Find referenced task by id:
			var task = this.list[this.findSelectedTask()];
			var index = this.list.indexOf(task);
			this.list.splice(index, 1);
		},
		clearCompleted: function() {
			// Set list as only our incomplete tasks (others will simply vanish)
			this.list = this.list.filter(this.notCompleted);
		},
		editTask: function(taskId) {
			// Finish editing if already editing:
			if (taskId === this.editingId) {
				this.editingId = null;
			}
			else {
				// Now set editing item:
				this.editingId = taskId;
			}
		},
		select: function(taskId) {	// COMBINE TWO FUNCTIONS?
			this.selectedId = taskId;
		},
		setSelectedTask: function(index) {
			this.selectedId = this.list[index].id;
		},
		findSelectedTask: function() {
			var position = null;
			// Check an item is selected:
			if (this.selectedId) {
				var selId = this.selectedId;
				// Find it by id within the task list:
				position = this.list.findIndex(function(element) {
					return (element.id == selId);
				});
			}
			return position;
		},
		selectUp: function() {
			// Get list index from selectedId:
			var selectedPos = this.findSelectedTask();
			if (selectedPos > 0) {
				selectedPos--;
			}
			// Set selectedId to new list index:
			this.setSelectedTask(selectedPos);
		},
		selectDown: function() {
			// Get list index from selectedId:
			var selectedPos = this.findSelectedTask();
			if (selectedPos < this.list.length - 1) {
				selectedPos++;
			}
			// Set selectedId to new list index:
			this.setSelectedTask(selectedPos);
		},
		addTag: function(tag) {
			// Where to add it?
			var position = this.findSelectedTask();
			if (position >= 0) {
				// Check tag doesn't exist on item:
				if (this.list[position].tags.indexOf(tag) === -1) {
					// Update tags data:
					this.list[position].tags.push(tag);
				}
			}
		},
		addColour: function(colour) {
			// Where to add it?
			var position = this.findSelectedTask();
			if (position >= 0) {
				if (this.list[position].colours.indexOf(colour) === -1) {
					// Update tags data:
					this.list[position].colours.push(colour);
				}
			}
		},
		deleteTag: function(tid, tag) {
			// Where to delete it?
			var position = this.list.findIndex(function(element) {
				return (element.id == tid);
			});
			if (position) {
				var i = this.list[position].tags.indexOf(tag);
				this.list[position].tags.splice(i, 1);
			}
		},
		deleteColour: function(tid, colour) {
			// Where to delete it?
			var position = this.list.findIndex(function(element) {
				return (element.id == tid);
			});
			if (position) {
				var i = this.list[position].colours.indexOf(colour);
				this.list[position].colours.splice(i, 1);
			}
		},
		newTask: function() {
			// Build task:
			var newTask = {
				id: this.nextTaskId,
				body: '',
				completed: false,
				tags: [],
				colours: []
			};
			// Add task, selected & open for editing & focused:
			this.list.push(newTask);
			this.editingId = newTask.id;
			this.selectedId = newTask.id;
			console.log('task with id', newTask.id, 'added');
			// Increment id tracker:
			this.nextTaskId++;
		}
	}
});

var vueUIComponent = Vue.component('taskUi' , {
	template: "#ui-tpl",
	props: [
		'tags',
		'colours'
	],
	data: function() {
		return {
			editingTags: false,
			newTag: ''
		};
	},
	methods: {
		toggleEditingGlobalTags: function() {
			// Simply to show/hide editing area
			this.editingTags = !this.editingTags;
		},
		addGlobalTag: function(tag) {
			if (this.tags.indexOf(tag) === -1) {
				this.tags.push(tag);
			}
			this.newTag = '';
		},
		deleteGlobalTag: function(tag) {
			var index = this.tags.indexOf(tag);
			if (index !== -1) {
				this.tags.splice(index, 1);
			}
		},
		addTag: function(t) {
			// Send a message to taskList component via bus events:
			bus.$emit('addTag', t);
		},
		addColour: function(c) {
			// Send a message to taskList component via bus events:
			bus.$emit('addColour', c);
		}
	}
});

var exampleTasks = [
	{ id: 0, body: 'Go to the bank', completed: false, tags: ['30min'], colours: ['red'] },
	{ id: 1, body: 'Buy 5 gallons of milk', completed: false, tags: ['5min'], colours: ['blue'] },
	{ id: 2, body: 'Finish programming app', completed: false, tags: ['2h+'], colours: ['orange', 'green'] }
];

var bus = new Vue();

var vm = new Vue({
	config: {
		debug: true
	},
	el: "#app",

	data: {
		tasks: exampleTasks,
		tags: ['5min', '15min', '30min', '45min', '1h', '1.5h', '2h+'],
		colours: ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink']
	},

	ready: function() {
		// Load state when app loads:
		if (localStorage.taskAppData) {
			this.loadAll();
		}
	},

	watch: {
		// Save state whenever data.tasks changes:
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
var taskListElement = document.getElementById("task-ul");
Sortable.create(taskListElement, {
	// Reposition the dragged list item within the original data array:
	onSort: function(evt) {
		console.log(evt.oldIndex + ' > ' + evt.newIndex);
		// Switcharoo:
		var moved = vm.$refs.task-list.list.splice(evt.oldIndex, 1);
		vm.$refs.task-list.list.splice(evt.newIndex, 0, moved[0]);
	}
});


// KeyCodes:
// Move up:
Mousetrap.bind('up', function() { vm.$refs.tasklist.selectUp(); });	// OK
// Move down:
Mousetrap.bind('down', function() { vm.$refs.tasklist.selectDown(); });	// OK
// Enter = toggle editing selected task:
Mousetrap.bind('enter', function() { vm.$refs.tasklist.editTask(vm.$refs.tasklist.selectedId); });		// OK
// x = toggle completed:
Mousetrap.bind('x', function() { vm.$refs.tasklist.toggleCompleted(vm.$refs.tasklist.selectedId); });	// OK
// T = trash selected task:
Mousetrap.bind('T', function() { vm.$refs.tasklist.deleteTask(vm.$refs.tasklist.selectedId); });	// OK
// n = new task:
Mousetrap.bind('n', function() { vm.$refs.tasklist.newTask(); });	// OK
