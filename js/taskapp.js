/*global Vue, Sortable, Mousetrap */
'use strict';

var bus = new Vue();

var vueListComponent = Vue.component('taskList' , {
	template: '#task-list-tpl',
	props: {
		list: Array,				// template binding: list = root.tasks
		trash: Array,
		search: {
			type: String,
			default: ''
		}
	},

	data: function() {
		return {
			addFormVisible: false,
			selectedId: null,
			editingId: null
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
			for (var i = 0; i < this.list.length; i++) {
				var tid = parseInt(this.list[i].id, 10);
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
			var task = this.list[this.findSelectedRow()];
			task.completed = !task.completed;
		},
		notCompleted: function(task) {
			return !task.completed;
		},		// only used as a filter function

		deleteTask: function(taskId) {
			// Where to delete it?
			var index = this.list.findIndex(function(element) {
				return (element.id === taskId);
			});
			if (index !== -1) {
				// Remove from list:
				var trashed = this.list.splice(index, 1);
				// Add to trash:
				this.trash.push(trashed[0]);
			}
		},
		clearCompleted: function() {
			// Add task to trash:
			var i;
			for (i = 0; i < this.list.length; i++) {
				if (this.list[i].completed) {
					this.trash.push(this.list[i]);
				}
			}
			// Set list as only our incomplete tasks:
			this.list = this.list.filter(this.notCompleted);
		},
		unTrashLast: function() {
			if (this.trash.length > 0) {
				var item = this.trash.pop();
				this.list.push(item);
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

		selectTask: function(taskId) {
			this.selectedId = taskId;
		},
		selectRow: function(rowId) {
			this.selectedId = this.list[rowId].id;
		},
		selectUp: function() {
			// Get list index from selectedId:
			var selectedPos = this.findSelectedRow();
			if (selectedPos > 0) {
				selectedPos--;
			}
			// Set selectedId to new list index:
			this.selectRow(selectedPos);
		},
		selectDown: function() {
			// Get list index from selectedId:
			var selectedPos = this.findSelectedRow();
			if (selectedPos < this.list.length - 1) {
				selectedPos++;
			}
			// Set selectedId to new list index:
			this.selectRow(selectedPos);
		},
		findSelectedRow: function() {
			// Check an item is selected:
			if (this.selectedId !== null) {
				var rowId = this.selectedId;
			}
			else {
				return null;
			}
			// Find it by id within the task list:
			return this.list.findIndex(function(element) {
				return (element.id === rowId);
			});
		},

		addTag: function(tag) {		// can only be added to selected row
			// Where to add it?
			var position = this.findSelectedRow();
			if (position >= 0) {
				// Check tag doesn't exist on item:
				if (this.list[position].tags.indexOf(tag) === -1) {
					// Update tags data:
					this.list[position].tags.push(tag);
				}
			}
		},
		addColour: function(colour) {	// can only be added to selected row
			// Where to add it?
			var position = this.findSelectedRow();
			if (position >= 0) {
				if (this.list[position].colours.indexOf(colour) === -1) {
					// Update tags data:
					this.list[position].colours.push(colour);
				}
			}
		},
		deleteTag: function(taskId, tag) {
			// Where to delete it?
			var position = this.list.findIndex(function(element) {
				return (element.id === taskId);
			});
			if (position >= 0) {
				var i = this.list[position].tags.indexOf(tag);
				this.list[position].tags.splice(i, 1);
			}
		},
		deleteColour: function(taskId, colour) {
			// Where to delete it?
			var position = this.list.findIndex(function(element) {
				return (element.id === taskId);
			});
			if (position >= 0) {
				var i = this.list[position].colours.indexOf(colour);
				this.list[position].colours.splice(i, 1);
			}
		}
	}
});

var vueUIComponent = Vue.component('taskUi' , {
	template: '#ui-tpl',
	props: {
		tags: Array,
		colours: Array,
		newTag: {
			type: String,
			default: ''
		}
	},

	data: function() {
		return {
			editingTags: false
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
		},
		exportTasks: function(format) {
			// Send a message to root component via bus events:
			bus.$emit('exportTasks', format);
		}
	}
});

var exampleTasks = [
	{ id: 0, body: 'Go to the bank', completed: false, tags: ['30min'], colours: ['red'] },
	{ id: 1, body: 'Buy 5 gallons of milk', completed: false, tags: ['5min'], colours: ['blue'] },
	{ id: 2, body: 'Finish programming app', completed: false, tags: ['2h+'], colours: ['orange', 'green'] }
];

var vm = new Vue({
	config: {
		debug: true
	},
	el: '#app',

	data: {
		// User-changeable:
		tasks: exampleTasks,
		trash: [],
		tags: ['5min', '15min', '30min', '45min', '1h', '1.5h', '2h+'],
		// Immutable:
		colours: ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink']
	},

	ready: function() {
		// Load state when app loads:
		if (localStorage.getItem('tasks')) {
			this.loadAll();
		}

		// Listen for message from the events bus:
		bus.$on('exportTasks', function(format) {
			this.exportTasks(format);
		}.bind(this));

		// Listen for message from the events bus:
		bus.$on('saveAll', function() {
			this.saveAll();
		}.bind(this));
	},

	watch: {
		// Save state whenever data.tasks changes:
		tasks: {
			handler: function(newData, oldData) {
				this.saveAll();
			},
			deep: true
		},
		// Save state whenever data.trash changes:
		trash: {
			handler: function(newData, oldData) {
				this.saveAll();
			},
			deep: true
		},
		// Save state whenever data.tags changes:
		tags: {
			handler: function(newData, oldData) {
				this.saveAll();
			}
		}
	},

	methods: {
		loadAll: function() {
			this.tasks = JSON.parse(localStorage.getItem('tasks'));
			this.trash = JSON.parse(localStorage.getItem('trash'));
			if (localStorage.getItem('tags').length > 0) {
				this.tags = JSON.parse(localStorage.getItem('tags'));	// else: keep default tags
			}
			console.info('Data loaded.');
		},
		saveAll: function() {
			localStorage.setItem('tasks', JSON.stringify(this.tasks));
			localStorage.setItem('trash', JSON.stringify(this.trash));
			localStorage.setItem('tags', JSON.stringify(this.tags));
			console.info('Data saved.');
		},
		exportTasks: function(format) {
			var encodedUri;
			if (format === 'csv') {
				var csvContent = 'data:text/csv;charset=utf-8,';
				for (var i = 0; i < this.tasks.length; i++) {
					var task = this.tasks[i];
   					csvContent += task.body + ',' + task.completed.toString() + ',' + task.tags.toString() + ',' + task.colours.toString() + '\n';
				}
				// Use JavaScript's window.open and encodeURI functions to download the CSV file:
				encodedUri = encodeURI(csvContent);
				window.open(encodedUri);
			}
			else if (format === 'json') {
				var jsonContent = 'data:text/json;charset=utf-8,';
				jsonContent += JSON.stringify(this.tasks);
				// Use JavaScript's window.open and encodeURI functions to download the CSV file:
				encodedUri = encodeURI(jsonContent);
				window.open(encodedUri);
			}
		}
	}
});


// Sortable.js
var taskListElement = document.getElementById('task-ul');
Sortable.create(taskListElement, {
	// Reposition the dragged list item within the original data array:
	onSort: function(evt) {
		console.log(evt.oldIndex + ' > ' + evt.newIndex);
		// Switcharoo:
		var moved = vm.$refs.tasklist.list.splice(evt.oldIndex, 1);
		vm.$refs.tasklist.list.splice(evt.newIndex, 0, moved[0]);
	}
});

/*
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
Mousetrap.bind('D', function() { vm.$refs.tasklist.deleteTask(vm.$refs.tasklist.selectedId); });	// OK
// U = untrash last trashed task:
Mousetrap.bind('U', function() { vm.$refs.tasklist.unTrashLast(); });	// OK
// n = new task:
Mousetrap.bind('n', function() { vm.$refs.tasklist.newTask(); });	// OK
*/
Mousetrap.bind({
	'up': 	function() { vm.$refs.tasklist.selectUp(); },
	'down': function() { vm.$refs.tasklist.selectDown(); },
	'enter':function() { vm.$refs.tasklist.editTask(vm.$refs.tasklist.selectedId); },
	'x': 	function() { vm.$refs.tasklist.toggleCompleted(vm.$refs.tasklist.selectedId); },
	'D': 	function() { vm.$refs.tasklist.deleteTask(vm.$refs.tasklist.selectedId); },
	'U': 	function() { vm.$refs.tasklist.unTrashLast(); },
	'n': 	function() { vm.$refs.tasklist.newTask(); }
});

// Save state before close or reload:
window.addEventListener('beforeunload', function(e){
	bus.$emit('saveAll');
}, false);
