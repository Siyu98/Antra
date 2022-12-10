const APIs = (() => {
    const URL = "http://localhost:3000/todos";

    const addTodo = (newTodos) => {
        return fetch(URL, {
            method: "POST",
            body: JSON.stringify(newTodos),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((res) => {
            return res.json();
        })
    }


    const deleteTodo = (id) => {
        return fetch(`${URL}/${id}`, {
            method: "DELETE"
        }).then((res) => {
            return res.json();
        })
    };

    const getTodos = () => {
        return fetch(`${URL}`).then((res) => {
            return res.json();
        })
    }

    const putTodos = (id,newTodos) => {
        return fetch(`${URL}/${id}`,{
            method: "PATCH",
            body: JSON.stringify({title:newTodos}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            return res.json();
        })
    }

    const updatestatesTodos = (id,status) => {
        return fetch(`${URL}/${id}`,{
            method: "PATCH",
            body: JSON.stringify({completed:status}),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            return res.json();
        })
    }

    return {
        getTodos,
        deleteTodo,
        addTodo,
        putTodos,
        updatestatesTodos
    }
})()




/*
    closure, IIFE
    event bubbling, event capturing
    json server
*/
const Model = (() => {
    class State {
        #todos;
        #onChangeCb;
        constructor() {
            this.#todos = [];
            this.#onChangeCb = () => { }
        }
        get todos() {
            return this.#todos
        }
        set todos(newTodos) {
            this.#todos = newTodos
            this.#onChangeCb();
        }

        subscirbe = (cb) => {
            this.#onChangeCb = cb;
        }
    }
    return {
        State
    }

})();

/*
    [
        {content:"work",id:1},
        {content:"eat",id:2}
    ]
*/

const View = (() => {
    const formEl = document.querySelector(".todo__form");
    const todoListEl = document.querySelector(".todo__list");
    const renderTodolist = (todos) => {
        console.log(todos);
        let template = "";
        todos.sort((a,b)=>b.id-a.id).forEach((todo) => {
            template += `
                <li><span class="span" id="input-${todo.id}">${todo.title}</span><button class="btn--delete" id="${todo.id}">Delete</button><button class="btn--update" id="${todo.id}">Update</button><button class="btn--submit" id="${todo.id}">Submit</button></li>
            `
        })
        todoListEl.innerHTML = template;
    }
    return {
        formEl,
        renderTodolist,
        todoListEl
    }
})();



const ViewModel = ((Model, View) => {
    const state = new Model.State();

    const addTodo = () => {
        View.formEl.addEventListener("submit", (event) => {
            event.preventDefault();
            const title = event.target[0].value;
            if(title.trim() === "") return;
            const newTodo = { title, completed:false }
            APIs.addTodo(newTodo).then(res => {
                console.log("Res", res);
                state.todos = [res, ...state.todos];//anti-pattern
            })

        })
    }

    const deleteTodo = () => {
        View.todoListEl.addEventListener("click", (event) => {
            console.log(event.currentTarget, event.target)
            const { id } = event.target
            if (event.target.className === "btn--delete") {
                APIs.deleteTodo(id).then(res => {
                    console.log("Res", res);
                    state.todos = state.todos.filter((todo) => {
                        return +todo.id !== +id
                    });
                });
            }
        })
    }

    const updateTodo = () => {
        View.todoListEl.addEventListener("click", (event) => {
            console.log(event.currentTarget, event.target);
            const { id } = event.target;
            if (event.target.className === "btn--update" && event.target.id==id) {
                console.log("targetid:",id);
                let element = document.getElementById(`input-${id}`);
                element.innerHTML=`<input id="edit-${id}", type="text"/>`;
            }
        })
    }

    const submitupdate = () => {
        View.todoListEl.addEventListener("click", (event) => {
            console.log(event.currentTarget, event.target);
            const { id } = event.target;
            if (event.target.className === "btn--submit" && event.target.id==id) {
                let elementvalue = document.getElementById(`edit-${id}`).value;
                console.log(elementvalue);
                APIs.putTodos(id,elementvalue).then(res => {
                    console.log("Res", res);
                    state.todos = state.todos.map((todo) => {
                        if(+todo.id==+id){
                            todo.title=elementvalue;
                        }
                        return todo;
                    });
                });
            }
        })
    }

    const updatestatus = () =>{
        View.todoListEl.addEventListener("click", (event) => {
            console.log(event.currentTarget, event.target);
            const { id } = event.target;
            if (event.target.className === "span") {
                const curTodo = state.todos.filter((todo) => todo.id !== id)[0]
                console.log(curTodo);
                const status=curTodo.completed;
                console.log(status);
                APIs.updatestatesTodos(id.split("-")[1], !status).then(res => {
                    console.log("Res", res);
                    document.getElementById(id).style.textDecoration='line-through'
                })
            }
            state.todos = state.todos.map((todo) => {
                if(+todo.id==+id.split("-")[1]){
                   todo.completed=!todo.completed;
                }
                return todo;
            });
        })
    }

    const getTodos = ()=>{
        APIs.getTodos().then(res=>{
            state.todos = res;
        })
    }

    const bootstrap = () => {
        addTodo();
        deleteTodo();
        getTodos();
        updateTodo();
        submitupdate();
        updatestatus();
        state.subscirbe(() => {
            View.renderTodolist(state.todos)
        });
    }
    return {
        bootstrap
    }
})(Model, View);

ViewModel.bootstrap();


