/*global TaskApp, mocha, chai, sinon, describe, it, beforeEach, afterEach*/

mocha.setup('bdd');

var expect = chai.expect;        // plain Node expect also exists
var assert = chai.assert;        // plain Node assert also exists

describe('Root Vue instance', function() {
    var sandbox;

    beforeEach(function() {
    	// create a sandbox
    	sandbox = sinon.sandbox.create();

    	// stub some console methods
    	sandbox.stub(window.console, "log");
    	sandbox.stub(window.console, "error");
    });

    afterEach(function() {
    	// restore the environment as it was before
    	sandbox.restore();
    });

    it('should exist', function(done) {     // PASSES
        expect(TaskApp.vm).to.satisfy(isaVue);

        function isaVue(vm) {
            return vm._isVue === true;
        }
        done();
    });

    it('should have a tasks array', function() {
        expect(TaskApp.vm).to.satisfy(hasTasksArray);

        function hasTasksArray(vm) {
            return typeof vm.$data.tasks  === Array;
        }
    });
});

mocha.run();

/*
TESTS

Root Vue instance
- it exists
- it has tasks = []
- it has trash = []
- it has tags = []
- it has colours = []
- it can load from localStorage
- it can save to localStorage
- if tasks changes, we save
- if trash changes, we save
- if tags changes, we save
- it can export tasks as json
- it can export tasks as csv

List component
- add task increases tasks.length by 1
- delete task reduces tasks.length by 1
- undelete task increases tasks.length by 1
- edit task, type, leaves task with new title

Tags
- select task
- click a tag adds tag to task
- click a colour adds colour to task
- click a tag deletes tag from task
- click a colour deletes colour from task
- add tag increases tags.length by 1

Key bindings
- up selects up
- down selects down
- enter toggles editing
- n makes new task
- D deletes task
- U undeletes task
*/
