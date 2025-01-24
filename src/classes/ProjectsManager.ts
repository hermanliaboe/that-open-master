import { IProject, Project } from "./Project"

export class ProjectsManager {

  list: Project[] = []
  ui: HTMLElement

  constructor (container: HTMLElement) {
    this.ui = container

    this.newProject({
      name: "Default small and big Project",
      description: "This is the big small default app project",
      status: "finished",
      userRole: "developer",
      finishDate: new Date()
    })
  }

  newProject(data: IProject) {
    // The map function creates a new list of something done to each element in the original list
    // Like iterating thorough all elements and adding project.name to a new list
    const projectNames = this.list.map((project) => {
      return project.name
    })
    const nameInUse = projectNames.includes(data.name)
    if (nameInUse) {
      throw new Error(`A project with the name "${data.name}" already exists`)
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

  private setDetailsPage (project: Project) {
    const detailsPage = document.getElementById("project-details")
    if (!detailsPage) { return }
    for (const key in project) {
      if (Object.prototype.hasOwnProperty.call(project, key)) {
        let value = project[key as keyof Project];
        if (key === "cost") {
          value = `$${value}`
        }
        if (key === "finishDate"  && value instanceof Date) {
          value = value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
        const elements = detailsPage.querySelectorAll(`[data-project-info='${key}']`)
        elements.forEach((element) => {
          if (element) { element.textContent = String(value) }
        })
      }
    }
  }

  getProject(id: string) {
    const project = this.list.find((project) => {
      return project.id === id
    })
    return project
  }

  deleteProject(id: string) {
    const project = this.getProject(id)
    if(!project) {return}
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
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      const json = reader.result
      if (!json) { return }
      const projects: IProject[] = JSON.parse(json as string)
      for (const project of projects) {
        try {
          this.newProject(project)
        } catch (error) {
          
        }
      }
    })
    input.addEventListener('change', () => {
      const filesList = input.files
      if (!filesList) { return }
      reader.readAsText(filesList[0])
    })
    input.click()
  }

}