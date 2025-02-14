import * as React from 'react';
import * as Firestore from "firebase/firestore";
import { getCollection } from '../firebase';
import { IProject, Project, ProjectStatus, UserRole } from '../classes/Project';
import { ProjectsManager } from '../classes/ProjectsManager';
import { ProjectCard } from './ProjectCard';
import { SearchBox } from './SearchBox';
import * as Router from 'react-router-dom';
import firebase from 'firebase/compat/app';
import { v4 as uuidv4 } from "uuid"
import { ProjectForm } from './ProjectForm';

interface Props {
  projectsManager: ProjectsManager
}
const projectsCollection = getCollection<IProject>("/projects")

export function ProjectsPage(props: Props) {
  
  const [projects, setProjects] = React.useState<Project[]>(props.projectsManager.list)
  const [searchValue, setSearchValue] = React.useState<string>("")
  console.log("Projects from start", projects)

  props.projectsManager.onProjectCreated = () => {setProjects([...props.projectsManager.list])}


  const getFirestoreProjects = async () => {
    const firebaseProjects = await Firestore.getDocs(projectsCollection)
    for (const doc of firebaseProjects.docs) {
      const data = doc.data()
      const project : IProject = {
        ...data,
        finishDate: (data.finishDate as unknown as Firestore.Timestamp).toDate(),
        todos: data.todos
        ? data.todos.map((todo: any) => ({
            ...todo,
            date: (todo.date as Firestore.Timestamp)?.toDate(), // Ensure todo dates are converted
          }))
        : [],
      }
      console.log("finishDate", project.finishDate)
      try {
        props.projectsManager.newProject(project, doc.id) // This is where the project is created
        console.log("Project created", project)
      }
      catch (error) {
        const existingProject = props.projectsManager.getProject(doc.id)
        if (!existingProject) {
          console.error("Project not found", doc.id)
          continue
        }
        props.projectsManager.updateProject(existingProject, project)
      }
    }
  }

  React.useEffect(() => {
    console.log("projects from firestore")
    getFirestoreProjects()
  }, [])

  const projectCards = projects.map((project) => {
    return (
      <Router.Link to={`/project/${project.id}`} key={project.id}>
        <ProjectCard project={project} />
      </Router.Link>
    )
  })

  React.useEffect(() => {
    console.log("Projects state updated PP", projects)
  }, [projects])

  const onNewProjectClick = () => {
    const modal = document.getElementById("new-project-modal")
    if (!(modal && modal instanceof HTMLDialogElement)) {return}
    modal.showModal()
  }

  const onExportProjectsClick = () => {
    props.projectsManager.exportToJSON()
  }

  const onImportProjectsClick = () => {
    props.projectsManager.importFromJSON()
  }

  const onProjectSearch = (value: string) => {
    setProjects(props.projectsManager.filterProjects(value))
    setSearchValue(value)
  }

  return(
    <div className="page" id="projects-page">
      { <ProjectForm projectsManager={props.projectsManager} /> }
      <header>
        <h2>Projects</h2>
        <SearchBox goalName='projects' onChange={(value) => onProjectSearch(value)} />
        <div style={{ display: "flex", alignItems: "center", columnGap: 15 }}>
          <span
            onClick={onImportProjectsClick}
            id="import-projects-btn"
            className="material-icons-round action-icon"
          >
            file_upload
          </span>
          <span
            onClick={onExportProjectsClick}
            id="export-projects-btn"
            className="material-icons-round action-icon"
          >
            file_download
          </span>
          <button onClick={onNewProjectClick} id="new-project-btn">
            <span className="material-icons-round">add</span>New Project
          </button>
        </div>
      </header>
      {
        projects.length > 0 ? <div id="projects-list">{ projectCards }</div> : 
        <div style={{ textAlign: 'center', color: 'gray', marginTop: '20px' }}>
          <p>No projects found for "<strong>{searchValue}</strong>"</p>
          <p>Try adjusting your search criteria.</p>
        </div>
      }

    </div>
  )   
}