const { PrismaClient } = require('@prisma/client')
const invoice = require("./invoice.json");
const user = require('./user.json');

const prisma = new PrismaClient();


async function seed() {
  await Promise.all(
    getInvoice().map(invoice => {
      return prisma.invoice.create({ data: invoice });
    })
  )

  // add users to database
  await Promise.all(
    getUsers().map(user => {
      return prisma.user.create({
        data: user
      })
    }),
  )
}

seed()
  .catch((e) => {
    throw e;
  }).finally(async () => {
    await prisma.$disconnect()
  })


function getInvoice() {
  return invoice;
}

function getUsers() {
  return user
}
