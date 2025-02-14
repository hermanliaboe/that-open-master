import * as React from "react";
import { Project, ITodo, IProject } from "../classes/Project";
import { updateDocument, getCollection } from "../firebase";

interface Props {
  project: Project,
  onTodoAdded: (newTodo: ITodo) => void,
  selectedTodo: ITodo | null
}
const projectCollection = getCollection<IProject>("/projects")

export function TodoForm(props: Props) {
  const [text, setText] = React.useState(props.selectedTodo?.text || "");
  const [priority, setPriority] = React.useState(props.selectedTodo?.priority || "Normal");
  const [status, setStatus] = React.useState(props.selectedTodo?.status || "New");

  React.useEffect(() => {
    setText(props.selectedTodo?.text || "");
    setPriority(props.selectedTodo?.priority || "Normal");
    setStatus(props.selectedTodo?.status || "New");
  }, [props.selectedTodo]); // Update fields when selectedTodo changes

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const todoData: ITodo = {
      id: props.selectedTodo?.id, // Keep ID for editing
      text,
      date: props.selectedTodo?.date || new Date(),
      priority,
      status,
    }
    try {
      if (props.selectedTodo) {
        props.project.updateTodo(todoData); // Update if editing
      } else {
        props.project.addTodo(todoData); // Add if new
      }
      props.onTodoAdded(todoData);
      await updateDocument("/projects", props.project.id, { ...props.project });

      const modal = document.getElementById("add-todo-modal") as HTMLDialogElement;
      if (modal) modal.close();
    } catch (error) {
      alert(error);
    }
  }

  return(
    <dialog id="add-todo-modal" className="modal">
      <form id="add-todo-form" onSubmit={onFormSubmit}>
        <h2>{props.selectedTodo ? "Edit Todo" : "Add Todo"}</h2>
        <div className="input-list">
          <div className="form-field-container">
            <label>
              <span className="material-icons-round">description</span>Description
            </label>
            <textarea
              name="todoDescription"
              id="todo-description"
              cols={30}
              rows={5}
              placeholder="Describe the task"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="form-field-container">
            <label>
              <span className="material-icons-round">priority_high</span>Priority
            </label>
            <select name="priority" id="todo-priority" value={priority} onChange={(e) => setPriority(e.target.value as "Critical" | "High" | "Normal" | "Low")}>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="form-field-container">
            <label>
              <span className="material-icons-round">assignment</span>Status
            </label>
            <select name="status" id="todo-status" value={status} onChange={(e) => setStatus(e.target.value as "New" | "In Progress" | "Completed")}>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div
            style={{
              display: "flex",
              margin: "10px 0px 10px auto",
              columnGap: 10
            }}
          >
            <button
              type="button"
              id="cancel-add-todo-form-button"
              style={{ backgroundColor: "transparent" }}
              onClick={() => {
                const modal = document.getElementById("add-todo-modal");
                if (!(modal && modal instanceof HTMLDialogElement)) return;
                modal.close();
              }}
            >
              Cancel
            </button>
            <button type="submit" style={{ backgroundColor: "rgb(18, 145, 18)" }}>
              {props.selectedTodo ? "Save Changes" : "Add Todo"}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  )
}