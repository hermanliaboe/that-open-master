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
  ui: HTMLDivElement
  cost: number = 0
  progress: number = 0
  id: string

  constructor(data: IProject) {
    for (const key in data) {
      this[key] = data[key]
    }

    // Check if finishDate is valid
    if (!(this.finishDate instanceof Date) || isNaN(this.finishDate.getUTCDay())) {
      this.finishDate = new Date(new Date().setMonth(new Date().getMonth() + 1)); // Set default finish date to one month from today
    }

    // Convert todo dates from strings to Date objects
    if (this.todos) {
      this.todos = this.todos.map(todo => ({
        ...todo,
        date: new Date(todo.date)
      }))
    }

    if (!data.id) {
      this.id = uuidv4()
    }

    this.logo = this.logo || this.name.slice(0, 2).toUpperCase(); // Initialize the logo
    this.color = this.colors[Math.floor(Math.random() * this.colors.length)]; // Initialize the color

    // Set project card UI
    this.setUI()
  }
  // Array of possible colors
  private colors: string[] = ["#ca8134", "#3498db", "#e74c3c", "#2ecc71", "#9b59b6", "#f1c40f"];

  // Creates the project card UI
  setUI() {
    if (this.ui) { return }

    this.ui = document.createElement("div")
    this.ui.className = "project-card"
    this.ui.innerHTML = `
    <div class="card-header">
      <p style="background-color: ${this.color}; padding: 10px; border-radius: 8px; aspect-ratio: 1;" data-project-info="logo">${this.logo}</p>
      <div>
        <h5 data-project-info="name">${this.name}</h5>
        <p data-project-info="description">${this.description}</p>
      </div>
    </div>
    <div class="card-content">
      <div class="card-property">
        <p style="color: #969696;">Status</p>
        <p data-project-info="status">${this.status}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696;">Role</p>
        <p data-project-info="userRole">${this.userRole}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696;">Cost</p>
        <p data-project-info="cost">$${this.cost}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696;">Estimated Progress</p>
        <p data-project-info="progress">${this.progress * 100}%</p>
      </div>
    </div>
    `
  }

  // Update the project UI with new details
  updateUI() {
    if (!this.ui) { return }
    const elements = this.ui.querySelectorAll("[data-project-info]");
    elements.forEach((element) => {
      const key = element.getAttribute("data-project-info");
      if (key) {
        let value = this[key as keyof Project];
        if (key === "cost") {
          value = `$${value}`;
        }
        if (key === "finishDate" && value instanceof Date) {
          value = value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        element.textContent = String(value);
      }
    });
  }

  // Add a new todo
  addTodo(todoData: ITodo) {
    if (!todoData.text) {
      throw new Error("To-do text cannot be empty.");
    }

    todoData.id = uuidv4();
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