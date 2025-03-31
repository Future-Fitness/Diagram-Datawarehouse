const { expect } = require('chai');
const request = require('supertest');
const http = require('http');
const { app } = require('../src/index'); // Destructure the exported app
const { connectDB } = require('../src/config/database');
const path = require('path');
const Diagram = require('../src/models/Diagram');
let server;
before(async function() {
  // Increase timeout for DB connection
  this.timeout(10000);
  // Establish a database connection
  try {
    await connectDB();
  } catch(err) {
    console.error('DB connection error in tests:', err);
  }
  // Start the server once the DB connection is ready
  server = http.createServer(app).listen();
});
after(done => {
  server.close(done);
});

// describe('POST Endpoints for Creating Types', () => {
//   describe('POST /api/v1/createDiagramType', () => {
//     it('should create a new diagram type', async () => {
//       // Provide the payload (adjust property names as needed)
//       const payload = {
//         name: "Line Chart",
//         description: "This is a test diagram type",
//         category: "Line chart"
//       };
//       const res = await request(server)
//         .post('/api/v1/createDiagramType')
//         .send(payload);
      
//       // Adjust the expected message according to your controller's response
//       expect(res.status).to.equal(200);
//       // For example, the DiagramController could return:
//       // { message: "diagram created", success: true, subject: newDiagram }
//       expect(res.body).to.have.property('message').that.is.a('string');
//       expect(res.body).to.have.property('subject');
//     });
//   });

//   describe('POST /api/v1/createSubjectType', () => {
//     it('should create a new subject type', async () => {
//       // Provide the payload (adjust property names as needed)
//       const payload = {
//         name: "Computer science",
//         description: "This is a test subject type"
//       };
//       const res = await request(server)
//         .post('/api/v1/createSubjectType')
//         .send(payload);
      
//       // According to your CreateCategory controller, it should return:
//       // { message: "subject created", success: true, subject }
//       expect(res.status).to.equal(200);
//       expect(res.body).to.have.property('message').that.equals("subject created");
//       expect(res.body).to.have.property('subject');
//     });
//   });
// });
// describe('GET Endpoints', () => {
//   describe('GET /api/v1/diagramTypes', () => {
//     it('should return a list of diagram types with verbose output', async () => {
//       console.log("TEST: Requesting GET /api/v1/diagramTypes");
//       const response = await request(server).get('/api/v1/diagramTypes');
//       console.log("TEST: Response from GET /api/v1/diagramTypes:", response.body);
//       expect(response.status, "Expected status code 200 for diagram types").to.equal(200);
//       expect(response.body, "Response should contain a property 'diagramTypes' that is an array").to.have.property('diagramTypes').that.is.an('array');
//       console.log("TEST: Number of diagram types received:", response.body.diagramTypes.length);
//     });
//   });

//   describe('GET /api/v1/SubjectTypes', () => {
//     it('should return a list of subject types with verbose output', async () => {
//       console.log("TEST: Requesting GET /api/v1/SubjectTypes");
//       const response = await request(server).get('/api/v1/SubjectTypes');
//       console.log("TEST: Response from GET /api/v1/SubjectTypes:", response.body);
//       expect(response.status, "Expected status code 200 for subject types").to.equal(200);
//       expect(response.body, "Response should contain a property 'subjectTypes' that is an array").to.have.property('subjectTypes').that.is.an('array');
//       console.log("TEST: Number of subject types received:", response.body.subjectTypes.length);
//     });
//   });
// });


describe('Image Upload and Analysis', () => {
  it('should upload, analyze, and store an image successfully', async () => {
    const imagePath = path.join(__dirname, '../fixtures/sample-diagram.PNG');
    const response = await request(server) // use server instead of app
      .post('/api/v1/analyze')
      .attach('image', imagePath)
      .field('title', 'Test Diagram')
      .field('subjectId', '67ea105cac1ced78c3c5c358')
      .field('diagramTypeId', '67ea0ec5912093254aa675d0')
      .field('sourceType', 'Book')
      .field('category', 'Physics');
    
   // Use Chai's .to.equal() and .to.be defined assertions
   expect(response.status).to.equal(200);
   expect(response.body.data).to.exist;
   expect(response.body.data.imageUrl).to.exist;
    
    // Verify database entry
    const diagram = await Diagram.findOne({ title: 'Test Diagram' });
    // expect(diagram).not.toBeNull();
  });
});