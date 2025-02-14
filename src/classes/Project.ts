import { v4 as uuidv4 } from "uuid"

export type ProjectStatus = "Pending" | "Active" | "Finished"
export type UserRole = "Architect" | "Engineer" | "Developer"

export interface IProject {
  id?: string
  name: string
  description: string
  status: ProjectStatus
  userRole: UserRole
  finishDate: Date
  todos?: ITodo[]
  logo?: string; // Add the logo property
}

export interface ITodo {
  id?: string
  text: string
  date: Date
  priority: "Critical" | "High" | "Normal" | "Low"
  status: "New" | "In Progress" | "Completed"
}

export class Project implements IProject {
  name: string
  description: string
  status: ProjectStatus
  userRole: UserRole
  finishDate: Date
  todos: ITodo[] = []
  logo: string
  color: string

  // Class internals
  cost: number = 0
  progress: number = 80
  id: string

  constructor(data: IProject, id = uuidv4()) {
    for (const key in data) {
      this[key] = data[key]
    }

    // Check if finishDate is valid
    // if (!(this.finishDate instanceof Date)) {
    //   this.finishDate = new Date(new Date().setMonth(new Date().getMonth() + 1)); // Set default finish date to one month from today
    //   console.log("date was set to", this.finishDate)
    // }

    // Convert todo dates from strings to Date objects
    if (this.todos) {
      this.todos = this.todos.map(todo => ({
        ...todo,
        date: new Date(todo.date)
      }))
    }

    this.id = id

    this.logo = this.name.slice(0, 2).toUpperCase(); // Initialize the logo
    if (!this.color) { this.color = this.colors[Math.floor(Math.random() * this.colors.length)] }

    
  }
  // Array of possible colors
  private colors: string[] = ["#ca8134", "#3498db", "#e74c3c", "#2ecc71", "#9b59b6", "#f1c40f"];

  


  // Add a new todo
  addTodo(todoData: ITodo) {
    if (!todoData.text) {
      throw new Error("To-do text cannot be empty.");
    }

    if (!(todoData.date instanceof Date) || isNaN(todoData.date.getTime())) {
      throw new Error("Invalid date in todo.");
    }

    if (!todoData.id) {
      todoData.id = uuidv4();
    }
    this.todos.push(todoData);
  }

  // Update an existing todo
  updateTodo(updatedTodoData: ITodo) {
    const todoIndex = this.todos.findIndex(todo => todo.id === updatedTodoData.id);
    if (todoIndex === -1) {
      throw new Error("To-do not found.");
    }

    this.todos[todoIndex] = updatedTodoData;
  }

  // Get todos
  getTodos() {
    return this.todos;
  }
}