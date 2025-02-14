import * as React from "react"
import { ITodo, Project } from "../classes/Project"
import { TodoCard } from "./TodoCard"
import * as Router from 'react-router-dom';
import { SearchBox } from "./SearchBox";
import { TodoForm } from "./TodoForm";

interface Props {
  project: Project
}
export function ProjectTodosList(props: Props) {

  const [todos, setTodos] = React.useState<ITodo[]>(props.project.todos)
  const [searchValue, setSearchValue] = React.useState<string>("")
  const [selectedTodo, setSelectedTodo] = React.useState<ITodo | null>(null); // New state

  
  const handleTodoAdded = (newTodo: ITodo) => {
    setTodos([...props.project.todos]); 
  };
  const handleTodoClick = (todo: ITodo) => {
    setSelectedTodo(todo); // Set selected todo
    const modal = document.getElementById("add-todo-modal") as HTMLDialogElement;
    if (modal) modal.showModal(); // Show modal
  };
  
  const todoCards = todos.map((todo) => {
    return (
      <>
        <TodoCard todo={todo} key={todo.id} onClick = {() => {handleTodoClick(todo)}} />
      </>
    )
  })

  const onTodoSearch = (value: string) => {
    setTodos(props.project.todos.filter(todo => todo.text.toLowerCase().includes(value.toLowerCase())))
    setSearchValue(value)
  }

  return(
    <div className="dashboard-card" style={{ flexGrow: 1 }}>
      {<TodoForm project={props.project} onTodoAdded={handleTodoAdded} selectedTodo = {selectedTodo} />}
      <div
        style={{
          padding: "20px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <h4>To-Do</h4>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            columnGap: 20
          }}
        >
          <SearchBox goalName="todos" onChange={(value) => onTodoSearch(value)} />
          <span
            id="add-todo-button"
            className="material-icons-round action-icon"
            onClick={() => {
              setSelectedTodo(null); // Clear selection when adding a new todo
              const modal = document.getElementById("add-todo-modal") as HTMLDialogElement;
              if (modal) modal.showModal();
            }}
          >
            add
          </span>
        </div>
      </div>
      <ul
        id="todo-list"
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "10px 30px",
          rowGap: "20px"
        }}
      >
      {
        todoCards.length > 0 ? <div id="projects-list">{ todoCards }</div> : 
        (props.project.todos.length > 0 ? 
          <div style={{ textAlign: 'center', color: 'gray', marginTop: '20px' }}>
            <p>No todos found for "<strong>{searchValue}</strong>"</p>
            <p>Try adjusting your search criteria.</p>
          </div> :
          <div style={{ textAlign: 'center', color: 'gray', marginTop: '20px' }}>
            <p>Nothing to do...</p>
          </div>
        )
      }
      </ul>
    </div>
  )
}