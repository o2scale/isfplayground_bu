import React from 'react'
import './CourseManagement.css';
import CourseNavbar from './CourseNavbar';

export default function CourseManagement() {
  return (
    <div className='course-container'>
      <CourseNavbar />
        <div className='course-title-container'>
          <div>
              <p className='course-management-p'>Course Management</p>
          </div>
          <div>
              <button className='course-create-btn'>➕ Create New Course</button>
          </div>
        </div>
        <div className='course-input-container'>
            <div className='input1'>
              <input type="text" placeholder='Search by course title...' style={{borderRadius: "50px", border: "2px solid #b3e5fc", color: "#b3e5fc"}} />
            </div>
            <div className='input2'>
              <input type="text" placeholder='Filter by balagruha' style={{borderRadius: "50px", border: "2px solid #b3e5fc", color: "#b3e5fc"}} />
            </div>
            <div className="input3">
              <input type="text" placeholder='Filter by status' style={{borderRadius: "50px", border: "2px solid #b3e5fc", color: "#b3e5fc"}} />
            </div>
            <div className="input-4">
              <input type="text" placeholder='Sort by: Newest' style={{borderRadius: "50px", border: "2px solid #b3e5fc", color: "#b3e5fc"}} />
            </div>
        </div>
        <div className='course-card-container'>
          <div className="card card1">
            <h2 className='card-title'>Course Title 1</h2>
            <p className='card-p'>A brief overview of the course content, objectives, and key topics covered.</p>
            <p className='card-point'>📙 4 Modules, 12 Chapters</p>
            <p className='card-point'>🧑‍🎓 45 Students</p>
            <div className='card-content1'>
              <p className='card-content1-p'>balagruha A</p>
              <p className='card-content1-p'>balagruha B</p>
            </div>
            <div>

            </div>
            <div className='card-btn-container'>
              <button className='card-btn edit-btn'>✏️ Edit</button>
              <button className='card-btn assign-btn'>📝 Assign</button>
              <button className='card-btn track-btn'>🗺️ Track</button>
              <button className='card-btn archive-btn'>🗃️ Archive</button>
            </div>
          </div>
          <div className="card card2">
            <h2 className='card-title'>Course Title 1</h2>
            <p className='card-p'>A brief overview of the course content, objectives, and key topics covered.</p>
            <p className='card-point'>📙 4 Modules, 12 Chapters</p>
            <p className='card-point'>🧑‍🎓 45 Students</p>
            <div className='card-content1'>
              <p className='card-content1-p'>balagruha A</p>
              <p className='card-content1-p'>balagruha B</p>
            </div>
            <div>

            </div>
            <div className='card-btn-container'>
              <button className='card-btn edit-btn'>✏️ Edit</button>
              <button className='card-btn assign-btn'>📝 Assign</button>
              <button className='card-btn track-btn'>🗺️ Track</button>
              <button className='card-btn archive-btn'>🗃️ Archive</button>
            </div>
          </div>
          <div className="card card3">
            <h2 className='card-title'>Course Title 1</h2>
            <p className='card-p'>A brief overview of the course content, objectives, and key topics covered.</p>
            <p className='card-point'>📙 4 Modules, 12 Chapters</p>
            <p className='card-point'>🧑‍🎓 45 Students</p>
            <div className='card-content1'>
              <p className='card-content1-p'>balagruha A</p>
              <p className='card-content1-p'>balagruha B</p>
            </div>
            <div>

            </div>
            <div className='card-btn-container'>
              <button className='card-btn edit-btn'>✏️ Edit</button>
              <button className='card-btn assign-btn'>📝 Assign</button>
              <button className='card-btn track-btn'>🗺️ Track</button>
              <button className='card-btn archive-btn'>🗃️ Archive</button>
            </div>
          </div>
        </div>
        <button className='load-more-btn'>Load More</button>
    </div>
  )
}
