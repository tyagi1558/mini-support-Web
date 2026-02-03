import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const ticket1 = await prisma.ticket.create({
    data: {
      title: "Cannot log in to dashboard",
      description:
        "When I enter my credentials and click Sign In, the page just refreshes and I stay on the login screen. No error message is shown. This started happening after the last update.",
      status: "OPEN",
      priority: "HIGH",
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      title: "Export report shows wrong date range",
      description:
        "I selected January 1–31 in the date picker for the monthly report, but the exported CSV contains data from December. Please fix the export logic to respect the selected range.",
      status: "IN_PROGRESS",
      priority: "MEDIUM",
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      title: "Suggestion: dark mode for the app",
      description:
        "It would be great to have a dark theme option in settings. Many users work in low-light environments and prefer dark backgrounds. Consider adding a toggle in the user preferences.",
      status: "RESOLVED",
      priority: "LOW",
    },
  });

  await prisma.comment.createMany({
    data: [
      {
        ticketId: ticket1.id,
        authorName: "Support Agent",
        message:
          "We are looking into the login issue. Can you confirm whether you use 2FA?",
      },
      {
        ticketId: ticket1.id,
        authorName: "John Doe",
        message:
          "Yes, I have 2FA enabled. I receive the code but after entering it the same thing happens.",
      },
      {
        ticketId: ticket2.id,
        authorName: "Dev Team",
        message:
          "The bug is in the timezone conversion. We will ship a fix in the next release.",
      },
    ],
  });

  console.log("Seed completed. Created 3 tickets and 3 comments.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
