import * as React from 'react';
import { Project } from '../classes/Project';
import * as Router from 'react-router-dom';

interface Props {
  project: Project
}

export function ProjectCard(props: Props) {
  return(
    
    <div className="project-card">
      <div className="card-header">
        <p
          style={{
            backgroundColor: props.project.color,
            padding: 10,
            borderRadius: 8,
            aspectRatio: 1
          }}
          data-project-info="logo"
        >
          { props.project.logo }
        </p>
        <div>
          <h5 data-project-info="name">{ props.project.name }</h5>
          <p data-project-info="description">{ props.project.description }</p>
        </div>
      </div>
      <div className="card-content">
        <div className="card-property">
          <p style={{ color: "#969696" }}>Status</p>
          <p data-project-info="status">{ props.project.status }</p>
        </div>
        <div className="card-property">
          <p style={{ color: "#969696" }}>Role</p>
          <p data-project-info="userRole">{ props.project.userRole }</p>
        </div>
        <div className="card-property">
          <p style={{ color: "#969696" }}>Cost</p>
          <p data-project-info="cost">${ props.project.cost }</p>
        </div>
        <div className="card-property">
          <p style={{ color: "#969696" }}>Estimated Progress</p>
          <p data-project-info="progress">{ props.project.progress *100 }%</p>
        </div>
      </div>
    </div>

  )
}