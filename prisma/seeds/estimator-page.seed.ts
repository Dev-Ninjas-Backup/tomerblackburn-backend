import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedEstimatorPage() {
  console.log('Seeding Estimator Page...');

  // Create or update main estimator page
  const estimatorPage = await prisma.estimatorPage.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {
      title: 'Estimate Your Bathroom Remodel Cost',
      description:
        'Professional bathroom remodels - real quotes, competitive pricing, 15 verified steps',
      howItWorksTitle: 'How It Works',
      whyChooseUsTitle: 'Why Choose Us',
    },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      title: 'Estimate Your Bathroom Remodel Cost',
      description:
        'Professional bathroom remodels - real quotes, competitive pricing, 15 verified steps',
      howItWorksTitle: 'How It Works',
      whyChooseUsTitle: 'Why Choose Us',
    },
  });

  console.log('✅ Estimator page created:', estimatorPage.title);

  // Create How It Works steps
  const howItWorksSteps = [
    {
      stepNumber: 1,
      title: 'Select Type',
      description: 'Choose your bathroom type',
    },
    {
      stepNumber: 2,
      title: 'Answer Questions',
      description: 'Provide specific details',
    },
    {
      stepNumber: 3,
      title: 'Get Estimate',
      description: 'Receive detailed proposed estimate',
    },
  ];

  for (const step of howItWorksSteps) {
    await prisma.howItWorksStep.upsert({
      where: { id: `step-${step.stepNumber}` },
      update: step,
      create: {
        id: `step-${step.stepNumber}`,
        ...step,
      },
    });
    console.log(`✅ How It Works Step ${step.stepNumber} created:`, step.title);
  }

  // Create Why Choose Us features
  const whyChooseUsFeatures = [
    {
      order: 0,
      title: 'Transparent Pricing',
      description: "See exactly what you're paying for with itemized estimates",
    },
    {
      order: 1,
      title: 'Fast & Easy',
      description: 'Get your estimate within 15 minutes',
    },
    {
      order: 2,
      title: 'No Hidden Fees',
      description: 'What you see is what you get, no surprises',
    },
    {
      order: 3,
      title: 'Expert Team',
      description:
        'Work with experienced professionals with years of experience',
    },
  ];

  for (const feature of whyChooseUsFeatures) {
    await prisma.whyChooseUsFeature.upsert({
      where: { id: `feature-${feature.order}` },
      update: feature,
      create: {
        id: `feature-${feature.order}`,
        ...feature,
      },
    });
    console.log(`✅ Why Choose Us Feature created:`, feature.title);
  }

  console.log('✅ Estimator Page seeding completed!');
}

// Run if called directly
if (require.main === module) {
  seedEstimatorPage()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
