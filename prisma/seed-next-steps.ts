import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function seedNextSteps() {
  const steps = [
    {
      stepNumber: 1,
      title: "You'll receive an email confirmation",
      description: 'Check your inbox for a summary of your estimate',
      displayOrder: 0,
      isActive: true,
    },
    {
      stepNumber: 2,
      title: "We'll review your estimate (1-2 hours)",
      description: 'Our team will carefully review your project details',
      displayOrder: 1,
      isActive: true,
    },
    {
      stepNumber: 3,
      title: "You'll get a detailed PDF proposal",
      description: 'Complete breakdown of costs and project timeline',
      displayOrder: 2,
      isActive: true,
    },
    {
      stepNumber: 4,
      title: "We'll contact you to discuss next steps",
      description: 'Schedule a consultation to finalize your project',
      displayOrder: 3,
      isActive: true,
    },
  ];

  console.log('Seeding next steps...');

  for (const step of steps) {
    await prisma.nextStep.upsert({
      where: { stepNumber: step.stepNumber },
      update: step,
      create: step,
    });
  }

  console.log('Next steps seeded successfully!');
}

seedNextSteps()
  .catch((e) => {
    console.error('Error seeding next steps:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
