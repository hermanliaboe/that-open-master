import { IProject, ITodo, ProjectStatus, UserRole } from "./classes/Project"
import { ProjectsManager } from "./classes/ProjectsManager"

function toggleModal(id: string, show: boolean) {
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

const projectsListUI = document.getElementById("projects-list") as HTMLElement
const projectsManager = new ProjectsManager(projectsListUI)

/* This document object is provided by the browser, 
and its main purpose is to help us interact with the DOM. */
const newProjectBtn = document.getElementById("new-project-btn")

if (newProjectBtn) {
  newProjectBtn.addEventListener("click", () => {toggleModal("new-project-modal", true)})
} else {
  console.warn("New project button was not found.")
}


const projectForm = document.getElementById("new-project-form")
if (projectForm && projectForm instanceof HTMLFormElement) {
  projectForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const formData = new FormData(projectForm)
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      finishDate: new Date(formData.get("finishDate") as string)
    }
    try {
      const project = projectsManager.newProject(projectData)
      projectForm.reset()
      toggleModal("new-project-modal", false)
    } catch (error) {
      alert(error)
    }
    
  })
  const cancelProjectFormBtn = document.getElementById("cancel-project-form-button")
  if (cancelProjectFormBtn) {
    cancelProjectFormBtn.addEventListener("click", () => {
      projectForm.reset()
      toggleModal("new-project-modal", false)})
  } else {
    console.warn("Cancel project form button was not found.")
  }
} else {
  console.warn("The project form was not found. Check the ID!")
}

const editProjectForm = document.getElementById("edit-project-form")
if (editProjectForm && editProjectForm instanceof HTMLFormElement) {
  editProjectForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const formData = new FormData(editProjectForm)
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      finishDate: new Date(formData.get("finishDate") as string)
    }
    try {
      const projectId = editProjectForm.getAttribute("data-project-id");
      if (projectId) {
        const project = projectsManager.editProjectDetails(projectData, projectId)
      } else {
        throw new Error("Project ID is null.")
      }
      editProjectForm.reset()
      toggleModal("edit-project-modal", false)
    } catch (error) {
      alert(error)
    }
    
  })
  const cancelEditProjectFormBtn = document.getElementById("cancel-edit-project-form-button")
  if (cancelEditProjectFormBtn) {
    cancelEditProjectFormBtn.addEventListener("click", () => {
      editProjectForm.reset()
      toggleModal("edit-project-modal", false)})
  } else {
    console.warn("Cancel edit project form button was not found.")
  }
} else {
  console.warn("The edit project form was not found. Check the ID!")
}

// todo form

// todo form

const exportProjectsBtn = document.getElementById("export-projects-btn")
if (exportProjectsBtn) {
  exportProjectsBtn.addEventListener("click", () => {
    projectsManager.exportToJSON()
  })
}

const importProjectsBtn = document.getElementById("import-projects-btn")
if (importProjectsBtn) {
  importProjectsBtn.addEventListener("click", () => {
    projectsManager.importFromJSON()
  })
}

const projectsPage = document.getElementById("projects-page");
const sidebarProjectsButton = document.getElementById("sidebar-projects-btn");

if (sidebarProjectsButton && projectsPage) {
  sidebarProjectsButton.addEventListener("click", () => {
    // Show projects page and hide others if necessary
    projectsPage.style.display = "flex";
    const detailsPage = document.getElementById("project-details");
    const usersPage = document.getElementById("users-page");

    if (detailsPage) detailsPage.style.display = "none";
    if (usersPage) usersPage.style.display = "none";
  });
}