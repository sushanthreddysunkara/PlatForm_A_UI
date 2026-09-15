import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import DashboardDetail from './components/DashboardDetail'
import DashboardHub from './components/DashboardHub'
import DocumentIntelligence from './components/DocumentIntelligence'
import ProjectComingSoon from './components/ProjectComingSoon'
import ProjectConnectionRequired from './components/ProjectConnectionRequired'
import OntologyPage from './components/ontology/OntologyPage'

import PlaceholderPage from './components/PlaceholderPage'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'

import { normalizeTrafficData, parseTrafficCsv, projectDatasets, sampleTrafficData } from './data/dashboardData'
import { routePaths } from './data/navigation'
import { projects } from './data/projects'

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [connectedProject, setConnectedProject] = useState(projects[0])
  const [trafficData, setTrafficData] = useState(projectDatasets[projects[0].key] || sampleTrafficData)
  const [fileName, setFileName] = useState('Sample traffic data')
  const [importError, setImportError] = useState('')

  function handleProjectConnect(project) {
    if (project.comingSoon && !project.created) return
    setConnectedProject(project)
    setTrafficData(projectDatasets[project.key] || [])
    setFileName(`${project.name} sample data`)
    setImportError('')
  }

  function handleProjectDisconnect() {
    setTrafficData([])
    setFileName('No project connected')
    setImportError('')
  }

  async function handleImport(event) {
    const [file] = event.target.files || []
    if (!file) return

    try {
      const importedRows = await parseTrafficCsv(file)
      setTrafficData(normalizeTrafficData(importedRows))
      setFileName(file.name)
      setImportError('')
    } catch (error) {
      setImportError(error.message || 'Unable to import this CSV file.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className="app-shell">

      <Sidebar
        connectedProject={connectedProject}
        onProjectConnect={handleProjectConnect}
        onProjectDisconnect={handleProjectDisconnect}
      />

      <main className="main-content">

        <Topbar
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
        />

        <section className="content-wrap">

          <Routes>

            <Route
              path="/"
              element={<Navigate to="/home" replace />}
            />

            <Route
              path="/ontology"
              element={<OntologyPage />}
            />

            <Route
              path="/dashboards"
              element={
                !connectedProject ? (
                  <ProjectConnectionRequired />
                ) : connectedProject.comingSoon ? (
                  <ProjectComingSoon projectName={connectedProject.name} />
                ) : (
                  <DashboardHub
                    fileName={fileName}
                    importError={importError}
                    onImport={handleImport}
                    projectName={connectedProject.name}
                    rows={trafficData}
                  />
                )
              }
            />

            <Route
              path="/dashboards/:kind"
              element={
                !connectedProject ? (
                  <ProjectConnectionRequired />
                ) : connectedProject.comingSoon ? (
                  <ProjectComingSoon projectName={connectedProject.name} />
                ) : (
                  <DashboardDetail
                    fileName={fileName}
                    importError={importError}
                    onImport={handleImport}
                    projectName={connectedProject.name}
                    rows={trafficData}
                  />
                )
              }
            />

            <Route
              path="/document-intelligence"
              element={
                !connectedProject ? (
                  <ProjectConnectionRequired />
                ) : connectedProject.comingSoon ? (
                  <ProjectComingSoon projectName={connectedProject.name} />
                ) : (
                  <DocumentIntelligence
                    fileName={fileName}
                    projectName={connectedProject.name}
                    rows={trafficData}
                  />
                )
              }
            />

            {/* OTHER PLATFORM PAGES */}

            {routePaths
              .filter((path) => path !== '/dashboards' && path !== '/ontology' && path !== '/document-intelligence')
              .map((path) => (
                <Route
                  element={<PlaceholderPage />}
                  key={path}
                  path={path}
                />
              ))}

            <Route
              path="*"
              element={<Navigate to="/home" replace />}
            />

          </Routes>

        </section>

      </main>

    </div>
  )
}