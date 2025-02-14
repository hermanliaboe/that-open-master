import * as React from "react";
import { ProjectsManager } from "../classes/ProjectsManager";
import* as Router from "react-router-dom";
import { IProject, Project, ProjectStatus, UserRole } from "../classes/Project";
import { ThreeViewer } from "./ThreeViewer";
import { deleteDocument, updateDocument } from "../firebase";
import { ProjectTodosList } from "./ProjectTodosList";

interface Props {
  projectsManager: ProjectsManager
}

export function ProjectDetailsPage(props: Props) {
  const routeParams = Router.useParams<{id: string}>()

  if (!routeParams.id) {
    return <p>Project ID is needed to see this page</p>;
  }

  const fetchedProject = props.projectsManager.getProject(routeParams.id);
  if (!fetchedProject) {
    return <p>The project with ID {routeParams.id} wasn't found.</p>;
  }
  console.log("the todos of the fetched project...",fetchedProject.todos)

  const navigateTo = Router.useNavigate()

  props.projectsManager.onProjectDeleted = async (id) => {
    await deleteDocument("/projects", id)
    navigateTo("/")
  }

  const [project, setProject] = React.useState<Project>(fetchedProject);
  
  props.projectsManager.onProjectUpdated = async (updatedProject: Project) => {
    await updateDocument("/projects", updatedProject.id, {...updatedProject})
    setProject(new Project({...updatedProject}))}

  React.useEffect(() => {
    console.log("Project state PDP updated", project);
  }, [project]);

  const onEditProjectClick = () => {
    const modal = document.getElementById("edit-project-modal");
    if (!(modal && modal instanceof HTMLDialogElement)) {
      return;
    }

    // Populate the form fields with the current project data
    const editProjectForm = document.getElementById("edit-project-form") as HTMLFormElement;
    if (editProjectForm) {
      (editProjectForm.elements.namedItem("name") as HTMLInputElement).value = project.name;
      (editProjectForm.elements.namedItem("description") as HTMLTextAreaElement).value = project.description;
      (editProjectForm.elements.namedItem("status") as HTMLSelectElement).value = project.status;
      (editProjectForm.elements.namedItem("userRole") as HTMLSelectElement).value = project.userRole;
      (editProjectForm.elements.namedItem("finishDate") as HTMLInputElement).value = project.finishDate.toISOString().split('T')[0];
    }

    modal.showModal();
  };

  const onFormSubmit = (e: React.FormEvent) => {
    const editProjectForm = document.getElementById("edit-project-form")
    if (!(editProjectForm && editProjectForm instanceof HTMLFormElement)) {return}
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
      props.projectsManager.updateProject(project, projectData)
      editProjectForm.reset()
      const modal = document.getElementById("edit-project-modal")
      if (!(modal && modal instanceof HTMLDialogElement)) {return}
      modal.close()
    } catch (error) {
      alert(error)
    }
  }
  
  return (
    <div className="page" id="project-details">
      {" "}
      {/* project details for each project card */}
      <dialog id="edit-project-modal" className="modal">
        <form onSubmit={(e) => onFormSubmit(e)} id="edit-project-form">
          <h2>Edit Project</h2>
          <div className="input-list">
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">apartment</span>Name
              </label>
              <input
                name="name"
                type="text"
                id="edit-project-name"
                placeholder="What's the name of your project?"
              />
              <p
                style={{
                  color: "gray",
                  fontSize: "var(--font-sm)",
                  marginTop: 5,
                  fontStyle: "italic"
                }}
              >
                TIP: Give it a short name
              </p>
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">subject</span>Description
              </label>
              <textarea
                name="description"
                id="edit-project-description"
                cols={30}
                rows={5}
                placeholder="Give your project a nice description! So people is jealous about it."
                defaultValue={""}
              />
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">person</span>Role
              </label>
              <select name="userRole" id="edit-project-role">
                <option>Architect</option>
                <option>Engineer</option>
                <option>Developer</option>
              </select>
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-icons-round">not_listed_location</span>
                Status
              </label>
              <select name="status" id="edit-project-status">
                <option>Pending</option>
                <option>Active</option>
                <option>Finished</option>
              </select>
            </div>
            <div className="form-field-container">
              <label htmlFor="finishDate">
                <span className="material-icons-round">calendar_month</span>
                Finish Date
              </label>
              <input
                name="finishDate"
                type="date"
                id="edit-project-finish-date"
              />
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
                id="cancel-edit-project-form-button"
                style={{ backgroundColor: "transparent" }}
                onClick={() => {
                  const modal = document.getElementById("edit-project-modal");
                  if (!(modal && modal instanceof HTMLDialogElement)) {
                    return;
                  }
                  modal.close();
                }}
              >
                Cancel
              </button>
              <button type="submit" style={{ backgroundColor: "rgb(18, 145, 18)" }}>
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </dialog>
      <header>
        {/* headline container for example Hospital Center */}
        <div>
          <h2 data-project-info="name">{project.name}</h2>
          <p data-project-info="description" style={{ color: "#969696" }}>{project.description}</p>
        </div>
        <button onClick={() => {props.projectsManager.deleteProject(project.id)}} style={{backgroundColor:"red"}}>Delete Project</button>
      </header>
      <div className="main-page-content">
        {/* everything under the headline (two columns) */}
        <div style={{ display: "flex", flexDirection: "column", rowGap: 30 }}>
          {/* left information: two containers: one with project discription and one with todos */}
          <div className="dashboard-card" style={{ padding: "30px 0" }}>
            {/* first dashboard card including info about the project such as role, staus, date etc */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0px 30px",
                marginBottom: 30
              }}
            >
              <p
                style={{
                  fontSize: 20,
                  backgroundColor: project.color,
                  aspectRatio: 1,
                  borderRadius: "100%",
                  padding: 12
                }}
                data-project-info="logo"
              >
                {project.logo}
              </p>
              <button onClick={onEditProjectClick} id="edit-button" className="btn-secondary">
                <p style={{ width: "100%" }}>Edit</p>
              </button>
            </div>
            <div style={{ padding: "0 30px" }}>
              <div>
                <h5 data-project-info="name">{project.name}</h5>
                <p data-project-info="description">{project.description}</p>
              </div>
              <div
                style={{
                  display: "flex",
                  columnGap: 30,
                  padding: "30px 0px",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                    Status
                  </p>
                  <p data-project-info="status">{project.status}</p>
                </div>
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                    Cost
                  </p>
                  <p data-project-info="cost">${project.cost}</p>
                </div>
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                    Role
                  </p>
                  <p data-project-info="userRole">{project.userRole}</p>
                </div>
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                    Finish Date
                  </p>
                  <p data-project-info="finishDate"> {project.finishDate.toLocaleDateString()}</p>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#404040",
                  borderRadius: 9999,
                  overflow: "auto"
                }}
              >
                <div
                  data-project-info="progress"
                  style={{
                    width: `${project.progress}%`,
                    backgroundColor: "green",
                    padding: "4px 0",
                    textAlign: "center"
                  }}
                >
                  {project.progress}%
                </div>
              </div>
            </div>
          </div>
          <ProjectTodosList project={project} />
        </div>
        <ThreeViewer />
      </div>
    </div>
  )
}