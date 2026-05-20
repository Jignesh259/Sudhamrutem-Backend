import bcrypt from "bcrypt";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const userPassword = await bcrypt.hash("Password@123", 10);

  const oralCare = await prisma.category.upsert({
    where: { slug: "oral-care" },
    update: {},
    create: { name: "Oral Care", slug: "oral-care" },
  });

  const immunity = await prisma.category.upsert({
    where: { slug: "immunity" },
    update: {},
    create: { name: "Immunity", slug: "immunity" },
  });

  const travel = await prisma.category.upsert({
    where: { slug: "travel" },
    update: {},
    create: { name: "Travel", slug: "travel" },
  });

  const user = await prisma.user.upsert({
    where: { email: "aarav@example.com" },
    update: {},
    create: {
      name: "Aarav Sharma",
      email: "aarav@example.com",
      phone: "9876543210",
      passwordHash: userPassword,
    },
  });

  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const products = [
    {
      name: "Nutraceutical Mouth Freshener",
      slug: "mouth-freshener",
      description:
        "Ancient herbs, modern freshness. The signature blend of 14 herbs for rejuvenation.",
      price: 499,
      discountPrice: 449,
      stock: 120,
      categoryId: oralCare.id,
      thumbnail: "http://localhost:5000/uploads/products/mouth-freshener.jpeg",
      gallery: [
        "http://localhost:5000/uploads/products/mouth-freshener.jpeg",
        "http://localhost:5000/uploads/products/mouth-freshener-alt.jpeg",
      ],
      benefits: [
        "Oral health",
        "Digestive support",
        "Freshness",
        "Nicotine free",
      ],
      ingredients: [
        "Mulethi",
        "Rosemary",
        "Giloy",
        "Cardamom",
        "Clove",
        "Amla",
      ],
      featured: true,
    },
    {
      name: "Amrut Haldi",
      slug: "amrut-haldi",
      description:
        "The golden essence of vitality. Pure Lakadong turmeric infused with black pepper.",
      price: 299,
      discountPrice: 279,
      stock: 90,
      categoryId: immunity.id,
      thumbnail: "http://localhost:5000/uploads/products/amrut-haldi.jpeg",
      gallery: [
        "http://localhost:5000/uploads/products/amrut-haldi.jpeg",
        "http://localhost:5000/uploads/products/amrut-haldi-alt.jpeg",
      ],
      benefits: ["Immunity", "Detox", "Family wellness"],
      ingredients: ["Lakadong Haldi", "Black Pepper", "Ginger"],
      featured: true,
    },
    {
      name: "Mouth Freshener Pouch",
      slug: "travel-pouch",
      description:
        "Carry your rituals anywhere with our compact freshness pouch.",
      price: 199,
      stock: 150,
      categoryId: travel.id,
      thumbnail: "http://localhost:5000/uploads/products/travel-pouch.jpeg",
      gallery: ["http://localhost:5000/uploads/products/travel-pouch.jpeg"],
      benefits: ["Travel friendly", "Freshness"],
      ingredients: ["Mixed Herbs"],
      featured: true,
    },
    {
      name: "Combo Pack",
      slug: "combo-pack",
      description:
        "A bestselling combination of our flagship mouth freshener and pouch.",
      price: 698,
      discountPrice: 649,
      stock: 60,
      categoryId: oralCare.id,
      thumbnail: "http://localhost:5000/uploads/products/combo-pack.jpeg",
      gallery: ["http://localhost:5000/uploads/products/combo-pack.jpeg"],
      benefits: ["Best value", "Family wellness"],
      ingredients: ["Signature herb blend"],
      featured: false,
    },
  ];

  for (const product of products) {
    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });

    await prisma.productImage.deleteMany({
      where: { productId: saved.id },
    });

    await prisma.productImage.createMany({
      data: product.gallery.map((imageUrl) => ({
        productId: saved.id,
        imageUrl,
      })),
    });
  }

  const mouthFreshener = await prisma.product.findUnique({
    where: { slug: "mouth-freshener" },
  });

  if (mouthFreshener) {
    await prisma.faq.createMany({
      data: [
        {
          question: "Is it safe for daily long-term use?",
          answer:
            "Yes. Sudhamrutam is built for everyday use with herbal ingredients.",
          productId: mouthFreshener.id,
        },
        {
          question: "How does it help in quitting nicotine?",
          answer:
            "Its herbal adaptogens support calmness and oral satisfaction during habit breaks.",
          productId: mouthFreshener.id,
        },
      ],
      skipDuplicates: true,
    });
  }

  await prisma.blog.createMany({
    data: [
      {
        title: "The Art of Breath: How Wild Mulethi Purifies Your Prana",
        slug: "wild-mulethi-purifies-prana",
        excerpt:
          "Discover how licorice root helps clear the throat and supports cleaner breath.",
        content:
          "Mulethi has long been treasured in Ayurveda for soothing the throat, reducing irritation, and supporting respiratory comfort.",
        image: "http://localhost:5000/uploads/blogs/mulethi.jpeg",
        category: "Ayurveda",
        tags: ["mulethi", "oral-health", "ayurveda"],
        createdById: user.id,
      },
      {
        title: "Understanding Curcumin: Boosting Bioavailability with Piperine",
        slug: "curcumin-bioavailability-with-piperine",
        excerpt:
          "Why turmeric works better when paired with black pepper.",
        content:
          "Curcumin is powerful, but it becomes much more absorbable when paired with piperine from black pepper.",
        image: "http://localhost:5000/uploads/blogs/curcumin.jpeg",
        category: "Immunity",
        tags: ["haldi", "curcumin", "immunity"],
        createdById: user.id,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.certification.createMany({
    data: [
      {
        title: "FSSAI",
        image: "http://localhost:5000/uploads/certifications/fssai.jpeg",
      },
      {
        title: "NABL",
        image: "http://localhost:5000/uploads/certifications/nabl.png",
      },
      {
        title: "Patent",
        image: "http://localhost:5000/uploads/certifications/fssai.jpeg",
      },
      {
        title: "Trademark",
        image: "http://localhost:5000/uploads/certifications/nabl.png",
      },
      {
        title: "Udyam",
        image: "http://localhost:5000/uploads/certifications/fssai.jpeg",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.distributor.createMany({
    data: [
      {
        name: "Healthy Retail Gujarat",
        email: "dealer@sudhamrutam.com",
        phone: "9898989898",
        businessType: "Distributor",
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
