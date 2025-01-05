import { Day, PrismaClient, UserSex } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";
import { role } from "@/lib/data";
const prisma = new PrismaClient();

async function main() {
  // ADMIN
  const client = clerkClient();
  console.log("Moddaaa");

  const user1 = await client.users.createUser({
    emailAddress: ['admin1@gmail.com'],
    password: 'trunki@123',
    username: 'admin1',
    publicMetadata: {
      role: "admin"
    },
  });
  const user2 = await client.users.createUser({
    emailAddress: ['admin2@gmail.com'],
    password: 'trunki@123',
    username: 'admin2',
    publicMetadata: {
      role: "admin"
    },
  });
  await prisma.admin.create({
    data: {
      id: user1.id,
      username: "admin1",
    },
  });
  await prisma.admin.create({
    data: {
      id: user2.id,
      username: "admin2",
    },
  });

  // GRADE
  for (let i = 1; i <= 6; i++) {
    await prisma.grade.create({
      data: {
        level: i,
      },
    });
  }

  // CLASS
  for (let i = 1; i <= 6; i++) {
    await prisma.class.create({
      data: {
        name: `${i}A`, 
        gradeId: i, 
        capacity: Math.floor(Math.random() * (20 - 15 + 1)) + 15,
      },
    });
  }

  // SUBJECT
  const subjectData = [
    { name: "Mathematics" },
    { name: "Science" },
    { name: "English" },
    { name: "History" },
    { name: "Geography" },
    { name: "Physics" },
    { name: "Chemistry" },
    { name: "Biology" },
    { name: "Computer Science" },
    { name: "Art" },
  ];

  for (const subject of subjectData) {
    await prisma.subject.create({ data: subject });
  }

  // TEACHER
  let teacherId = [];
  for (let i = 1; i <= 15; i++) {
    const client = clerkClient();
    const user = await client.users.createUser({
      emailAddress: [`teacher${i}@gmail.com`],
      password: 'trunki@123',
      username: `teacher${i}`,
      publicMetadata: {
        role: "teacher"
      },
    });
    await prisma.teacher.create({
      data: {
        id: user.id, // Unique ID for the teacher
        username: `teacher${i}`,
        name: `TName${i}`,
        surname: `TSurname${i}`,
        email: `teacher${i}@gmail.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
        bloodType: "A+",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        subjects: { connect: [{ id: (i % 10) + 1 }] }, 
        classes: { connect: [{ id: (i % 6) + 1 }] }, 
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
      },
    });
    teacherId.push(user.id);
  }

  // LESSON
  for (let i = 1; i <= 30; i++) {
    await prisma.lesson.create({
      data: {
        name: `Lesson${i}`, 
        day: Day[
          Object.keys(Day)[
            Math.floor(Math.random() * Object.keys(Day).length)
          ] as keyof typeof Day
        ], 
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)), 
        endTime: new Date(new Date().setHours(new Date().getHours() + 3)), 
        subjectId: (i % 10) + 1, 
        classId: (i % 6) + 1, 
        teacherId: teacherId[(i % 14) + 1], 
      },
    });
  }

  // PARENT
  let parentId = [];
  for (let i = 1; i <= 25; i++) {
    const client = clerkClient();
    const user = await client.users.createUser({
      emailAddress: [`parent${i}@gmail.com`],
      password: "trunki@123",
      username: `parentId${i}`,
      publicMetadata: {
        role: "parent"
      },
    });
    await prisma.parent.create({
      data: {
        id: user.id,
        username: `parentId${i}`,
        name: `PName ${i}`,
        surname: `PSurname ${i}`,
        email: `parent${i}@gmail.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
      },
    });
    parentId.push(user.id);
  }

  // STUDENT
  let studentId = [];
  for (let i = 1; i <= 50; i++) {
    const client = clerkClient();
    const user = await client.users.createUser({
      emailAddress: [`student${i}@gmail.com`],
      password:"trunki@123",
      username: `student${i}`,
      publicMetadata: {
        role: "student"
      },
    });
    await prisma.student.create({
      data: {
        id: user.id, 
        username: `student${i}`, 
        name: `SName${i}`,
        surname: `SSurname ${i}`,
        email: `student${i}@gmail.com`,
        phone: `987-654-321${i}`,
        address: `Address${i}`,
        bloodType: "O-",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        parentId: parentId[(i % 24) + 1], 
        gradeId: (i % 6) + 1, 
        classId: (i % 6) + 1, 
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 10)),
      },
    });
    studentId.push(user.id);
  }

  // EXAM
  for (let i = 1; i <= 10; i++) {
    await prisma.exam.create({
      data: {
        title: `Exam ${i}`, 
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)), 
        endTime: new Date(new Date().setHours(new Date().getHours() + 2)), 
        lessonId: (i % 30) + 1, 
      },
    });
  }

  // ASSIGNMENT
  for (let i = 1; i <= 10; i++) {
    await prisma.assignment.create({
      data: {
        title: `Assignment ${i}`, 
        startDate: new Date(new Date().setHours(new Date().getHours() + 1)), 
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)), 
        lessonId: (i % 30) + 1, 
      },
    });
  }

  // RESULT
  for (let i = 1; i <= 10; i++) {
    await prisma.result.create({
      data: {
        score: 90, 
        studentId: studentId[i],
        ...(i <= 5 ? { examId: i } : { assignmentId: i - 5 }), 
      },
    });
  }

  // ATTENDANCE
  for (let i = 1; i <= 10; i++) {
    await prisma.attendance.create({
      data: {
        date: new Date(), 
        present: true, 
        studentId: studentId[i],
        lessonId: (i % 30) + 1, 
      },
    });
  }

  // EVENT
  for (let i = 1; i <= 5; i++) {
    await prisma.event.create({
      data: {
        title: `Event ${i}`, 
        description: `Description for Event ${i}`, 
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)), 
        endTime: new Date(new Date().setHours(new Date().getHours() + 2)), 
        classId: (i % 5) + 1, 
      },
    });
  }

  // ANNOUNCEMENT
  for (let i = 1; i <= 5; i++) {
    await prisma.announcement.create({
      data: {
        title: `Announcement ${i}`, 
        description: `Description for Announcement ${i}`, 
        date: new Date(), 
        classId: (i % 5) + 1, 
      },
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
