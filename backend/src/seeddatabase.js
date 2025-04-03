// const mongoose = require("mongoose");
// const DiagramType = require("./models/DiagramType");
// const Subject = require("./models/SubjectSchema");

// // Connect to MongoDB
// const connectDB = async () => {
//   try {
//     await mongoose.connect("mongodb+srv://indianshahishere:Ae6QfKZUJo27fH7I@cluster0.2kwig.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/test", {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("Database connected successfully");
//   } catch (error) {
//     console.error("Database connection failed:", error);
//     process.exit(1);
//   }
// };

// // Data to seed
// const data = [
//   {
//     subject: "Mathematics",
//     diagrams: [
//       { name: "Bar Graph", category: "Mathematics", description: "A graph that uses bars to represent data." },
//       { name: "Line Graph", category: "Mathematics", description: "A graph that uses lines to connect data points." },
//       { name: "Pie Chart", category: "Mathematics", description: "A circular chart divided into sectors." },
//       { name: "Histogram", category: "Mathematics", description: "A graph showing frequency distribution." },
//       { name: "Venn Diagram", category: "Mathematics", description: "A diagram showing logical relationships." },
//       { name: "Number Line", category: "Mathematics", description: "A line representing numbers in order." },
//       { name: "Coordinate Plane", category: "Mathematics", description: "A plane with x and y axes for graphing." },
//       { name: "Tree Diagram", category: "Mathematics", description: "A diagram for probability and decision-making." },
//       { name: "Set Diagram", category: "Mathematics", description: "A diagram representing sets and their relationships." },
//       { name: "Flowchart", category: "Mathematics", description: "A diagram for problem-solving steps." },
//     ],
//   },
//   {
//     subject: "Computer Science",
//     diagrams: [
//       { name: "Flowchart", category: "Computer Science", description: "A diagram representing a process or algorithm." },
//       { name: "UML Class Diagram", category: "Computer Science", description: "A diagram showing class relationships." },
//       { name: "ER Diagram", category: "Computer Science", description: "A diagram showing entity relationships." },
//       { name: "Data Flow Diagram", category: "Computer Science", description: "A diagram showing data flow in a system." },
//       { name: "Network Topology Diagram", category: "Computer Science", description: "A diagram showing network structure." },
//       { name: "Gantt Chart", category: "Computer Science", description: "A chart for project timelines." },
//       { name: "Logic Gates Diagram", category: "Computer Science", description: "A diagram showing logic gates." },
//       { name: "Architecture Diagram", category: "Computer Science", description: "A diagram showing system architecture." },
//     ],
//   },
//   {
//     subject: "Physics",
//     diagrams: [
//       { name: "Free Body Diagram", category: "Physics", description: "A diagram showing forces acting on an object." },
//       { name: "Ray Diagram", category: "Physics", description: "A diagram showing light rays in optics." },
//       { name: "Circuit Diagram", category: "Physics", description: "A diagram representing an electrical circuit." },
//       { name: "Motion Graphs", category: "Physics", description: "Graphs showing motion (e.g., velocity-time)." },
//       { name: "Electric Field Diagram", category: "Physics", description: "A diagram showing electric field lines." },
//       { name: "Wave Diagram", category: "Physics", description: "A diagram showing transverse or longitudinal waves." },
//       { name: "Vector Diagram", category: "Physics", description: "A diagram showing vector quantities." },
//       { name: "Energy Level Diagram", category: "Physics", description: "A diagram showing atomic energy levels." },
//     ],
//   },
//   {
//     subject: "Chemistry",
//     diagrams: [
//       { name: "Molecular Structure Diagram", category: "Chemistry", description: "A diagram showing molecular structures." },
//       { name: "Bohr’s Atomic Model", category: "Chemistry", description: "A diagram of Bohr's atomic structure." },
//       { name: "Periodic Table Diagram", category: "Chemistry", description: "A diagram of the periodic table." },
//       { name: "Chemical Reaction Flowchart", category: "Chemistry", description: "A flowchart showing chemical reactions." },
//       { name: "Energy Profile Diagram", category: "Chemistry", description: "A diagram showing energy changes in reactions." },
//       { name: "Electron Dot Structure", category: "Chemistry", description: "A diagram showing valence electrons." },
//       { name: "Laboratory Setup Diagram", category: "Chemistry", description: "A diagram showing lab equipment setup." },
//       { name: "Titration Curve", category: "Chemistry", description: "A graph showing titration results." },
//       { name: "Orbital Diagram", category: "Chemistry", description: "A diagram showing electron orbitals." },
//       { name: "Phase Diagram", category: "Chemistry", description: "A diagram showing states of matter." },
//     ],
//   },
// ];

// // Seed function
// const seedDatabase = async () => {
//   try {
//     // Clear existing data
//     await Subject.deleteMany({});
//     await DiagramType.deleteMany({});

//     for (const entry of data) {
//       // Create DiagramType entries or reuse existing ones
//       const diagramIds = [];
//       for (const diagram of entry.diagrams) {
//         let existingDiagram = await DiagramType.findOne({ name: diagram.name });
//         if (!existingDiagram) {
//           existingDiagram = await DiagramType.create(diagram);
//         }
//         diagramIds.push(existingDiagram._id);
//       }

//       // Create Subject entry
//       await Subject.create({
//         name: entry.subject,
//         description: `${entry.subject} related diagrams.`,
//         diagrams: diagramIds, // Associate diagrams with the subject
//       });
//     }

//     console.log("Database seeded successfully");
//     process.exit(0);
//   } catch (error) {
//     console.error("Error seeding database:", error);
//     process.exit(1);
//   }
// };

// // Run the script
// const run = async () => {
//   await connectDB();
//   await seedDatabase();
// };

// run();

const DiagramType = require("./models/DiagramType");

const assignDefaultCategory = async () => {
  const defaultCategory = "Uncategorized"; // Replace with your desired default category
  await DiagramType.updateMany(
    { category: null },
    { $set: { category: defaultCategory } }
  );
  console.log("Assigned default category to diagrams with null category");
};

assignDefaultCategory();