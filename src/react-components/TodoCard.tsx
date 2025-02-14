import * as React from "react"
import { ITodo, Project } from "../classes/Project"

interface Props {
  todo: ITodo,
  onClick: () => void
}

export function TodoCard(props: Props) {
  const statusColors: { [key: string]: string } = {
    "New": "#e57373",
    "In Progress": "#ffb74d",
    "Completed": "#81c784"
  };
  const todo = props.todo
  
  return(
    <div className="todo-item"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: statusColors[todo.status] || "#f8f9fa"
      }}
      onClick={props.onClick}
    >
      <div style={{ display: "flex", columnGap: "15px", alignItems: "center" }}>
        <span
          className="material-icons-round"
          style={{ padding: "10px", backgroundColor: "#686868", borderRadius: "10px" }}
        >
          construction
        </span>
        <p>
          {todo.text}
        </p>
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ margin: 0 }}>
          Date: {todo.date.toLocaleDateString()}
        </p>
        <p style={{ margin: 0 }}>
          Priority: {todo.priority}
        </p>
        <p style={{ margin: 0 }}>
          Status: {todo.status}
        </p>
      </div>
    </div>
  )
}