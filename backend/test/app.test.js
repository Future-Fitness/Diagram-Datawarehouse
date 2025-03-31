const { expect } = require('chai');
const request = require('supertest');
const http = require('http');
const { app } = require('../src/index'); // Destructure the exported app
const { connectDB } = require('../src/config/database');

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

describe('POST Endpoints for Creating Types', () => {
  describe('POST /api/v1/createDiagramType', () => {
    it('should create a new diagram type', async () => {
      // Provide the payload (adjust property names as needed)
      const payload = {
        name: "Bar Chart",
        description: "This is a test diagram type",
        category: "Bar chart"
      };
      const res = await request(server)
        .post('/api/v1/createDiagramType')
        .send(payload);
      
      // Adjust the expected message according to your controller's response
      expect(res.status).to.equal(200);
      // For example, the DiagramController could return:
      // { message: "diagram created", success: true, subject: newDiagram }
      expect(res.body).to.have.property('message').that.is.a('string');
      expect(res.body).to.have.property('subject');
    });
  });

  describe('POST /api/v1/createSubjectType', () => {
    it('should create a new subject type', async () => {
      // Provide the payload (adjust property names as needed)
      const payload = {
        name: "Physics",
        description: "This is a test subject type"
      };
      const res = await request(server)
        .post('/api/v1/createSubjectType')
        .send(payload);
      
      // According to your CreateCategory controller, it should return:
      // { message: "subject created", success: true, subject }
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message').that.equals("subject created");
      expect(res.body).to.have.property('subject');
    });
  });
});
describe('GET Diagram Types', () => {
  it('should return a list of diagram types', async () => {
    const response = await request(server).get('/api/v1/diagramTypes');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    // Optionally, add more expectations if you know the structure of diagram types
  });
});

describe('GET Subject Types', () => {
  it('should return a list of subject types', async () => {
    const response = await request(server).get('/api/v1/SubjectTypes');
    expect(response.status).to.equal(200);
    expect(response.body).to.be.an('array');
    // Optionally, add more expectations if you know the structure of subject types
  });
});