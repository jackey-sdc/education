import React from 'react'
import './SubjectCard.css'

const SubjectCard = ({ icon, title, description, onClick }) => {
  return (
    <div className="card subject-card" onClick={onClick}>
      <div className="subject-icon">
        {icon}
      </div>
      <h3 className="subject-title">{title}</h3>
      <p className="subject-description">{description}</p>
      <button className="gradient-btn" onClick={onClick}>
        开始学习
      </button>
    </div>
  )
}

export default SubjectCard
