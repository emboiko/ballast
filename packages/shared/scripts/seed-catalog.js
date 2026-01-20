import prisma from "../src/db/client.js"

const buildSlug = (value) => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

const productTemplates = [
  {
    category: "machines",
    subcategory: "retroencabulators",
    baseName: "Retroencabulator",
    description:
      "Precision-built encabulation system for industrial retrofitting.",
    count: 10,
    basePriceCents: 250000,
    priceStepCents: 15000,
  },
  {
    category: "parts",
    subcategory: "bearings",
    baseName: "Magno-Bearing",
    description:
      "High-tolerance bearing set engineered for sustained encabulation loads.",
    count: 10,
    basePriceCents: 4500,
    priceStepCents: 350,
  },
  {
    category: "parts",
    subcategory: "rotors",
    baseName: "Flux Rotor",
    description: "Balanced rotor assembly for stabilizing oscillation streams.",
    count: 10,
    basePriceCents: 8500,
    priceStepCents: 500,
  },
  {
    category: "accessories",
    subcategory: "controls",
    baseName: "Control Console",
    description:
      "Operator console with hardened controls and status monitoring.",
    count: 10,
    basePriceCents: 12500,
    priceStepCents: 900,
  },
  {
    category: "kits",
    subcategory: "calibration",
    baseName: "Calibration Kit",
    description:
      "Field kit for tuning encabulation profiles and verifying output.",
    count: 10,
    basePriceCents: 6500,
    priceStepCents: 250,
  },
]

const productDetailPhrases = [
  "Built for production-ready throughput.",
  "Optimized for tight lab spaces.",
  "Includes reinforced mounts for heavy-duty runs.",
  "Balanced for quiet, low-vibration operation.",
  "Ships with calibration profile for rapid setup.",
]

const buildProducts = () => {
  const products = []
  for (const template of productTemplates) {
    for (let index = 0; index < template.count; index += 1) {
      const variantNumber = index + 1
      const detailPhrase =
        productDetailPhrases[index % productDetailPhrases.length]
      const name = `${template.baseName} Mk ${variantNumber}`
      const description = `${template.description} ${detailPhrase}`
      products.push({
        slug: buildSlug(name),
        name,
        description,
        priceCents: template.basePriceCents + template.priceStepCents * index,
        category: template.category,
        subcategory: template.subcategory,
      })
    }
  }
  return products
}

const services = [
  {
    slug: "on-site-calibration",
    name: "On-site Calibration",
    description:
      "Hands-on calibration session to align encabulator output to spec.",
    longDescription:
      "Includes initial diagnostics, full system tuning, and a post-service performance report.",
    priceCents: 45000,
  },
  {
    slug: "preventive-maintenance",
    name: "Preventive Maintenance",
    description:
      "Quarterly service visit focused on wear mitigation and system uptime.",
    longDescription:
      "Covers bearing checks, rotor alignment, lubrication, and control surface verification.",
    priceCents: 32000,
  },
  {
    slug: "commissioning-support",
    name: "Commissioning Support",
    description:
      "Launch support for new encabulator deployments and operator onboarding.",
    longDescription:
      "Includes configuration validation, operator training, and initial output verification.",
    priceCents: 60000,
  },
  {
    slug: "workflow-audit",
    name: "Workflow Audit",
    description:
      "End-to-end review of encabulation workflows with optimization plan.",
    longDescription:
      "We assess throughput, downtime causes, and recommend improvements to reduce bottlenecks.",
    priceCents: 28000,
  },
  {
    slug: "priority-support",
    name: "Priority Support",
    description:
      "Dedicated support channel with expedited response and scheduled check-ins.",
    longDescription:
      "Ideal for critical production environments needing proactive monitoring.",
    priceCents: 52000,
  },
]

const products = buildProducts()

const clearCatalog = async () => {
  await prisma.catalogImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.service.deleteMany()
}

const seedProducts = async () => {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        category: product.category,
        subcategory: product.subcategory,
        isActive: true,
      },
      create: {
        slug: product.slug,
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        category: product.category,
        subcategory: product.subcategory,
        isActive: true,
      },
    })
  }
}

const seedServices = async () => {
  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        name: service.name,
        description: service.description,
        longDescription: service.longDescription,
        priceCents: service.priceCents,
        isActive: true,
      },
      create: {
        slug: service.slug,
        name: service.name,
        description: service.description,
        longDescription: service.longDescription,
        priceCents: service.priceCents,
        isActive: true,
      },
    })
  }
}

const run = async () => {
  await clearCatalog()
  await seedProducts()
  await seedServices()
}

run()
  .catch((error) => {
    console.error("Catalog seed failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
