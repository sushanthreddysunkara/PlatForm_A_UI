import { Check, ChevronDown, Eye, FolderKanban, HelpCircle, Plug, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { navigation } from '../data/navigation'
import { projects } from '../data/projects'

const storedProjectsKey = 'vision-iq-created-projects'

export default function Sidebar({ connectedProject, onProjectConnect, onProjectDisconnect }) {
  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <div className="brand-mark" aria-hidden="true">
          <Eye size={25} strokeWidth={2.1} />
        </div>
        <div>
          <p className="brand-name">VisionIQ</p>
          <p className="brand-caption">See Smarter<br />Safer Tomorrow</p>
        </div>
      </div>

      <ProjectsSection connectedProject={connectedProject} onProjectConnect={onProjectConnect} onProjectDisconnect={onProjectDisconnect} />

      <nav className="main-nav" aria-label="Primary navigation">
        <p className="nav-eyebrow">Workspace</p>
        {navigation.map(({ label, path, icon: Icon }) => (
          <NavLink
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            key={path}
            to={path}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="utility-item" type="button">
          <HelpCircle size={17} />
          Help center
        </button>
        <div className="user-card">
          <div className="user-avatar">AM</div>
          <div className="user-copy">
            <strong>Alex Morgan</strong>
            <span>VisionIQ operator</span>
          <div className="user-avatar">U</div>
          <div className="user-copy">
            <strong>User</strong>
            <span>VisionIQ User</span>
          </div>
          <ChevronDown size={15} />
        </div>
      </div>
    </aside>
  )
}

function ProjectsSection({ connectedProject, onProjectConnect, onProjectDisconnect }) {
  const [projectList, setProjectList] = useState(() => {
    try {
      const storedProjects = JSON.parse(localStorage.getItem(storedProjectsKey) || '[]')
      return [...projects, ...storedProjects.filter((project) => project.created)]
    } catch {
      return projects
    }
  })
  const [selectedProject, setSelectedProject] = useState(projects[0])
  const [expanded, setExpanded] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')

  useEffect(() => {
    localStorage.setItem(
      storedProjectsKey,
      JSON.stringify(projectList.filter((project) => project.created)),
    )
  }, [projectList])

  function selectProject(project) {
    setSelectedProject(project)
  }

  function createProject(event) {
    event.preventDefault()
    const name = newProjectName.trim()
    if (!name) return

    const project = {
      name,
      caption: 'New project',
      status: 'Coming soon',
      modules: 'No modules yet',
      dashboards: 'No dashboards yet',
      data: 'Not connected',
      key: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
      comingSoon: true,
      created: true,
    }
    setProjectList((currentProjects) => [...currentProjects, project])
    setSelectedProject(project)
    setNewProjectName('')
    setShowCreate(false)
  }

  function deleteProject() {
    if (!selectedProject.comingSoon) return
    const confirmed = window.confirm(`Delete ${selectedProject.name}?`)
    if (!confirmed) return

    setProjectList((currentProjects) => currentProjects.filter((project) => project.key !== selectedProject.key))
    setSelectedProject(projectList[0])
  }

  const connected = connectedProject?.key === selectedProject.key

  return (
    <section className="projects-section" aria-labelledby="projects-heading">
      <button
        aria-controls="projects-content"
        aria-expanded={expanded}
        className="projects-heading-row"
        onClick={() => setExpanded((value) => !value)}
        type="button"
      >
        <p className="nav-eyebrow" id="projects-heading">Projects</p>
        <span className="projects-heading-actions">
          <span className="projects-count">{projectList.length}</span>
          <ChevronDown className={`projects-chevron ${expanded ? 'expanded' : ''}`} size={15} />
        </span>
      </button>
      <div className={`projects-content ${expanded ? 'expanded' : ''}`} id="projects-content">
        <div className="projects-list">
          {projectList.map((project) => (
            <button
              aria-pressed={selectedProject.name === project.name}
              className={`project-item ${selectedProject.name === project.name ? 'active' : ''}`}
              key={project.name}
              onClick={() => selectProject(project)}
              type="button"
            >
              <span className="project-icon"><FolderKanban size={16} strokeWidth={1.8} /></span>
              <span className="project-copy">
                <strong>{project.name}</strong>
                <small>{project.caption}</small>
              </span>
              {selectedProject.name === project.name && <Check className="project-check" size={14} />}
            </button>
          ))}
        </div>
        {showCreate ? (
          <form className="create-project-form" onSubmit={createProject}>
            <input autoFocus onChange={(event) => setNewProjectName(event.target.value)} placeholder="Project name" value={newProjectName} />
            <div className="create-project-actions">
              <button type="submit">Create</button>
              <button onClick={() => setShowCreate(false)} type="button">Cancel</button>
            </div>
          </form>
        ) : (
          <button className="create-project-button" onClick={() => setShowCreate(true)} type="button">
            <Plus size={14} />
            Create project
          </button>
        )}
        <div className="selected-project-panel">
          <div className="selected-project-header">
            <div>
              <span>Selected project</span>
              <strong>{selectedProject.name}</strong>
            </div>
            <span className={`project-state ${connected ? 'connected' : ''}`}>{selectedProject.comingSoon ? 'Coming soon' : connected ? 'Connected' : selectedProject.status}</span>
          </div>
          {selectedProject.comingSoon && !selectedProject.created ? (
            <>
              <p className="project-coming-soon">This project will be available in a future phase.</p>
              <button className="project-delete-button" onClick={deleteProject} type="button">
                <Trash2 size={13} />
                Delete project
              </button>
            </>
          ) : (
            <>
              <div className="project-build-summary">
                <span>{selectedProject.modules}</span>
                <span>{selectedProject.dashboards}</span>
                <span>{selectedProject.data}</span>
              </div>
              <button className={`project-connect-button ${connected ? 'connected' : ''}`} onClick={() => connected ? onProjectDisconnect() : onProjectConnect(selectedProject)} type="button">
                {connected ? <Check size={14} /> : <Plug size={14} />}
                {connected ? 'Disconnect project' : 'Connect project'}
              </button>
              {selectedProject.created && (
                <button className="project-delete-button" onClick={deleteProject} type="button">
                  <Trash2 size={13} />
                  Delete project
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
