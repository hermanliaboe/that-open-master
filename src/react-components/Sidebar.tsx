import * as React from 'react';
import * as Router from 'react-router-dom';

export function Sidebar() {
  return(
    <aside id="sidebar">
      <img style={{ backgroundColor: 'rgb(108, 110, 112)', borderRadius: '1cap' }} id="company-logo" src="./assets/sweco-logo.svg" alt="Construction Company" />
      <ul id="nav-buttons">
        <Router.Link to="/">
          <li id="sidebar-projects-btn"><span className="material-icons-round">apartment</span>Projects</li>
        </Router.Link>
        <Router.Link to="/project">
        <li id="sidebar-users-btn"><span className="material-icons-round">people</span>Users</li>
        </Router.Link>
      </ul>
    </aside>
  )
}