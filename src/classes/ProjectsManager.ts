import { IProject, Project, ITodo } from "./Project"

export class ProjectsManager {

  list: Project[] = []
  ui: HTMLElement

  constructor(container: HTMLElement) {
    this.ui = container

    this.newProject({
      name: "Default small and big Project",
      description: "This is the big small default app project",
      status: "Finished",
      userRole: "Developer",
      finishDate: new Date()
    })
  }

  newProject(data: IProject) {
    const projectNames = this.list.map((project) => {
      return project.name
    })
    const nameInUse = projectNames.includes(data.name)
    if (nameInUse) {
      throw new Error(`A project with the name "${data.name}" already exists`)
    }
    if (data.name.length < 5) {
      throw new Error("Project name must be at least 5 characters long")
    }
    const project = new Project(data)

    project.ui.addEventListener("click", () => {
      const projectsPage = document.getElementById("projects-page")
      const detailsPage = document.getElementById("project-details")
      if (!projectsPage || !detailsPage) { return }
      projectsPage.style.display = "none"
      detailsPage.style.display = "flex"
      this.setDetailsPage(project)
    })

    this.ui.append(project.ui)
    this.list.push(project)
    return project
  }
  
  

  private detailsPageEventListenersAdded = false;
  private addTodoFormEventListenerAdded = false;
  private editTodoFormEventListenerAdded = false;

  private setDetailsPage(project: Project) {
    const detailsPage = document.getElementById("project-details")
    if (!detailsPage) { return }

    // Populate project details
    for (const key in project) {
      if (Object.prototype.hasOwnProperty.call(project, key)) {
        let value = project[key as keyof Project];
        if (key === "cost") {
          value = `$${value}`
        }
        if (key === "finishDate" && value instanceof Date) {
          value = value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }
        const elements = detailsPage.querySelectorAll(`[data-project-info='${key}']`)
        elements.forEach((element) => {
          if (element) { 
            if (key == "logo") {
              element.textContent = String(value)
              element.setAttribute("style", `background-color: ${project.color}; padding: 10px; border-radius: 8px; aspect-ratio: 1;`)
            }
            else {
              element.textContent = String(value)
            }
          }
        })
      }
    }

    // Populate todos
    const todoList = document.getElementById("todo-list");
    if (todoList) {
      todoList.innerHTML = "";
      project.getTodos().forEach(todo => {
        this.appendTodoItem(todoList, todo, project);
      });
    }

      // Add new event listeners only if they haven't been added yet
    if (!this.detailsPageEventListenersAdded) {
      const editButton = document.getElementById("edit-button");
      const todoSearchBar = document.getElementById("todo-search-bar");
      const addTodoButton = document.getElementById("add-todo-button");

      if (editButton) {
        editButton.addEventListener("click", () => {
          this.showEditProjectModal(project);
        });
      }

      if (todoSearchBar) {
        todoSearchBar.addEventListener("input", (e) => {
          const searchTerm = (e.target as HTMLInputElement).value;
          this.searchTodos(searchTerm, todoList);
        });
      }

      if (addTodoButton) {
        addTodoButton.addEventListener("click", () => {
          this.toggleModal("add-todo-modal", true);
          try {
            if (todoList) {
              this.addTodoToProject(project, todoList);
            }
          } catch (error) {
            alert(`Failed to add to-do: ${error.message}`);
          }
          
        });
      }

      this.detailsPageEventListenersAdded = true;
    }
  }


  addTodoToProject(project: Project, todoList: HTMLElement) {
    const addTodoForm = document.getElementById("add-todo-form")
    if (addTodoForm && addTodoForm instanceof HTMLFormElement && !this.addTodoFormEventListenerAdded) {
      addTodoForm.addEventListener("submit", (e) => {
        e.preventDefault()
        const formData = new FormData(addTodoForm)
        const todoData: ITodo = {
          text: formData.get("todoDescription") as string,
          date: new Date(),
          priority: formData.get("priority") as "Critical" | "High" | "Normal" | "Low",
          status: formData.get("status") as "New" | "In Progress" | "Completed"
        }
        try {
          this.appendTodoItem(todoList, todoData, project)
          project.addTodo(todoData)
          addTodoForm.reset()
          this.toggleModal("add-todo-modal", false)
        } catch (error) {
          alert(error)
        }
      })
      const cancelTodoFormBtn = document.getElementById("cancel-add-todo-form-button")
      if (cancelTodoFormBtn) {
        cancelTodoFormBtn.addEventListener("click", () => {
          addTodoForm.reset()
          this.toggleModal("add-todo-modal", false)
        })
      } else {
        console.warn("Cancel add todo form button was not found.")
      }
      this.addTodoFormEventListenerAdded = true;
    } 
  }

