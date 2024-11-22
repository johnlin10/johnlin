import List from './ui/List/List'
import ContentBlock from './ui/ContentBlock/ContentBlock'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import style from './Project.module.scss'
import { useParams } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import { db } from '../../firebase'
import { collection, getDocs, onSnapshot } from 'firebase/firestore'
import useAuth from '../../hooks/useAuth'

function Project() {
  const { t } = useTranslation()
  const { projectId } = useParams()
  const { isAdmin } = useAuth()
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)

  // fetch projects from firestore
  useEffect(() => {
    const fetchProjects = async () => {
      const projectsCollection = collection(db, 'projects')
      const projectSnapshot = await getDocs(projectsCollection)
      const projectList = projectSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setProjects(projectList)
    }
    fetchProjects()

    // set projects realtime listener
    const projectsCollection = collection(db, 'projects')
    const unsubscribe = onSnapshot(projectsCollection, (snapshot) => {
      const updatedProjects = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setProjects(updatedProjects)
    })
    return () => unsubscribe()
  }, [])

  // if have projectId, set currentProject
  useEffect(() => {
    const project = projects.find((p) => p.id === projectId)
    setCurrentProject(project)
  }, [projectId, projects])

  //* render content
  const renderContent = () => {
    //
    if (!projectId) {
      return (
        <div>
          <List
            isAdmin={isAdmin}
            projects={projects}
            setProjects={setProjects}
          />
        </div>
      )
    }
    if (!currentProject) {
      return (
        <div
          className={style.notFoundProject}
          initial={{ opacity: 0, y: '10%' }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FontAwesomeIcon icon={faCircleExclamation} />
          <h1>{t('project.projectNotFound')}</h1>
        </div>
      )
    }

    return (
      <ContentBlock projectId={projectId} currentProject={currentProject} />
    )
  }

  return <>{renderContent()}</>
}

export default Project
