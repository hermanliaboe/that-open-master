import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { Sidebar } from './react-components/Sidebar';

import * as THREE from "three"
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js"

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

// THREE JS viewer

const scene = new THREE.Scene()

const viewerContainer = document.getElementById("viewer-container") as HTMLElement
const camera = new THREE.PerspectiveCamera(75)
camera.position.z = 20
camera.position.y = 10

const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})
viewerContainer.append(renderer.domElement)

function resizeViewer() {
  const containerDimensions = viewerContainer.getBoundingClientRect()
  renderer.setSize(containerDimensions.width, containerDimensions.height)
  const aspectRatio = containerDimensions.width / containerDimensions.height
  camera.aspect = aspectRatio
  camera.updateProjectionMatrix()
}

window.addEventListener("resize", resizeViewer)

resizeViewer()

const boxGeometry = new THREE.BoxGeometry()
const material = new THREE.MeshStandardMaterial()
const cube = new THREE.Mesh(boxGeometry, material)



const directionalLight = new THREE.DirectionalLight()
const ambientLight = new THREE.AmbientLight()
const spotLight = new THREE.SpotLight()


scene.add( spotLight );

ambientLight.intensity = 0.5

scene.add(directionalLight, ambientLight, spotLight)



const cameraControls = new OrbitControls(camera, viewerContainer)

function renderScene() {
  renderer.render(scene, camera)
  requestAnimationFrame(renderScene)
}

renderScene()

const axes = new THREE.AxesHelper()
const grid = new THREE.GridHelper()
const lightHelper = new THREE.SpotLightHelper(spotLight)


grid.material.transparent = true
grid.material.opacity = 0.4
grid.material.color = new THREE.Color("#808080")

scene.add(axes, grid, lightHelper)

const gui = new GUI()

const cubeControls = gui.addFolder("Cube")
cubeControls.add(cube.position, "x", -5, 5)
cubeControls.add(cube.position, "y", -5, 5)
cubeControls.add(cube.position, "z", -5, 5)
cubeControls.add(cube, "visible")
cubeControls.addColor(cube.material, "color")

const lightControls = gui.addFolder("Light")
lightControls.add(directionalLight.position, "x", -5, 5)
lightControls.add(directionalLight.position, "y", -5, 5)
lightControls.add(directionalLight.position, "z", -5, 5)
lightControls.add(directionalLight, "visible")
lightControls.addColor(directionalLight, "color")
lightControls.add(directionalLight, "intensity", 0, 1)

const spotLightControls = gui.addFolder("Spot Light")
spotLightControls.add(spotLight.position, "x", -5, 5)
spotLightControls.add(spotLight.position, "y", -5, 50)
spotLightControls.add(spotLight.position, "z", -5, 5)
spotLightControls.add(spotLight, "visible")
spotLightControls.addColor(spotLight, "color")
spotLightControls.add(spotLight, "intensity", 0, 1)
spotLightControls.add(spotLight, "angle", 0, Math.PI) 
spotLightControls.add(spotLight.scale, "x", 0.1, 2, 0.1)
spotLightControls.add(spotLight.scale, "y", 0.1, 2, 0.1)
spotLightControls.add(spotLight.scale, "z", 0.1, 2, 0.1)





const objLoader = new OBJLoader()
const mtlLoader = new MTLLoader()


mtlLoader.load("../assets/Gear/Gear1.mtl", (materials) => {
  materials.preload()
  objLoader.setMaterials(materials)
  objLoader.load("../assets/Gear/Gear1.obj", (mesh) => {
    scene.add(mesh)
  })
})