  private appendTodoItem(todoList: HTMLElement, todoData: ITodo, project: Project) {
    const statusColors: { [key: string]: string } = {
      "New": "#e57373",
      "In Progress": "#ffb74d",
      "Completed": "#81c784"
    };
  
    const todoItem = document.createElement("li");
    todoItem.className = "todo-item";
    todoItem.style.backgroundColor = statusColors[todoData.status] || "#f8f9fa"; // Default color if status not matched
    todoItem.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; column-gap: 15px; align-items: center;">
          <span class="material-icons-round" style="padding: 10px; background-color: #686868; border-radius: 10px;">construction</span>
          <p>${todoData.text}</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0;">Date: ${todoData.date.toDateString()}</p>
          <p style="margin: 0;">Priority: ${todoData.priority}</p>
          <p style="margin: 0;">Status: ${todoData.status}</p>
        </div>
      </div>
    `;
    todoItem.addEventListener("click", () => {
      this.showEditTodoModal(todoData, project);
    });
    todoList.appendChild(todoItem);
  }

  private toggleModal(id: string, show: boolean) {
    const modal = document.getElementById(id)
    if (modal && modal instanceof HTMLDialogElement) {
      if (show) {
        modal.showModal()
      }
      else {
        modal.close()
      }
    } else {
      console.warn("The element id was not found in the document.")
    }
    
  }

  private showEditTodoModal(todoData: ITodo, project: Project) {
    const editTodoModal = document.getElementById("edit-todo-modal");
    const editTodoForm = document.getElementById("edit-todo-form");
    if (!editTodoModal || !editTodoForm) { return; }

    const editTodoDescription = document.getElementById("edit-todo-description") as HTMLTextAreaElement;
    const editTodoPriority = document.getElementById("edit-todo-priority") as HTMLSelectElement;
    const editTodoStatus = document.getElementById("edit-todo-status") as HTMLSelectElement;

    editTodoDescription.value = todoData.text;
    editTodoPriority.value = todoData.priority;
    editTodoStatus.value = todoData.status;

    editTodoForm.setAttribute("data-todo-id", todoData.id!);
    this.toggleModal("edit-todo-modal", true);

    if (!this.editTodoFormEventListenerAdded) {
      editTodoForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(editTodoForm as HTMLFormElement);
        const updatedTodoData: ITodo = {
          id: todoData.id,
          text: formData.get("todoDescription") as string,
          date: todoData.date,
          priority: formData.get("priority") as "Critical" | "High" | "Normal" | "Low",
          status: formData.get("status") as "New" | "In Progress" | "Completed"
        };
        try {
          project.updateTodo(updatedTodoData);
          this.setDetailsPage(project); // Refresh the details page to reflect changes
          (editTodoForm as HTMLFormElement).reset();
          this.toggleModal("edit-todo-modal", false);
        } catch (error) {
          alert(error);
        }
      });
      const cancelEditTodoFormBtn = document.getElementById("cancel-edit-todo-form-button");
      if (cancelEditTodoFormBtn) {
        cancelEditTodoFormBtn.addEventListener("click", () => {
          (editTodoForm as HTMLFormElement).reset();
          this.toggleModal("edit-todo-modal", false);
        });
      } else {
        console.warn("Cancel edit todo form button was not found.");
      }
      this.editTodoFormEventListenerAdded = true;
    }
  }

  private showEditProjectModal(project: Project) {
    const editProjectModal = document.getElementById("edit-project-modal");
    const editProjectForm = document.getElementById("edit-project-form");
    if (!editProjectModal || !editProjectForm) { return; }

    const editProjectName = document.getElementById("edit-project-name") as HTMLInputElement;
    const editProjectDescription = document.getElementById("edit-project-description") as HTMLTextAreaElement;
    const editProjectStatus = document.getElementById("edit-project-status") as HTMLSelectElement;
    const editProjectRole = document.getElementById("edit-project-role") as HTMLSelectElement;
    const editProjectFinishDate = document.getElementById("edit-project-finish-date") as HTMLInputElement;

    editProjectName.value = project.name;
    editProjectDescription.value = project.description;
    editProjectStatus.value = project.status;
    editProjectRole.value = project.userRole;
    editProjectFinishDate.value = project.finishDate.toISOString().split("T")[0];

    editProjectForm.setAttribute("data-project-id", project.id);
    this.toggleModal("edit-project-modal", true);
  }

  editProjectDetails(data: IProject, projectId: string) {
    if (!projectId) {
      throw new Error("Project ID not found in the form.");
    }
    if (projectId) {
      const project = this.getProject(projectId);
      if (!project) {
        throw new Error("Project not found in the list.");
      }
      if (data.name.length < 5) {
        throw new Error("Project name must be at least 5 characters long")
      }
      project.name = data.name;
      project.description = data.description;
      project.status = data.status;
      project.userRole = data.userRole;
      project.finishDate = data.finishDate;
      project.logo = data.name.slice(0, 2).toUpperCase(); // Update the logo
      project.updateUI();
      this.setDetailsPage(project);
    }
  }

  private searchTodos(searchTerm: string, todoList: HTMLElement | null) {
    if (!todoList) return
    const todos = todoList.querySelectorAll(".todo-item")
    todos.forEach(todo => {
      const todoText = todo.querySelector("p")!.textContent!.toLowerCase()
      if (todoText.includes(searchTerm.toLowerCase())) {
        (todo as HTMLElement).style.display = "flex"
      } else {
        (todo as HTMLElement).style.display = "none"
      }
    })
  }

  getProject(id: string) {
    const project = this.list.find((project) => {
      return project.id === id
    })
    return project
  }

  deleteProject(id: string) {
    const project = this.getProject(id)
    if (!project) { return }
    project.ui.remove()
    const remaining = this.list.filter((project) => {
      return project.id !== id
    })
    this.list = remaining
  }

  calculateCostOfAllProjects() {
    const totalCost = this.list.reduce((total, project) => {
      return total + project.cost
    }, 0)
    return totalCost
  }

  getProjectByName(name: string) {
    const project = this.list.find((project) => {
      return project.name === name
    })
    return project
  }

  exportToJSON(fileName: string = "projects") {
    // Create a new array of projects excluding the ui attribute
    const projectsWithoutUI = this.list.map(({ ui, ...project }) => project);

    const json = JSON.stringify(projectsWithoutUI, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  importFromJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const json = reader.result;
      if (!json) { return; }
      const projects: IProject[] = JSON.parse(json as string);
      for (const project of projects) {
        try {
          if (project.id) {
            console.log(project.id);
            const existingProject = this.getProject(project.id);
            if (existingProject) {
              // Update existing project
              this.updateProject(existingProject, project);
              console.log(`Project with ID ${project.id} updated.`);
              console.log(existingProject);
            } else {
              // Add new project
              const newProject = this.newProject(project);
              console.log(`New project added:`, newProject);
            }
          }
       
        } catch (error) {
          console.error(`Failed to import project: ${error.message}`);
        }
      }
    });
    input.addEventListener('change', () => {
      const filesList = input.files;
      if (!filesList) { return; }
      reader.readAsText(filesList[0]);
    });
    input.click();
  }
  

  updateProject(existingProject: IProject, newProjectData: IProject) {
    for (const key in newProjectData) {
      if (newProjectData.hasOwnProperty(key) && key !== 'id') {
        if (key === 'finishDate' && typeof newProjectData[key] === 'string') {
          existingProject[key] = new Date(newProjectData[key]);
        } else if (key === 'todos' && Array.isArray(newProjectData[key])) {
          existingProject[key] = newProjectData[key].map((todo) => ({
            ...todo,
            date: new Date(todo.date)
          }));
        } else {
          existingProject[key] = newProjectData[key];
        }
      }
    }
  
    if (existingProject instanceof Project) {
      existingProject.updateUI();
    }
  }
}