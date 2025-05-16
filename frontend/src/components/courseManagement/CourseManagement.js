import React, { useState } from "react";
import "./CourseManagement.css";
import CourseNavbar from "./CourseNavbar";

export default function CourseManagement() {
  const [showCreateCourse, setCreateCourse] = useState(false);
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);

  return (
    <div className="course-container">
      <CourseNavbar />
      <div className="course-title-container">
       <div>
        <p className="course-management-p">
            {showCreateCourse && !showCreateQuiz
              ? "Create New Course"
              : !showCreateCourse && showCreateQuiz
              ? "Create New Quiz"
              : "Course Management"}
          </p>
        </div>
        <div>
         {!showCreateCourse && (
           <button
            className="course-create-btn"
            onClick={() => setShowCreateQuiz((prev) => !prev)}
          >
            {showCreateQuiz ? "❌ Cancel" : "➕ Create Quiz"}
          </button>
         )}
          {!showCreateQuiz && (
             <button
           style={{marginLeft: "10px"}}
            className="course-create-btn"
            onClick={() => setCreateCourse((prev) => !prev)}
          >
            {showCreateCourse ? "❌ Cancel" : "➕ Create New Course"}
          </button>
          )}
        </div>
      </div>
      {!showCreateCourse && !showCreateQuiz && (
        <>
          <div className="course-input-container">
            <div className="input1">
              <input
                type="text"
                placeholder="Search by course title..."
                style={{
                  borderRadius: "50px",
                  border: "2px solid #b3e5fc",
                  color: "#b3e5fc",
                }}
              />
            </div>
            <div className="input2">
              <input
                type="text"
                placeholder="Filter by balagruha"
                style={{
                  borderRadius: "50px",
                  border: "2px solid #b3e5fc",
                  color: "#b3e5fc",
                }}
              />
            </div>
            <div className="input3">
              <input
                type="text"
                placeholder="Filter by status"
                style={{
                  borderRadius: "50px",
                  border: "2px solid #b3e5fc",
                  color: "#b3e5fc",
                }}
              />
            </div>
            <div className="input-4">
              <input
                type="text"
                placeholder="Sort by: Newest"
                style={{
                  borderRadius: "50px",
                  border: "2px solid #b3e5fc",
                  color: "#b3e5fc",
                }}
              />
            </div>
          </div>
          <div className="course-card-container">
            <div className="card card1">
              <h2 className="card-title">Course Title 1</h2>
              <p className="card-p">
                A brief overview of the course content, objectives, and key
                topics covered.
              </p>
              <p className="card-point">📙 4 Modules, 12 Chapters</p>
              <p className="card-point">🧑‍🎓 45 Students</p>
              <div className="card-content1">
                <p className="card-content1-p">balagruha A</p>
                <p className="card-content1-p">balagruha B</p>
              </div>
              <div></div>
              <div className="card-btn-container">
                <button className="card-btn edit-btn">✏️ Edit</button>
                <button className="card-btn assign-btn">📝 Assign</button>
                <button className="card-btn track-btn">🗺️ Track</button>
                <button className="card-btn archive-btn">🗃️ Archive</button>
              </div>
            </div>
            <div className="card card2">
              <h2 className="card-title">Course Title 1</h2>
              <p className="card-p">
                A brief overview of the course content, objectives, and key
                topics covered.
              </p>
              <p className="card-point">📙 4 Modules, 12 Chapters</p>
              <p className="card-point">🧑‍🎓 45 Students</p>
              <div className="card-content1">
                <p className="card-content1-p">balagruha A</p>
                <p className="card-content1-p">balagruha B</p>
              </div>
              <div></div>
              <div className="card-btn-container">
                <button className="card-btn edit-btn">✏️ Edit</button>
                <button className="card-btn assign-btn">📝 Assign</button>
                <button className="card-btn track-btn">🗺️ Track</button>
                <button className="card-btn archive-btn">🗃️ Archive</button>
              </div>
            </div>
            <div className="card card3">
              <h2 className="card-title">Course Title 1</h2>
              <p className="card-p">
                A brief overview of the course content, objectives, and key
                topics covered.
              </p>
              <p className="card-point">📙 4 Modules, 12 Chapters</p>
              <p className="card-point">🧑‍🎓 45 Students</p>
              <div className="card-content1">
                <p className="card-content1-p">balagruha A</p>
                <p className="card-content1-p">balagruha B</p>
              </div>
              <div></div>
              <div className="card-btn-container">
                <button className="card-btn edit-btn">✏️ Edit</button>
                <button className="card-btn assign-btn">📝 Assign</button>
                <button className="card-btn track-btn">🗺️ Track</button>
                <button className="card-btn archive-btn">🗃️ Archive</button>
              </div>
            </div>
          </div>
          <button className="load-more-btn">Load More</button>
        </>
      )}
      {showCreateCourse && !showCreateQuiz && (
        <>
          <form className="user-form">
            <div className="course-create-course-container">
              <div className="form-group">
                <label htmlFor="title">Course Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Enter course Title"
                />
                {/* {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )} */}
              </div>
              <div className="form-group">
                <label htmlFor="description">Course Description</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Enter description"
                  style={{ height: '100px' }}
                />
                {/* {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )} */}
              </div>

              <div className="course-create-input-container-flex">
                <div className="form-group">
                  <label htmlFor="category">Course Category</label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    // value={formData.name}
                    // onChange={handleInputChange}
                    // className={errors.name ? "error" : ""}
                    placeholder="General"
                  // style={{width: "200px"}}
                  />
                  {/* {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )} */}
                </div>
                <div className="form-group">
                  <label htmlFor="duration">Estimated Duration</label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    // value={formData.name}
                    // onChange={handleInputChange}
                    // className={errors.name ? "error" : ""}
                    placeholder="2 Hours"
                  // style={{width: "200px"}}
                  />
                  {/* {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )} */}
                </div>
              </div>

              <div className="course-create-input-container-flex">
                <div className="form-group">
                  <label htmlFor="difficulty">Difficulty Level</label>
                  <input
                    type="text"
                    id="difficulty"
                    name="difficulty"
                    // value={formData.name}
                    // onChange={handleInputChange}
                    // className={errors.name ? "error" : ""}
                    placeholder="Beginner"
                  // style={{width: "200px"}}
                  />
                  {/* {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )} */}
                </div>
                <div className="form-group">
                  <label htmlFor="thumbnail">Course Thumbnail</label>
                  <input
                    type="text"
                    id="thumbnail"
                    name="thumbnail"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  // placeholder="2 Hours"
                  // style={{width: "200px"}}
                  />
                  {/* {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )} */}
                </div>
              </div>

              <div className="course-create-input-container-flex">
                <div className="form-group">
                  <label className="isfLabel" htmlFor="difficulty">Enable ISF Coin Reward</label>
                  {/* <input
                  type="text"
                  id="difficulty"
                  name="difficulty"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Beginner"
                  // style={{width: "200px"}}
                /> */}
                  {/* {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )} */}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="coins">Coins on Completion</label>
                <input
                  type="text"
                  id="coins"
                  name="coins"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="138"
                />
                {/* {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )} */}
              </div>

              <div className="form-group">
                <label htmlFor="assign">Assign Course To</label>
                <input
                  type="text"
                  id="assign"
                  name="assign"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Balagruha A"
                />
                {/* {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )} */}
              </div>

            </div>

            <div className="course-create-course-container-modules">
              <h3 className="course-module-h3">Modules & Chapters Builder</h3>

              <div className="course-module-flex">
              <div className="form-group course-module-input-change-width">
                {/* <label htmlFor="title">Course Title</label> */}
                <input
                  type="text"
                  id="moduleTitle"
                  name="moduleTitle"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Module Title"
                />
                {/* {errors.name && (
                  <span className="error-message">{errors.name}</span>
                  )} */}
              </div>
             <div>
             <button className="add-chapter">Add Chapter</button>
             </div>
              </div>
              <div className="form-group">
                {/* <label htmlFor="title">Course Title</label> */}
                <input
                  type="text"
                  id="chapterTitle"
                  name="chapterTitle"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Chapter Title"
                />
                {/* {errors.name && (
                  <span className="error-message">{errors.name}</span>
                  )} */}
              </div>

              <div className="course-create-input-container-flex">
                <div className="form-group">
                  {/* <label htmlFor="difficulty">Difficulty Level</label> */}
                  <input
                    type="text"
                    id="video"
                    name="video"
                    // value={formData.name}
                    // onChange={handleInputChange}
                    // className={errors.name ? "error" : ""}
                    placeholder="Video"
                  // style={{width: "200px"}}
                  />
                  {/* {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )} */}
                </div>
                <div className="form-group">
                  {/* <label htmlFor="thumbnail">Course Thumbnail</label> */}
                  <input
                    type="text"
                    id="uploadLink"
                    name="uploadLink"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Upload/Link"
                  // style={{width: "200px"}}
                  />
                  {/* {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )} */}
                </div>
              </div>
              <div>
                <button className="option-btn">Add Multiple Form</button>
                <button className="option-btn" style={{marginLeft: "10px"}}>Add Quiz</button>
              </div>
              <div className="switch-input-container">
                <label class="switch">
                <input type="checkbox"/>
                <span class="slider round"></span>
              </label>
              <p>Unlock</p>
              </div>
            </div>

            <div className="course-create-course-container-modules">
              <h3 className="course-module-h3">Modules & Chapters Builder</h3>

              <div className="course-module-flex">
              <div className="form-group course-module-input-change-width">
                {/* <label htmlFor="title">Course Title</label> */}
                <input
                  type="text"
                  id="moduleTitle"
                  name="moduleTitle"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Module Title"
                />
                {/* {errors.name && (
                  <span className="error-message">{errors.name}</span>
                  )} */}
              </div>
             {/* <div>
             <button className="add-chapter">Add Chapter</button>
             </div> */}
              </div>
              <div className="form-group">
                {/* <label htmlFor="title">Course Title</label> */}
                <input
                  type="text"
                  id="chapterTitle"
                  name="chapterTitle"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Chapter Title"
                />
                {/* {errors.name && (
                  <span className="error-message">{errors.name}</span>
                  )} */}
              </div>

              <div className="course-create-input-container-flex">
                <div className="form-group">
                  {/* <label htmlFor="difficulty">Difficulty Level</label> */}
                  <input
                    type="text"
                    id="video"
                    name="video"
                    // value={formData.name}
                    // onChange={handleInputChange}
                    // className={errors.name ? "error" : ""}
                    placeholder="Video"
                  // style={{width: "200px"}}
                  />
                  {/* {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )} */}
                </div>
                <div className="form-group">
                  {/* <label htmlFor="thumbnail">Course Thumbnail</label> */}
                  <input
                    type="text"
                    id="uploadLink"
                    name="uploadLink"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Upload/Link"
                  // style={{width: "200px"}}
                  />
                  {/* {errors.name && (
                  <span className="error-message">{errors.name}</span>
                )} */}
                </div>
              </div>
              <div>
                <button className="option-btn">Add Multiple Form</button>
                <button className="option-btn" style={{marginLeft: "10px"}}>Add Quiz</button>
              </div>
              <div className="switch-input-container">
                <label class="switch">
                <input type="checkbox"/>
                <span class="slider round"></span>
              </label>
              <p>Unlock</p>
              </div>
            </div>
            <div className="course-create-btn-container">
              <button className="save-btn-course btn-course">Save as draft</button>
              <button className="publish-btn btn-course">Publish Course</button>
              <button className="cancel-btn btn-course">Cancel</button>
            </div>
          </form>
        </>
      )}

      {showCreateQuiz && !showCreateCourse && (
        <>
        <form className="user-form">
            <div className="course-create-course-container">
              <div className="form-group">
                <label htmlFor="title">Quiz Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Enter quiz Title"
                />
              </div>
              <div className="form-group">
                <label htmlFor="title">Assigned To</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Chapter 1: Indroduction to AI"
                />
              </div>
              <h3 className="course-module-h3">Question 1</h3>
              <div className="form-group" style={{width: "30%"}}>
                <select name="" id="">
                  <option value="">Question Type</option>
                </select>
              </div>
               <div className="form-group">
                <input
                  type="text"
                  id="title"
                  name="title"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Write question here"
                />
              </div>
              <h3 className="course-module-h3">Answers option</h3>
                <div className="form-group">
                <input
                  type="text"
                  id="title"
                  name="title"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Option 1"
                />
              </div>
                <div className="form-group">
                <input
                  type="text"
                  id="title"
                  name="title"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Option 2"
                />
              </div>
              <button className="option-btn">Add Option</button>
              <h3 className="course-module-h3">Correct Answer</h3>
               <div className="form-group">
                <input
                  type="text"
                  id="title"
                  name="title"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Option 1"
                />
              </div>
               <h3 className="course-module-h3">Explanation</h3>
               <div className="form-group">
                <input
                  type="text"
                  id="title"
                  name="title"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Enter explanation"
                />
              </div>
              <div className="quiz-dltbtn-container">
                <button className="publish-btn btn-course">Delete question</button>
              </div>
              <button className="option-btn">Add Question</button>
               <h3 className="course-module-h3">Question 2</h3>
              <div className="form-group" style={{width: "30%"}}>
                <select name="" id="">
                  <option value="">Short Answer</option>
                </select>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  id="title"
                  name="title"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Write question here"
                />
              </div>
              <h3 className="course-module-h3">Correct Answer</h3>
               <div className="form-group">
                <input
                  type="text"
                  id="title"
                  name="title"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Option 1"
                />
              </div>
              <div className="quiz-dltbtn-container">
                <button className="publish-btn btn-course">Delete question</button>
              </div>
              <button className="option-btn">Add Question</button>
              <h3 className="course-module-h3">Question 3</h3>
              <div className="form-group" style={{width: "30%"}}>
                <select name="" id="">
                  <option value="">Long answer</option>
                </select>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  id="title"
                  name="title"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Write question here"
                />
              </div>
              <h3 className="course-module-h3">Correct Answer</h3>
               <div className="form-group">
                <input
                  type="text"
                  id="title"
                  name="title"
                  // value={formData.name}
                  // onChange={handleInputChange}
                  // className={errors.name ? "error" : ""}
                  placeholder="Option 1"
                />
              </div>
              <div className="quiz-dltbtn-container">
                <button className="publish-btn btn-course">Delete question</button>
              </div>
              <button className="option-btn">Add Question</button>
               <div className="switch-input-container">
                <label class="switch">
                <input type="checkbox"/>
                <span class="slider round"></span>
              </label>
              <p>Allow retry</p>
               </div>
               <div className="switch-input-container">
                <label class="switch">
                <input type="checkbox"/>
                <span class="slider round"></span>
              </label>
              <p>Shuffle Questions</p>
               </div>
               <div className="switch-input-container">
                <label class="switch">
                <input type="checkbox"/>
                <span class="slider round"></span>
              </label>
              <p>Minimum score to pass</p>
               </div>
            </div>
             <div className="course-create-btn-container">
              <button className="save-btn-course btn-course">Save quiz</button>
              <button className="cancel-btn btn-course">Cancel</button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
